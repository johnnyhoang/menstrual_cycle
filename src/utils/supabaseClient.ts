import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { HistoricalCycle, DailyCycleLog } from '../data/menstrualCycleLogData';

const ENV_SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  '';
const ENV_SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  '';


export function getSupabaseConfig(): { url: string; key: string; isConfigured: boolean } {
  const customUrl = localStorage.getItem('mh_supabase_url') || ENV_SUPABASE_URL;
  const customKey = localStorage.getItem('mh_supabase_anon_key') || ENV_SUPABASE_ANON_KEY;
  const isConfigured = Boolean(customUrl && customKey);
  return { url: customUrl, key: customKey, isConfigured };
}

export function saveSupabaseConfig(url: string, key: string) {
  if (url.trim()) {
    localStorage.setItem('mh_supabase_url', url.trim());
  } else {
    localStorage.removeItem('mh_supabase_url');
  }
  if (key.trim()) {
    localStorage.setItem('mh_supabase_anon_key', key.trim());
  } else {
    localStorage.removeItem('mh_supabase_anon_key');
  }
}

let cachedClient: SupabaseClient | null = null;
let lastClientKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  const currentKey = `${url}__${key}`;
  if (!cachedClient || lastClientKey !== currentKey) {
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      lastClientKey = currentKey;
    } catch (e) {
      console.error('Failed to initialize Supabase client', e);
      return null;
    }
  }
  return cachedClient;
}

// ==============================================================================
// 1. MH_MENSTRUAL_CYCLES API
// ==============================================================================

export interface DBMenstrualCycle {
  id: string;
  start_date: string;
  end_date: string | null;
  date_range_display: string;
  year: number;
  cycle_length_days: number;
  period_duration_days: number;
  cycle_type: string;
  cycle_type_label: string | null;
  clinical_note: string | null;
  created_at?: string;
  updated_at?: string;
}

export function cycleToDB(c: HistoricalCycle): DBMenstrualCycle {
  return {
    id: c.id,
    start_date: c.startDate,
    end_date: c.endDate || null,
    date_range_display: c.dateRangeDisplay,
    year: c.year,
    cycle_length_days: c.cycleLengthDays,
    period_duration_days: c.periodDurationDays,
    cycle_type: c.cycleType,
    cycle_type_label: c.cycleTypeLabel,
    clinical_note: c.clinicalNote || null,
    updated_at: new Date().toISOString()
  };
}

export function cycleFromDB(row: DBMenstrualCycle): HistoricalCycle {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date || '',
    dateRangeDisplay: row.date_range_display,
    year: row.year,
    cycleLengthDays: row.cycle_length_days,
    periodDurationDays: row.period_duration_days,
    cycleType: row.cycle_type as HistoricalCycle['cycleType'],
    cycleTypeLabel: row.cycle_type_label || '',
    clinicalNote: row.clinical_note || ''
  };
}

export async function fetchCyclesFromDB(): Promise<{ data: HistoricalCycle[] | null; error: string | null }> {
  const client = getSupabase();
  if (!client) return { data: null, error: 'Supabase is not configured' };

  try {
    const { data, error } = await client
      .from('mh_menstrual_cycles')
      .select('*')
      .order('year', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return { data: data.map(cycleFromDB), error: null };
    }
    return { data: [], error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error fetching mh_menstrual_cycles:', msg);
    return { data: null, error: msg };
  }
}

export async function upsertCyclesToDB(cycles: HistoricalCycle[]): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase is not configured' };

  try {
    const payload = cycles.map(cycleToDB);
    const { error } = await client
      .from('mh_menstrual_cycles')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error upserting mh_menstrual_cycles:', msg);
    return { success: false, error: msg };
  }
}

export async function deleteCycleFromDB(cycleId: string): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase is not configured' };

  try {
    const { error } = await client
      .from('mh_menstrual_cycles')
      .delete()
      .eq('id', cycleId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

// ==============================================================================
// 2. MH_DAILY_LOGS API
// ==============================================================================

export interface DBDailyLog {
  date: string;
  day_of_week: string | null;
  cycle_day_text: string | null;
  cycle_day_number: number | null;
  phase: string;
  phase_label: string | null;
  summary: string;
  symptoms: string[];
  discharge_type: string;
  discharge_label: string | null;
  pain_level: string;
  pain_description: string | null;
  event_note: string | null;
  clinical_interpretation: string | null;
  is_key_milestone: boolean;
  has_intercourse?: boolean | null;
  intercourse_protection?: string | null;
  intercourse_orgasm?: boolean | null;
  intercourse_count?: number | null;
  intercourse_note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function logToDB(l: DailyCycleLog): DBDailyLog {
  return {
    date: l.date.trim(),
    day_of_week: l.dayOfWeek || null,
    cycle_day_text: l.cycleDayText || null,
    cycle_day_number: l.cycleDayNumber || null,
    phase: l.phase,
    phase_label: l.phaseLabel || null,
    summary: l.summary,
    symptoms: l.symptoms || [],
    discharge_type: l.dischargeType,
    discharge_label: l.dischargeLabel || null,
    pain_level: l.painLevel,
    pain_description: l.painDescription || null,
    event_note: l.eventNote || null,
    clinical_interpretation: l.clinicalInterpretation || null,
    is_key_milestone: Boolean(l.isKeyMilestone),
    has_intercourse: Boolean(l.hasIntercourse),
    intercourse_protection: l.intercourseProtection || null,
    intercourse_orgasm: l.intercourseOrgasm || null,
    intercourse_count: l.intercourseCount || null,
    intercourse_note: l.intercourseNote || null,
    updated_at: new Date().toISOString()
  };
}

export function logFromDB(row: DBDailyLog): DailyCycleLog {
  return {
    date: row.date,
    dayOfWeek: row.day_of_week || '',
    cycleDayText: row.cycle_day_text || '',
    cycleDayNumber: row.cycle_day_number || undefined,
    phase: row.phase as DailyCycleLog['phase'],
    phaseLabel: row.phase_label || '',
    summary: row.summary,
    symptoms: Array.isArray(row.symptoms) ? row.symptoms : [],
    dischargeType: row.discharge_type as DailyCycleLog['dischargeType'],
    dischargeLabel: row.discharge_label || '',
    painLevel: row.pain_level as DailyCycleLog['painLevel'],
    painDescription: row.pain_description || undefined,
    eventNote: row.event_note || undefined,
    clinicalInterpretation: row.clinical_interpretation || '',
    isKeyMilestone: Boolean(row.is_key_milestone),
    hasIntercourse: Boolean(row.has_intercourse),
    intercourseProtection: (row.intercourse_protection as DailyCycleLog['intercourseProtection']) || undefined,
    intercourseOrgasm: row.intercourse_orgasm || undefined,
    intercourseCount: row.intercourse_count || undefined,
    intercourseNote: row.intercourse_note || undefined
  };
}

export async function fetchDailyLogsFromDB(): Promise<{ data: DailyCycleLog[] | null; error: string | null }> {
  const client = getSupabase();
  if (!client) return { data: null, error: 'Supabase is not configured' };

  try {
    const { data, error } = await client
      .from('mh_daily_logs')
      .select('*');

    if (error) throw error;
    if (data && data.length > 0) {
      return { data: data.map(logFromDB), error: null };
    }
    return { data: [], error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error fetching mh_daily_logs:', msg);
    return { data: null, error: msg };
  }
}

export async function upsertDailyLogsToDB(logs: DailyCycleLog[]): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase is not configured' };

  try {
    const payload = logs.map(logToDB);
    const { error } = await client
      .from('mh_daily_logs')
      .upsert(payload, { onConflict: 'date' });

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error upserting mh_daily_logs:', msg);
    return { success: false, error: msg };
  }
}

export async function deleteDailyLogFromDB(dateStr: string): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabase();
  if (!client) return { success: false, error: 'Supabase is not configured' };

  try {
    const { error } = await client
      .from('mh_daily_logs')
      .delete()
      .eq('date', dateStr.trim());

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
