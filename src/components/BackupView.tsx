import React, { useRef, useState } from 'react';
import { MergedSalon } from '../data/salonsData';
import { TrackingStore } from '../types/tracking';
import { exportDataToJSON, exportDataToCSV, importTrackingFromJSON } from '../utils/storage';
import {
  Download,
  Upload,
  AlertTriangle,
  FileJson,
  FileSpreadsheet,
  CheckCircle,
  Database,
  Trash2,
  HardDrive,
} from 'lucide-react';

interface BackupViewProps {
  salons: MergedSalon[];
  tracking: TrackingStore;
  onRefreshTracking: () => void;
  onClearAllTracking: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  salons,
  tracking,
  onRefreshTracking,
  onClearAllTracking,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const recordCount = Object.keys(tracking).length;
  const contactedCount = Object.values(tracking).filter((t) => t.status !== 'not_contacted').length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const res = importTrackingFromJSON(content);
      if (res.success) {
        setImportStatus({
          type: 'success',
          message: `تم استيراد ${res.count} سجل تتبع بنجاح ودمجها مع بياناتك!`,
        });
        onRefreshTracking();
      } else {
        setImportStatus({
          type: 'error',
          message: res.error || 'فشل في استيراد الملف، تأكد من صحة صيغة JSON.',
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Warning & Reminder Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 shadow-xs flex items-start gap-3.5 text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm">
          <h4 className="font-bold">تذكير هام حول أمان وحفظ البيانات:</h4>
          <p className="leading-relaxed text-amber-800">
            تُحفظ جميع بيانات التتبع وسجلات التواصل والملاحظات والمبالغ المتفق عليها حصرياً داخل
            التخزين المحلي لمتصفحك (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded">localStorage</code>).
            لا ترسل أية بيانات إلى خوادم خارجية. في حال قمت بمسح بيانات التصفح (Clear Cache/Storage) أو تغيير المتصفح، قد تفقد هذه البيانات.
            <strong> يرجى تحميل وتصدير نسخة احتياطية (JSON أو CSV) دورياً لحفظ تقدمك بأمان.</strong>
          </p>
        </div>
      </div>

      {/* Current Storage Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900 font-display">حالة بيانات التتبع الحالية</h3>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            تخزين محلي آمن
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block mb-1">إجمالي الصالونات المدمجة:</span>
            <span className="text-xl font-bold font-mono text-slate-900">{salons.length}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block mb-1">سجلات التتبع المسجلة:</span>
            <span className="text-xl font-bold font-mono text-indigo-600">{recordCount}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block mb-1">صالونات تم بدء التواصل معها:</span>
            <span className="text-xl font-bold font-mono text-emerald-600">{contactedCount}</span>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" />
            <span>تصدير البيانات والنسخ الاحتياطي</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            حمّل نسخة من بياناتك لاستخدامها في Excel أو استعادتها لاحقاً
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* CSV Export */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>تصدير جدول Excel (صيغة CSV)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ملف CSV معرّب ومجهّز بترميز <strong>UTF-8 with BOM</strong> ليعمل مباشرة في Microsoft Excel
              باللغة العربية دون أي تشويه في الحروف. يشمل جميع أعمدة الإكسل الـ 24 الأصلية إضافة لكافة حقول التتبع الشخصي.
            </p>
            <button
              onClick={() => exportDataToCSV(salons, tracking)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف CSV لبرنامج Excel</span>
            </button>
          </div>

          {/* JSON Export */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FileJson className="w-4 h-4 text-indigo-600" />
              <span>تصدير نسخة كاملة (صيغة JSON)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              نسخة رقمية برمجية شاملة تحتوي على قاعدة البيانات الكاملة، الحقول الأصلية، وبيانات التتبع بتفاصيلها.
              تسمح لك باستعادة سجلاتك بسهولة على أي جهاز آخر عبر خيار الاستيراد.
            </p>
            <button
              onClick={() => exportDataToJSON(salons, tracking)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تحميل نسخة احتياطية JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <span>استيراد واستعادة نسخة احتياطية</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            استرجع سجلات التتبع من ملف JSON احتياطي سبق تصديره
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center space-y-3">
          <p className="text-xs text-slate-600">
            اختر ملف JSON الاحتياطي من جهازك لاستعادة سجلات التواصل والمتابعات
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>اختيار ملف JSON من الجهاز</span>
          </button>
        </div>

        {importStatus.type && (
          <div
            className={`p-3.5 rounded-lg border text-xs flex items-center gap-2 ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>

      {/* Dangerous Zone */}
      <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-xs space-y-3">
        <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>منطقة الإجراءات الحساسة</span>
        </h4>
        <p className="text-xs text-slate-600">
          يمكنك إعادة ضبط وتفريغ سجلات التتبع المحلية إذا أردت البدء من الصفر. هذا الإجراء لا يمكن التراجع عنه.
        </p>
        <button
          onClick={() => {
            if (window.confirm('هل أنت متأكد من رغبتك في حذف كافة سجلات التتبع والملاحظات؟ لا يمكن التراجع عن هذا الإجراء.')) {
              onClearAllTracking();
            }
          }}
          className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors"
        >
          حذف كافة سجلات التتبع المحلية
        </button>
      </div>
    </div>
  );
};
