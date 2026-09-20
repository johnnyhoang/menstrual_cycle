import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Cloud, 
  RefreshCw, 
  Save, 
  ExternalLink,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  getSupabase,
  upsertCyclesToDB,
  upsertDailyLogsToDB,
  fetchCyclesFromDB,
  fetchDailyLogsFromDB
} from '../utils/supabaseClient';
import type { HistoricalCycle, DailyCycleLog } from '../data/menstrualCycleLogData';

interface DatabaseSettingsModalProps {
  onClose: () => void;
  cycles: HistoricalCycle[];
  dailyLogs: DailyCycleLog[];
  onSyncFromCloud: (cycles: HistoricalCycle[], logs: DailyCycleLog[]) => void;
}

export const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({
  onClose,
  cycles,
  dailyLogs,
  onSyncFromCloud
}) => {
  const initialConfig = getSupabaseConfig();
  const [url, setUrl] = useState(initialConfig.url);
  const [key, setKey] = useState(initialConfig.key);
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isConnected = Boolean(initialConfig.isConfigured && getSupabase());

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, key);
    setStatusMessage({
      text: 'Đã lưu cấu hình kết nối Supabase vào trình duyệt!',
      type: 'success'
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    saveSupabaseConfig(url, key);

    const client = getSupabase();
    if (!client) {
      setStatusMessage({
        text: 'Vui lòng nhập đầy đủ Supabase URL và Anon Key!',
        type: 'error'
      });
      setIsTesting(false);
      return;
    }

    try {
      const { error } = await client.from('mh_menstrual_cycles').select('id').limit(1);
      if (error) {
        if (error.code === '42P01') {
          setStatusMessage({
            text: 'Kết nối thành công! Tuy nhiên bảng `mh_menstrual_cycles` chưa được tạo trong Supabase. Hãy chạy mã trong file `supabase_schema.sql` trên Supabase SQL Editor.',
            type: 'info'
          });
        } else {
          setStatusMessage({
            text: `Lỗi kết nối: ${error.message}`,
            type: 'error'
          });
        }
      } else {
        setStatusMessage({
          text: 'Kết nối tới Database Supabase (prefix: mh_) thành công 100%!',
          type: 'success'
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage({
        text: `Không thể kết nối tới Supabase: ${msg}`,
        type: 'error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushLocalToCloud = async () => {
    setIsPushing(true);
    setStatusMessage(null);
    try {
      const resCycles = await upsertCyclesToDB(cycles);
      const resLogs = await upsertDailyLogsToDB(dailyLogs);

      if (resCycles.error || resLogs.error) {
        setStatusMessage({
          text: `Lỗi đồng bộ lên đám mây: ${resCycles.error || resLogs.error}`,
          type: 'error'
        });
      } else {
        setStatusMessage({
          text: `Đồng bộ thành công ${cycles.length} chu kỳ và ${dailyLogs.length} nhật ký lên bảng mh_menstrual_cycles & mh_daily_logs!`,
          type: 'success'
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatusMessage({ text: `Lỗi: ${msg}`, type: 'error' });
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullCloudToLocal = async () => {
    setIsPulling(true);
    setStatusMessage(null);
    try {
      const resCycles = await fetchCyclesFromDB();
      const resLogs = await fetchDailyLogsFromDB();

      if (resCycles.error || resLogs.error) {
        setStatusMessage({
          text: `Lỗi tải dữ liệu từ đám mây: ${resCycles.error || resLogs.error}`,
          type: 'error'
        });
      } else if (resCycles.data && resCycles.data.length > 0) {
        onSyncFromCloud(resCycles.data, resLogs.data || []);
        setStatusMessage({
          text: `Đã kéo về thành công ${resCycles.data.length} chu kỳ và ${resLogs.data?.length || 0} nhật ký từ Supabase!`,
          type: 'success'
        });
      } else {
        setStatusMessage({
          text: 'Database trên Cloud hiện đang trống (0 bản ghi). Bạn có thể bấm "Tải toàn bộ dữ liệu máy lên Cloud".',
          type: 'info'
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatusMessage({ text: `Lỗi: ${msg}`, type: 'error' });
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Cấu Hình Database (Supabase)</h3>
              <p className="text-xs text-slate-400">Đồng bộ dữ liệu bảng tiền tố `mh_` theo chuẩn TokenWallet</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
          isConnected 
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
            : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            {isConnected ? <Cloud className="w-4 h-4 text-emerald-400" /> : <HardDrive className="w-4 h-4 text-amber-400" />}
            <span>
              Trạng thái: <strong>{isConnected ? 'Đã cấu hình Supabase Cloud' : 'Đang hoạt động cục bộ (Offline-first)'}</strong>
            </span>
          </div>
          <span className="font-mono text-[11px] opacity-80">
            {cycles.length} chu kỳ • {dailyLogs.length} logs
          </span>
        </div>

        {/* Message Banner */}
        {statusMessage && (
          <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-100' :
            statusMessage.type === 'error' ? 'bg-rose-950/60 border-rose-500/50 text-rose-100' :
            'bg-slate-950 border-teal-500/50 text-teal-100'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
            <div>{statusMessage.text}</div>
          </div>
        )}

        {/* Form Config */}
        <form onSubmit={handleSaveCredentials} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-bold flex items-center justify-between">
              <span>VITE_SUPABASE_URL:</span>
              <a 
                href="https://supabase.com/dashboard/projects" 
                target="_blank" 
                rel="noreferrer"
                className="text-[11px] text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold">VITE_SUPABASE_ANON_KEY:</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700 disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm Tra Kết Nối'}</span>
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Cấu Hình</span>
            </button>
          </div>
        </form>

        {/* Cloud Sync Actions */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-3 text-xs">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-teal-400" />
            <span>Đồng Bộ Dữ Liệu Hai Chiều (mh_):</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePushLocalToCloud}
              disabled={isPushing}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 flex flex-col items-center justify-center gap-1 font-bold cursor-pointer transition-all hover:border-teal-500/50 disabled:opacity-50"
            >
              <Cloud className="w-4 h-4 text-teal-400" />
              <span>Đẩy Lên Cloud (Push)</span>
              <span className="text-[10px] text-slate-500 font-normal">Lưu 43 chu kỳ & logs</span>
            </button>

            <button
              onClick={handlePullCloudToLocal}
              disabled={isPulling}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 flex flex-col items-center justify-center gap-1 font-bold cursor-pointer transition-all hover:border-teal-500/50 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Kéo Về Máy (Pull)</span>
              <span className="text-[10px] text-slate-500 font-normal">Nạp từ Supabase</span>
            </button>
          </div>
        </div>

        {/* Schema SQL hint */}
        <div className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-800/80 pt-3">
          💡 Dữ liệu được lưu trữ trong các bảng: <code className="text-teal-400">mh_menstrual_cycles</code>, <code className="text-teal-400">mh_daily_logs</code>, <code className="text-teal-400">mh_app_settings</code>. File <code className="text-slate-300">supabase_schema.sql</code> nằm tại thư mục gốc của dự án.
        </div>

      </div>
    </div>
  );
};
