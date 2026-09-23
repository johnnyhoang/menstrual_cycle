import { createClient } from '@supabase/supabase-js';
import { 
  menstrualCycleLogs, 
  historicalCyclesData 
} from '../src/data/menstrualCycleLogData.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong môi trường.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedMockData() {
  console.log('🌱 Đang đẩy dữ liệu giả lập từ code vào Supabase Database (mh_menstrual_cycles & mh_daily_logs)...');

  // Seed Historical Cycles
  const cyclesPayload = historicalCyclesData.map(c => ({
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
  }));

  const { error: cyclesError } = await supabase
    .from('mh_menstrual_cycles')
    .upsert(cyclesPayload, { onConflict: 'id' });

  if (cyclesError) {
    console.error('❌ Lỗi khi lưu dữ liệu chu kỳ:', cyclesError.message);
  } else {
    console.log(`✅ Đã đồng bộ thành công ${cyclesPayload.length} chu kỳ vào database!`);
  }

  // Seed Daily Logs
  const logsPayload = menstrualCycleLogs.map(l => ({
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
  }));

  const { error: logsError } = await supabase
    .from('mh_daily_logs')
    .upsert(logsPayload, { onConflict: 'date' });

  if (logsError) {
    console.error('❌ Lỗi khi lưu nhật ký hàng ngày:', logsError.message);
  } else {
    console.log(`✅ Đã đồng bộ thành công ${logsPayload.length} nhật ký hàng ngày vào database!`);
  }

  console.log('🎉 Quá trình lưu dữ liệu ảo vào Database hoàn tất!');
}

seedMockData().catch(console.error);
