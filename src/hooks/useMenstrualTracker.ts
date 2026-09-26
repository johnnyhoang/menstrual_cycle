import { useState, useEffect, useMemo, useCallback } from 'react';
import type { DailyCycleLog, HistoricalCycle } from '../data/menstrualCycleLogData';
import type { UserProfile } from '../components/UserProfileModal';
import { 
  parseDateUnified, 
  formatDateToVN, 
  recalibrateCycles
} from '../utils/dateUtils';
import { 
  getSupabaseConfig, 
  fetchCyclesFromDB, 
  fetchDailyLogsFromDB,
  upsertCyclesToDB,
  upsertDailyLogsToDB,
  deleteCycleFromDB,
  deleteDailyLogFromDB
} from '../utils/supabaseClient';

const STORAGE_KEY_CYCLES = (uid: string) => `mom_health_menstrual_cycles_v3_${uid}`;
const STORAGE_KEY_LOGS = (uid: string) => `mom_health_daily_logs_v3_${uid}`;

export function useMenstrualTracker(userProfile?: UserProfile | null, userId?: string | null) {
  // Adult check (18+)
  const isAdult = useMemo(() => {
    let prof = userProfile;
    if (!prof) {
      const raw = localStorage.getItem('mom_health_user_profile_v1');
      if (raw) {
        try { prof = JSON.parse(raw); } catch {}
      }
    }
    if (!prof) return false;
    if (prof.birthYear && prof.birthYear > 1900) {
      return (new Date().getFullYear() - prof.birthYear) >= 18;
    }
    if (prof.birthDate) {
      const parts = prof.birthDate.split(/[-/.]/);
      let year: number | null = null;
      if (parts.length === 3) {
        year = parts[2].length === 4 ? parseInt(parts[2], 10) : parseInt(parts[0], 10);
      } else if (parts.length === 1 && parts[0].length === 4) {
        year = parseInt(parts[0], 10);
      }
      if (year && !isNaN(year) && year > 1900) {
        return (new Date().getFullYear() - year) >= 18;
      }
    }
    return false;
  }, [userProfile]);

  // Loading & notification states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Per-user localStorage keys
  const cycleStorageKey = userId ? STORAGE_KEY_CYCLES(userId) : null;
  const logsStorageKey = userId ? STORAGE_KEY_LOGS(userId) : null;

  // Persistence State — start empty, will be populated from DB or localStorage per user
  const [cycles, setCycles] = useState<HistoricalCycle[]>(() => {
    if (!cycleStorageKey) return [];
    try {
      const saved = localStorage.getItem(cycleStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return recalibrateCycles(parsed);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [dailyLogs, setDailyLogs] = useState<DailyCycleLog[]>(() => {
    if (!logsStorageKey) return [];
    try {
      const saved = localStorage.getItem(logsStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Sync to per-user LocalStorage
  useEffect(() => {
    if (!cycleStorageKey) return;
    try {
      localStorage.setItem(cycleStorageKey, JSON.stringify(cycles));
    } catch (e) {
      console.error('Failed to save cycles to LocalStorage', e);
    }
  }, [cycles, cycleStorageKey]);

  useEffect(() => {
    if (!logsStorageKey) return;
    try {
      localStorage.setItem(logsStorageKey, JSON.stringify(dailyLogs));
    } catch (e) {
      console.error('Failed to save logs to LocalStorage', e);
    }
  }, [dailyLogs, logsStorageKey]);

  // Reset state when userId changes (user switch)
  useEffect(() => {
    if (!userId) {
      setCycles([]);
      setDailyLogs([]);
      return;
    }
    // Load from per-user localStorage
    const savedCycles = localStorage.getItem(STORAGE_KEY_CYCLES(userId));
    const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS(userId));
    setCycles(savedCycles ? (JSON.parse(savedCycles) as HistoricalCycle[]) : []);
    setDailyLogs(savedLogs ? (JSON.parse(savedLogs) as DailyCycleLog[]) : []);
  }, [userId]);

  // Initial Sync with Supabase DB — fetch ONLY this user's data
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    const config = getSupabaseConfig();
    if (config.isConfigured) {
      setIsLoading(true);
      Promise.all([fetchCyclesFromDB(userId), fetchDailyLogsFromDB(userId)])
        .then(([cyclesRes, logsRes]) => {
          if (cyclesRes.data && cyclesRes.data.length > 0) {
            // Use only real DB data for this user — no hardcode injection
            const recalibrated = recalibrateCycles(cyclesRes.data);
            setCycles(recalibrated);
          }
          if (logsRes.data && logsRes.data.length > 0) {
            setDailyLogs(logsRes.data);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // Real-time Dynamic Statistics
  const dynamicStats = useMemo(() => {
    const total = cycles.length;
    if (total === 0) {
      return {
        totalTrackedCycles: 0,
        averageCycleLength: 0,
        averagePeriodDuration: 0,
        longCyclePercentage: 0,
        minYear: 2022,
        maxYear: 2026
      };
    }
    const sumCycleLength = cycles.reduce((acc, c) => acc + (c.cycleLengthDays || 0), 0);
    const sumPeriod = cycles.reduce((acc, c) => acc + (c.periodDurationDays || 0), 0);
    const regularLongCount = cycles.filter(c => (c.cycleLengthDays >= 30 && c.cycleLengthDays <= 42)).length;
    const years = cycles.map(c => c.year).filter(y => Boolean(y));
    const minYear = years.length > 0 ? Math.min(...years) : 2022;
    const maxYear = years.length > 0 ? Math.max(...years) : 2026;

    return {
      totalTrackedCycles: total,
      averageCycleLength: Number((sumCycleLength / total).toFixed(1)),
      averagePeriodDuration: Number((sumPeriod / total).toFixed(1)),
      longCyclePercentage: Math.round((regularLongCount / total) * 100),
      minYear,
      maxYear
    };
  }, [cycles]);

  // Fast Lookup Map for Daily Logs
  const dailyLogsMap = useMemo(() => {
    const map = new Map<string, DailyCycleLog>();
    dailyLogs.forEach(log => {
      map.set(log.date.trim(), log);
    });
    return map;
  }, [dailyLogs]);

  // Save / Upsert Daily Log
  const saveDailyLog = useCallback((fullLog: DailyCycleLog, isStartOfCycle?: boolean) => {
    const parsedDate = parseDateUnified(fullLog.date) || new Date();
    const dateVN = formatDateToVN(parsedDate);

    // Auto update cycle series if marked as cycle start
    if (isStartOfCycle) {
      const existingCycle = cycles.find(c => c.startDate === dateVN);
      let updatedCycles: HistoricalCycle[];
      if (!existingCycle) {
        const newCycle: HistoricalCycle = {
          id: `cycle-${Date.now()}`,
          startDate: dateVN,
          endDate: 'Hiện tại',
          dateRangeDisplay: `${dateVN} – [Đang diễn ra]`,
          year: parsedDate.getFullYear(),
          cycleLengthDays: 35,
          periodDurationDays: 5,
          cycleType: 'normal_long',
          cycleTypeLabel: 'Chu kỳ dài sinh lý (35 ngày)',
          clinicalNote: `Chu kỳ bắt đầu ngày ${dateVN}.`
        };
        updatedCycles = recalibrateCycles([newCycle, ...cycles]);
      } else {
        updatedCycles = recalibrateCycles(cycles);
      }
      setCycles(updatedCycles);
      upsertCyclesToDB(updatedCycles, userId ?? undefined);
    } else {
      const cycleStartingHere = cycles.find(c => c.startDate === dateVN);
      if (cycleStartingHere && cycles.length > 1) {
        const remaining = cycles.filter(c => c.startDate !== dateVN);
        const recalibrated = recalibrateCycles(remaining);
        setCycles(recalibrated);
        deleteCycleFromDB(cycleStartingHere.id);
        upsertCyclesToDB(recalibrated, userId ?? undefined);
      }
    }

    const existsIndex = dailyLogs.findIndex(l => l.date === fullLog.date);
    let updated: DailyCycleLog[];
    if (existsIndex >= 0) {
      updated = [...dailyLogs];
      updated[existsIndex] = fullLog;
      showNotification(`Đã cập nhật nhật ký ngày ${fullLog.date}!`, 'success');
    } else {
      updated = [fullLog, ...dailyLogs];
      showNotification(`Đã ghi nhận nhật ký ngày mới ${fullLog.date}!`, 'success');
    }

    setDailyLogs(updated);
    upsertDailyLogsToDB([fullLog], userId ?? undefined);
  }, [cycles, dailyLogs, showNotification, userId]);

  // Delete Daily Log
  const deleteLogForDay = useCallback((dateStr: string) => {
    const updated = dailyLogs.filter(l => l.date !== dateStr);
    setDailyLogs(updated);
    deleteDailyLogFromDB(dateStr);
    showNotification(`Đã xóa nhật ký ngày ${dateStr}!`, 'info');
  }, [dailyLogs, showNotification]);

  // Save / Update Historical Cycle
  const saveCycle = useCallback((editingCycle: HistoricalCycle) => {
    const range = editingCycle.dateRangeDisplay.trim() || `${editingCycle.startDate} – ${editingCycle.endDate || 'Hiện tại'}`;
    const toSave: HistoricalCycle = {
      ...editingCycle,
      dateRangeDisplay: range,
      year: editingCycle.year || new Date().getFullYear()
    };
    const existsIndex = cycles.findIndex(c => c.id === toSave.id);
    let updated: HistoricalCycle[];
    if (existsIndex >= 0) {
      updated = [...cycles];
      updated[existsIndex] = toSave;
      showNotification('Đã cập nhật thông tin chu kỳ!', 'success');
    } else {
      updated = [toSave, ...cycles];
      showNotification('Đã thêm chu kỳ mới!', 'success');
    }
    const recalibrated = recalibrateCycles(updated);
    setCycles(recalibrated);
    upsertCyclesToDB(recalibrated, userId ?? undefined);
  }, [cycles, showNotification, userId]);

  // Delete Cycle
  const deleteCycle = useCallback((id: string) => {
    const updated = cycles.filter(c => c.id !== id);
    const recalibrated = recalibrateCycles(updated);
    setCycles(recalibrated);
    deleteCycleFromDB(id);
    showNotification('Đã xóa chu kỳ!', 'info');
  }, [cycles, showNotification]);

  return {
    isAdult,
    isLoading,
    notification,
    setNotification,
    cycles,
    dailyLogs,
    dailyLogsMap,
    dynamicStats,
    showNotification,
    saveDailyLog,
    deleteLogForDay,
    saveCycle,
    deleteCycle
  };
}
