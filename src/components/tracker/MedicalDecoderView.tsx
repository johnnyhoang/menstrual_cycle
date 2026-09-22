import React from 'react';
import { cyclePhaseAnalyses, symptomDecoders } from '../../data/menstrualCycleLogData';
import { Activity, CheckCircle2, HelpCircle } from 'lucide-react';

export const MedicalDecoderView: React.FC = () => {
  // Pastel Sticky Note Color Map for 4 phases
  const cardColorStyles = [
    'bg-[#fce7f3] border-[#f472b6] text-[#831843] rotate-[-1deg]', // Pink note (Pha 1)
    'bg-[#fef9c3] border-[#facc15] text-[#78350f] rotate-[1deg]',  // Yellow note (Pha 2)
    'bg-[#dcfce7] border-[#34d399] text-[#064e3b] rotate-[-1deg]', // Green note (Pha 3)
    'bg-[#dbeafe] border-[#3b82f6] text-[#1e3a8a] rotate-[1deg]',  // Blue note (Pha 4)
  ];

  return (
    <div className="space-y-6">
      {/* 4 Phase Overview Header Box */}
      <div className="p-5 rounded-3xl bg-white border border-[#f8bbd0] text-[#6a4c46] space-y-3 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-[#6a4c46] text-base font-comfortaa">
          <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
          <span>Tổng Quan 4 Pha Chu Kỳ & Biến Thiên Niêm Mạc Tử Cung:</span>
        </div>
        <div className="space-y-2 leading-relaxed text-[#4a4c46] text-xs sm:text-sm">
          <p>
            • <strong className="text-[#6a4c46]">Cơ chế điều hòa nội tiết:</strong> Chu kỳ kinh nguyệt được điều hòa nhịp nhàng bởi trục Trục Hạ Đồi – Tuyến Yên – Buồng Trứng qua sự tương tác giữa hormone FSH, LH, Estrogen và Progesterone.
          </p>
          <p>
            • <strong className="text-[#6a4c46]">Biến thiên niêm mạc sinh lý:</strong> Niêm mạc tử cung mỏng nhất sau hành kinh (2-4mm), tăng sinh dần trong pha noãn (7-10mm) và đạt độ dày tối đa (10-16mm) ở pha hoàng thể phân tiết để chuẩn bị môi trường dinh dưỡng nuôi phôi.
          </p>
        </div>
      </div>

      {/* Grid of 4 Phases - Pastel Sticky Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cyclePhaseAnalyses.map((phase, idx) => (
          <div 
            key={phase.id} 
            className={`p-5 sm:p-6 rounded-3xl border-2 shadow-sm transition-all duration-300 hover:rotate-0 hover:scale-[1.02] space-y-3 ${cardColorStyles[idx % cardColorStyles.length]}`}
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
              <h4 className="font-bold text-base flex items-center gap-2 font-comfortaa">
                <Activity className="w-4 h-4 shrink-0" />
                <span>{phase.title}</span>
              </h4>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/70 shadow-xs">{phase.timeRange}</span>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
              <div>
                <span className="font-bold uppercase text-[10px] tracking-wider opacity-80">Sinh lý & Độ dày niêm mạc:</span>
                <p className="mt-0.5">{phase.physiologicState} (Độ dày: <strong>{phase.endometrialThickness}</strong>)</p>
              </div>
              <div>
                <span className="font-bold uppercase text-[10px] tracking-wider opacity-80">Cơ chế sinh lý học:</span>
                <p className="mt-0.5">{phase.clinicalMechanism}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/60 border border-black/5 font-semibold">
                <strong>Đánh giá sinh lý:</strong> {phase.safetyVerdict}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Symptom Decoders */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#f8bbd0] space-y-4 shadow-sm">
        <h4 className="font-bold text-[#6a4c46] text-sm sm:text-base flex items-center gap-2 font-comfortaa">
          <HelpCircle className="w-5 h-5 text-pink-500" />
          <span>Giải Mã 3 Hiện Tượng Sinh Lý Thường Gặp Ở Phụ Nữ:</span>
        </h4>

        <div className="space-y-3">
          {symptomDecoders.map((dec, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#fff8f9] border border-pink-100 space-y-2 text-xs sm:text-sm">
              <div className="font-bold text-[#6a4c46] text-sm font-comfortaa">{dec.symptom}</div>
              <p className="text-[#4a4c46] leading-relaxed">{dec.scientificMechanism}</p>
              <div className="text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                ✓ Cơ sở an toàn: {dec.whyNotCancer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
