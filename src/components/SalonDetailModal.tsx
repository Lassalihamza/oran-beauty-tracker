import React, { useState } from 'react';
import { MergedSalon } from '../data/salonsData';
import { TrackingRecord, TRACKING_STATUS_CONFIG, TrackingStatus, CHANNEL_OPTIONS } from '../types/tracking';
import {
  X,
  Phone,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  MapPin,
  Calendar,
  MessageSquare,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SalonDetailModalProps {
  salon: MergedSalon | null;
  tracking?: TrackingRecord;
  onUpdateTracking: (salonId: string, updates: Partial<TrackingRecord>) => void;
  onClose: () => void;
  onCopyMessageForSalon: (salon: MergedSalon) => void;
}

export const SalonDetailModal: React.FC<SalonDetailModalProps> = ({
  salon,
  tracking,
  onUpdateTracking,
  onClose,
  onCopyMessageForSalon,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'social' | 'analysis' | 'tracking' | 'raw'>('info');
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!salon) return null;

  const currentTracking: TrackingRecord = tracking || {
    salonId: salon.id,
    status: 'not_contacted',
    dateContacted: '',
    lastFollowUpDate: '',
    nextFollowUpDate: '',
    channelUsed: '',
    notes: '',
    amountAgreed: null,
    updatedAt: new Date().toISOString(),
  };

  const handleCopyPhone = () => {
    if (!salon.phoneWhatsApp) return;
    navigator.clipboard.writeText(salon.phoneWhatsApp);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Helper to extract URLs from text
  const extractUrls = (text: string): { label: string; url: string }[] => {
    if (!text) return [];
    const urlMatches = text.match(/https?:\/\/[^\s|;]+/g);
    if (!urlMatches) return [];
    return urlMatches.map((url) => ({
      label: url.length > 50 ? url.slice(0, 47) + '...' : url,
      url,
    }));
  };

  const statusConfig = TRACKING_STATUS_CONFIG[currentTracking.status];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-white">
                  {salon.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-medium ${
                    salon.outreachPriority === 'A'
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : salon.outreachPriority === 'B'
                      ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                      : 'bg-slate-200 text-slate-800 border border-slate-300'
                  }`}
                >
                  أولوية {salon.outreachPriority}
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-medium ${
                    salon.verificationLabel === 'Verified'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {salon.verificationLabel === 'Verified' ? 'موثق بالكامل' : 'موثق جزئياً'}
                </span>

                {salon.isFlaggedCheck && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-white font-medium text-[11px] shadow-xs">
                    <AlertTriangle className="w-3 h-3" />
                    يحتاج تدقيق (Check)
                  </span>
                )}

                {salon.matchedWithMarkdown && salon.markdownTop50Rank && (
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-medium">
                    الترتيب #{salon.markdownTop50Rank} في أفضل 50
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 truncate">
                {salon.salonName}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 line-clamp-1">
                {salon.category} · {salon.neighborhood || salon.communeDaira}
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-200 transition-colors shrink-0"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Strip */}
          <div className="flex flex-wrap items-center gap-2 pt-3 mt-2 border-t border-slate-200/60">
            {salon.phoneWhatsApp && (
              <button
                onClick={handleCopyPhone}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-colors shadow-xs"
              >
                {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span className="font-mono" dir="ltr">{salon.phoneWhatsApp.split('|')[0].trim()}</span>
                <span className="text-slate-500 text-[11px]">(نسخ الهاتف)</span>
              </button>
            )}

            {salon.googleMapsUrl && (
              <a
                href={salon.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-white hover:bg-slate-100 text-blue-700 border border-slate-300 transition-colors shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>فتح في Google Maps</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}

            <button
              onClick={() => onCopyMessageForSalon(salon)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-colors shadow-xs mr-auto"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>نسخ رسالة مخصصة</span>
            </button>
          </div>
        </div>

        {/* Check Badge Alert (if flagged) */}
        {salon.isFlaggedCheck && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-start gap-3 text-xs text-amber-900 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">تنبيهات التدقيق وعدم التطابق المرصودة في هذا السجل:</span>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                {salon.checkFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'info'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            المعلومات الأساسية والموقع
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`py-3 px-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'social'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            القنوات والحضور الرقمي
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`py-3 px-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'analysis'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            النشاط والتقييم وقاعدة البيانات
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`py-3 px-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'tracking'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            بطاقة التتبع والتواصل
            <span
              className={`mr-1.5 px-1.5 py-0.2 rounded text-[10px] ${statusConfig.bgColor} ${statusConfig.textColor}`}
            >
              {statusConfig.labelAr}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`py-3 px-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'raw'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            حقول المصدر الخام (24 عموداً)
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-800">
          {/* TAB 1: INFO & LOCATION */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">اسم الصالون (كما ورد):</span>
                  <span className="font-semibold text-slate-900 select-all">{salon.salonName}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">المعرف الفريد (ID):</span>
                  <span className="font-mono text-slate-900">{salon.id}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">البلدية / الدائرة:</span>
                  <span className="text-slate-900">{salon.communeDaira}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">الحي / المنطقة:</span>
                  <span className="text-slate-900">{salon.neighborhood || '—'}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 md:col-span-2">
                  <span className="text-xs text-slate-500 block mb-1">الفئة والتخصص:</span>
                  <span className="text-slate-900 font-medium">{salon.category}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 md:col-span-2">
                  <span className="text-xs text-slate-500 block mb-1">العنوان المسجل (Address as listed):</span>
                  <span className="text-slate-900 font-mono text-xs leading-relaxed select-all">
                    {salon.address || '—'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">نطاق الهدف أو الامتداد:</span>
                  <span className="text-slate-900">{salon.targetAreaExtension}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">تقييم ومراجعات Maps:</span>
                  <span className="text-slate-900 font-mono text-xs">
                    {salon.mapsRatingReviews || 'لم يظهر تقييم في المصادر المفحوصة'}
                  </span>
                </div>
              </div>

              {salon.duplicateSourceIdsMerged && (
                <div className="p-3.5 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-900">
                  <span className="font-bold block mb-1">سجلات مكررة تم دمجها مع هذا النشاط:</span>
                  <span className="font-mono">{salon.duplicateSourceIdsMerged}</span>
                  <p className="mt-1 text-slate-600">
                    تم توحيد الحقول والمصادر بين السجلين دون حذف أي تفاصيل من أي منهما.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SOCIAL & DIGITAL */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              {/* Instagram */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-1.5">Instagram:</span>
                {salon.instagramUrl ? (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-900 font-mono select-all leading-relaxed" dir="ltr">
                      {salon.instagramUrl}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {extractUrls(salon.instagramUrl).map((item, i) => (
                        <a
                          key={i}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>فتح الحساب</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">لا يوجد رابط إنستغرام في المصادر المفحوصة</span>
                )}
              </div>

              {/* Facebook */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-1.5">Facebook:</span>
                {salon.facebookUrl ? (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-900 font-mono select-all leading-relaxed" dir="ltr">
                      {salon.facebookUrl}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {extractUrls(salon.facebookUrl).map((item, i) => (
                        <a
                          key={i}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>فتح الصفحة</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">لا يوجد رابط فيسبوك في المصادر المفحوصة</span>
                )}
              </div>

              {/* TikTok */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-1.5">TikTok:</span>
                {salon.tiktokUrl ? (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-900 font-mono select-all leading-relaxed" dir="ltr">
                      {salon.tiktokUrl}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {extractUrls(salon.tiktokUrl).map((item, i) => (
                        <a
                          key={i}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-900 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>فتح TikTok</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">لا يوجد رابط تيك توك في المصادر المفحوصة</span>
                )}
              </div>

              {/* Website / Booking */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-1.5">
                  الموقع الإلكتروني أو رابط الحجز (Website or booking):
                </span>
                <p className="text-xs text-slate-900 font-mono select-all leading-relaxed" dir="ltr">
                  {salon.websiteBooking || 'No link surfaced in checked sources'}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {extractUrls(salon.websiteBooking).map((item, i) => (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-teal-700 hover:underline font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>زيارة الرابط المسجل</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY, DIGITAL GAP & DATABASE */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">أولوية التواصل (Priority):</span>
                  <span className="text-slate-900 font-bold block">{salon.outreachPriorityFull}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">مستوى النشاط وتاريخ آخر منشور:</span>
                  <span className="text-slate-900 font-medium block">
                    الحالة: {salon.activityLevel} · التاريخ: {salon.lastPostDate}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 md:col-span-2">
                  <span className="text-xs text-slate-500 block mb-1">ملاحظة الفجوة الرقمية (Digital gap note):</span>
                  <p className="text-slate-900 text-xs leading-relaxed">{salon.digitalGapNote || '—'}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 md:col-span-2">
                  <span className="text-xs text-slate-500 block mb-1">الأسعار والخدمات الظاهرة:</span>
                  <p className="text-slate-900 text-xs leading-relaxed">{salon.pricesServices || '—'}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">جودة الصور والهوية البصرية:</span>
                  <span className="text-slate-900">{salon.photoBrandingQuality || '—'}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-500 block mb-1">تاريخ الفحص والتحقق:</span>
                  <span className="text-slate-900 font-mono text-xs">{salon.dateChecked}</span>
                </div>
              </div>

              {/* Top 50 Markdown cross-reference (Side-by-Side comparison) */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    بيانات السجل في ملف قاعدة البيانات (أفضل 50 للبدء):
                  </span>
                  {salon.matchedWithMarkdown ? (
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      متطابق ومصنف بالترتيب #{salon.markdownTop50Rank}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                      وارد في الإكسل فقط (خارج أفضل 50)
                    </span>
                  )}
                </div>

                {salon.matchedWithMarkdown ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
                      <span className="text-slate-500 font-medium">البيانات المسجلة في جدول الإكسل:</span>
                      <p><span className="text-slate-400">الاسم:</span> {salon.salonName}</p>
                      <p><span className="text-slate-400">المنطقة:</span> {salon.neighborhood || salon.communeDaira}</p>
                      <p><span className="text-slate-400">الأولوية:</span> {salon.outreachPriority}</p>
                    </div>

                    <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
                      <span className="text-purple-700 font-medium">البيانات المسجلة في ملف Markdown:</span>
                      <p><span className="text-slate-400">الاسم:</span> {salon.markdownNameAr}</p>
                      <p><span className="text-slate-400">المنطقة:</span> {salon.markdownAreaAr}</p>
                      <p><span className="text-slate-400">الأولوية:</span> {salon.markdownPriority}</p>
                    </div>

                    <div className="md:col-span-2 p-3 bg-white rounded border border-slate-200">
                      <span className="text-slate-500 font-medium block mb-1">سبب الترتيب في قاعدة البيانات:</span>
                      <p className="text-slate-900 leading-relaxed">{salon.markdownReason}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600">
                    هذا الصالون مدرج في جدول الإكسل (57 صالوناً) ولم يدخل في قائمة أفضل 50 ذات الأولوية الأولى، وحُفظت كامل بياناته بدقة هنا.
                  </p>
                )}
              </div>

              {/* Source URLs */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-1.5">
                  روابط المصادر المستند إليها (Source URLs):
                </span>
                <p className="text-xs text-slate-700 font-mono leading-relaxed select-all" dir="ltr">
                  {salon.sourceUrls}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {extractUrls(salon.sourceUrls).map((item, i) => (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline bg-white px-2 py-0.5 rounded border border-slate-200"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span className="truncate max-w-[200px]" dir="ltr">{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRACKING LAYER */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                <Layers className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">طبقة التتبع الشخصية المستقلة:</span>
                  <span>
                    هذه الحقول تُحفظ في متصفحك بشكل فوري ومنفصل تماماً عن ملف البيانات، ولا تؤثر على بيانات المصدر الأصلية.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">حالة التواصل الحالية:</label>
                  <select
                    value={currentTracking.status}
                    onChange={(e) =>
                      onUpdateTracking(salon.id, {
                        status: e.target.value as TrackingStatus,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-slate-900"
                  >
                    {Object.entries(TRACKING_STATUS_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.labelAr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Channel Used */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">القناة المستخدمة:</label>
                  <select
                    value={currentTracking.channelUsed}
                    onChange={(e) =>
                      onUpdateTracking(salon.id, {
                        channelUsed: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">(اختر القناة)</option>
                    {CHANNEL_OPTIONS.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Contacted */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    تاريخ أول تواصل:
                  </label>
                  <input
                    type="date"
                    value={currentTracking.dateContacted}
                    onChange={(e) =>
                      onUpdateTracking(salon.id, {
                        dateContacted: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono"
                  />
                </div>

                {/* Last Follow-up */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    تاريخ آخر متابعة:
                  </label>
                  <input
                    type="date"
                    value={currentTracking.lastFollowUpDate}
                    onChange={(e) =>
                      onUpdateTracking(salon.id, {
                        lastFollowUpDate: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono"
                  />
                </div>

                {/* Next Follow-up */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    تاريخ المتابعة القادمة:
                  </label>
                  <input
                    type="date"
                    value={currentTracking.nextFollowUpDate}
                    onChange={(e) =>
                      onUpdateTracking(salon.id, {
                        nextFollowUpDate: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono"
                  />
                </div>

                {/* Amount Agreed in DZD */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    المبلغ المتفق عليه (دج DZD):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={currentTracking.amountAgreed ?? ''}
                      onChange={(e) =>
                        onUpdateTracking(salon.id, {
                          amountAgreed: e.target.value ? Number(e.target.value) : null,
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      className="w-full text-xs sm:text-sm p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono pl-12"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">DZD</span>
                  </div>
                </div>

                {/* Free Text Notes */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ملاحظات التواصل الحرة:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="سجل نتائج المكالمة، رغبات صاحب الصالون، وقت المعاودة المناسب..."
                    value={currentTracking.notes}
                    onChange={(e) =>
                      onUpdateTracking(salon.id, {
                        notes: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {currentTracking.updatedAt && (
                <div className="text-[11px] text-slate-400 font-mono text-left">
                  آخر تحديث: {new Date(currentTracking.updatedAt).toLocaleString('ar-DZ')}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: RAW SOURCE VALUES (UNTOUCHED) */}
          {activeTab === 'raw' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-medium">
                  <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                  <span>جميع حقول الإكسل الـ 24 كاملة كما وردت دون أدنى تعديل أو تنظيف:</span>
                </div>
                <span className="font-mono text-[11px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                  {Object.keys(salon.rawFields).length} حقول
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-right font-semibold text-slate-600 w-1/3">
                        اسم العمود في الإكسل
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-slate-600 w-2/3">
                        القيمة الخام (Raw Value)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {Object.entries(salon.rawFields).map(([key, val]) => (
                      <tr key={key} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-600 font-medium whitespace-nowrap bg-slate-50/50">
                          {key}
                        </td>
                        <td className="px-3 py-2 text-slate-900 break-words select-all">
                          {val || <span className="text-slate-300 italic">فارغ (خالٍ في المصدر)</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>البيانات متطابقة بنسبة 100% مع ملفات الفحص الأصلية</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
