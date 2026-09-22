import React, { useState, useMemo } from 'react';
import type { DailyCycleLog, HistoricalCycle } from '../../data/menstrualCycleLogData';
import { parseDateUnified, formatDateToVN } from '../../utils/dateUtils';
import { 
  GitBranch, 
  Search, 
  X, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  Heart, 
  Sparkles, 
  Info,
  FolderSearch
} from 'lucide-react';

interface TreeViewProps {
  cycles: HistoricalCycle[];
  dailyLogs: DailyCycleLog[];
  isAdult: boolean;
  onStartQuickEditOnDate: (dateStr: string) => void;
  onOpenEditCycleModal: (cycle: HistoricalCycle) => void;
  onDeleteCycle: (id: string) => void;
  onDeleteLogForDay: (dateStr: string) => void;
}

export const TreeView: React.FC<TreeViewProps> = ({
  cycles,
  dailyLogs,
  isAdult,
  onStartQuickEditOnDate,
  onOpenEditCycleModal,
  onDeleteCycle,
  onDeleteLogForDay
}) => {
  const [treeYearFilter, setTreeYearFilter] = useState<number | 'all'>('all');
  const [treeSearchQuery, setTreeSearchQuery] = useState<string>('');
  const [expandedCycleIds, setExpandedCycleIds] = useState<Record<string, boolean>>({});

  // Tree View Hierarchy computation
  const treeCyclesHierarchy = useMemo(() => {
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
        return da - db;
      });

      return {
        cycle,
        sDate,
        isOngoing,
        childLogs
      };
    });

    return hierarchy.reverse();
  }, [cycles, dailyLogs]);

  // Filtered Hierarchy
  const filteredHierarchy = useMemo(() => {
    return treeCyclesHierarchy.filter(item => {
      if (treeYearFilter !== 'all' && item.cycle.year !== treeYearFilter) return false;
      if (treeSearchQuery.trim()) {
        const q = treeSearchQuery.toLowerCase().trim();
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
    });
  }, [treeCyclesHierarchy, treeYearFilter, treeSearchQuery]);

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

  return (
    <div className="space-y-5">
      {/* Filter & Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm sm:text-base">
            <GitBranch className="w-4 h-4 text-rose-400" />
            <span>Danh Sách Chu Kỳ & Nhật Ký ({cycles.length} chu kỳ, {dailyLogs.length} ngày ghi nhận)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAllCycles}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-600"
            >
              Mở Rộng Tất Cả
            </button>
            <button
              onClick={collapseAllCycles}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-600"
            >
              Thu Gọn
            </button>
            <button
              onClick={() => onStartQuickEditOnDate(formatDateToVN(new Date()))}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-rose-500/40"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Chu Kỳ Mới</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: Year Pills + Search Input */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/60">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">Năm:</span>
            <button
              onClick={() => setTreeYearFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                treeYearFilter === 'all'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-slate-200'
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
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    treeYearFilter === y
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {y} ({countInYear})
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm triệu chứng, ngày, ghi chú..."
              value={treeSearchQuery}
              onChange={(e) => setTreeSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 w-52 sm:w-64"
            />
            {treeSearchQuery && (
              <button
                onClick={() => setTreeSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-100 cursor-pointer"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tree Items / Cards */}
      <div className="space-y-4">
        {filteredHierarchy.length > 0 ? (
          filteredHierarchy.map(({ cycle, isOngoing, childLogs }) => {
            const isExpanded = Boolean(expandedCycleIds[cycle.id]);

            return (
              <div
                key={cycle.id}
                className="rounded-xl bg-slate-800/60 border border-slate-700/80 overflow-hidden shadow-xs transition-all"
              >
                {/* Cycle Parent Row */}
                <div
                  onClick={() => toggleCycleExpansion(cycle.id)}
                  className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-700/40 transition-colors border-b border-transparent data-[expanded=true]:border-slate-700/60"
                  data-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="p-1 rounded-lg bg-slate-900/80 text-slate-400 hover:text-slate-100 shrink-0"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-rose-400" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                          {isOngoing
                            ? cycle.dateRangeDisplay.split('–')[0].trim()
                            : cycle.dateRangeDisplay}
                          {isOngoing && (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                              Đang diễn ra
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-slate-400">
                        <span>Chu kỳ: <strong className="text-slate-200">{cycle.cycleLengthDays} ngày</strong></span>
                        <span>•</span>
                        <span>Hành kinh: <strong className="text-slate-200">{cycle.periodDurationDays} ngày</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onStartQuickEditOnDate(cycle.startDate)}
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-slate-400 hover:text-rose-300 cursor-pointer border border-slate-700"
                      title="Ghi nhật ký ngày"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onOpenEditCycleModal(cycle)}
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 cursor-pointer border border-slate-700"
                      title="Sửa chu kỳ"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteCycle(cycle.id)}
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 cursor-pointer border border-slate-700"
                      title="Xóa chu kỳ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Child Logs */}
                {isExpanded && (
                  <div className="px-4 py-3 space-y-2 bg-slate-900/40">
                    {cycle.clinicalNote && (
                      <div className="py-1.5 text-xs text-slate-400 italic flex items-center gap-1.5 border-b border-slate-700/40">
                        <Info className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{cycle.clinicalNote}</span>
                      </div>
                    )}

                    {childLogs.length > 0 ? (
                      <div className="divide-y divide-slate-700/40">
                        {childLogs.map((log, lIdx) => {
                          const isDay1 = log.cycleDayNumber === 1 || log.cycleDayText?.includes('Ngày 1') || log.date === cycle.startDate;

                          return (
                            <div
                              key={lIdx}
                              className={`py-3 transition-colors ${
                                isDay1 ? 'bg-rose-500/[0.04] -mx-2 px-2 rounded-lg' : ''
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-slate-100 text-xs sm:text-sm">{log.date}</span>
                                  <span className="text-slate-400">{log.dayOfWeek.split('(')[0].trim()}</span>
                                  <span className="text-slate-600">•</span>
                                  <span className={`text-xs font-semibold ${isDay1 ? 'text-rose-300' : 'text-slate-300'}`}>
                                    {isDay1 ? 'Ngày 1' : log.cycleDayText.split('(')[0].trim()}
                                  </span>

                                  {log.dischargeType !== 'none' && log.dischargeType !== 'fresh_blood' && (
                                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                                      {log.dischargeLabel}
                                    </span>
                                  )}

                                  {log.hasIntercourse && isAdult && (
                                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-rose-300 border border-slate-700 flex items-center gap-1">
                                      <Heart className="w-3 h-3 text-rose-400 fill-rose-400/40" />
                                      <span>{log.intercourseCount || 1} lần</span>
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => onStartQuickEditOnDate(log.date)}
                                    className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors cursor-pointer"
                                    title="Chỉnh sửa nhật ký"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Bạn có chắc muốn xóa nhật ký ngày ${log.date}?`)) {
                                        onDeleteLogForDay(log.date);
                                      }
                                    }}
                                    className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors cursor-pointer"
                                    title="Xóa nhật ký"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                {log.summary}
                              </p>

                              {!isDay1 && (log.symptoms.length > 0 || log.painDescription || (isAdult && log.intercourseNote)) && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs text-slate-400">
                                  {log.symptoms.map((s, sIdx) => (
                                    <span key={sIdx} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                                      {s}
                                    </span>
                                  ))}
                                  {log.painDescription && (
                                    <span className="text-slate-300">⚡ {log.painDescription}</span>
                                  )}
                                  {isAdult && log.hasIntercourse && log.intercourseNote && (
                                    <span className="text-slate-300">❤ {log.intercourseNote}</span>
                                  )}
                                </div>
                              )}

                              {!isDay1 && log.eventNote && (
                                <div className="mt-1 text-xs text-slate-400 flex items-start gap-1">
                                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                                  <span>{log.eventNote}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-4 text-xs text-slate-400 text-center">
                        Chu kỳ lịch sử ({cycle.cycleLengthDays} ngày, hành kinh {cycle.periodDurationDays} ngày) • Chưa có nhật ký chi tiết từng ngày.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* Empty Search State */
          <div className="p-8 text-center bg-slate-800/60 border border-slate-700/80 rounded-xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
              <FolderSearch className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-200">Không tìm thấy ghi nhận phù hợp</h4>
              <p className="text-xs text-slate-400">
                Không có chu kỳ hoặc nhật ký nào khớp với từ khóa &quot;<strong className="text-slate-300">{treeSearchQuery}</strong>&quot;.
              </p>
            </div>
            <button
              onClick={() => setTreeSearchQuery('')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-600"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
