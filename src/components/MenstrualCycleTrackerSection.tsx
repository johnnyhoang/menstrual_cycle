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
}

export const MenstrualCycleTrackerSection: React.FC<MenstrualCycleTrackerSectionProps> = ({ userProfile }) => {
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
  } = useMenstrualTracker(userProfile);

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
        <div className={`fixed top-16 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-in slide-in-from-top-4 duration-200 ${
          notification.type === 'success' ? 'bg-slate-800 border-slate-600 text-slate-100' :
          notification.type === 'error' ? 'bg-rose-950 border-rose-600 text-rose-100' :
          'bg-slate-800 border-slate-600 text-slate-200'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{notification.message}</span>
          <button 
            onClick={() => setNotification(null)} 
            className="p-1 hover:bg-slate-700 rounded cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* Top Stats Header */}
      <StatsHeader dynamicStats={dynamicStats} />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
        <div className="grid grid-cols-3 gap-1.5 flex-1">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Lịch Tháng</span>
          </button>

          <button
            onClick={() => setActiveTab('tree_view')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'tree_view'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Chu Kỳ & Nhật Ký</span>
          </button>

          <button
            onClick={() => setActiveTab('medical_decoder')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'medical_decoder'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
            }`}
          >
            <Microscope className="w-4 h-4" />
            <span>Giải Mã 4 Pha Sinh Lý</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-8 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center space-y-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse mx-auto flex items-center justify-center text-rose-400">
            <Heart className="w-4 h-4 fill-rose-400/20" />
          </div>
          <p className="text-xs text-slate-400">Đang đồng bộ dữ liệu với cơ sở dữ liệu...</p>
        </div>
      )}

      {/* Main Active Tab Content */}
      {!isLoading && (
        <>
          {activeTab === 'calendar' && (
            isQuickEditing ? (
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                    Ghi Nhật Ký Cho Ngày {selectedCalendarDateStr}
                  </h3>
                  <button
                    onClick={() => setIsQuickEditing(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-100 cursor-pointer"
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
