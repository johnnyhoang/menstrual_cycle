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
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#f8bbd0] space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#6a4c46] font-bold text-sm sm:text-base font-comfortaa">
            <GitBranch className="w-4 h-4 text-pink-500" />
            <span>Danh Sách Chu Kỳ & Nhật Ký ({cycles.length} chu kỳ, {dailyLogs.length} ngày ghi nhận)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAllCycles}
              className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#6a4c46] text-xs font-bold transition-all cursor-pointer border border-pink-200"
            >
              Mở Rộng Tất Cả
            </button>
            <button
              onClick={collapseAllCycles}
              className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#6a4c46]/70 hover:text-[#6a4c46] text-xs font-bold transition-all cursor-pointer border border-pink-200"
            >
              Thu Gọn
            </button>
            <button
              onClick={() => onStartQuickEditOnDate(formatDateToVN(new Date()))}
              className="px-3.5 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all font-comfortaa"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Chu Kỳ Mới</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: Year Pills + Search Input */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-pink-100">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#6a4c46]/70 font-semibold mr-1 font-comfortaa">Năm:</span>
            <button
              onClick={() => setTreeYearFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                treeYearFilter === 'all'
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'bg-pink-50 text-[#6a4c46] border border-pink-200 hover:bg-pink-100'
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
                    treeYearFilter === y
                      ? 'bg-pink-500 text-white shadow-xs'
                      : 'bg-pink-50 text-[#6a4c46] border border-pink-200 hover:bg-pink-100'
                  }`}
                >
                  {y} ({countInYear})
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-pink-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm triệu chứng, ngày, ghi chú..."
              value={treeSearchQuery}
              onChange={(e) => setTreeSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-1.5 rounded-2xl bg-[#fff8f9] border border-pink-200 text-xs text-[#6a4c46] placeholder:text-pink-300 focus:outline-none focus:border-pink-400 w-52 sm:w-64"
            />
            {treeSearchQuery && (
              <button
                onClick={() => setTreeSearchQuery('')}
                className="absolute right-2.5 top-2 text-pink-400 hover:text-pink-600 cursor-pointer"
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
                className="rounded-3xl bg-white border border-[#f8bbd0] overflow-hidden shadow-xs transition-all"
              >
                {/* Cycle Parent Row */}
                <div
                  onClick={() => toggleCycleExpansion(cycle.id)}
                  className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-pink-50/50 transition-colors border-b border-transparent data-[expanded=true]:border-pink-100"
                  data-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="p-1.5 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 shrink-0"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-pink-600" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-[#6a4c46] flex items-center gap-2 font-comfortaa">
                          {isOngoing
                            ? cycle.dateRangeDisplay.split('–')[0].trim()
                            : cycle.dateRangeDisplay}
                          {isOngoing && (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-300 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                              Đang diễn ra
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-[#6a4c46]/70">
                        <span>Chu kỳ: <strong className="text-[#6a4c46]">{cycle.cycleLengthDays} ngày</strong></span>
                        <span>•</span>
                        <span>Hành kinh: <strong className="text-[#6a4c46]">{cycle.periodDurationDays} ngày</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onStartQuickEditOnDate(cycle.startDate)}
                      className="p-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 cursor-pointer border border-pink-200"
                      title="Ghi nhật ký ngày"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onOpenEditCycleModal(cycle)}
                      className="p-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#6a4c46] cursor-pointer border border-pink-200"
                      title="Sửa chu kỳ"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteCycle(cycle.id)}
                      className="p-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 cursor-pointer border border-pink-200"
                      title="Xóa chu kỳ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Child Logs */}
                {isExpanded && (
                  <div className="px-4 py-3 space-y-2 bg-[#fff8f9]">
                    {cycle.clinicalNote && (
                      <div className="py-2 text-xs text-[#6a4c46]/80 italic flex items-center gap-1.5 border-b border-pink-100">
                        <Info className="w-4 h-4 text-pink-500 shrink-0" />
                        <span>{cycle.clinicalNote}</span>
                      </div>
                    )}

                    {childLogs.length > 0 ? (
                      <div className="divide-y divide-pink-100">
                        {childLogs.map((log, lIdx) => {
                          const isDay1 = log.cycleDayNumber === 1 || log.cycleDayText?.includes('Ngày 1') || log.date === cycle.startDate;

                          return (
                            <div
                              key={lIdx}
                              className={`py-3 transition-colors ${
                                isDay1 ? 'bg-pink-100/50 -mx-2 px-3 rounded-2xl' : ''
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-[#6a4c46] text-xs sm:text-sm font-comfortaa">{log.date}</span>
                                  <span className="text-[#6a4c46]/70">{log.dayOfWeek.split('(')[0].trim()}</span>
                                  <span className="text-pink-300">•</span>
                                  <span className={`text-xs font-bold ${isDay1 ? 'text-pink-700' : 'text-[#6a4c46]'}`}>
                                    {isDay1 ? 'Ngày 1' : log.cycleDayText.split('(')[0].trim()}
                                  </span>

                                  {log.dischargeType !== 'none' && log.dischargeType !== 'fresh_blood' && (
                                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-white text-[#6a4c46] border border-pink-200">
                                      {log.dischargeLabel}
                                    </span>
                                  )}

                                  {log.hasIntercourse && isAdult && (
                                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-pink-100 text-pink-800 border border-pink-300 flex items-center gap-1">
                                      <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                                      <span>{log.intercourseCount || 1} lần</span>
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => onStartQuickEditOnDate(log.date)}
                                    className="p-1.5 rounded-lg text-[#6a4c46] hover:bg-white transition-colors cursor-pointer"
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
                                    className="p-1.5 rounded-lg text-pink-600 hover:bg-white transition-colors cursor-pointer"
                                    title="Xóa nhật ký"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <p className="text-xs text-[#4a4c46] mt-1 leading-relaxed">
                                {log.summary}
                              </p>

                              {!isDay1 && (log.symptoms.length > 0 || log.painDescription || (isAdult && log.intercourseNote)) && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs text-[#6a4c46]/80">
                                  {log.symptoms.map((s, sIdx) => (
                                    <span key={sIdx} className="px-2 py-0.5 rounded-lg bg-white border border-pink-200 text-[#6a4c46] font-medium">
                                      {s}
                                    </span>
                                  ))}
                                  {log.painDescription && (
                                    <span className="text-[#6a4c46]">⚡ {log.painDescription}</span>
                                  )}
                                  {isAdult && log.hasIntercourse && log.intercourseNote && (
                                    <span className="text-[#6a4c46]">❤ {log.intercourseNote}</span>
                                  )}
                                </div>
                              )}

                              {!isDay1 && log.eventNote && (
                                <div className="mt-1 text-xs text-amber-800 flex items-start gap-1">
                                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                                  <span>{log.eventNote}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-4 text-xs text-[#6a4c46]/70 text-center font-comfortaa">
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
          <div className="p-8 text-center bg-white border border-[#f8bbd0] rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center mx-auto text-pink-500">
              <FolderSearch className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#6a4c46] font-comfortaa">Không tìm thấy ghi nhận phù hợp</h4>
              <p className="text-xs text-[#6a4c46]/70">
                Không có chu kỳ hoặc nhật ký nào khớp với từ khóa &quot;<strong className="text-[#6a4c46]">{treeSearchQuery}</strong>&quot;.
              </p>
            </div>
            <button
              onClick={() => setTreeSearchQuery('')}
              className="px-4 py-2 rounded-2xl bg-pink-50 hover:bg-pink-100 text-[#6a4c46] text-xs font-bold cursor-pointer border border-pink-200"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
