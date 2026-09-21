import React, { useState, useEffect, useMemo } from 'react';
import { 
  menstrualCycleLogs as initialDailyLogs, 
  cyclePhaseAnalyses, 
  symptomDecoders,
  historicalCyclesData as initialHistoricalCycles,
} from '../data/menstrualCycleLogData';
import type { DailyCycleLog, HistoricalCycle } from '../data/menstrualCycleLogData';
import type { UserProfile } from './UserProfileModal';
import {
  Calendar as CalendarIcon,
  Activity,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Droplets,
  Microscope,
  Info,
  CalendarDays,
  X,
  Plus,
  Edit3,
  Trash2,
  Save,
  Search,
  Sliders,
  GitBranch,
  Heart
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  fetchCyclesFromDB, 
  fetchDailyLogsFromDB,
  upsertCyclesToDB,
  upsertDailyLogsToDB,
  deleteCycleFromDB,
  deleteDailyLogFromDB
} from '../utils/supabaseClient';

const STORAGE_KEY_CYCLES = 'mom_health_menstrual_cycles_v3';
const STORAGE_KEY_LOGS = 'mom_health_daily_logs_v3';

// Helper: Merge loaded logs with initial full clinical dataset (guarantees September biopsy & GPB logs are never lost)
function mergeWithInitialLogs(loadedLogs: DailyCycleLog[]): DailyCycleLog[] {
  const map = new Map<string, DailyCycleLog>();
  initialDailyLogs.forEach(log => map.set(log.date.trim(), log));
  loadedLogs.forEach(log => {
    const existing = map.get(log.date.trim());
    if (existing) {
      map.set(log.date.trim(), {
        ...existing,
        ...log,
        summary: log.summary || existing.summary,
        symptoms: (log.symptoms && log.symptoms.length > 0) ? log.symptoms : existing.symptoms,
        dischargeType: log.dischargeType || existing.dischargeType,
        dischargeLabel: log.dischargeLabel || existing.dischargeLabel,
        painLevel: log.painLevel || existing.painLevel,
        painDescription: log.painDescription || existing.painDescription,
        clinicalInterpretation: log.clinicalInterpretation || existing.clinicalInterpretation,
        isKeyMilestone: log.isKeyMilestone ?? existing.isKeyMilestone,
        hasIntercourse: log.hasIntercourse ?? existing.hasIntercourse,
        eventNote: log.eventNote || existing.eventNote
      });
    } else {
      map.set(log.date.trim(), log);
    }
  });
  return Array.from(map.values()).sort((a, b) => {
    const da = parseDateUnified(a.date)?.getTime() || 0;
    const db = parseDateUnified(b.date)?.getTime() || 0;
    return db - da;
  });
}

function mergeWithInitialCycles(loadedCycles: HistoricalCycle[]): HistoricalCycle[] {
  const map = new Map<string, HistoricalCycle>();
  initialHistoricalCycles.forEach(c => map.set(c.id, c));
  loadedCycles.forEach(c => map.set(c.id, c));
  return recalibrateCycles(Array.from(map.values()));
}

// Helper: Parse any date string into JS Date object robustly
function parseDateUnified(dateStr: string): Date | null {
  if (!dateStr) return null;
  const s = dateStr.trim();
  
  // Format DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const parts = s.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }

  // Format YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
    const parts = s.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }

  // Fallback standard Date.parse
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// Helper: Format Date object to DD/MM/YYYY
function formatDateToVN(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Helper: Get weekday name in Vietnamese
function getWeekdayVN(d: Date): string {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return days[d.getDay()];
}

// Helper: Recalibrate and auto-close previous cycles based on start dates
function recalibrateCycles(cyclesList: HistoricalCycle[]): HistoricalCycle[] {
  // Sort chronologically ascending
  const sorted = [...cyclesList].sort((a, b) => {
    const da = parseDateUnified(a.startDate)?.getTime() || 0;
    const db = parseDateUnified(b.startDate)?.getTime() || 0;
    return da - db;
  });

  const updated: HistoricalCycle[] = sorted.map((cycle, idx) => {
    const sDate = parseDateUnified(cycle.startDate);
    const nextCycle = sorted[idx + 1];
    const nextSDate = nextCycle ? parseDateUnified(nextCycle.startDate) : null;

    if (sDate && nextSDate) {
      // End date is 1 day before next cycle start date
      const calcEndDate = new Date(nextSDate.getFullYear(), nextSDate.getMonth(), nextSDate.getDate() - 1);
      const calcEndDateStr = formatDateToVN(calcEndDate);
      const diffDays = Math.round((nextSDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24));
      const sDateVN = formatDateToVN(sDate);

      return {
        ...cycle,
        startDate: cycle.startDate.includes('/') ? cycle.startDate : sDateVN,
        endDate: calcEndDateStr,
        dateRangeDisplay: `${sDateVN} – ${calcEndDateStr}`,
        cycleLengthDays: diffDays > 0 ? diffDays : cycle.cycleLengthDays,
        year: sDate.getFullYear()
      };
    } else if (sDate && !nextCycle) {
      // Latest cycle
      const sDateVN = formatDateToVN(sDate);
      const isStillOngoing = !cycle.endDate || cycle.endDate.toLowerCase().includes('hiện tại') || cycle.endDate.toLowerCase().includes('ongoing');
      return {
        ...cycle,
        startDate: cycle.startDate.includes('/') ? cycle.startDate : sDateVN,
        endDate: isStillOngoing ? 'Hiện tại' : cycle.endDate,
        dateRangeDisplay: isStillOngoing ? `${sDateVN} – [Đang diễn ra]` : cycle.dateRangeDisplay,
        year: sDate.getFullYear()
      };
    }
    return cycle;
  });

  // Return sorted descending (newest first)
  return updated.sort((a, b) => {
    const da = parseDateUnified(a.startDate)?.getTime() || 0;
    const db = parseDateUnified(b.startDate)?.getTime() || 0;
    return db - da;
  });
}

interface MenstrualCycleTrackerSectionProps {
  userProfile?: UserProfile | null;
}

export const MenstrualCycleTrackerSection: React.FC<MenstrualCycleTrackerSectionProps> = ({ userProfile }) => {
  // Check if user is adult (18+) with confirmed profile
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

  // Main View Tabs:
  // 1. 'calendar' (Lịch Tháng WomanLog)
  // 2. 'tree_view' (Nhật Ký & Chu Kỳ Dạng Cây - gộp chu kỳ là cha, ngày là con)
  // 3. 'medical_decoder' (Giải Mã 4 Pha & GPB)
  const [activeTab, setActiveTab] = useState<'calendar' | 'tree_view' | 'medical_decoder'>('calendar');

  // Persistence State: Cycles & Daily Logs (Merged with rich initial records)
  const [cycles, setCycles] = useState<HistoricalCycle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CYCLES) || localStorage.getItem('mom_health_menstrual_cycles_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return mergeWithInitialCycles(parsed);
      }
    } catch {
      // ignore
    }
    return recalibrateCycles(initialHistoricalCycles);
  });

  const [dailyLogs, setDailyLogs] = useState<DailyCycleLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS) || localStorage.getItem('mom_health_daily_logs_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return mergeWithInitialLogs(parsed);
      }
    } catch {
      // ignore
    }
    return initialDailyLogs;
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CYCLES, JSON.stringify(cycles));
    } catch (e) {
      console.error('Failed to save cycles', e);
    }
  }, [cycles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(dailyLogs));
    } catch (e) {
      console.error('Failed to save logs', e);
    }
  }, [dailyLogs]);

  // Calendar State: Default to 09/2026 (focal month of biopsy & logs)
  const [currentCalYear, setCurrentCalYear] = useState<number>(2026);
  const [currentCalMonth, setCurrentCalMonth] = useState<number>(8); // 8 is September (0-indexed)

  // Selected date in Calendar (e.g. "15/09/2026")
  const [selectedCalendarDateStr, setSelectedCalendarDateStr] = useState<string>('15/09/2026');

  // Interactive Day Drawer / Quick Edit state
  const [isQuickEditing, setIsQuickEditing] = useState<boolean>(false);
  const [quickEditLog, setQuickEditLog] = useState<Partial<DailyCycleLog>>({});
  const [customSymptomInput, setCustomSymptomInput] = useState<string>('');

  // Edit Existing Cycle Modal
  const [isCycleModalOpen, setIsCycleModalOpen] = useState<boolean>(false);
  const [editingCycle, setEditingCycle] = useState<HistoricalCycle | null>(null);

  // Tree View State: Filter, Search, Expanded Nodes
  const [treeYearFilter, setTreeYearFilter] = useState<number | 'all'>('all');
  const [treeSearchQuery, setTreeSearchQuery] = useState<string>('');
  const [expandedCycleIds, setExpandedCycleIds] = useState<Record<string, boolean>>({});

  // Notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Initial Seamless Auto-Sync & Auto-Seed with Supabase
  useEffect(() => {
    const config = getSupabaseConfig();
    if (config.isConfigured) {
      fetchCyclesFromDB().then(res => {
        if (res.data) {
          const merged = mergeWithInitialCycles(res.data);
          setCycles(merged);
          upsertCyclesToDB(merged);
        }
      });
      fetchDailyLogsFromDB().then(res => {
        if (res.data) {
          const merged = mergeWithInitialLogs(res.data);
          setDailyLogs(merged);
          upsertDailyLogsToDB(merged);
        }
      });
    }
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Real-time Dynamic Statistics from Current Cycles
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

  // Map of daily logs by date string (DD/MM/YYYY)
  const dailyLogsMap = useMemo(() => {
    const map = new Map<string, DailyCycleLog>();
    dailyLogs.forEach(log => {
      map.set(log.date.trim(), log);
    });
    return map;
  }, [dailyLogs]);

  // Compute Period & Ovulation intervals across all cycles
  const calculatedCycleEvents = useMemo(() => {
    const periodDaysSet = new Map<string, { dayNumber: number; cycleId: string }>();
    const ovulationDaysSet = new Map<string, { isPeak: boolean; cycleId: string }>();

    cycles.forEach(cycle => {
      const sDate = parseDateUnified(cycle.startDate);

      if (sDate) {
        const periodLen = cycle.periodDurationDays || 5;
        for (let i = 0; i < periodLen; i++) {
          const pDay = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate() + i);
          const pStr = formatDateToVN(pDay);
          periodDaysSet.set(pStr, { dayNumber: i + 1, cycleId: cycle.id });
        }

        const cycleLen = cycle.cycleLengthDays || 35;
        const ovulationOffset = Math.max(10, cycleLen - 14);
        
        for (let o = -3; o <= 1; o++) {
          const ovDay = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate() + ovulationOffset + o);
          const ovStr = formatDateToVN(ovDay);
          if (!periodDaysSet.has(ovStr)) {
            ovulationDaysSet.set(ovStr, { isPeak: o === 0, cycleId: cycle.id });
          }
        }
      }
    });

    return { periodDaysSet, ovulationDaysSet };
  }, [cycles]);

  // Build Calendar Matrix for currentCalMonth & currentCalYear
  const calendarMatrix = useMemo(() => {
    const firstDayOfMonth = new Date(currentCalYear, currentCalMonth, 1);
    const lastDayOfMonth = new Date(currentCalYear, currentCalMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    let startingDay = firstDayOfMonth.getDay() - 1;
    if (startingDay === -1) startingDay = 6; // Sunday

    const matrix: Array<{
      date: Date;
      dateStr: string;
      isCurrentMonth: boolean;
      dayNumber: number;
      isPeriod: boolean;
      periodDayNumber?: number;
      isOvulation: boolean;
      isOvulationPeak: boolean;
      hasLog: boolean;
      isCycleStart: boolean;
      hasIntercourse: boolean;
      log?: DailyCycleLog;
      dischargeType?: DailyCycleLog['dischargeType'];
      painLevel?: DailyCycleLog['painLevel'];
    }> = [];

    const prevMonthLastDay = new Date(currentCalYear, currentCalMonth, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const d = new Date(currentCalYear, currentCalMonth - 1, prevMonthLastDay - i);
      const dStr = formatDateToVN(d);
      const log = dailyLogsMap.get(dStr);
      const periodInfo = calculatedCycleEvents.periodDaysSet.get(dStr);
      const ovInfo = calculatedCycleEvents.ovulationDaysSet.get(dStr);
      const isCycleStart = cycles.some(c => {
        const cDate = parseDateUnified(c.startDate);
        return cDate ? formatDateToVN(cDate) === dStr : false;
      });

      matrix.push({
        date: d,
        dateStr: dStr,
        isCurrentMonth: false,
        dayNumber: d.getDate(),
        isPeriod: Boolean(periodInfo || (log && log.phase === 'menstrual')),
        periodDayNumber: periodInfo?.dayNumber,
        isOvulation: Boolean(ovInfo),
        isOvulationPeak: Boolean(ovInfo?.isPeak),
        hasLog: Boolean(log),
        isCycleStart,
        hasIntercourse: Boolean(log?.hasIntercourse),
        log,
        dischargeType: log?.dischargeType,
        painLevel: log?.painLevel
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(currentCalYear, currentCalMonth, i);
      const dStr = formatDateToVN(d);
      const log = dailyLogsMap.get(dStr);
      const periodInfo = calculatedCycleEvents.periodDaysSet.get(dStr);
      const ovInfo = calculatedCycleEvents.ovulationDaysSet.get(dStr);
      const isCycleStart = cycles.some(c => {
        const cDate = parseDateUnified(c.startDate);
        return cDate ? formatDateToVN(cDate) === dStr : false;
      });

      matrix.push({
        date: d,
        dateStr: dStr,
        isCurrentMonth: true,
        dayNumber: i,
        isPeriod: Boolean(periodInfo || (log && log.phase === 'menstrual')),
        periodDayNumber: periodInfo?.dayNumber,
        isOvulation: Boolean(ovInfo),
        isOvulationPeak: Boolean(ovInfo?.isPeak),
        hasLog: Boolean(log),
        isCycleStart,
        hasIntercourse: Boolean(log?.hasIntercourse),
        log,
        dischargeType: log?.dischargeType,
        painLevel: log?.painLevel
      });
    }

    const remainingCells = 42 - matrix.length;
    if (remainingCells > 0 && remainingCells < 7) {
      for (let i = 1; i <= remainingCells; i++) {
        const d = new Date(currentCalYear, currentCalMonth + 1, i);
        const dStr = formatDateToVN(d);
        const log = dailyLogsMap.get(dStr);
        const periodInfo = calculatedCycleEvents.periodDaysSet.get(dStr);
        const ovInfo = calculatedCycleEvents.ovulationDaysSet.get(dStr);
        const isCycleStart = cycles.some(c => {
          const cDate = parseDateUnified(c.startDate);
          return cDate ? formatDateToVN(cDate) === dStr : false;
        });

        matrix.push({
          date: d,
          dateStr: dStr,
          isCurrentMonth: false,
          dayNumber: i,
          isPeriod: Boolean(periodInfo || (log && log.phase === 'menstrual')),
          periodDayNumber: periodInfo?.dayNumber,
          isOvulation: Boolean(ovInfo),
          isOvulationPeak: Boolean(ovInfo?.isPeak),
          hasLog: Boolean(log),
          isCycleStart,
          hasIntercourse: Boolean(log?.hasIntercourse),
          log,
          dischargeType: log?.dischargeType,
          painLevel: log?.painLevel
        });
      }
    }

    return matrix;
  }, [currentCalYear, currentCalMonth, dailyLogsMap, calculatedCycleEvents, cycles]);

  // Selected date log or virtual log for empty days
  const activeSelectedDayData = useMemo(() => {
    const existing = dailyLogsMap.get(selectedCalendarDateStr);
    const parsedDate = parseDateUnified(selectedCalendarDateStr) || new Date();
    const isPeriod = calculatedCycleEvents.periodDaysSet.get(selectedCalendarDateStr);
    const isOvulation = calculatedCycleEvents.ovulationDaysSet.get(selectedCalendarDateStr);
    const isCycleStart = cycles.some(c => {
      const cDate = parseDateUnified(c.startDate);
      return cDate ? formatDateToVN(cDate) === selectedCalendarDateStr : false;
    });

    if (existing) {
      return {
        ...existing,
        isVirtual: false,
        isCycleStart
      };
    }

    return {
      date: selectedCalendarDateStr,
      dayOfWeek: getWeekdayVN(parsedDate),
      cycleDayText: isPeriod ? `Ngày ${isPeriod.dayNumber} kỳ kinh` : isOvulation ? 'Cửa sổ rụng trứng (Dự đoán)' : 'Ngày theo dõi sinh lý',
      phase: isPeriod ? 'menstrual' : isOvulation ? 'ovulatory' : 'secretory',
      phaseLabel: isPeriod ? 'Pha Hành Kinh' : isOvulation ? 'Pha Rụng Trứng' : 'Ngày Sinh Lý Bình Thường',
      summary: isPeriod ? 'Ngày có kinh nguyệt' : 'Chưa có ghi nhận bất thường trong ngày này.',
      symptoms: isPeriod ? ['Hành kinh'] : [],
      dischargeType: isPeriod ? 'fresh_blood' : 'none',
      dischargeLabel: isPeriod ? 'Máu kinh đỏ' : 'Sạch / Không ra dịch',
      painLevel: 'none',
      clinicalInterpretation: 'Sinh lý phụ khoa ổn định.',
      hasIntercourse: false,
      isVirtual: true,
      isCycleStart
    } as DailyCycleLog & { isVirtual: boolean; isCycleStart: boolean };
  }, [selectedCalendarDateStr, dailyLogsMap, calculatedCycleEvents, cycles]);

  // =========================================================================
  // TREE VIEW HIERARCHY COMPUTATION (Parent: Cycle, Children: Daily Logs)
  // =========================================================================
  const treeCyclesHierarchy = useMemo(() => {
    // Sort chronologically ascending for precise interval matching
    const chronoCycles = [...cycles].sort((a, b) => {
      const da = parseDateUnified(a.startDate)?.getTime() || 0;
      const db = parseDateUnified(b.startDate)?.getTime() || 0;
      return da - db;
    });

    const hierarchy = chronoCycles.map((cycle, idx) => {
      const sDate = parseDateUnified(cycle.startDate);
      const nextCycle = chronoCycles[idx + 1];
      const nextSDate = nextCycle ? parseDateUnified(nextCycle.startDate) : null;

      const isOngoing = !cycle.endDate || cycle.endDate.includes('Hiện tại') || cycle.endDate.includes('ongoing');

      // Predicted end date based on cycle length
      let predictedEndDate = '';
      if (sDate) {
        const predD = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate() + (cycle.cycleLengthDays || 35) - 1);
        predictedEndDate = formatDateToVN(predD);
      }

      // Collect all daily logs falling into this cycle's timeframe
      const childLogs = dailyLogs.filter(log => {
        const lDate = parseDateUnified(log.date);
        if (!lDate || !sDate) return false;
        
        if (nextSDate) {
          return lDate.getTime() >= sDate.getTime() && lDate.getTime() < nextSDate.getTime();
        } else {
          return lDate.getTime() >= sDate.getTime();
        }
      }).sort((a, b) => {
        const da = parseDateUnified(a.date)?.getTime() || 0;
        const db = parseDateUnified(b.date)?.getTime() || 0;
        return da - db; // Chronological inside cycle
      });

      return {
        cycle,
        sDate,
        isOngoing,
        predictedEndDate,
        childLogs
      };
    });

    // Default return sorted descending (newest cycles on top)
    return hierarchy.reverse();
  }, [cycles, dailyLogs]);

  // Expand latest cycle by default on first load
  useEffect(() => {
    if (treeCyclesHierarchy.length > 0 && Object.keys(expandedCycleIds).length === 0) {
      const firstId = treeCyclesHierarchy[0].cycle.id;
      setExpandedCycleIds({ [firstId]: true });
    }
  }, [treeCyclesHierarchy]);

  const changeMonth = (newYear: number, newMonth: number) => {
    setCurrentCalYear(newYear);
    setCurrentCalMonth(newMonth);
    // Auto-select first recorded log in this month or day 1
    const monthLogs = dailyLogs.filter(l => {
      const d = parseDateUnified(l.date);
      return d && d.getFullYear() === newYear && d.getMonth() === newMonth;
    }).sort((a, b) => {
      const da = parseDateUnified(a.date)?.getTime() || 0;
      const db = parseDateUnified(b.date)?.getTime() || 0;
      return db - da;
    });

    if (monthLogs.length > 0) {
      setSelectedCalendarDateStr(monthLogs[0].date);
    } else {
      const defaultDate = new Date(newYear, newMonth, 1);
      setSelectedCalendarDateStr(formatDateToVN(defaultDate));
    }
    setIsQuickEditing(false);
  };

  const handlePrevMonth = () => {
    if (currentCalMonth === 0) {
      changeMonth(currentCalYear - 1, 11);
    } else {
      changeMonth(currentCalYear, currentCalMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentCalMonth === 11) {
      changeMonth(currentCalYear + 1, 0);
    } else {
      changeMonth(currentCalYear, currentCalMonth + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    changeMonth(now.getFullYear(), now.getMonth());
    const todayStr = formatDateToVN(now);
    setSelectedCalendarDateStr(todayStr);
  };

  const handleSelectDay = (dateStr: string) => {
    setSelectedCalendarDateStr(dateStr);
    setIsQuickEditing(false);
  };

  // Quick Start Cycle or Open Quick Edit for Selected Date
  const handleQuickStartCycleOnDate = (dateStr: string) => {
    setSelectedCalendarDateStr(dateStr);
    const parsed = parseDateUnified(dateStr) || new Date();
    const dateFormatted = formatDateToVN(parsed);
    
    setQuickEditLog({
      date: dateFormatted,
      dayOfWeek: getWeekdayVN(parsed),
      cycleDayText: 'Ngày 1 (Bắt đầu kỳ kinh)',
      phase: 'menstrual',
      phaseLabel: 'Pha Hành Kinh',
      summary: 'Bắt đầu chu kỳ kinh nguyệt mới (Ngày 1).',
      symptoms: ['Bắt đầu ra kinh'],
      dischargeType: 'fresh_blood',
      dischargeLabel: 'Máu đỏ tươi (Kinh)',
      painLevel: 'moderate',
      painDescription: '',
      eventNote: 'Bắt đầu kỳ kinh mới',
      clinicalInterpretation: `Ngày 1 của chu kỳ kinh nguyệt mới (${dateFormatted}).`,
      isStartOfCycle: true,
      hasIntercourse: false,
      intercourseProtection: 'protected',
      intercourseOrgasm: false,
      intercourseCount: 1,
      intercourseNote: ''
    });
    setCustomSymptomInput('');
    setIsQuickEditing(true);
  };

  const handleStartQuickEdit = () => {
    const isCycleStart = Boolean(
      activeSelectedDayData.cycleDayNumber === 1 ||
      activeSelectedDayData.cycleDayText?.includes('Ngày 1') ||
      cycles.some(c => c.startDate === activeSelectedDayData.date) ||
      activeSelectedDayData.isStartOfCycle
    );

    setQuickEditLog({
      date: activeSelectedDayData.date,
      dayOfWeek: activeSelectedDayData.dayOfWeek,
      cycleDayText: activeSelectedDayData.cycleDayText,
      phase: activeSelectedDayData.phase,
      phaseLabel: activeSelectedDayData.phaseLabel,
      summary: activeSelectedDayData.isVirtual ? '' : activeSelectedDayData.summary,
      symptoms: [...activeSelectedDayData.symptoms],
      dischargeType: activeSelectedDayData.dischargeType,
      dischargeLabel: activeSelectedDayData.dischargeLabel,
      painLevel: activeSelectedDayData.painLevel,
      painDescription: activeSelectedDayData.painDescription || '',
      eventNote: activeSelectedDayData.eventNote || '',
      clinicalInterpretation: activeSelectedDayData.clinicalInterpretation || '',
      isStartOfCycle: isCycleStart,
      hasIntercourse: Boolean(activeSelectedDayData.hasIntercourse),
      intercourseProtection: activeSelectedDayData.intercourseProtection || 'protected',
      intercourseOrgasm: Boolean(activeSelectedDayData.intercourseOrgasm),
      intercourseCount: activeSelectedDayData.intercourseCount || 1,
      intercourseNote: activeSelectedDayData.intercourseNote || ''
    });
    setCustomSymptomInput('');
    setIsQuickEditing(true);
  };

  const handleSaveQuickEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditLog.date) return;

    const isStart = Boolean(quickEditLog.isStartOfCycle);
    const parsedDate = parseDateUnified(quickEditLog.date) || new Date();
    const dateVN = formatDateToVN(parsedDate);

    const fullLog: DailyCycleLog = {
      date: dateVN,
      dayOfWeek: quickEditLog.dayOfWeek || getWeekdayVN(parsedDate),
      cycleDayText: isStart ? 'Ngày 1 (Bắt đầu kỳ kinh)' : (quickEditLog.cycleDayText || 'Ngày theo dõi'),
      cycleDayNumber: isStart ? 1 : quickEditLog.cycleDayNumber,
      phase: isStart ? 'menstrual' : (quickEditLog.phase || 'secretory'),
      phaseLabel: isStart ? 'Pha Hành Kinh' : (quickEditLog.phaseLabel || 'Pha Phân Tiết'),
      summary: quickEditLog.summary?.trim() || (isStart ? 'Bắt đầu chu kỳ kinh nguyệt mới (Ngày 1).' : 'Ghi nhận bình thường, không có bất thường.'),
      symptoms: quickEditLog.symptoms || [],
      dischargeType: quickEditLog.dischargeType || (isStart ? 'fresh_blood' : 'none'),
      dischargeLabel: quickEditLog.dischargeLabel?.trim() || (isStart ? 'Máu đỏ tươi (Kinh)' : 'Sạch hoàn toàn'),
      painLevel: quickEditLog.painLevel || 'none',
      painDescription: quickEditLog.painDescription?.trim() || undefined,
      eventNote: isStart ? (quickEditLog.eventNote?.trim() || 'Bắt đầu chu kỳ mới') : (quickEditLog.eventNote?.trim() || undefined),
      clinicalInterpretation: quickEditLog.clinicalInterpretation?.trim() || (isStart ? `Ngày 1 của chu kỳ kinh nguyệt mới (${dateVN}).` : 'Sinh lý phụ khoa ổn định.'),
      isKeyMilestone: isStart || Boolean(quickEditLog.eventNote?.trim()),
      isStartOfCycle: isStart,
      hasIntercourse: Boolean(quickEditLog.hasIntercourse),
      intercourseProtection: quickEditLog.hasIntercourse ? quickEditLog.intercourseProtection : undefined,
      intercourseOrgasm: quickEditLog.hasIntercourse ? quickEditLog.intercourseOrgasm : undefined,
      intercourseCount: quickEditLog.hasIntercourse ? (quickEditLog.intercourseCount || 1) : undefined,
      intercourseNote: quickEditLog.hasIntercourse ? quickEditLog.intercourseNote?.trim() : undefined
    };

    // Auto update cycle series if marked as cycle start
    if (isStart) {
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
      upsertCyclesToDB(updatedCycles);
    } else {
      // If unchecked on a day that previously had a cycle start
      const cycleStartingHere = cycles.find(c => c.startDate === dateVN);
      if (cycleStartingHere && cycles.length > 1) {
        const remaining = cycles.filter(c => c.startDate !== dateVN);
        const recalibrated = recalibrateCycles(remaining);
        setCycles(recalibrated);
        deleteCycleFromDB(cycleStartingHere.id);
        upsertCyclesToDB(recalibrated);
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
    setIsQuickEditing(false);
    upsertDailyLogsToDB([fullLog]);
  };

  const handleDeleteLogForDay = (dateStr: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhật ký của ngày ${dateStr}?`)) {
      const updated = dailyLogs.filter(l => l.date !== dateStr);
      setDailyLogs(updated);
      deleteDailyLogFromDB(dateStr);
      showNotification(`Đã xóa nhật ký ngày ${dateStr}!`, 'info');
    }
  };

  const handleToggleSymptom = (tag: string) => {
    const curr = quickEditLog.symptoms || [];
    if (curr.includes(tag)) {
      setQuickEditLog({ ...quickEditLog, symptoms: curr.filter(s => s !== tag) });
    } else {
      setQuickEditLog({ ...quickEditLog, symptoms: [...curr, tag] });
    }
  };

  const handleAddCustomSymptom = () => {
    if (!customSymptomInput.trim()) return;
    const tag = customSymptomInput.trim();
    const curr = quickEditLog.symptoms || [];
    if (!curr.includes(tag)) {
      setQuickEditLog({ ...quickEditLog, symptoms: [...curr, tag] });
    }
    setCustomSymptomInput('');
  };


  const handleSaveCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCycle) return;
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
    setIsCycleModalOpen(false);
    setEditingCycle(null);
    upsertCyclesToDB(recalibrated);
  };

  const handleDeleteCycle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Bạn có chắc muốn xóa chu kỳ này?')) {
      const updated = cycles.filter(c => c.id !== id);
      const recalibrated = recalibrateCycles(updated);
      setCycles(recalibrated);
      deleteCycleFromDB(id);
      showNotification('Đã xóa chu kỳ!', 'info');
    }
  };

  const toggleCycleExpansion = (id: string) => {
    setExpandedCycleIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAllCycles = () => {
    const all: Record<string, boolean> = {};
    cycles.forEach(c => { all[c.id] = true; });
    setExpandedCycleIds(all);
  };

  const collapseAllCycles = () => {
    setExpandedCycleIds({});
  };

  const monthNamesVN = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  return (
    <div className="w-full space-y-6 my-6 font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-16 right-4 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-4 duration-200 ${
          notification.type === 'success' ? 'bg-slate-800 border-slate-600 text-slate-200' :
          notification.type === 'error' ? 'bg-rose-950/80 border-rose-500/40 text-rose-100' :
          'bg-slate-800 border-slate-600 text-slate-300'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-slate-800 rounded cursor-pointer">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* Top Stats Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-700/60 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-rose-400" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-200 tracking-tight uppercase">
            Chỉ Số Thống Kê Chu Kỳ
          </h2>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 bg-slate-800/60 p-1.5 rounded-xl border border-slate-700/50 text-xs shrink-0">
          <div className="text-center px-2.5 border-r border-slate-700/50">
            <div className="text-[9px] text-slate-400 font-semibold uppercase">Chu kỳ TB</div>
            <div className="text-sm font-bold text-slate-200">{dynamicStats.averageCycleLength} <span className="text-[9px] font-normal text-slate-400">ngày</span></div>
          </div>
          <div className="text-center px-2.5 border-r border-slate-700/50">
            <div className="text-[9px] text-slate-400 font-semibold uppercase">Hành kinh</div>
            <div className="text-sm font-bold text-slate-200">{dynamicStats.averagePeriodDuration} <span className="text-[9px] font-normal text-slate-400">ngày</span></div>
          </div>
          <div className="text-center px-2.5">
            <div className="text-[9px] text-slate-400 font-semibold uppercase">Chu kỳ dài</div>
            <div className="text-sm font-bold text-slate-200">{dynamicStats.longCyclePercentage}%</div>
          </div>
        </div>
      </div>

      {/* 3 Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
        <div className="grid grid-cols-3 gap-1 flex-1">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Lịch Tháng</span>
          </button>

          <button
            onClick={() => setActiveTab('tree_view')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'tree_view'
                ? 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Chu Kỳ & Nhật Ký</span>
          </button>

          <button
            onClick={() => setActiveTab('medical_decoder')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'medical_decoder'
                ? 'bg-rose-400/20 text-rose-300 border border-rose-400/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>Giải Mã 4 Pha Sinh Lý</span>
          </button>
        </div>
      </div>

      {/* Dynamic View Panels */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Calendar Slimmer Column (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-700/60 shadow-md space-y-2.5">
              
              {/* Calendar Month/Year Navigator */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-400/60" />
                  <h4 className="text-sm font-black text-white">
                    {monthNamesVN[currentCalMonth]} {currentCalYear}
                  </h4>
                </div>

                {/* Quick jump month controls */}
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => {
                      setCurrentCalYear(2026);
                      setCurrentCalMonth(8); // September
                      setSelectedCalendarDateStr('15/09/2026');
                    }}
                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer border transition-all ${
                      currentCalYear === 2026 && currentCalMonth === 8
                        ? 'bg-rose-400/20 text-rose-300 border-rose-400/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    T9/2026
                  </button>
                  <button
                    onClick={() => {
                      setCurrentCalYear(2026);
                      setCurrentCalMonth(7); // August
                      setSelectedCalendarDateStr('24/08/2026');
                    }}
                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer border transition-all ${
                      currentCalYear === 2026 && currentCalMonth === 7
                        ? 'bg-rose-400/20 text-rose-300 border-rose-400/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    T8/2026
                  </button>
                  <button
                    onClick={handleJumpToToday}
                    className="px-1.5 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold cursor-pointer border border-slate-700"
                  >
                    Hôm Nay
                  </button>
                  <div className="flex items-center bg-slate-800 rounded-md p-0.5 border border-slate-700">
                    <button
                      onClick={handlePrevMonth}
                      className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 cursor-pointer"
                      title="Tháng trước"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 cursor-pointer"
                      title="Tháng sau"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Legend Bar */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-lg bg-slate-800/40 border border-slate-700/40 text-[10px] text-slate-400">
                <span className="font-semibold text-slate-500 flex items-center gap-1">
                  <Sliders className="w-2.5 h-2.5 text-slate-500" />
                  Ký hiệu:
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  <span>Máu đỏ</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  <span>Đốm cam</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                  <span>Rụng trứng</span>
                </div>
                {isAdult && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-400 inline-block" />
                    <span>Quan hệ</span>
                  </div>
                )}
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black text-slate-400">
                <div className="py-0.5">T2</div>
                <div className="py-0.5">T3</div>
                <div className="py-0.5">T4</div>
                <div className="py-0.5">T5</div>
                <div className="py-0.5">T6</div>
                <div className="py-0.5 text-amber-400">T7</div>
                <div className="py-0.5 text-rose-400">CN</div>
              </div>

              {/* Calendar Matrix (Slimmer Cells) */}
              <div className="grid grid-cols-7 gap-1">
                {calendarMatrix.map((cell, idx) => {
                  const isSelected = cell.dateStr === selectedCalendarDateStr;
                  const isToday = cell.dateStr === formatDateToVN(new Date());
                  const hasSpotting = cell.dischargeType === 'orange_spotting';
                  const hasFreshBlood = cell.dischargeType === 'fresh_blood' || cell.isPeriod;
                  const hasPostProc = cell.dischargeType === 'post_procedure_bleeding';
                  const hasBrown = cell.dischargeType === 'brown_blood';
                  const hasMastalgia = cell.log?.symptoms?.some(s => s.toLowerCase().includes('vú') || s.toLowerCase().includes('ngực'));
                  const hasSex = isAdult && cell.hasIntercourse;
                  const hasLog = cell.hasLog;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectDay(cell.dateStr)}
                      className={`min-h-[46px] sm:min-h-[52px] p-1 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                        isSelected
                          ? 'ring-2 ring-rose-400 border-rose-400 bg-rose-950/50 shadow-md z-10'
                          : cell.isCurrentMonth
                          ? hasLog
                            ? hasPostProc || cell.log?.isKeyMilestone
                              ? 'bg-rose-950/30 border-rose-600/60 hover:bg-rose-900/40'
                              : hasFreshBlood || cell.isPeriod
                              ? 'bg-rose-950/25 border-rose-700/50 hover:bg-rose-900/35'
                              : hasSpotting
                              ? 'bg-amber-950/20 border-amber-600/50 hover:bg-amber-900/30'
                              : 'bg-slate-800/60 border-slate-600/60 hover:bg-slate-800'
                            : cell.isPeriod
                            ? 'bg-rose-900/15 border-rose-800/30 hover:bg-rose-900/25'
                            : cell.isOvulation
                            ? 'bg-slate-800/30 border-slate-700/40 hover:bg-slate-800/50'
                            : 'bg-slate-800/15 border-slate-700/20 hover:bg-slate-800/30 hover:border-slate-600/40'
                          : 'bg-transparent border-slate-800/20 text-slate-600 opacity-25 hover:opacity-50'
                      }`}
                    >
                      {/* Top Day Number & Badges */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold ${
                          isSelected ? 'text-rose-300 font-black' :
                          isToday ? 'px-1 rounded bg-rose-400/20 text-rose-300 font-bold text-[9px]' :
                          hasLog ? 'text-white font-bold' :
                          cell.isCurrentMonth ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {cell.dayNumber}
                        </span>

                        {cell.isCycleStart && (
                          <span className="text-[7px] px-1 rounded bg-rose-500/30 text-rose-300 font-bold" title="Bắt đầu chu kỳ">
                            K1
                          </span>
                        )}

                        {!cell.isCycleStart && cell.periodDayNumber && (
                          <span className="text-[7px] px-0.5 rounded bg-rose-400/20 text-rose-300 font-medium">
                            K{cell.periodDayNumber}
                          </span>
                        )}

                        {cell.isOvulationPeak && !cell.isPeriod && (
                          <span className="text-[8px] opacity-80" title="Đỉnh Rụng Trứng">🌸</span>
                        )}
                      </div>

                      {/* Middle Visual Status Dots/Pills */}
                      <div className="my-0.5 flex flex-col gap-0.5">
                        {hasFreshBlood && (
                          <div className="h-1 w-full rounded-full bg-rose-500/80 shadow-xs" title="Máu đỏ (Kinh)" />
                        )}

                        {hasSpotting && (
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs shrink-0" title="Đốm cam" />
                          </div>
                        )}

                        {hasBrown && !hasFreshBlood && (
                          <div className="h-1 w-3/4 rounded-full bg-amber-700/60" title="Nâu sậm" />
                        )}

                        {hasPostProc && (
                          <div className="h-1 w-full rounded-full bg-rose-400 shadow-xs" title="Máu sau sinh thiết Pipelle" />
                        )}
                      </div>

                      {/* Bottom Icon Badges */}
                      <div className="flex items-center justify-between text-[8px]">
                        <div className="flex items-center gap-0.5">
                          {hasSex && (
                            <span title="Có sinh hoạt vợ chồng" className="inline-flex">
                              <Heart className="w-2 h-2 text-rose-400 fill-rose-400" />
                            </span>
                          )}
                          {cell.log?.isKeyMilestone && (
                            <span className="text-[8px]" title="Cột mốc quan trọng">⭐</span>
                          )}
                          {hasMastalgia && (
                            <span className="text-[7px] text-amber-400 font-bold" title="Căng đau vú">⚡</span>
                          )}
                          {cell.log?.eventNote && (
                            <span className="text-[7px]" title={cell.log.eventNote}>🏥</span>
                          )}
                        </div>

                        {hasLog && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Có nhật ký" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Wider Day Content Column (Right 7 Cols - Song Song & Rộng Rãi) */}
          <div className="lg:col-span-7 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl sticky top-20">
            
            {/* Top Header of Day Detail */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 shadow-sm">
                  <CalendarIcon className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>{activeSelectedDayData.date}</span>
                    {activeSelectedDayData.isKeyMilestone && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                        ⭐ Cột Mốc
                      </span>
                    )}
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">
                    {activeSelectedDayData.dayOfWeek} • {activeSelectedDayData.cycleDayText}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isQuickEditing ? (
                  <button
                    onClick={handleStartQuickEdit}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700 shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-300" />
                    <span>{activeSelectedDayData.isVirtual ? 'Ghi Nhật Ký' : 'Sửa Ngày'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsQuickEditing(false)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer border border-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* READ MODE */}
            {!isQuickEditing ? (
              <div className="space-y-4 text-xs sm:text-sm">
                
                {/* Status Badges Row */}
                <div className="flex flex-wrap items-center gap-2">
                  {(activeSelectedDayData.cycleDayNumber === 1 || cycles.some(c => c.startDate === activeSelectedDayData.date) || activeSelectedDayData.isStartOfCycle) && (
                    <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1">
                      <span>🩸 Bắt đầu chu kỳ (K1)</span>
                    </span>
                  )}
                  <span className={`px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1.5 text-xs ${
                    activeSelectedDayData.dischargeType === 'none' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                    activeSelectedDayData.dischargeType === 'orange_spotting' ? 'bg-amber-950/40 text-amber-300 border border-amber-600/40 shadow-xs' :
                    activeSelectedDayData.dischargeType === 'fresh_blood' ? 'bg-rose-950/40 text-rose-300 border border-rose-600/50 shadow-xs' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    <Droplets className="w-3.5 h-3.5 text-rose-400" />
                    <span>{activeSelectedDayData.dischargeLabel}</span>
                  </span>

                  <span className={`px-2.5 py-1 rounded-xl font-semibold text-xs ${
                    activeSelectedDayData.painLevel === 'none' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                    activeSelectedDayData.painLevel === 'mild' ? 'bg-slate-800 text-slate-300 border border-slate-700' :
                    'bg-amber-950/40 text-amber-300 border border-amber-600/40'
                  }`}>
                    Đau: {
                      activeSelectedDayData.painLevel === 'none' ? 'Không đau' :
                      activeSelectedDayData.painLevel === 'mild' ? 'Đau nhẹ' :
                      activeSelectedDayData.painLevel === 'moderate' ? 'Đau vừa' : 'Đau quặn'
                    }
                  </span>

                  <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs">
                    {activeSelectedDayData.phaseLabel}
                  </span>
                </div>

                {/* Intimacy Heart Banner */}
                {activeSelectedDayData.hasIntercourse && isAdult && (
                  <div className="p-3 rounded-2xl bg-rose-950/25 border border-rose-600/30 text-slate-200 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-rose-300 text-xs">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                      <span>Sinh hoạt vợ chồng ghi nhận:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200 font-medium border border-slate-700">
                        {activeSelectedDayData.intercourseCount || 1} lần
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                        {activeSelectedDayData.intercourseProtection === 'protected' ? 'Có bao cao su' : 'Tự nhiên'}
                      </span>
                      {activeSelectedDayData.intercourseOrgasm && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                          Có cực khoái
                        </span>
                      )}
                    </div>
                    {activeSelectedDayData.intercourseNote && (
                      <p className="text-xs text-slate-300 italic pt-0.5">
                        {activeSelectedDayData.intercourseNote}
                      </p>
                    )}
                  </div>
                )}

                {/* Summary Box (Diễn biến trong ngày) */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Diễn biến trong ngày:
                  </div>
                  <p className="text-slate-100 leading-relaxed text-sm">
                    {activeSelectedDayData.summary}
                  </p>
                </div>

                {/* Symptoms Tags */}
                {activeSelectedDayData.symptoms.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Triệu chứng ghi nhận:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeSelectedDayData.symptoms.map((sym, sIdx) => (
                        <span key={sIdx} className="px-2.5 py-1 rounded-xl bg-slate-800/80 text-slate-200 border border-slate-700 text-xs font-medium">
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2-Column Grid for Event Note & Medical Interpretation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {activeSelectedDayData.eventNote && (
                    <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-slate-300 space-y-1">
                      <div className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sự Kiện & Cột Mốc:</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {activeSelectedDayData.eventNote}
                      </p>
                    </div>
                  )}

                  {activeSelectedDayData.clinicalInterpretation && (
                    <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-slate-300 space-y-1">
                      <div className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        <span>Đối Chiếu Y Học Sinh Lý:</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {activeSelectedDayData.clinicalInterpretation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                {!activeSelectedDayData.isVirtual && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleDeleteLogForDay(activeSelectedDayData.date)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa nhật ký ngày này</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* EDIT MODE */
              <form onSubmit={handleSaveQuickEdit} className="space-y-4 text-xs sm:text-sm">

                {/* 0. START CYCLE FLAG TOGGLE */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🩸</span>
                    <div>
                      <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                        <span>Bắt đầu chu kỳ mới (Ngày 1 / K1)</span>
                        {quickEditLog.isStartOfCycle && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 text-[10px] font-bold">Đang Bật</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">Đánh dấu ngày này là ngày bắt đầu kỳ kinh mới</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuickEditLog({ 
                      ...quickEditLog, 
                      isStartOfCycle: !quickEditLog.isStartOfCycle,
                      dischargeType: !quickEditLog.isStartOfCycle && (!quickEditLog.dischargeType || quickEditLog.dischargeType === 'none') ? 'fresh_blood' : quickEditLog.dischargeType,
                      dischargeLabel: !quickEditLog.isStartOfCycle && (!quickEditLog.dischargeLabel || quickEditLog.dischargeLabel === 'Sạch hoàn toàn') ? 'Máu đỏ tươi (Kinh)' : quickEditLog.dischargeLabel
                    })}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                      quickEditLog.isStartOfCycle
                        ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {quickEditLog.isStartOfCycle ? '✓ Ngày 1 (K1)' : 'Đặt làm Ngày 1 (K1)'}
                  </button>
                </div>

                {/* 1. TEXT INPUTS (PRIORITY USER INPUT FIRST) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Ghi chú diễn biến trong ngày:</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="VD: Cả ngày sạch không ra cam, tối hơi mỏi lưng nhẹ..."
                      value={quickEditLog.summary || ''}
                      onChange={(e) => setQuickEditLog({ ...quickEditLog, summary: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Sự kiện đặc biệt / Đi khám (nếu có):</label>
                    <textarea
                      rows={2}
                      placeholder="VD: Sinh thiết Pipelle BV Hùng Vương..."
                      value={quickEditLog.eventNote || ''}
                      onChange={(e) => setQuickEditLog({ ...quickEditLog, eventNote: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500 text-xs"
                    />
                  </div>
                </div>

                {/* 2. OPTIONS: Bleeding Status & Pain Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tình trạng xuất huyết */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">Tình trạng xuất huyết / Dịch:</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { type: 'none', label: 'Sạch hoàn toàn' },
                        { type: 'orange_spotting', label: 'Đốm cam / Cam tươi' },
                        { type: 'fresh_blood', label: 'Máu đỏ tươi (Kinh)' },
                        { type: 'brown_blood', label: 'Máu nâu sẫm' },
                        { type: 'post_procedure_bleeding', label: 'Máu sau thủ thuật' }
                      ].map((item) => {
                        const isSelected = quickEditLog.dischargeType === item.type;
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => setQuickEditLog({ 
                              ...quickEditLog, 
                              dischargeType: item.type as DailyCycleLog['dischargeType'],
                              dischargeLabel: item.label
                            })}
                            className={`p-2 rounded-xl text-left font-medium transition-all cursor-pointer border text-xs ${
                              isSelected
                                ? 'bg-rose-500/20 border-rose-500 text-rose-200 font-bold shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="pt-1">
                      <input
                        type="text"
                        placeholder="Hoặc nhập trường hợp khác..."
                        value={quickEditLog.dischargeLabel || ''}
                        onChange={(e) => setQuickEditLog({ ...quickEditLog, dischargeLabel: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 text-xs"
                      />
                    </div>
                  </div>

                  {/* Mức độ đau */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">Mức độ đau:</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { level: 'none', label: 'Không' },
                        { level: 'mild', label: 'Nhẹ' },
                        { level: 'moderate', label: 'Vừa' },
                        { level: 'severe', label: 'Quặn' }
                      ].map((p) => {
                        const isSelected = quickEditLog.painLevel === p.level;
                        return (
                          <button
                            key={p.level}
                            type="button"
                            onClick={() => setQuickEditLog({ ...quickEditLog, painLevel: p.level as DailyCycleLog['painLevel'] })}
                            className={`py-2 rounded-xl font-bold transition-all text-center cursor-pointer border text-xs ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="pt-1">
                      <input
                        type="text"
                        placeholder="Mô tả đau chi tiết (VD: Căng đau ngực, mỏi lưng...)"
                        value={quickEditLog.painDescription || ''}
                        onChange={(e) => setQuickEditLog({ ...quickEditLog, painDescription: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. OPTIONS: Chọn nhanh triệu chứng */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">Triệu chứng (Click để bật/tắt):</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Căng đau vú PMS',
                      'Đau mỏi thắt lưng',
                      'Đau bụng dưới',
                      'Dính cam băng daily',
                      ...(isAdult ? ['Dính cam sau sinh hoạt'] : []),
                      'Sau tập thể dục',
                      'Người khỏe khoắn',
                      'Ra máu nhiều K1-K2'
                    ].map((tag) => {
                      const isSelected = quickEditLog.symptoms?.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleSymptom(tag)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-rose-500 text-white border-rose-400 font-bold shadow-sm'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{tag}
                        </button>
                      );
                    })}

                    {quickEditLog.symptoms?.filter(s => ![
                      'Căng đau vú PMS',
                      'Đau mỏi thắt lưng',
                      'Đau bụng dưới',
                      'Dính cam băng daily',
                      'Dính cam sau sinh hoạt',
                      'Sau tập thể dục',
                      'Người khỏe khoắn',
                      'Ra máu nhiều K1-K2'
                    ].includes(s)).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleSymptom(tag)}
                        className="px-2.5 py-1 rounded-xl text-xs font-medium bg-rose-900/40 text-rose-300 border-rose-700/50 font-bold shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <span>✓ {tag}</span>
                        <X className="w-3 h-3 text-rose-400 hover:text-white" />
                      </button>
                    ))}
                  </div>

                  {/* Textbox thêm triệu chứng khác */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Nhập thêm triệu chứng khác..."
                      value={customSymptomInput}
                      onChange={(e) => setCustomSymptomInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSymptom();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSymptom}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                    >
                      + Thêm
                    </button>
                  </div>
                </div>

                {/* 4. OPTIONS: Sinh hoạt vợ chồng / Intimacy Section (Chỉ dành cho người >= 18 tuổi đã xác nhận hồ sơ) */}
                {isAdult && (
                  <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-rose-300 font-bold flex items-center gap-1.5 cursor-pointer">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>Sinh hoạt vợ chồng:</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setQuickEditLog({ ...quickEditLog, hasIntercourse: !quickEditLog.hasIntercourse })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          quickEditLog.hasIntercourse
                            ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        {quickEditLog.hasIntercourse ? '❤️ Có ghi nhận' : 'Không'}
                      </button>
                    </div>

                    {quickEditLog.hasIntercourse && (
                      <div className="space-y-2 pt-2 border-t border-rose-900/40 animate-in slide-in-from-top-2 duration-150">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-slate-400">Số lần trong ngày:</label>
                            <select
                              value={quickEditLog.intercourseCount || 1}
                              onChange={(e) => setQuickEditLog({ ...quickEditLog, intercourseCount: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs mt-0.5"
                            >
                              <option value={1}>1 lần</option>
                              <option value={2}>2 lần</option>
                              <option value={3}>3 lần</option>
                              <option value={4}>4+ lần</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-400">Biện pháp bảo vệ:</label>
                            <select
                              value={quickEditLog.intercourseProtection || 'protected'}
                              onChange={(e) => setQuickEditLog({ ...quickEditLog, intercourseProtection: e.target.value as DailyCycleLog['intercourseProtection'] })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs mt-0.5"
                            >
                              <option value="protected">Có bảo vệ (Bao cao su)</option>
                              <option value="unprotected">Không bảo vệ</option>
                              <option value="none">Tự nhiên / Khác</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <label className="text-slate-300 text-[11px] flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(quickEditLog.intercourseOrgasm)}
                              onChange={(e) => setQuickEditLog({ ...quickEditLog, intercourseOrgasm: e.target.checked })}
                              className="rounded bg-slate-950 border-slate-700 text-rose-500 focus:ring-0"
                            />
                            <span>Có đạt cực khoái (Orgasm)</span>
                          </label>
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Ghi chú thêm: VD: Có dính cam nhẹ sau sinh hoạt, không đau..."
                            value={quickEditLog.intercourseNote || ''}
                            onChange={(e) => setQuickEditLog({ ...quickEditLog, intercourseNote: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsQuickEditing(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer text-xs"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-400/20 hover:bg-rose-400/30 text-rose-300 font-bold flex items-center gap-1.5 cursor-pointer border border-rose-400/30 text-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Nhật Ký Ngày</span>
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UNIFIED TREE VIEW (CYCLES AS PARENTS, DAILY LOGS AS CHILDREN) */}
      {/* ========================================================================= */}
      {activeTab === 'tree_view' && (
        <div className="space-y-6">
          
          {/* Top Filter & Toolbar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base">
                <GitBranch className="w-4 h-4 text-rose-400" />
                <span>Danh Sách Chu Kỳ & Nhật Ký ({cycles.length} chu kỳ, {dailyLogs.length} ngày ghi nhận):</span>
              </div>

              {/* Action Buttons: Expand/Collapse All, + Start Cycle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={expandAllCycles}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-700"
                >
                  Mở Rộng Tất Cả
                </button>
                <button
                  onClick={collapseAllCycles}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-700"
                >
                  Thu Gọn
                </button>
                <button
                  onClick={() => {
                    setActiveTab('calendar');
                    handleQuickStartCycleOnDate(formatDateToVN(new Date()));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-400/15 hover:bg-rose-400/25 text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-rose-400/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Chu Kỳ Mới</span>
                </button>
              </div>
            </div>

            {/* Filter Bar: Year Pills + Search Input */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-bold mr-1">Năm:</span>
                <button
                  onClick={() => setTreeYearFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    treeYearFilter === 'all' ? 'bg-rose-500 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  Tất Cả ({cycles.length})
                </button>
                {[2026, 2025, 2024, 2023, 2022].map((y) => {
                  const countInYear = cycles.filter(c => c.year === y).length;
                  return (
                    <button
                      key={y}
                      onClick={() => setTreeYearFilter(y)}
                      className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        treeYearFilter === y ? 'bg-rose-500 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {y} ({countInYear})
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm triệu chứng, ngày, ghi chú..."
                  value={treeSearchQuery}
                  onChange={(e) => setTreeSearchQuery(e.target.value)}
                  className="pl-8 pr-7 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 w-52 sm:w-64"
                />
                {treeSearchQuery && (
                  <button onClick={() => setTreeSearchQuery('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tree Cards List (Parent Cycles with Child Logs) */}
          <div className="space-y-4">
            {treeCyclesHierarchy
              .filter(item => {
                if (treeYearFilter !== 'all' && item.cycle.year !== treeYearFilter) return false;
                if (treeSearchQuery.trim()) {
                  const q = treeSearchQuery.toLowerCase();
                  const matchCycle = item.cycle.dateRangeDisplay.toLowerCase().includes(q) ||
                                     item.cycle.clinicalNote.toLowerCase().includes(q) ||
                                     item.cycle.cycleTypeLabel.toLowerCase().includes(q);
                  const matchLogs = item.childLogs.some(l => 
                    l.date.includes(q) || 
                    l.summary.toLowerCase().includes(q) || 
                    l.symptoms.some(s => s.toLowerCase().includes(q)) ||
                    l.clinicalInterpretation.toLowerCase().includes(q)
                  );
                  if (!matchCycle && !matchLogs) return false;
                }
                return true;
              })
              .map(({ cycle, isOngoing, childLogs }) => {
                const isExpanded = Boolean(expandedCycleIds[cycle.id]);

                return (
                  <div
                    key={cycle.id}
                    className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden shadow-sm transition-all"
                  >
                    {/* PARENT NODE: CYCLE HEADER */}
                    <div
                      onClick={() => toggleCycleExpansion(cycle.id)}
                      className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2 cursor-pointer hover:bg-slate-800/40 transition-colors border-b border-transparent data-[expanded=true]:border-slate-800/60"
                      data-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          className="p-1 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white shrink-0"
                        >
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-rose-400" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                              {isOngoing
                                ? cycle.dateRangeDisplay.split('–')[0].trim()
                                : cycle.dateRangeDisplay}
                              {isOngoing && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                                  Đang diễn ra
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5 text-xs text-slate-500">
                            <span>Chu kỳ: <strong className="text-slate-400">{cycle.cycleLengthDays} ngày</strong></span>
                            <span>•</span>
                            <span>Hành kinh: <strong className="text-slate-400">{cycle.periodDurationDays} ngày</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Parent Cycle Actions */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            const defaultDay = cycle.startDate.includes('/') ? cycle.startDate : formatDateToVN(parseDateUnified(cycle.startDate) || new Date());
                            setSelectedCalendarDateStr(defaultDay);
                            setActiveTab('calendar');
                            handleStartQuickEdit();
                          }}
                          className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-300 cursor-pointer border border-slate-700/60"
                          title="Ghi nhật ký ngày"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingCycle({ ...cycle });
                            setIsCycleModalOpen(true);
                          }}
                          className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer border border-slate-700/60"
                          title="Sửa chu kỳ"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteCycle(cycle.id, e)}
                          className="p-1 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 cursor-pointer border border-slate-700/60"
                          title="Xóa chu kỳ"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* CHILD LOGS LIST (FLAT, BORDERLESS, DENSE) */}
                    {isExpanded && (
                      <div className="px-3.5 sm:px-5 py-2 space-y-1">
                        {cycle.clinicalNote && (
                          <div className="py-1.5 text-xs text-slate-400 italic flex items-center gap-1.5 border-b border-slate-800/40">
                            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{cycle.clinicalNote}</span>
                          </div>
                        )}

                        {childLogs.length > 0 ? (
                          <div className="divide-y divide-slate-800/40">
                            {childLogs.map((log, lIdx) => {
                              const isDay1 = log.cycleDayNumber === 1 || log.cycleDayText?.includes('Ngày 1') || log.date === cycle.startDate;

                              return (
                                <div
                                  key={lIdx}
                                  className={`py-2.5 sm:py-3 transition-colors ${
                                    isDay1 ? 'bg-rose-500/[0.03] -mx-2 px-2 rounded-lg' : ''
                                  }`}
                                >
                                  {/* Line 1: Date, Day label, Badges & Actions */}
                                  <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="font-bold text-slate-200 text-xs sm:text-sm">{log.date}</span>
                                      <span className="text-slate-500">
                                        {/* Chỉ lấy phần tiếng Việt, bỏ "(Monday)" */}
                                        {log.dayOfWeek.split('(')[0].trim()}
                                      </span>
                                      <span className="text-slate-600">•</span>
                                      <span className={`text-[11px] font-medium ${isDay1 ? 'text-rose-400/80' : 'text-slate-400'}`}>
                                        {/* Chỉ lấy phần ngắn trước dấu ( */}
                                        {isDay1 ? 'Ngày 1' : log.cycleDayText.split('(')[0].trim()}
                                      </span>

                                      {/* Discharge Badge — chỉ hiện khi không phải fresh_blood (đã rõ qua summary) */}
                                      {log.dischargeType !== 'none' && log.dischargeType !== 'fresh_blood' && (
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                          log.dischargeType === 'orange_spotting' ? 'bg-rose-900/20 text-rose-400/70' :
                                          'bg-slate-800/50 text-slate-500'
                                        }`}>
                                          {log.dischargeLabel}
                                        </span>
                                      )}

                                      {/* Intimacy Badge */}
                                      {log.hasIntercourse && isAdult && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800/40 text-slate-400 flex items-center gap-1">
                                          <Heart className="w-2.5 h-2.5 text-rose-400/50 fill-rose-400/30" />
                                          <span>{log.intercourseCount || 1}×</span>
                                        </span>
                                      )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => {
                                          setSelectedCalendarDateStr(log.date);
                                          const parsed = parseDateUnified(log.date);
                                          if (parsed) {
                                            setCurrentCalYear(parsed.getFullYear());
                                            setCurrentCalMonth(parsed.getMonth());
                                          }
                                          setActiveTab('calendar');
                                          handleStartQuickEdit();
                                        }}
                                        className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                                        title="Chỉnh sửa"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteLogForDay(log.date)}
                                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                        title="Xóa"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Line 2: Summary */}
                                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                                    {log.summary}
                                  </p>

                                  {/* Line 3: Symptoms & pain — chỉ show khi không phải Day 1 (Day 1 đã có trong summary) */}
                                  {!isDay1 && (log.symptoms.length > 0 || log.painDescription || (isAdult && log.intercourseNote)) && (
                                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 mt-1 text-[10px] text-slate-500">
                                      {log.symptoms.map((s, sIdx) => (
                                        <span key={sIdx} className="px-1.5 py-0.5 rounded bg-slate-800/40 border border-slate-700/40">
                                          {s}
                                        </span>
                                      ))}
                                      {log.painDescription && (
                                        <span className="text-slate-400">⚡ {log.painDescription}</span>
                                      )}
                                      {isAdult && log.hasIntercourse && log.intercourseNote && (
                                        <span className="text-slate-400">❤ {log.intercourseNote}</span>
                                      )}
                                    </div>
                                  )}

                                  {/* Cột mốc — chỉ hiện khi không phải Day 1 */}
                                  {!isDay1 && log.eventNote && (
                                    <div className="mt-0.5 text-[10px] text-slate-500 flex items-start gap-1">
                                      <Sparkles className="w-3 h-3 shrink-0 mt-0.5" />
                                      <span>{log.eventNote}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-3 text-xs text-slate-500 text-center">
                            Chu kỳ lịch sử ({cycle.cycleLengthDays} ngày, hành kinh {cycle.periodDurationDays} ngày) • Chưa có nhật ký chi tiết từng ngày.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MEDICAL DECODER & PATHOLOGY INSIGHTS */}
      {/* ========================================================================= */}
      {activeTab === 'medical_decoder' && (
        <div className="space-y-6">
          
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-800/40 border-l-4 border-rose-400/40 text-slate-300 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-slate-200 text-base">
              <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0" />
              <span>Tổng Quan 4 Pha Chu Kỳ & Sự Thay Đổi Niêm Mạc Tử Cung:</span>
            </div>
            <div className="space-y-2 leading-relaxed text-slate-400 text-xs sm:text-sm">
              <p>
                • <strong className="text-slate-300">Cơ chế điều hòa nội tiết:</strong> Chu kỳ kinh nguyệt được điều hòa nhịp nhàng bởi trục Não bộ – Tuyến yên – Buồng trứng qua sự tương tác giữa hormone FSH, LH, Estrogen và Progesterone.
              </p>
              <p>
                • <strong className="text-slate-300">Biến thiên niêm mạc sinh lý:</strong> Niêm mạc tử cung mỏng nhất sau hành kinh (2-4mm), tăng sinh dần trong pha noãn (7-10mm) và đạt độ dày tối đa (10-16mm) ở pha hoàng thể phân tiết để chuẩn bị môi trường dinh dưỡng nuôi phôi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cyclePhaseAnalyses.map((phase) => (
              <div key={phase.id} className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700/40 pb-2">
                  <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-rose-400/60" />
                    <span>{phase.title}</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">{phase.timeRange}</span>
                </div>

                <div className="space-y-2 text-xs text-slate-400">
                  <div>
                    <span className="font-semibold text-slate-500 uppercase text-[10px]">Sinh lý & Độ dày niêm mạc:</span>
                    <p className="mt-0.5">{phase.physiologicState} (Độ dày: <strong className="text-slate-300">{phase.endometrialThickness}</strong>)</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 uppercase text-[10px]">Cơ chế sinh lý học:</span>
                    <p className="mt-0.5">{phase.clinicalMechanism}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-700/30 border border-slate-600/30 text-slate-300">
                    <strong>Đánh giá sinh lý:</strong> {phase.safetyVerdict}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50 space-y-4">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Giải Mã 3 Hiện Tượng Thường Gặp Ở Phụ Nữ:</span>
            </h4>

            <div className="space-y-3">
              {symptomDecoders.map((dec, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/20 border border-slate-700/30 space-y-2 text-xs">
                  <div className="font-semibold text-slate-200 text-sm">{dec.symptom}</div>
                  <p className="text-slate-400 leading-relaxed">{dec.scientificMechanism}</p>
                  <div className="text-slate-400 font-medium">✓ Cơ sở an toàn: {dec.whyNotCancer}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT CYCLE METADATA */}
      {/* ========================================================================= */}
      {isCycleModalOpen && editingCycle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-rose-400" />
                <span>Chỉnh Sửa Thông Số Chu Kỳ</span>
              </h3>
              <button onClick={() => setIsCycleModalOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCycle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Khoảng thời gian (Hiển thị):</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 24/08/2026 – 28/09/2026"
                    value={editingCycle.dateRangeDisplay}
                    onChange={(e) => setEditingCycle({ ...editingCycle, dateRangeDisplay: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Năm:</label>
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2030}
                    value={editingCycle.year}
                    onChange={(e) => setEditingCycle({ ...editingCycle, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Độ dài chu kỳ (ngày):</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={90}
                    value={editingCycle.cycleLengthDays}
                    onChange={(e) => setEditingCycle({ ...editingCycle, cycleLengthDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Số ngày hành kinh (ngày):</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={20}
                    value={editingCycle.periodDurationDays}
                    onChange={(e) => setEditingCycle({ ...editingCycle, periodDurationDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Phân loại chu kỳ:</label>
                <select
                  value={editingCycle.cycleType}
                  onChange={(e) => {
                    const val = e.target.value as HistoricalCycle['cycleType'];
                    const labelMap = {
                      'standard': `Chu kỳ chuẩn (${editingCycle.cycleLengthDays} ngày)`,
                      'normal_long': `Chu kỳ dài sinh lý (${editingCycle.cycleLengthDays} ngày)`,
                      'delayed_long': `Chu kỳ thưa (${editingCycle.cycleLengthDays} ngày)`,
                      'short_breakthrough': `Chu kỳ ngắn không phóng noãn (${editingCycle.cycleLengthDays} ngày)`
                    };
                    setEditingCycle({ 
                      ...editingCycle, 
                      cycleType: val,
                      cycleTypeLabel: labelMap[val] || 'Chu kỳ bình thường'
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="normal_long">Chu kỳ dài sinh lý (30 - 42 ngày)</option>
                  <option value="standard">Chu kỳ chuẩn (26 - 30 ngày)</option>
                  <option value="delayed_long">Chu kỳ thưa / trễ (&gt; 43 ngày)</option>
                  <option value="short_breakthrough">Chu kỳ ngắn / không phóng noãn (&lt; 25 ngày)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Ghi chú diễn biến:</label>
                <textarea
                  rows={2}
                  value={editingCycle.clinicalNote}
                  onChange={(e) => setEditingCycle({ ...editingCycle, clinicalNote: e.target.value })}
                  placeholder="Triệu chứng, lượng máu..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCycleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-400/20 hover:bg-rose-400/30 text-rose-300 font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer border border-rose-400/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Chu Kỳ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
