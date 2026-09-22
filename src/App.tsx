import { useState, useEffect } from 'react';
import { MenstrualCycleTrackerSection } from './components/MenstrualCycleTrackerSection';
import { UserProfileModal, type UserProfile } from './components/UserProfileModal';
import { Heart, Download, LogOut, User as UserIcon, AlertCircle } from 'lucide-react';
import { 
  signInWithGoogle, 
  signOutUser, 
  getCurrentUser, 
  onAuthStateChange 
} from './utils/supabaseClient';

export function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Initial user fetch
    getCurrentUser()
      .then(u => {
        setUser(u);
        if (u) {
          const storageKey = `menstrual_user_profile_${u.id || u.email || 'default'}`;
          const localData = localStorage.getItem(storageKey);
          if (u.user_metadata?.user_profile) {
            setUserProfile(u.user_metadata.user_profile);
          } else if (localData) {
            try {
              setUserProfile(JSON.parse(localData));
            } catch {}
          }
        }
      })
      .finally(() => {
        setIsAuthChecking(false);
      });

    // Subscribe to auth state changes
    const sub = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
      if (currentUser) {
        setAuthError(null);
        const storageKey = `menstrual_user_profile_${currentUser.id || currentUser.email || 'default'}`;
        const localData = localStorage.getItem(storageKey);
        if (currentUser.user_metadata?.user_profile) {
          setUserProfile(currentUser.user_metadata.user_profile);
        } else if (localData) {
          try {
            setUserProfile(JSON.parse(localData));
          } catch {}
        }
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
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
    setUserProfile(null);
  };

  const handleExportData = () => {
    try {
      const cyclesRaw = localStorage.getItem('mom_health_menstrual_cycles_v3') || localStorage.getItem('mom_health_menstrual_cycles_v2');
      const logsRaw = localStorage.getItem('mom_health_daily_logs_v3') || localStorage.getItem('mom_health_daily_logs_v2');
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        userEmail: user?.email || 'user',
        userProfile: userProfile || undefined,
        cycles: cyclesRaw ? JSON.parse(cyclesRaw) : [],
        dailyLogs: logsRaw ? JSON.parse(logsRaw) : []
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `menstrual_cycle_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Failed to export data', e);
    }
  };

  const userDisplayName = userProfile?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Tài khoản';
  const userAvatar = user?.user_metadata?.avatar_url;

  // Calculate age for badge
  const userAge = userProfile?.birthYear ? (new Date().getFullYear() - userProfile.birthYear) : null;

  // 1. Loading screen while checking initial session
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#fcf7f8] text-[#6a4c46] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#f8bbd0] shadow-sm mx-auto flex items-center justify-center text-pink-500">
            <Heart className="w-6 h-6 fill-pink-400/30 animate-pulse" />
          </div>
          <p className="text-xs text-[#6a4c46]/80 font-medium">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  // 2. Auth Gate: Require Google Login
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcf7f8] text-[#4a4c46] flex flex-col justify-between selection:bg-pink-200 selection:text-pink-900 p-4 sm:p-6">
        {/* Top minimal header */}
        <header className="max-w-md w-full mx-auto flex items-center gap-2 text-xs text-[#6a4c46] pt-2">
          <div className="p-1.5 rounded-lg bg-pink-100 border border-pink-200 text-pink-600">
            <Heart className="w-4 h-4 fill-pink-400/30" />
          </div>
          <span className="font-semibold text-[#6a4c46] font-comfortaa">FemInsight • Nhật Ký Chu Kỳ Kinh Nguyệt</span>
        </header>

        {/* Center Login Box */}
        <main className="max-w-md w-full mx-auto my-auto py-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#f8bbd0] shadow-md space-y-6 text-center">
            
            <div className="w-16 h-16 rounded-2xl bg-pink-50 border border-pink-200 mx-auto flex items-center justify-center text-pink-500 shadow-sm">
              <Heart className="w-8 h-8 fill-pink-400/30" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#6a4c46] font-comfortaa">Theo Dõi Chu Kỳ Kinh Nguyệt</h2>
              <p className="text-xs text-[#6a4c46]/70">Theo dõi sức khỏe sinh lý phụ nữ nhẹ nhàng & riêng tư</p>
            </div>

            {/* Error Message if any */}
            {authError && (
              <div className="p-3 rounded-xl bg-pink-50 border border-pink-300 text-pink-800 text-xs text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                <div>{authError}</div>
              </div>
            )}

            {/* Google Sign-in CTA */}
            <button
              onClick={handleGoogleLogin}
              disabled={isAuthLoading}
              className="w-full py-3 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
              <span>{isAuthLoading ? 'Đang chuyển hướng Google...' : 'Đăng nhập bằng tài khoản Google'}</span>
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-md w-full mx-auto text-center text-[11px] text-[#6a4c46]/60 pb-2 font-comfortaa">
          FemInsight • Menstrual Cycle Tracker
        </footer>
      </div>
    );
  }

  // 3. Main Authenticated App Screen
  return (
    <div className="min-h-screen bg-[#fcf7f8] text-[#4a4c46] flex flex-col selection:bg-pink-200 selection:text-pink-900">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-[1650px] w-full mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-pink-100 border border-pink-200 text-pink-600 shadow-xs">
              <Heart className="w-5 h-5 fill-pink-400/40 text-pink-600" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#6a4c46] tracking-tight flex items-center gap-2 font-comfortaa">
                <span>FemInsight • Nhật Ký Chu Kỳ Kinh Nguyệt</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download backup button */}
            <button
              onClick={handleExportData}
              title="Tải xuống toàn bộ dữ liệu (JSON)"
              className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#6a4c46] border border-pink-200 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-pink-600" />
            </button>

            {/* User Profile Trigger Button */}
            <div className="flex items-center gap-1.5 bg-pink-50/80 border border-pink-200 rounded-2xl p-1">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                title="Xem và chỉnh sửa hồ sơ phụ nữ / ngày sinh"
                className="flex items-center gap-2 hover:bg-white rounded-xl px-2 py-1 transition-all cursor-pointer text-left"
              >
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-6 h-6 rounded-full border border-pink-300 object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-pink-200 text-pink-800 flex items-center justify-center text-xs font-bold">
                    <UserIcon className="w-3.5 h-3.5 text-pink-700" />
                  </div>
                )}
                <div className="hidden md:block text-left text-[11px] leading-tight pr-1">
                  <div className="font-bold text-[#6a4c46] flex items-center gap-1">
                    <span>{userDisplayName}</span>
                    {userAge !== null && (
                      <span className="text-[10px] text-pink-700 font-bold bg-pink-200 px-1 rounded-full">
                        {userAge}t
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#6a4c46]/70 truncate max-w-[130px]">{user.email}</div>
                </div>
              </button>

              <button
                onClick={handleLogout}
                title="Đăng xuất khỏi Google"
                className="p-1.5 rounded-xl text-[#6a4c46]/70 hover:text-pink-600 hover:bg-white transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1650px] w-full mx-auto px-4 sm:px-8 py-5">
        <MenstrualCycleTrackerSection userProfile={userProfile} />
      </main>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onProfileUpdated={(updated) => setUserProfile(updated)}
      />

      {/* Footer */}
      <footer className="bg-white/60 border-t border-pink-100 py-4 px-4 sm:px-8 text-center text-xs text-[#6a4c46]/70">
        <div className="max-w-[1650px] w-full mx-auto flex items-center justify-center">
          <div className="font-comfortaa text-[11px]">
            FemInsight • Nhật Ký Chu Kỳ Kinh Nguyệt & Nhịp Sinh Lý Phụ Nữ
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
