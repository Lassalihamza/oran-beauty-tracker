import React from 'react';
import { MergedSalon, EXCEL_ROW_COUNT } from '../data/salonsData';
import { ShieldCheck, AlertCircle, Database, CheckCircle2, Download } from 'lucide-react';

interface DataIntegrityBarProps {
  salons: MergedSalon[];
  onOpenBackup: () => void;
}

export const DataIntegrityBar: React.FC<DataIntegrityBarProps> = ({ salons, onOpenBackup }) => {
  const totalLoaded = salons.length;
  const matchedWithMarkdown = salons.filter((s) => s.matchedWithMarkdown).length;
  const flaggedCheck = salons.filter((s) => s.isFlaggedCheck).length;

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          {/* Integrity indicators */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5 font-medium text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>شريط سلامة البيانات:</span>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>صالونات الإكسل المحملة:</span>
              <span className="font-mono font-semibold text-white tabular-nums px-1.5 py-0.5 rounded bg-slate-800">
                {totalLoaded} / {EXCEL_ROW_COUNT}
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>تطابق بين الملفين:</span>
              <span className="font-mono font-semibold text-blue-300 tabular-nums px-1.5 py-0.5 rounded bg-slate-800">
                {matchedWithMarkdown}
              </span>
              <span className="text-slate-400 text-xs">(+7 في الإكسل فقط)</span>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>موسومة بتنبيه تدقيق (Check):</span>
              <span className="font-mono font-semibold text-amber-300 tabular-nums px-1.5 py-0.5 rounded bg-slate-800">
                {flaggedCheck}
              </span>
            </div>
          </div>

          {/* Backup reminder */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 hidden md:inline text-xs">
              التتبع محفوظ محلياً. احرص على التصدير الدوري.
            </span>
            <button
              onClick={onOpenBackup}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded border border-slate-700 transition-colors"
            >
              <Download className="w-3 h-3 text-slate-400" />
              <span>تصدير نسخة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
