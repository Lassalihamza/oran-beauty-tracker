/**
 * متتبع صالونات التجميل في وهران - Oran Beauty Prospects Tracker
 * @license Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SALONS_DATA, MergedSalon } from './data/salonsData';
import { TrackingStore, TrackingRecord, TrackingStatus } from './types/tracking';
import {
  loadTrackingStore,
  saveTrackingStore,
  loadMessageTemplate,
  saveMessageTemplate,
} from './utils/storage';
import { DataIntegrityBar } from './components/DataIntegrityBar';
import { TopBar, ActiveTab } from './components/TopBar';
import { SalonsTableView } from './components/SalonsTableView';
import { DashboardView } from './components/DashboardView';
import { DatabaseReferenceView } from './components/DatabaseReferenceView';
import { BackupView } from './components/BackupView';
import { SalonDetailModal } from './components/SalonDetailModal';
import { MessageHelperModal } from './components/MessageHelperModal';
import { Check, AlertCircle } from 'lucide-react';

export default function App() {
  const [salons] = useState<MergedSalon[]>(SALONS_DATA);
  const [tracking, setTracking] = useState<TrackingStore>(() => loadTrackingStore());
  const [template, setTemplate] = useState<string>(() => loadMessageTemplate());
  const [activeTab, setActiveTab] = useState<ActiveTab>('table');

  // Modals state
  const [selectedSalon, setSelectedSalon] = useState<MergedSalon | null>(null);
  const [showMessageHelper, setShowMessageHelper] = useState<boolean>(false);
  const [messageHelperSalonId, setMessageHelperSalonId] = useState<string | undefined>(undefined);

  // Global toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // Update tracking record
  const handleUpdateTracking = useCallback(
    (salonId: string, updates: Partial<TrackingRecord>) => {
      setTracking((prev) => {
        const existing: TrackingRecord = prev[salonId] || {
          salonId,
          status: 'not_contacted',
          dateContacted: '',
          lastFollowUpDate: '',
          nextFollowUpDate: '',
          channelUsed: '',
          notes: '',
          amountAgreed: null,
          updatedAt: new Date().toISOString(),
        };

        const updated: TrackingRecord = {
          ...existing,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const nextStore = { ...prev, [salonId]: updated };
        saveTrackingStore(nextStore);
        return nextStore;
      });
      showToast('تم حفظ التحديث فوراً في متصفحك');
    },
    [showToast]
  );

  // Quick status change from table or card
  const handleQuickStatusChange = useCallback(
    (salonId: string, status: TrackingStatus) => {
      const now = new Date().toISOString().slice(0, 10);
      handleUpdateTracking(salonId, {
        status,
        dateContacted: status !== 'not_contacted' ? now : '',
      });
    },
    [handleUpdateTracking]
  );

  // Save template
  const handleSaveTemplate = useCallback((newTmpl: string) => {
    setTemplate(newTmpl);
    saveMessageTemplate(newTmpl);
  }, []);

  // Copy message for specific salon
  const handleCopyMessageForSalon = useCallback(
    (salon: MergedSalon) => {
      if (!template.trim()) {
        // Open helper so user can write their template
        setMessageHelperSalonId(salon.id);
        setShowMessageHelper(true);
        showToast('يرجى كتابة نص القالب أولاً في مساعد الرسائل');
        return;
      }

      const populated = template
        .replace(/{salon_name}/g, salon.salonName)
        .replace(/{neighborhood}/g, salon.neighborhood || salon.communeDaira);

      navigator.clipboard.writeText(populated);
      showToast(`تم نسخ الرسالة المخصصة لـ "${salon.salonName}"!`);
    },
    [template, showToast]
  );

  // Clear all tracking
  const handleClearAllTracking = useCallback(() => {
    saveTrackingStore({});
    setTracking({});
    showToast('تم تفريغ كافة سجلات التتبع المحلية');
  }, [showToast]);

  // Today pending count
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayPendingCount = useMemo(() => {
    return salons.filter((s) => {
      const t = tracking[s.id];
      return t && t.nextFollowUpDate && t.nextFollowUpDate <= todayStr;
    }).length;
  }, [salons, tracking, todayStr]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Data Integrity Bar at the very top */}
      <DataIntegrityBar
        salons={salons}
        onOpenBackup={() => setActiveTab('backup')}
      />

      {/* 2. Top Bar Navigation Contract */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMessageHelper={() => {
          setMessageHelperSalonId(salons[0]?.id);
          setShowMessageHelper(true);
        }}
        todayPendingCount={todayPendingCount}
      />

      {/* 3. Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'table' && (
          <SalonsTableView
            salons={salons}
            tracking={tracking}
            onSelectSalon={(s) => setSelectedSalon(s)}
            onCopyMessage={handleCopyMessageForSalon}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            salons={salons}
            tracking={tracking}
            onSelectSalon={(s) => setSelectedSalon(s)}
          />
        )}

        {activeTab === 'reference' && <DatabaseReferenceView />}

        {activeTab === 'backup' && (
          <BackupView
            salons={salons}
            tracking={tracking}
            onRefreshTracking={() => setTracking(loadTrackingStore())}
            onClearAllTracking={handleClearAllTracking}
          />
        )}
      </main>

      {/* 4. Modals */}
      <SalonDetailModal
        salon={selectedSalon}
        tracking={selectedSalon ? tracking[selectedSalon.id] : undefined}
        onUpdateTracking={handleUpdateTracking}
        onClose={() => setSelectedSalon(null)}
        onCopyMessageForSalon={handleCopyMessageForSalon}
      />

      <MessageHelperModal
        isOpen={showMessageHelper}
        onClose={() => setShowMessageHelper(false)}
        salons={salons}
        selectedSalonId={messageHelperSalonId}
        template={template}
        onSaveTemplate={handleSaveTemplate}
      />

      {/* 5. Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 6. Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>متتبع صالونات التجميل في وهران · 57 نشاطاً موثقاً من ملفات الفحص الرسمية (6 نوفمبر 2026)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>ترميز CSV: UTF-8 BOM جاهز لـ Excel</span>
            <span aria-hidden="true">·</span>
            <span>الواجهة معربة بالكامل (RTL)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
