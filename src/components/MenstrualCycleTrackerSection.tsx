import React, { useState } from 'react';
import type { HistoricalCycle, DailyCycleLog } from '../data/menstrualCycleLogData';
import type { UserProfile } from './UserProfileModal';
import { useMenstrualTracker } from '../hooks/useMenstrualTracker';
import { parseDateUnified } from '../utils/dateUtils';
import { StatsHeader } from './tracker/StatsHeader';
import { CalendarView } from './tracker/CalendarView';
import { TreeView } from './tracker/TreeView';
import { MedicalDecoderView } from './tracker/MedicalDecoderView';
import { QuickEditDrawer } from './tracker/QuickEditDrawer';
import { CycleEditModal } from './tracker/CycleEditModal';
import { 
  CalendarDays, 
  GitBranch, 
  Microscope, 
  CheckCircle2, 
  X,
  Heart
} from 'lucide-react';

interface MenstrualCycleTrackerSectionProps {
  userProfile?: UserProfile | null;
  userId?: string | null;
}

export const MenstrualCycleTrackerSection: React.FC<MenstrualCycleTrackerSectionProps> = ({ userProfile, userId }) => {
  const {
    isAdult,
    isLoading,
    notification,
    setNotification,
    cycles,
    dailyLogs,
    dailyLogsMap,
    dynamicStats,
    saveDailyLog,
    deleteLogForDay,
    saveCycle,
    deleteCycle
  } = useMenstrualTracker(userProfile, userId);

  // Active Main Tab: 'calendar' | 'tree_view' | 'medical_decoder'
  const [activeTab, setActiveTab] = useState<'calendar' | 'tree_view' | 'medical_decoder'>('calendar');

  // Calendar Navigator state (defaults to Sept 2026)
  const [currentCalYear, setCurrentCalYear] = useState<number>(2026);
  const [currentCalMonth, setCurrentCalMonth] = useState<number>(8); // 8 is September
  const [selectedCalendarDateStr, setSelectedCalendarDateStr] = useState<string>('15/09/2026');

  // Quick edit state
  const [isQuickEditing, setIsQuickEditing] = useState<boolean>(false);
  const [quickEditInitialLog, setQuickEditInitialLog] = useState<Partial<DailyCycleLog>>({});

  // Cycle modal state
  const [isCycleModalOpen, setIsCycleModalOpen] = useState<boolean>(false);
  const [editingCycle, setEditingCycle] = useState<HistoricalCycle | null>(null);

  const handleChangeMonth = (newYear: number, newMonth: number) => {
    setCurrentCalYear(newYear);
    setCurrentCalMonth(newMonth);
  };

  const handleSelectDay = (dateStr: string) => {
    setSelectedCalendarDateStr(dateStr);
    setIsQuickEditing(false);
  };

  const handleStartQuickEdit = () => {
    const existing = dailyLogsMap.get(selectedCalendarDateStr);
    if (existing) {
      setQuickEditInitialLog(existing);
    } else {
      setQuickEditInitialLog({
        date: selectedCalendarDateStr,
        summary: '',
        symptoms: [],
        dischargeType: 'none',
        dischargeLabel: 'Sạch hoàn toàn',
        painLevel: 'none'
      });
    }
    setIsQuickEditing(true);
  };

  const handleStartQuickEditOnDate = (dateStr: string) => {
    setSelectedCalendarDateStr(dateStr);
    const parsed = parseDateUnified(dateStr);
    if (parsed) {
      setCurrentCalYear(parsed.getFullYear());
      setCurrentCalMonth(parsed.getMonth());
    }
    setActiveTab('calendar');
    
    const existing = dailyLogsMap.get(dateStr);
    if (existing) {
      setQuickEditInitialLog(existing);
    } else {
      setQuickEditInitialLog({
        date: dateStr,
        summary: '',
        symptoms: [],
        dischargeType: 'none',
        dischargeLabel: 'Sạch hoàn toàn',
        painLevel: 'none'
      });
    }
    setIsQuickEditing(true);
  };

  const handleSaveQuickEdit = (log: DailyCycleLog, isStartOfCycle: boolean) => {
    saveDailyLog(log, isStartOfCycle);
    setIsQuickEditing(false);
  };

  const handleOpenEditCycleModal = (cycle: HistoricalCycle) => {
    setEditingCycle({ ...cycle });
    setIsCycleModalOpen(true);
  };

  const handleSaveCycle = (cycle: HistoricalCycle) => {
    saveCycle(cycle);
    setIsCycleModalOpen(false);
    setEditingCycle(null);
  };

  const handleDeleteCycle = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa chu kỳ này?')) {
      deleteCycle(id);
    }
  };

  return (
    <div className="w-full space-y-6 my-4 font-sans">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-16 right-4 z-50 p-4 rounded-2xl shadow-md border flex items-center gap-3 animate-in slide-in-from-top-4 duration-200 ${
          notification.type === 'success' ? 'bg-white border-[#f8bbd0] text-[#6a4c46]' :
          notification.type === 'error' ? 'bg-pink-50 border-pink-400 text-pink-900' :
          'bg-white border-[#f8bbd0] text-[#6a4c46]'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)} 
            className="p-1 hover:bg-pink-100 rounded-lg cursor-pointer transition-colors"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4 text-[#6a4c46]" />
          </button>
        </div>
      )}

      {/* Top Stats Header */}
      <StatsHeader dynamicStats={dynamicStats} />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-pink-50/80 rounded-2xl border border-pink-200/80 shadow-xs">
        <div className="grid grid-cols-3 gap-1.5 flex-1">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer font-comfortaa ${
              activeTab === 'calendar'
                ? 'bg-white text-[#6a4c46] border border-[#f8bbd0] shadow-xs'
                : 'text-[#6a4c46]/70 hover:text-[#6a4c46] hover:bg-white/60'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-pink-500" />
            <span>Lịch Tháng</span>
          </button>

          <button
            onClick={() => setActiveTab('tree_view')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer font-comfortaa ${
              activeTab === 'tree_view'
                ? 'bg-white text-[#6a4c46] border border-[#f8bbd0] shadow-xs'
                : 'text-[#6a4c46]/70 hover:text-[#6a4c46] hover:bg-white/60'
            }`}
          >
            <GitBranch className="w-4 h-4 text-pink-500" />
            <span>Chu Kỳ & Nhật Ký</span>
          </button>

          <button
            onClick={() => setActiveTab('medical_decoder')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer font-comfortaa ${
              activeTab === 'medical_decoder'
                ? 'bg-white text-[#6a4c46] border border-[#f8bbd0] shadow-xs'
                : 'text-[#6a4c46]/70 hover:text-[#6a4c46] hover:bg-white/60'
            }`}
          >
            <Microscope className="w-4 h-4 text-pink-500" />
            <span>Giải Mã 4 Pha Sinh Lý</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-8 rounded-2xl bg-white border border-[#f8bbd0] text-center space-y-3 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-pink-100 animate-pulse mx-auto flex items-center justify-center text-pink-500">
            <Heart className="w-4 h-4 fill-pink-400/40" />
          </div>
          <p className="text-xs text-[#6a4c46]">Đang đồng bộ dữ liệu với cơ sở dữ liệu...</p>
        </div>
      )}

      {/* Main Active Tab Content */}
      {!isLoading && (
        <>
          {activeTab === 'calendar' && (
            isQuickEditing ? (
              <div className="bg-white border border-[#f8bbd0] rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
                  <h3 className="font-bold text-[#6a4c46] text-sm sm:text-base font-comfortaa">
                    Ghi Nhật Ký Cho Ngày {selectedCalendarDateStr}
                  </h3>
                  <button
                    onClick={() => setIsQuickEditing(false)}
                    className="p-1 rounded-lg text-[#6a4c46] hover:bg-pink-50 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <QuickEditDrawer
                  selectedCalendarDateStr={selectedCalendarDateStr}
                  initialLog={quickEditInitialLog}
                  isAdult={isAdult}
                  onSave={handleSaveQuickEdit}
                  onCancel={() => setIsQuickEditing(false)}
                />
              </div>
            ) : (
              <CalendarView
                currentCalYear={currentCalYear}
                currentCalMonth={currentCalMonth}
                selectedCalendarDateStr={selectedCalendarDateStr}
                isQuickEditing={isQuickEditing}
                cycles={cycles}
                dailyLogsMap={dailyLogsMap}
                isAdult={isAdult}
                onSelectDay={handleSelectDay}
                onChangeMonth={handleChangeMonth}
                onStartQuickEdit={handleStartQuickEdit}
                onCloseQuickEdit={() => setIsQuickEditing(false)}
                onDeleteLogForDay={deleteLogForDay}
              />
            )
          )}

          {activeTab === 'tree_view' && (
            <TreeView
              cycles={cycles}
              dailyLogs={dailyLogs}
              isAdult={isAdult}
              onStartQuickEditOnDate={handleStartQuickEditOnDate}
              onOpenEditCycleModal={handleOpenEditCycleModal}
              onDeleteCycle={handleDeleteCycle}
              onDeleteLogForDay={deleteLogForDay}
            />
          )}

          {activeTab === 'medical_decoder' && (
            <MedicalDecoderView />
          )}
        </>
      )}

      {/* Cycle Edit Modal */}
      <CycleEditModal
        isOpen={isCycleModalOpen}
        cycle={editingCycle}
        onClose={() => setIsCycleModalOpen(false)}
        onSave={handleSaveCycle}
      />
    </div>
  );
};
