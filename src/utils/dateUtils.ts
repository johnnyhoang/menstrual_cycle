import { menstrualCycleLogs as initialDailyLogs, historicalCyclesData as initialHistoricalCycles } from '../data/menstrualCycleLogData';
import type { DailyCycleLog, HistoricalCycle } from '../data/menstrualCycleLogData';

/**
 * Robustly parse any date string into JS Date object.
 * Supports DD/MM/YYYY, YYYY-MM-DD, or standard Date string formats.
 */
export function parseDateUnified(dateStr: string): Date | null {
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

/**
 * Format Date object to DD/MM/YYYY format.
 */
export function formatDateToVN(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get weekday name in Vietnamese.
 */
export function getWeekdayVN(d: Date): string {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return days[d.getDay()];
}

/**
 * Recalibrate and auto-close previous cycles based on start dates.
 */
export function recalibrateCycles(cyclesList: HistoricalCycle[]): HistoricalCycle[] {
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

  return updated.sort((a, b) => {
    const da = parseDateUnified(a.startDate)?.getTime() || 0;
    const db = parseDateUnified(b.startDate)?.getTime() || 0;
    return db - da;
  });
}

/**
 * Merge loaded logs with initial clinical dataset to guarantee core biopsy records are preserved.
 */
export function mergeWithInitialLogs(loadedLogs: DailyCycleLog[]): DailyCycleLog[] {
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

/**
 * Merge loaded historical cycles with initial default cycles.
 */
export function mergeWithInitialCycles(loadedCycles: HistoricalCycle[]): HistoricalCycle[] {
  const map = new Map<string, HistoricalCycle>();
  initialHistoricalCycles.forEach(c => map.set(c.id, c));
  loadedCycles.forEach(c => map.set(c.id, c));
  return recalibrateCycles(Array.from(map.values()));
}
