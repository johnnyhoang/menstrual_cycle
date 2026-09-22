import React from 'react';
import { Calendar } from 'lucide-react';

interface StatsHeaderProps {
  dynamicStats: {
    totalTrackedCycles: number;
    averageCycleLength: number;
    averagePeriodDuration: number;
    longCyclePercentage: number;
  };
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ dynamicStats }) => {
  return (
    <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-100 tracking-tight">
            Thống Kê Sinh Lý Chu Kỳ
          </h2>
          <p className="text-xs text-slate-400">
            Dữ liệu tổng hợp qua {dynamicStats.totalTrackedCycles} chu kỳ được ghi nhận
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-slate-900/60 p-2 rounded-lg border border-slate-700/60 text-xs shrink-0">
        <div className="text-center px-3 border-r border-slate-700/60">
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Chu kỳ TB</div>
          <div className="text-sm font-bold text-slate-100">
            {dynamicStats.averageCycleLength} <span className="text-xs font-normal text-slate-400">ngày</span>
          </div>
        </div>
        <div className="text-center px-3 border-r border-slate-700/60">
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Hành kinh TB</div>
          <div className="text-sm font-bold text-slate-100">
            {dynamicStats.averagePeriodDuration} <span className="text-xs font-normal text-slate-400">ngày</span>
          </div>
        </div>
        <div className="text-center px-3">
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Tỷ lệ chu kỳ dài</div>
          <div className="text-sm font-bold text-rose-300">
            {dynamicStats.longCyclePercentage}%
          </div>
        </div>
      </div>
    </div>
  );
};
