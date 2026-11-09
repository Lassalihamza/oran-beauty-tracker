import React, { useState } from 'react';
import { MergedSalon } from '../data/salonsData';
import { X, Copy, Check, Info } from 'lucide-react';

interface MessageHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  salons: MergedSalon[];
  selectedSalonId?: string;
  template: string;
  onSaveTemplate: (tmpl: string) => void;
}

export const MessageHelperModal: React.FC<MessageHelperModalProps> = ({
  isOpen,
  onClose,
  salons,
  selectedSalonId,
  template,
  onSaveTemplate,
}) => {
  const [activeSalonId, setActiveSalonId] = useState<string>(selectedSalonId || salons[0]?.id || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentSalon = salons.find((s) => s.id === activeSalonId) || salons[0];

  const getPopulatedMessage = (tmpl: string, salon?: MergedSalon) => {
    if (!salon || !tmpl) return '';
    return tmpl
      .replace(/{salon_name}/g, salon.salonName)
      .replace(/{neighborhood}/g, salon.neighborhood || salon.communeDaira);
  };

  const populated = getPopulatedMessage(template, currentSalon);

  const handleCopy = () => {
    if (!populated) return;
    navigator.clipboard.writeText(populated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">مساعد إعداد الرسائل وتخصيصها</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              قالب رسائل التواصل مع استبدال تلقائي لاسم الصالون والحي
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">المتغيرات المدعومة في نص القالب:</p>
              <div className="flex flex-wrap gap-2 font-mono">
                <span className="bg-white px-2 py-0.5 rounded border border-blue-300 text-blue-800">
                  {'{salon_name}'}
                </span>
                <span className="text-slate-600">← اسم الصالون كما ورد في الملفات</span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-300 text-blue-800 mr-2">
                  {'{neighborhood}'}
                </span>
                <span className="text-slate-600">← الحي أو المنطقة</span>
              </div>
            </div>
          </div>

          {/* Editable Template */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              نص قالب الرسالة (يبدأ فارغاً بالكامل - اكتب صياغتك الخاصة هنا):
            </label>
            <textarea
              rows={4}
              value={template}
              onChange={(e) => onSaveTemplate(e.target.value)}
              placeholder="اكتب قالب رسالتك هنا... مثال: السلام عليكم، نتواصل معكم بخصوص صالون {salon_name} في منطقة {neighborhood}..."
              className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-sans leading-relaxed text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Salon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              اختيار الصالون لمعاينة النص المخصص:
            </label>
            <select
              value={activeSalonId}
              onChange={(e) => setActiveSalonId(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {salons.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.id}] {s.salonName} ({s.neighborhood || s.communeDaira}) - أولوية {s.outreachPriority}
                </option>
              ))}
            </select>
          </div>

          {/* Populated Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                المعاينة بعد استبدال المتغيرات:
              </label>
              {currentSalon && (
                <span className="text-[11px] text-slate-500">
                  {currentSalon.salonName} · {currentSalon.neighborhood || currentSalon.communeDaira}
                </span>
              )}
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 min-h-[90px] whitespace-pre-wrap font-sans leading-relaxed">
              {populated || (
                <span className="text-slate-400 italic text-xs">
                  (سيظهر النص المخصص هنا بمجرد كتابة القالب واختيار الصالون)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            {copied ? (
              <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                تم نسخ الرسالة المخصصة بنجاح!
              </span>
            ) : (
              <span>يتم حفظ القالب تلقائياً في متصفحك</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              إغلاق
            </button>
            <button
              onClick={handleCopy}
              disabled={!populated}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                populated
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ النص للصالون الحالي</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
