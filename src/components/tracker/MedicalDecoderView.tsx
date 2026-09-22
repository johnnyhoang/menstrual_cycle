import React from 'react';
import { cyclePhaseAnalyses, symptomDecoders } from '../../data/menstrualCycleLogData';
import { Activity, CheckCircle2, HelpCircle } from 'lucide-react';

export const MedicalDecoderView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 4 Phase Overview */}
      <div className="p-5 rounded-2xl bg-slate-800/80 border-l-4 border-rose-500 text-slate-300 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-slate-100 text-base">
          <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0" />
          <span>Tổng Quan 4 Pha Chu Kỳ & Biến Thiên Niêm Mạc Tử Cung:</span>
        </div>
        <div className="space-y-2 leading-relaxed text-slate-300 text-xs sm:text-sm">
          <p>
            • <strong className="text-slate-100">Cơ chế điều hòa nội tiết:</strong> Chu kỳ kinh nguyệt được điều hòa nhịp nhàng bởi trục Trục Hạ Đồi – Tuyến Yên – Buồng Trứng qua sự tương tác giữa hormone FSH, LH, Estrogen và Progesterone.
          </p>
          <p>
            • <strong className="text-slate-100">Biến thiên niêm mạc sinh lý:</strong> Niêm mạc tử cung mỏng nhất sau hành kinh (2-4mm), tăng sinh dần trong pha noãn (7-10mm) và đạt độ dày tối đa (10-16mm) ở pha hoàng thể phân tiết để chuẩn bị môi trường dinh dưỡng nuôi phôi.
          </p>
        </div>
      </div>

      {/* Grid of 4 Phases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cyclePhaseAnalyses.map((phase) => (
          <div key={phase.id} className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-400" />
                <span>{phase.title}</span>
              </h4>
              <span className="text-xs font-mono text-slate-400">{phase.timeRange}</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div>
                <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">Sinh lý & Độ dày niêm mạc:</span>
                <p className="mt-0.5 leading-relaxed">{phase.physiologicState} (Độ dày: <strong className="text-slate-100">{phase.endometrialThickness}</strong>)</p>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">Cơ chế sinh lý học:</span>
                <p className="mt-0.5 leading-relaxed">{phase.clinicalMechanism}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-200">
                <strong className="text-rose-300">Đánh giá sinh lý:</strong> {phase.safetyVerdict}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Symptom Decoders */}
      <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-4">
        <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Giải Mã 3 Hiện Tượng Sinh Lý Thường Gặp Ở Phụ Nữ:</span>
        </h4>

        <div className="space-y-3">
          {symptomDecoders.map((dec, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-900/60 border border-slate-700/60 space-y-2 text-xs">
              <div className="font-bold text-slate-100 text-sm">{dec.symptom}</div>
              <p className="text-slate-300 leading-relaxed">{dec.scientificMechanism}</p>
              <div className="text-slate-300 font-medium">✓ Cơ sở an toàn: {dec.whyNotCancer}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
