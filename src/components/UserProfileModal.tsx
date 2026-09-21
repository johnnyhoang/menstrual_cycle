import React, { useState, useEffect } from 'react';
import { 
  User, 
  Activity, 
  X, 
  Save, 
  Check, 
  Stethoscope
} from 'lucide-react';
import { updateUserProfile } from '../utils/supabaseClient';

export interface UserProfile {
  fullName: string;
  birthDate: string; // DD/MM/YYYY
  birthYear?: number;
  heightCm?: number;
  weightKg?: number;
  bloodType?: string;
  averageCycleDays?: number;
  averagePeriodDays?: number;
  menarcheAge?: number; // Tuổi bắt đầu có kinh
  obstetricHistory?: string;
  trackingGoal?: string;
  gynecologicalNotes?: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onProfileUpdated?: (profile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileUpdated
}) => {
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    birthDate: '',
    birthYear: undefined,
    heightCm: undefined,
    weightKg: undefined,
    bloodType: 'O',
    averageCycleDays: 35,
    averagePeriodDays: 5,
    menarcheAge: 13,
    obstetricHistory: 'Đã sinh con',
    trackingGoal: 'Theo dõi sức khỏe sinh sản định kỳ',
    gynecologicalNotes: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing profile from user metadata or localStorage
  useEffect(() => {
    if (!user) return;
    
    const storageKey = `menstrual_user_profile_${user.id || user.email || 'default'}`;
    const localData = localStorage.getItem(storageKey);
    const metaProfile = user.user_metadata?.user_profile;

    if (metaProfile) {
      setProfile(metaProfile);
    } else if (localData) {
      try {
        setProfile(JSON.parse(localData));
      } catch (e) {
        console.error('Error parsing local profile', e);
      }
    } else {
      // Default fallback using user google metadata
      setProfile(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || ''
      }));
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  // Calculate age & BMI
  const calculateAge = () => {
    if (!profile.birthDate) return null;
    const parts = profile.birthDate.split(/[-/.]/);
    let year: number | null = null;
    if (parts.length === 3) {
      year = parts[2].length === 4 ? parseInt(parts[2], 10) : parseInt(parts[0], 10);
    } else if (parts.length === 1 && parts[0].length === 4) {
      year = parseInt(parts[0], 10);
    }
    if (year && !isNaN(year) && year > 1920 && year <= new Date().getFullYear()) {
      return new Date().getFullYear() - year;
    }
    return null;
  };

  const calculateBMI = () => {
    if (profile.heightCm && profile.weightKg && profile.heightCm > 0) {
      const hM = profile.heightCm / 100;
      const bmi = (profile.weightKg / (hM * hM)).toFixed(1);
      return parseFloat(bmi);
    }
    return null;
  };

  const userAge = calculateAge();
  const userBMI = calculateBMI();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    let year = profile.birthYear;
    if (profile.birthDate) {
      const parts = profile.birthDate.split(/[-/.]/);
      if (parts.length === 3 && parts[2].length === 4) {
        year = parseInt(parts[2], 10);
      }
    }

    const updatedProfile: UserProfile = {
      ...profile,
      birthYear: year || profile.birthYear
    };

    // 1. Save to LocalStorage
    const storageKey = `menstrual_user_profile_${user.id || user.email || 'default'}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
    localStorage.setItem('mom_health_user_profile_v1', JSON.stringify(updatedProfile));

    // 2. Save to Supabase User Metadata (if logged in)
    await updateUserProfile(updatedProfile);

    setIsSaving(false);
    setSaveSuccess(true);
    if (onProfileUpdated) {
      onProfileUpdated(updatedProfile);
    }

    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                Hồ Sơ Sức Khỏe Phụ Nữ
              </h3>
              <p className="text-xs text-slate-400">
                Thông số sinh học và tiền sử sức khỏe cá nhân
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">

          {/* 1. THÔNG TIN CƠ BẢN & NGÀY SINH */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>1. Thông Tin Cá Nhân & Ngày Sinh</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Họ và tên hiển thị:</label>
                <input
                  type="text"
                  required
                  placeholder="Họ và tên của bạn"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">Ngày tháng năm sinh:</label>
                  {userAge !== null && (
                    <span className="text-[10px] text-rose-300 font-bold bg-rose-500/20 px-1.5 py-0.5 rounded">
                      {userAge} tuổi
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY (VD: 15/08/1985)"
                  value={profile.birthDate}
                  onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Chiều cao, cân nặng, nhóm máu */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Chiều cao (cm):</label>
                <input
                  type="number"
                  placeholder="160"
                  value={profile.heightCm || ''}
                  onChange={(e) => setProfile({ ...profile, heightCm: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Cân nặng (kg):</label>
                <input
                  type="number"
                  placeholder="52"
                  value={profile.weightKg || ''}
                  onChange={(e) => setProfile({ ...profile, weightKg: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-medium">Nhóm máu:</label>
                  {userBMI !== null && (
                    <span className="text-[9px] text-slate-400">BMI: {userBMI}</span>
                  )}
                </div>
                <select
                  value={profile.bloodType || 'O'}
                  onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="A">Nhóm máu A</option>
                  <option value="B">Nhóm máu B</option>
                  <option value="AB">Nhóm máu AB</option>
                  <option value="O">Nhóm máu O</option>
                  <option value="unknown">Chưa rõ</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. THÔNG SỐ CHU KỲ KINH NGUYỆT CƠ SỞ */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>2. Thông Số Chu Kỳ Sinh Lý Cơ Sở</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Chu kỳ TB (ngày):</label>
                <input
                  type="number"
                  min={15}
                  max={90}
                  value={profile.averageCycleDays || 35}
                  onChange={(e) => setProfile({ ...profile, averageCycleDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Hành kinh TB (ngày):</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={profile.averagePeriodDays || 5}
                  onChange={(e) => setProfile({ ...profile, averagePeriodDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Tuổi có kinh lần đầu:</label>
                <input
                  type="number"
                  min={9}
                  max={20}
                  value={profile.menarcheAge || 13}
                  onChange={(e) => setProfile({ ...profile, menarcheAge: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* 3. TIỀN SỬ SẢN PHỤ KHOA & MỤC TIÊU */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>3. Tiền Sử Sản Phụ Khoa & Mục Tiêu Theo Dõi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Tiền sử sinh nở:</label>
                <select
                  value={profile.obstetricHistory || 'Đã sinh con'}
                  onChange={(e) => setProfile({ ...profile, obstetricHistory: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-teal-500"
                >
                  <option value="Chưa từng sinh con">Chưa từng sinh con</option>
                  <option value="Sinh thường 1 con">Sinh thường 1 con</option>
                  <option value="Sinh thường 2+ con">Sinh thường 2+ con</option>
                  <option value="Sinh mổ 1 con">Sinh mổ 1 con</option>
                  <option value="Sinh mổ 2+ con">Sinh mổ 2+ con</option>
                  <option value="Đã sinh con">Đã sinh con</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Mục tiêu theo dõi chính:</label>
                <select
                  value={profile.trackingGoal || 'Theo dõi sức khỏe sinh sản định kỳ'}
                  onChange={(e) => setProfile({ ...profile, trackingGoal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-teal-500"
                >
                  <option value="Theo dõi sức khỏe sinh sản định kỳ">Theo dõi sức khỏe sinh sản định kỳ</option>
                  <option value="Tránh thai tự nhiên">Tránh thai tự nhiên</option>
                  <option value="Chuẩn bị mang thai / Canh rụng trứng">Chuẩn bị mang thai / Canh rụng trứng</option>
                  <option value="Giai đoạn tiền mãn kinh">Giai đoạn tiền mãn kinh</option>
                  <option value="Theo dõi can thiệp phụ khoa">Theo dõi sau can thiệp / thủ thuật</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">Tiền sử bệnh lý / Can thiệp phụ khoa (nếu có):</label>
              <textarea
                rows={2}
                placeholder="VD: Từng sinh thiết Pipelle, u nang buồng trứng lành tính, đa nang buồng trứng PCOS..."
                value={profile.gynecologicalNotes || ''}
                onChange={(e) => setProfile({ ...profile, gynecologicalNotes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Đóng
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-rose-500/20 disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Đã Lưu!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>{isSaving ? 'Đang Lưu...' : 'Lưu Hồ Sơ'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
