import React from 'react';
import { MessageSquareText } from 'lucide-react';

export type ActiveTab = 'table' | 'dashboard' | 'reference' | 'backup';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenMessageHelper: () => void;
  todayPendingCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMessageHelper,
  todayPendingCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg md:text-xl font-bold font-display text-slate-900 whitespace-nowrap">
              متتبع صالونات وهران
            </span>
            <span className="hidden sm:inline-block text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              2026-11-06
            </span>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-medium text-slate-600 overflow-x-auto py-1">
            <button
              onClick={() => onSelectTab('table')}
              className={`pb-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'table'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              قائمة الصالونات (57)
            </button>
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`pb-1 border-b-2 transition-colors whitespace-nowrap shrink-0 relative ${
                activeTab === 'dashboard'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              لوحة المؤشرات
              {todayPendingCount > 0 && (
                <span className="mr-1.5 inline-block text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-amber-500 text-white">
                  {todayPendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onSelectTab('reference')}
              className={`pb-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'reference'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              مرجع القاعدة والتقسيم
            </button>
            <button
              onClick={() => onSelectTab('backup')}
              className={`pb-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'backup'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              النسخ الاحتياطي
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenMessageHelper}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <MessageSquareText className="w-4 h-4" />
              <span>مساعد الرسائل</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
