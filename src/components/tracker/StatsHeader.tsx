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
    <div className="p-4 rounded-3xl bg-white border border-[#f8bbd0] shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-pink-100 text-pink-600 border border-pink-200 shadow-xs">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#6a4c46] tracking-tight font-comfortaa">
            Thống Kê Sinh Lý Chu Kỳ
          </h2>
          <p className="text-xs text-[#6a4c46]/70">
            Dữ liệu tổng hợp qua {dynamicStats.totalTrackedCycles} chu kỳ được ghi nhận
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-[#fff8f9] p-2.5 rounded-2xl border border-pink-200/80 text-xs shrink-0">
        <div className="text-center px-3 border-r border-pink-200/80">
          <div className="text-[10px] text-[#6a4c46]/70 font-semibold uppercase tracking-wider font-comfortaa">Chu kỳ TB</div>
          <div className="text-sm font-bold text-[#6a4c46]">
            {dynamicStats.averageCycleLength} <span className="text-xs font-normal text-[#6a4c46]/70">ngày</span>
          </div>
        </div>
        <div className="text-center px-3 border-r border-pink-200/80">
          <div className="text-[10px] text-[#6a4c46]/70 font-semibold uppercase tracking-wider font-comfortaa">Hành kinh TB</div>
          <div className="text-sm font-bold text-[#6a4c46]">
            {dynamicStats.averagePeriodDuration} <span className="text-xs font-normal text-[#6a4c46]/70">ngày</span>
          </div>
        </div>
        <div className="text-center px-3">
          <div className="text-[10px] text-[#6a4c46]/70 font-semibold uppercase tracking-wider font-comfortaa">Tỷ lệ chu kỳ dài</div>
          <div className="text-sm font-bold text-pink-600">
            {dynamicStats.longCyclePercentage}%
          </div>
        </div>
      </div>
    </div>
  );
};
