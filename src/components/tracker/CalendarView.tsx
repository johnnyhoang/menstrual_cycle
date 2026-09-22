import React, { useMemo } from 'react';
import type { DailyCycleLog, HistoricalCycle } from '../../data/menstrualCycleLogData';
import { parseDateUnified, formatDateToVN, getWeekdayVN } from '../../utils/dateUtils';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Droplets, 
  Heart, 
  Sparkles, 
  Edit3, 
  X, 
  Trash2, 
  Info 
} from 'lucide-react';

interface CalendarViewProps {
  currentCalYear: number;
  currentCalMonth: number;
  selectedCalendarDateStr: string;
  isQuickEditing: boolean;
  cycles: HistoricalCycle[];
  dailyLogsMap: Map<string, DailyCycleLog>;
  isAdult: boolean;
  onSelectDay: (dateStr: string) => void;
  onChangeMonth: (year: number, month: number) => void;
  onStartQuickEdit: () => void;
  onCloseQuickEdit: () => void;
  onDeleteLogForDay: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentCalYear,
  currentCalMonth,
  selectedCalendarDateStr,
  isQuickEditing,
  cycles,
  dailyLogsMap,
  isAdult,
  onSelectDay,
  onChangeMonth,
  onStartQuickEdit,
  onCloseQuickEdit,
  onDeleteLogForDay,
}) => {
  const monthNamesVN = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

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

  // Build Calendar Matrix for current month
  const calendarMatrix = useMemo(() => {
    const firstDayOfMonth = new Date(currentCalYear, currentCalMonth, 1);
    const lastDayOfMonth = new Date(currentCalYear, currentCalMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    let startingDay = firstDayOfMonth.getDay() - 1;
    if (startingDay === -1) startingDay = 6; // Sunday

    const sortedCyclesAsc = [...cycles].sort((a, b) => {
      const da = parseDateUnified(a.startDate)?.getTime() || 0;
      const db = parseDateUnified(b.startDate)?.getTime() || 0;
      return da - db;
    });

    const getCycleDayNumberForDate = (d: Date): number | undefined => {
      const dTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      for (let idx = sortedCyclesAsc.length - 1; idx >= 0; idx--) {
        const c = sortedCyclesAsc[idx];
        const sDate = parseDateUnified(c.startDate);
        if (!sDate) continue;
        const sTime = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate()).getTime();
        if (dTime >= sTime) {
          return Math.floor((dTime - sTime) / (1000 * 60 * 60 * 24)) + 1;
        }
      }
      return undefined;
    };

    const matrix: Array<{
      date: Date;
      dateStr: string;
      isCurrentMonth: boolean;
      dayNumber: number;
      cycleDayNumber?: number;
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
        cycleDayNumber: getCycleDayNumberForDate(d),
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
        cycleDayNumber: getCycleDayNumberForDate(d),
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
          cycleDayNumber: getCycleDayNumberForDate(d),
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

  // Selected date log or virtual fallback
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

  const handlePrevMonth = () => {
    if (currentCalMonth === 0) {
      onChangeMonth(currentCalYear - 1, 11);
    } else {
      onChangeMonth(currentCalYear, currentCalMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentCalMonth === 11) {
      onChangeMonth(currentCalYear + 1, 0);
    } else {
      onChangeMonth(currentCalYear, currentCalMonth + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    onChangeMonth(now.getFullYear(), now.getMonth());
    onSelectDay(formatDateToVN(now));
  };

  // Keyboard navigation for calendar matrix
  const handleKeyDownCell = (e: React.KeyboardEvent, dateStr: string, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectDay(dateStr);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextCell = calendarMatrix[idx + 1];
      if (nextCell) onSelectDay(nextCell.dateStr);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevCell = calendarMatrix[idx - 1];
      if (prevCell) onSelectDay(prevCell.dateStr);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const downCell = calendarMatrix[idx + 7];
      if (downCell) onSelectDay(downCell.dateStr);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const upCell = calendarMatrix[idx - 7];
      if (upCell) onSelectDay(upCell.dateStr);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Calendar Column (Left 5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#f8bbd0] shadow-sm space-y-4">
          
          {/* Navigator Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-100 pb-3">
            <h3 className="text-base font-bold text-[#6a4c46] flex items-center gap-2 font-comfortaa">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              <span>{monthNamesVN[currentCalMonth]} {currentCalYear}</span>
            </h3>

            {/* Jump controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  onChangeMonth(2026, 8); // Sept 2026
                  onSelectDay('15/09/2026');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentCalYear === 2026 && currentCalMonth === 8
                    ? 'bg-pink-500 text-white shadow-xs'
                    : 'bg-pink-50 hover:bg-pink-100 text-[#6a4c46] border border-pink-200'
                }`}
              >
                T9/2026
              </button>
              <button
                onClick={() => {
                  onChangeMonth(2026, 7); // Aug 2026
                  onSelectDay('24/08/2026');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentCalYear === 2026 && currentCalMonth === 7
                    ? 'bg-pink-500 text-white shadow-xs'
                    : 'bg-pink-50 hover:bg-pink-100 text-[#6a4c46] border border-pink-200'
                }`}
              >
                T8/2026
              </button>
              <button
                onClick={handleJumpToToday}
                className="px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#6a4c46] text-xs font-bold border border-pink-200 cursor-pointer"
              >
                Hôm Nay
              </button>
              <div className="flex items-center bg-pink-50 rounded-xl p-0.5 border border-pink-200">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 text-[#6a4c46] hover:bg-white rounded-lg cursor-pointer"
                  title="Tháng trước"
                  aria-label="Tháng trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 text-[#6a4c46] hover:bg-white rounded-lg cursor-pointer"
                  title="Tháng sau"
                  aria-label="Tháng sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-2xl bg-[#fff8f9] border border-pink-100 text-xs text-[#6a4c46]">
            <span className="font-bold text-[#6a4c46]/80 font-comfortaa">Ký hiệu:</span>
            <span className="flex items-center gap-1.5 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Kinh nguyệt</span>
            <span className="flex items-center gap-1.5 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Đốm cam</span>
            <span className="flex items-center gap-1.5 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Rụng trứng</span>
            {isAdult && (
              <span className="flex items-center gap-1 text-pink-600 font-medium"><Heart className="w-3 h-3 fill-pink-400/60" /> Quan hệ</span>
            )}
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#6a4c46]/70">
            <div className="py-1">T2</div>
            <div className="py-1">T3</div>
            <div className="py-1">T4</div>
            <div className="py-1">T5</div>
            <div className="py-1">T6</div>
            <div className="py-1 text-amber-600">T7</div>
            <div className="py-1 text-pink-600">CN</div>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Lịch tháng theo dõi chu kỳ">
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
                  tabIndex={0}
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-label={`${cell.dateStr}${cell.isPeriod ? ', Có kinh nguyệt' : ''}${hasLog ? ', Có nhật ký' : ''}`}
                  onClick={() => onSelectDay(cell.dateStr)}
                  onKeyDown={(e) => handleKeyDownCell(e, cell.dateStr, idx)}
                  className={`min-h-[50px] p-1.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none ${
                    isSelected
                      ? 'ring-2 ring-pink-500 border-pink-500 bg-pink-100/90 shadow-sm'
                      : cell.isCurrentMonth
                      ? hasLog
                        ? hasPostProc || cell.log?.isKeyMilestone
                          ? 'bg-pink-100/80 border-pink-300 hover:bg-pink-200/80'
                          : hasFreshBlood || cell.isPeriod
                          ? 'bg-pink-100/70 border-pink-300 hover:bg-pink-200/60'
                          : hasSpotting
                          ? 'bg-amber-100/70 border-amber-300 hover:bg-amber-200/60'
                          : 'bg-white border-pink-200/80 hover:bg-pink-50'
                        : cell.isPeriod
                        ? 'bg-pink-100/50 border-pink-200 hover:bg-pink-100/80'
                        : cell.isOvulation
                        ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/60'
                        : 'bg-white/70 border-pink-100 hover:bg-pink-50/50'
                      : 'bg-transparent border-pink-100/40 text-pink-300 opacity-40 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      isSelected ? 'text-pink-900 font-black' :
                      isToday ? 'px-1 rounded bg-pink-500 text-white font-bold text-[10px]' :
                      hasLog ? 'text-[#6a4c46] font-bold' :
                      cell.isCurrentMonth ? 'text-[#6a4c46]' : 'text-[#6a4c46]/40'
                    }`}>
                      {cell.dayNumber}
                    </span>

                    {cell.cycleDayNumber !== undefined && (
                      <span className={`text-[9px] font-bold px-1 rounded-full ${
                        cell.isCycleStart
                          ? 'bg-pink-500 text-white'
                          : cell.isPeriod
                          ? 'bg-pink-200 text-pink-900'
                          : 'bg-pink-50 text-[#6a4c46]/70'
                      }`} title={`Ngày thứ ${cell.cycleDayNumber} của chu kỳ`}>
                        {cell.cycleDayNumber}
                      </span>
                    )}
                  </div>

                  <div className="my-0.5 flex flex-col gap-0.5">
                    {hasFreshBlood && <div className="h-1 w-full rounded-full bg-pink-500" title="Máu kinh đỏ" />}
                    {hasSpotting && <div className="h-1 w-full rounded-full bg-amber-400" title="Đốm cam" />}
                    {hasBrown && !hasFreshBlood && <div className="h-1 w-3/4 rounded-full bg-amber-700/80" title="Máu nâu" />}
                    {hasPostProc && <div className="h-1 w-full rounded-full bg-pink-400" title="Máu thủ thuật" />}
                  </div>

                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-1">
                      {hasSex && <Heart className="w-2.5 h-2.5 text-pink-500 fill-pink-500" />}
                      {cell.log?.isKeyMilestone && <span>⭐</span>}
                      {hasMastalgia && <span className="text-amber-500 font-bold">⚡</span>}
                    </div>
                    {hasLog && <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Detail Column (Right 7 cols) */}
      <div className="lg:col-span-7 bg-white border border-[#f8bbd0] rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-pink-100 text-pink-600 border border-pink-200">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#6a4c46] flex items-center gap-2 font-comfortaa">
                <span>{activeSelectedDayData.date}</span>
                {activeSelectedDayData.isKeyMilestone && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                    ⭐ Cột Mốc
                  </span>
                )}
              </h3>
              <span className="text-xs text-[#6a4c46]/70 font-medium">
                {activeSelectedDayData.dayOfWeek} • {activeSelectedDayData.cycleDayText}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isQuickEditing ? (
              <button
                onClick={onStartQuickEdit}
                className="px-4 py-2 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs font-comfortaa"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{activeSelectedDayData.isVirtual ? 'Ghi Nhật Ký' : 'Sửa Ngày'}</span>
              </button>
            ) : (
              <button
                onClick={onCloseQuickEdit}
                className="p-2 rounded-xl bg-pink-50 text-[#6a4c46] hover:bg-pink-100 cursor-pointer border border-pink-200"
                aria-label="Đóng chỉnh sửa"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Read Mode View */}
        <div className="space-y-4 text-xs sm:text-sm text-[#4a4c46]">
          <div className="flex flex-wrap items-center gap-2">
            {(activeSelectedDayData.cycleDayNumber === 1 || cycles.some(c => c.startDate === activeSelectedDayData.date) || activeSelectedDayData.isStartOfCycle) && (
              <span className="px-3 py-1 rounded-full bg-pink-500 text-white font-bold text-xs shadow-xs">
                🩸 Bắt đầu chu kỳ (K1)
              </span>
            )}
            <span className={`px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 text-xs ${
              activeSelectedDayData.dischargeType === 'none' ? 'bg-pink-50 text-[#6a4c46] border border-pink-200' :
              activeSelectedDayData.dischargeType === 'orange_spotting' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
              activeSelectedDayData.dischargeType === 'fresh_blood' ? 'bg-pink-100 text-pink-900 border border-pink-300 font-bold' :
              'bg-pink-50 text-[#6a4c46] border border-pink-200'
            }`}>
              <Droplets className="w-3.5 h-3.5 text-pink-500" />
              <span>{activeSelectedDayData.dischargeLabel}</span>
            </span>

            <span className="px-3 py-1 rounded-full bg-pink-50 text-[#6a4c46] border border-pink-200 font-semibold text-xs">
              Đau: {
                activeSelectedDayData.painLevel === 'none' ? 'Không đau' :
                activeSelectedDayData.painLevel === 'mild' ? 'Đau nhẹ' :
                activeSelectedDayData.painLevel === 'moderate' ? 'Đau vừa' : 'Đau quặn'
              }
            </span>

            <span className="px-3 py-1 rounded-full bg-pink-50 text-[#6a4c46] border border-pink-200 font-semibold text-xs">
              {activeSelectedDayData.phaseLabel}
            </span>
          </div>

          {activeSelectedDayData.hasIntercourse && isAdult && (
            <div className="p-4 rounded-2xl bg-pink-50/80 border border-pink-200 text-[#4a4c46] space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-pink-700 text-xs font-comfortaa">
                <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                <span>Sinh hoạt vợ chồng ghi nhận:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#4a4c46]">
                <span className="px-2.5 py-0.5 rounded-full bg-white text-[#6a4c46] font-semibold border border-pink-200">
                  {activeSelectedDayData.intercourseCount || 1} lần
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-[#6a4c46] border border-pink-200">
                  {activeSelectedDayData.intercourseProtection === 'protected' ? 'Có bao cao su' : 'Tự nhiên'}
                </span>
                {activeSelectedDayData.intercourseOrgasm && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white text-[#6a4c46] border border-pink-200">
                    Có cực khoái
                  </span>
                )}
              </div>
              {activeSelectedDayData.intercourseNote && (
                <p className="text-xs text-[#6a4c46] italic pt-0.5">
                  {activeSelectedDayData.intercourseNote}
                </p>
              )}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#fff8f9] border border-pink-100 space-y-1">
            <div className="text-[11px] font-bold text-[#6a4c46]/70 uppercase tracking-wider font-comfortaa">
              Diễn biến trong ngày:
            </div>
            <p className="text-[#4a4c46] leading-relaxed text-sm">
              {activeSelectedDayData.summary}
            </p>
          </div>

          {activeSelectedDayData.symptoms.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-[#6a4c46]/70 uppercase tracking-wider font-comfortaa">
                Triệu chứng ghi nhận:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeSelectedDayData.symptoms.map((sym, sIdx) => (
                  <span key={sIdx} className="px-3 py-1 rounded-xl bg-pink-50 text-[#6a4c46] border border-pink-200 text-xs font-semibold">
                    {sym}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {activeSelectedDayData.eventNote && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5 font-comfortaa">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sự Kiện & Cột Mốc:</span>
                </div>
                <p className="text-xs leading-relaxed">
                  {activeSelectedDayData.eventNote}
                </p>
              </div>
            )}

            {activeSelectedDayData.clinicalInterpretation && (
              <div className="p-3.5 rounded-2xl bg-[#fff8f9] border border-pink-100 text-[#4a4c46] space-y-1">
                <div className="font-bold text-[#6a4c46] text-xs flex items-center gap-1.5 font-comfortaa">
                  <Info className="w-3.5 h-3.5 text-pink-500" />
                  <span>Đối Chiếu Y Học Sinh Lý:</span>
                </div>
                <p className="text-xs text-[#6a4c46]/80 leading-relaxed">
                  {activeSelectedDayData.clinicalInterpretation}
                </p>
              </div>
            )}
          </div>

          {!activeSelectedDayData.isVirtual && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  if (window.confirm(`Bạn có chắc muốn xóa nhật ký ngày ${activeSelectedDayData.date}?`)) {
                    onDeleteLogForDay(activeSelectedDayData.date);
                  }
                }}
                className="text-xs text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa nhật ký ngày này</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
