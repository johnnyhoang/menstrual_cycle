import { useState } from 'react';
import { MenstrualCycleTrackerSection } from './components/MenstrualCycleTrackerSection';
import { Heart, ShieldCheck, Database } from 'lucide-react';
import { DatabaseSettingsModal } from './components/DatabaseSettingsModal';
import { getSupabaseConfig, getSupabase } from './utils/supabaseClient';
import type { HistoricalCycle, DailyCycleLog } from './data/menstrualCycleLogData';

export function App() {
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dummyCycles, setDummyCycles] = useState<HistoricalCycle[]>([]);
  const [dummyLogs, setDummyLogs] = useState<DailyCycleLog[]>([]);
  
  const supabaseConfig = getSupabaseConfig();
  const isCloudConnected = Boolean(supabaseConfig.isConfigured && getSupabase());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Nhật Ký & Chu Kỳ Kinh Nguyệt</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Theo dõi lâm sàng • Lịch tháng trực quan • Đồng bộ Supabase (mh_)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDbModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isCloudConnected
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/60'
                  : 'bg-teal-950/80 hover:bg-teal-900 text-teal-200 border-teal-500/40'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Supabase DB</span>
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4">
        <MenstrualCycleTrackerSection />
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Dữ liệu y tế được bảo mật cục bộ & đồng bộ Cloud Supabase riêng tư</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Menstrual Cycle Tracker • Standardized Supabase Schema (Prefix mh_)
          </div>
        </div>
      </footer>

      {/* Global Database Settings Modal */}
      {isDbModalOpen && (
        <DatabaseSettingsModal
          onClose={() => setIsDbModalOpen(false)}
          cycles={dummyCycles}
          dailyLogs={dummyLogs}
          onSyncFromCloud={(cycles, logs) => {
            setDummyCycles(cycles);
            setDummyLogs(logs);
            // Trigger storage event so tracker component re-loads
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

export default App;
