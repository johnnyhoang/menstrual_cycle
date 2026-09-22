import React, { useState, useEffect } from 'react';
import type { DailyCycleLog } from '../../data/menstrualCycleLogData';
import { parseDateUnified, formatDateToVN, getWeekdayVN } from '../../utils/dateUtils';
import { Save, X, Heart, Plus } from 'lucide-react';

interface QuickEditDrawerProps {
  selectedCalendarDateStr: string;
  initialLog: Partial<DailyCycleLog>;
  isAdult: boolean;
  onSave: (log: DailyCycleLog, isStartOfCycle: boolean) => void;
  onCancel: () => void;
}

export const QuickEditDrawer: React.FC<QuickEditDrawerProps> = ({
  selectedCalendarDateStr,
  initialLog,
  isAdult,
  onSave,
  onCancel
}) => {
  const [quickEditLog, setQuickEditLog] = useState<Partial<DailyCycleLog>>({});
  const [customSymptomInput, setCustomSymptomInput] = useState<string>('');

  useEffect(() => {
    setQuickEditLog({
      date: initialLog.date || selectedCalendarDateStr,
      dayOfWeek: initialLog.dayOfWeek || '',
      cycleDayText: initialLog.cycleDayText || '',
      cycleDayNumber: initialLog.cycleDayNumber,
      phase: initialLog.phase || 'secretory',
      phaseLabel: initialLog.phaseLabel || 'Pha Phân Tiết',
      summary: initialLog.summary || '',
      symptoms: initialLog.symptoms ? [...initialLog.symptoms] : [],
      dischargeType: initialLog.dischargeType || 'none',
      dischargeLabel: initialLog.dischargeLabel || 'Sạch hoàn toàn',
      painLevel: initialLog.painLevel || 'none',
      painDescription: initialLog.painDescription || '',
      eventNote: initialLog.eventNote || '',
      clinicalInterpretation: initialLog.clinicalInterpretation || '',
      isStartOfCycle: Boolean(initialLog.isStartOfCycle),
      hasIntercourse: Boolean(initialLog.hasIntercourse),
      intercourseProtection: initialLog.intercourseProtection || 'protected',
      intercourseOrgasm: Boolean(initialLog.intercourseOrgasm),
      intercourseCount: initialLog.intercourseCount || 1,
      intercourseNote: initialLog.intercourseNote || ''
    });
    setCustomSymptomInput('');
  }, [initialLog, selectedCalendarDateStr]);

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

  const handleSubmit = (e: React.FormEvent) => {
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

    onSave(fullLog, isStart);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm text-[#4a4c46]">
      {/* 0. START CYCLE FLAG TOGGLE */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-50/80 border border-pink-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🩸</span>
          <div>
            <div className="font-bold text-[#6a4c46] text-xs sm:text-sm flex items-center gap-2 font-comfortaa">
              <span>Bắt đầu chu kỳ mới (Ngày 1 / K1)</span>
              {quickEditLog.isStartOfCycle && (
                <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-bold">Đang Bật</span>
              )}
            </div>
            <div className="text-xs text-[#6a4c46]/70">Đánh dấu ngày này là ngày bắt đầu kỳ kinh mới</div>
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
          className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
            quickEditLog.isStartOfCycle
              ? 'bg-pink-500 text-white border-pink-500 shadow-xs'
              : 'bg-white text-[#6a4c46] border-pink-200 hover:bg-pink-50'
          }`}
        >
          {quickEditLog.isStartOfCycle ? '✓ Ngày 1 (K1)' : 'Đặt làm Ngày 1 (K1)'}
        </button>
      </div>

      {/* 1. TEXT INPUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="quick_summary" className="text-[#6a4c46] font-bold text-xs font-comfortaa">Ghi chú diễn biến trong ngày:</label>
          <textarea
            id="quick_summary"
            rows={2}
            required
            placeholder="VD: Cả ngày sạch không ra cam, tối hơi mỏi lưng nhẹ..."
            value={quickEditLog.summary || ''}
            onChange={(e) => setQuickEditLog({ ...quickEditLog, summary: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-[#fff8f9] border border-pink-200 text-[#4a4c46] placeholder:text-pink-300 focus:outline-none focus:border-pink-400 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="quick_event" className="text-[#6a4c46] font-bold text-xs font-comfortaa">Sự kiện đặc biệt / Đi khám (nếu có):</label>
          <textarea
            id="quick_event"
            rows={2}
            placeholder="VD: Sinh thiết Pipelle BV Hùng Vương..."
            value={quickEditLog.eventNote || ''}
            onChange={(e) => setQuickEditLog({ ...quickEditLog, eventNote: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-[#fff8f9] border border-pink-200 text-[#4a4c46] placeholder:text-pink-300 focus:outline-none focus:border-pink-400 text-xs"
          />
        </div>
      </div>

      {/* 2. OPTIONS: Bleeding & Pain */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <span className="text-[#6a4c46] font-bold text-xs block font-comfortaa">Tình trạng xuất huyết / Dịch:</span>
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
                  className={`p-2.5 rounded-xl text-left font-medium transition-all cursor-pointer border text-xs ${
                    isSelected
                      ? 'bg-pink-500 border-pink-500 text-white font-bold shadow-xs'
                      : 'bg-white border-pink-200 text-[#6a4c46] hover:bg-pink-50'
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
              className="w-full px-3 py-2 rounded-xl bg-[#fff8f9] border border-pink-200 text-[#4a4c46] placeholder:text-pink-300 focus:outline-none focus:border-pink-400 text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[#6a4c46] font-bold text-xs block font-comfortaa">Mức độ đau:</span>
          <div className="grid grid-cols-4 gap-1.5">
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
                      ? 'bg-amber-400 text-amber-950 border-amber-400 shadow-xs'
                      : 'bg-white border-pink-200 text-[#6a4c46] hover:bg-pink-50'
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
              className="w-full px-3 py-2 rounded-xl bg-[#fff8f9] border border-pink-200 text-[#4a4c46] placeholder:text-pink-300 focus:outline-none focus:border-pink-400 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. SYMPTOMS SELECT */}
      <div className="space-y-1.5">
        <span className="text-[#6a4c46] font-bold text-xs block font-comfortaa">Triệu chứng (Click để chọn/bỏ):</span>
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-pink-500 text-white border-pink-500 font-bold shadow-xs'
                    : 'bg-white text-[#6a4c46] border-pink-200 hover:bg-pink-50'
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
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-pink-100 text-pink-900 border-pink-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>✓ {tag}</span>
              <X className="w-3.5 h-3.5 text-pink-700 hover:text-pink-900" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
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
            className="flex-1 px-3 py-2 rounded-xl bg-[#fff8f9] border border-pink-200 text-[#4a4c46] placeholder:text-pink-300 focus:outline-none focus:border-pink-400 text-xs"
          />
          <button
            type="button"
            onClick={handleAddCustomSymptom}
            className="px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs border border-pink-200 cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm
          </button>
        </div>
      </div>

      {/* 4. INTIMACY (ADULT ONLY) */}
      {isAdult && (
        <div className="p-4 rounded-2xl bg-pink-50/80 border border-pink-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-pink-800 font-bold flex items-center gap-1.5 text-xs font-comfortaa">
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
              <span>Sinh hoạt vợ chồng:</span>
            </span>
            <button
              type="button"
              onClick={() => setQuickEditLog({ ...quickEditLog, hasIntercourse: !quickEditLog.hasIntercourse })}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                quickEditLog.hasIntercourse
                  ? 'bg-pink-500 text-white border-pink-500 shadow-xs'
                  : 'bg-white text-[#6a4c46] border-pink-200'
              }`}
            >
              {quickEditLog.hasIntercourse ? '❤️ Có ghi nhận' : 'Không'}
            </button>
          </div>

          {quickEditLog.hasIntercourse && (
            <div className="space-y-2 pt-2 border-t border-pink-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="intercourse_count" className="text-[11px] text-[#6a4c46]/70 block">Số lần trong ngày:</label>
                  <select
                    id="intercourse_count"
                    value={quickEditLog.intercourseCount || 1}
                    onChange={(e) => setQuickEditLog({ ...quickEditLog, intercourseCount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-[#4a4c46] text-xs mt-0.5"
                  >
                    <option value={1}>1 lần</option>
                    <option value={2}>2 lần</option>
                    <option value={3}>3 lần</option>
                    <option value={4}>4+ lần</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="intercourse_protection" className="text-[11px] text-[#6a4c46]/70 block">Biện pháp bảo vệ:</label>
                  <select
                    id="intercourse_protection"
                    value={quickEditLog.intercourseProtection || 'protected'}
                    onChange={(e) => setQuickEditLog({ ...quickEditLog, intercourseProtection: e.target.value as DailyCycleLog['intercourseProtection'] })}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-[#4a4c46] text-xs mt-0.5"
                  >
                    <option value="protected">Có bảo vệ (Bao cao su)</option>
                    <option value="unprotected">Không bảo vệ</option>
                    <option value="none">Tự nhiên / Khác</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="text-[#4a4c46] text-xs flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={Boolean(quickEditLog.intercourseOrgasm)}
                    onChange={(e) => setQuickEditLog({ ...quickEditLog, intercourseOrgasm: e.target.checked })}
                    className="rounded text-pink-500 focus:ring-pink-400 border-pink-300"
                  />
                  <span>Có đạt cực khoái (Orgasm)</span>
                </label>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Ghi chú thêm: VD: Có dính cam nhẹ sau sinh hoạt..."
                  value={quickEditLog.intercourseNote || ''}
                  onChange={(e) => setQuickEditLog({ ...quickEditLog, intercourseNote: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-[#4a4c46] placeholder:text-pink-300 text-xs"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-2xl bg-pink-50 text-[#6a4c46] hover:bg-pink-100 cursor-pointer text-xs font-bold"
        >
          Hủy Bỏ
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs text-xs font-comfortaa"
        >
          <Save className="w-4 h-4" />
          <span>Lưu Nhật Ký Ngày</span>
        </button>
      </div>
    </form>
  );
};
