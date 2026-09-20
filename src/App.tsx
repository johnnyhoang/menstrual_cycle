import { useState, useEffect } from 'react';
import { MenstrualCycleTrackerSection } from './components/MenstrualCycleTrackerSection';
import { Heart, ShieldCheck, Database, LogOut, User as UserIcon, AlertCircle } from 'lucide-react';
import { DatabaseSettingsModal } from './components/DatabaseSettingsModal';
import { 
  getSupabaseConfig, 
  getSupabase, 
  signInWithGoogle, 
  signOutUser, 
  getCurrentUser, 
  onAuthStateChange,
  DEFAULT_OWNER_EMAIL 
} from './utils/supabaseClient';
import type { HistoricalCycle, DailyCycleLog } from './data/menstrualCycleLogData';

export function App() {
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dummyCycles, setDummyCycles] = useState<HistoricalCycle[]>([]);
  const [dummyLogs, setDummyLogs] = useState<DailyCycleLog[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const supabaseConfig = getSupabaseConfig();
  const isCloudConnected = Boolean(supabaseConfig.isConfigured && getSupabase());

  useEffect(() => {
    // Initial user fetch
    getCurrentUser().then(u => {
      setUser(u);
    });

    // Subscribe to auth state changes
    const sub = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAuthError(null);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    if (!isCloudConnected) {
      setIsDbModalOpen(true);
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setAuthError(error);
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
  };

  const userEmail = user?.email || (isCloudConnected ? DEFAULT_OWNER_EMAIL : null);
  const userFullName = user?.user_metadata?.full_name || (userEmail === DEFAULT_OWNER_EMAIL ? 'Thúy Nga' : userEmail?.split('@')[0] || 'Người dùng');
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 flex flex-col selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-rose-400">
              <Heart className="w-5 h-5 fill-rose-400/20" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                <span>Nhật Ký & Chu Kỳ Kinh Nguyệt</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Theo dõi lâm sàng • Lịch tháng trực quan • Hồ sơ: <span className="text-slate-300 font-semibold">{DEFAULT_OWNER_EMAIL}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Auth Status / Button */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-6 h-6 rounded-full border border-slate-600 object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">
                    <UserIcon className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                )}
                <div className="hidden md:block text-left text-[11px] leading-tight pr-1">
                  <div className="font-semibold text-slate-200">{userFullName}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất khỏi Google"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isAuthLoading}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                title="Đăng nhập tài khoản Google để đồng bộ dữ liệu cá nhân"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isAuthLoading ? 'Đang kết nối...' : 'Đăng nhập Google'}</span>
              </button>
            )}

            {/* Database settings button */}
            <button
              onClick={() => setIsDbModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isCloudConnected
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Database</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isCloudConnected ? 'bg-rose-400' : 'bg-slate-500'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Auth Error Banner if any */}
      {authError && (
        <div className="max-w-7xl mx-auto px-4 pt-3 w-full">
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
            <button onClick={() => setAuthError(null)} className="text-xs text-rose-400 hover:underline">Đóng</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4">
        <MenstrualCycleTrackerSection />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Dữ liệu y tế được bảo mật cục bộ & đồng bộ Cloud Supabase riêng tư</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Hồ sơ theo dõi: {DEFAULT_OWNER_EMAIL}
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
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

export default App;
