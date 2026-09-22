import React, { useState } from 'react';
import type { HistoricalCycle } from '../../data/menstrualCycleLogData';
import { Calendar as CalendarIcon, X, Save } from 'lucide-react';

interface CycleEditModalProps {
  isOpen: boolean;
  cycle: HistoricalCycle | null;
  onClose: () => void;
  onSave: (cycle: HistoricalCycle) => void;
}

export const CycleEditModal: React.FC<CycleEditModalProps> = ({
  isOpen,
  cycle,
  onClose,
  onSave
}) => {
  const [editingCycle, setEditingCycle] = useState<HistoricalCycle | null>(cycle);

  React.useEffect(() => {
    setEditingCycle(cycle);
  }, [cycle]);

  if (!isOpen || !editingCycle) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editingCycle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#f8bbd0] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-[#4a4c46]">
        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
          <h3 className="font-bold text-[#6a4c46] text-base flex items-center gap-2 font-comfortaa">
            <CalendarIcon className="w-4 h-4 text-pink-500" />
            <span>Chỉnh Sửa Thông Số Chu Kỳ</span>
          </h3>
          <button onClick={onClose} className="p-1 text-[#6a4c46]/60 hover:text-[#6a4c46] cursor-pointer rounded-lg hover:bg-pink-50" aria-label="Đóng cửa sổ">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="cycle_date_range" className="text-[#6a4c46] font-bold block font-comfortaa">Khoảng thời gian (Hiển thị):</label>
              <input
                id="cycle_date_range"
                type="text"
                required
                placeholder="VD: 24/08/2026 – 28/09/2026"
                value={editingCycle.dateRangeDisplay}
                onChange={(e) => setEditingCycle({ ...editingCycle, dateRangeDisplay: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#fff8f9] border border-pink-200 text-[#4a4c46] focus:outline-none focus:border-pink-400"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="cycle_year" className="text-[#6a4c46] font-bold block font-comfortaa">Năm:</label>
              <input
                id="cycle_year"
                type="number"
                required
                min={2020}
                max={2030}
                value={editingCycle.year}
                onChange={(e) => setEditingCycle({ ...editingCycle, year: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#fff8f9] border border-pink-200 text-[#4a4c46] focus:outline-none focus:border-pink-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="cycle_length" className="text-[#6a4c46] font-bold block font-comfortaa">Độ dài chu kỳ (ngày):</label>
              <input
                id="cycle_length"
                type="number"
                required
                min={10}
                max={90}
                value={editingCycle.cycleLengthDays}
                onChange={(e) => setEditingCycle({ ...editingCycle, cycleLengthDays: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#fff8f9] border border-pink-200 text-[#4a4c46] focus:outline-none focus:border-pink-400"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="period_duration" className="text-[#6a4c46] font-bold block font-comfortaa">Số ngày hành kinh (ngày):</label>
              <input
                id="period_duration"
                type="number"
                required
                min={1}
                max={20}
                value={editingCycle.periodDurationDays}
                onChange={(e) => setEditingCycle({ ...editingCycle, periodDurationDays: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#fff8f9] border border-pink-200 text-[#4a4c46] focus:outline-none focus:border-pink-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="cycle_type" className="text-[#6a4c46] font-bold block font-comfortaa">Phân loại chu kỳ:</label>
            <select
              id="cycle_type"
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
              className="w-full px-3 py-2 rounded-xl bg-[#fff8f9] border border-pink-200 text-[#4a4c46] focus:outline-none focus:border-pink-400"
            >
              <option value="normal_long">Chu kỳ dài sinh lý (30 - 42 ngày)</option>
              <option value="standard">Chu kỳ chuẩn (26 - 30 ngày)</option>
              <option value="delayed_long">Chu kỳ thưa / trễ (&gt; 43 ngày)</option>
              <option value="short_breakthrough">Chu kỳ ngắn / không phóng noãn (&lt; 25 ngày)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="clinical_note" className="text-[#6a4c46] font-bold block font-comfortaa">Ghi chú diễn biến:</label>
            <textarea
              id="clinical_note"
              rows={2}
              value={editingCycle.clinicalNote}
              onChange={(e) => setEditingCycle({ ...editingCycle, clinicalNote: e.target.value })}
              placeholder="Triệu chứng, lượng máu..."
              className="w-full px-3 py-2 rounded-xl bg-[#fff8f9] border border-pink-200 text-[#4a4c46] placeholder:text-pink-300 focus:outline-none focus:border-pink-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl bg-pink-50 text-[#6a4c46] hover:bg-pink-100 cursor-pointer font-bold"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs font-comfortaa"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Chu Kỳ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
