import React, { useState, useMemo } from 'react';
import { MergedSalon } from '../data/salonsData';
import { TrackingStore, TRACKING_STATUS_CONFIG, TrackingStatus } from '../types/tracking';
import {
  Search,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Phone,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Eye,
  EyeOff,
  RotateCcw,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface SalonsTableViewProps {
  salons: MergedSalon[];
  tracking: TrackingStore;
  onSelectSalon: (salon: MergedSalon) => void;
  onCopyMessage: (salon: MergedSalon) => void;
  onQuickStatusChange: (salonId: string, status: TrackingStatus) => void;
}

export type SortField =
  | 'id'
  | 'salonName'
  | 'neighborhood'
  | 'communeDaira'
  | 'category'
  | 'outreachPriority'
  | 'verificationLabel'
  | 'activityLevel'
  | 'lastPostDate'
  | 'status'
  | 'targetAreaExtension';

export interface ColumnDef {
  id: string;
  labelAr: string;
  defaultVisible: boolean;
  sortKey?: SortField;
}

export const ALL_COLUMNS: ColumnDef[] = [
  { id: 'id', labelAr: 'المعرف ID', defaultVisible: true, sortKey: 'id' },
  { id: 'salonName', labelAr: 'اسم الصالون', defaultVisible: true, sortKey: 'salonName' },
  { id: 'neighborhood', labelAr: 'الحي / المنطقة', defaultVisible: true, sortKey: 'neighborhood' },
  { id: 'outreachPriority', labelAr: 'الأولوية', defaultVisible: true, sortKey: 'outreachPriority' },
  { id: 'trackingStatus', labelAr: 'حالة التتبع', defaultVisible: true, sortKey: 'status' },
  { id: 'phoneWhatsApp', labelAr: 'الهاتف / واتساب', defaultVisible: true },
  { id: 'category', labelAr: 'الفئة والتخصص', defaultVisible: false, sortKey: 'category' },
  { id: 'communeDaira', labelAr: 'البلدية / الدائرة', defaultVisible: false, sortKey: 'communeDaira' },
  { id: 'verificationLabel', labelAr: 'مستوى التوثيق', defaultVisible: true, sortKey: 'verificationLabel' },
  { id: 'activityLevel', labelAr: 'النشاط', defaultVisible: false, sortKey: 'activityLevel' },
  { id: 'lastPostDate', labelAr: 'تاريخ آخر منشور', defaultVisible: false, sortKey: 'lastPostDate' },
  { id: 'targetAreaExtension', labelAr: 'الهدف / الامتداد', defaultVisible: false, sortKey: 'targetAreaExtension' },
  { id: 'mapsRatingReviews', labelAr: 'تقييم Maps', defaultVisible: false },
  { id: 'googleMapsUrl', labelAr: 'رابط الخريطة', defaultVisible: false },
  { id: 'address', labelAr: 'العنوان المسجل', defaultVisible: false },
  { id: 'instagramUrl', labelAr: 'حساب إنستغرام', defaultVisible: false },
  { id: 'facebookUrl', labelAr: 'صفحة فيسبوك', defaultVisible: false },
  { id: 'tiktokUrl', labelAr: 'حساب تيك توك', defaultVisible: false },
  { id: 'websiteBooking', labelAr: 'الموقع أو الحجز', defaultVisible: false },
  { id: 'pricesServices', labelAr: 'الأسعار والخدمات', defaultVisible: false },
  { id: 'photoBrandingQuality', labelAr: 'جودة الهوية', defaultVisible: false },
  { id: 'digitalGapNote', labelAr: 'الفجوة الرقمية', defaultVisible: false },
  { id: 'duplicateSourceIdsMerged', labelAr: 'المكررات المدمجة', defaultVisible: false },
  { id: 'sourceUrls', labelAr: 'روابط المصادر', defaultVisible: false },
];

export const SalonsTableView: React.FC<SalonsTableViewProps> = ({
  salons,
  tracking,
  onSelectSalon,
  onCopyMessage,
  onQuickStatusChange,
}) => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNeighborhood, setFilterNeighborhood] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterVerification, setFilterVerification] = useState('ALL');
  const [filterActivity, setFilterActivity] = useState('ALL');
  const [filterTargetExtension, setFilterTargetExtension] = useState('ALL');
  const [filterCheckFlag, setFilterCheckFlag] = useState('ALL');
  const [filterTrackingStatus, setFilterTrackingStatus] = useState('ALL');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((c) => {
      initial[c.id] = c.defaultVisible;
    });
    return initial;
  });

  const [showColPicker, setShowColPicker] = useState(false);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Distinct options for filters
  const neighborhoods = useMemo(() => {
    const set = new Set<string>();
    salons.forEach((s) => {
      if (s.neighborhood) set.add(s.neighborhood);
      else if (s.communeDaira) set.add(s.communeDaira);
    });
    return Array.from(set).sort();
  }, [salons]);

  const targetExtensionOptions = useMemo(() => {
    const set = new Set<string>();
    salons.forEach((s) => {
      if (s.targetAreaExtension) set.add(s.targetAreaExtension);
    });
    return Array.from(set).sort();
  }, [salons]);

  // Handle column toggle
  const toggleColumn = (colId: string) => {
    setVisibleColumns((prev) => ({ ...prev, [colId]: !prev[colId] }));
  };

  const resetDefaultColumns = () => {
    const reset: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((c) => {
      reset[c.id] = c.defaultVisible;
    });
    setVisibleColumns(reset);
  };

  const showAllColumns = () => {
    const all: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((c) => {
      all[c.id] = true;
    });
    setVisibleColumns(all);
  };

  // Sorting handler
  const handleSort = (field?: SortField) => {
    if (!field) return;
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filtering & Sorting
  const filteredSalons = useMemo(() => {
    return salons
      .filter((s) => {
        // Search term in every text field
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchSearch =
            s.salonName.toLowerCase().includes(term) ||
            s.id.toLowerCase().includes(term) ||
            s.communeDaira.toLowerCase().includes(term) ||
            s.neighborhood.toLowerCase().includes(term) ||
            s.category.toLowerCase().includes(term) ||
            s.address.toLowerCase().includes(term) ||
            s.phoneWhatsApp.toLowerCase().includes(term) ||
            s.instagramUrl.toLowerCase().includes(term) ||
            s.facebookUrl.toLowerCase().includes(term) ||
            s.tiktokUrl.toLowerCase().includes(term) ||
            s.digitalGapNote.toLowerCase().includes(term) ||
            s.outreachPriorityFull.toLowerCase().includes(term) ||
            (s.markdownReason && s.markdownReason.toLowerCase().includes(term)) ||
            (s.markdownNameAr && s.markdownNameAr.toLowerCase().includes(term)) ||
            (tracking[s.id]?.notes && tracking[s.id]!.notes.toLowerCase().includes(term));
          if (!matchSearch) return false;
        }

        // Neighborhood
        if (filterNeighborhood !== 'ALL') {
          const salonArea = s.neighborhood || s.communeDaira;
          if (salonArea !== filterNeighborhood) return false;
        }

        // Priority
        if (filterPriority !== 'ALL' && s.outreachPriority !== filterPriority) {
          return false;
        }

        // Verification
        if (filterVerification !== 'ALL' && s.verificationLabel !== filterVerification) {
          return false;
        }

        // Activity
        if (filterActivity !== 'ALL' && s.activityLevel !== filterActivity) {
          return false;
        }

        // Target vs Extension
        if (filterTargetExtension !== 'ALL' && s.targetAreaExtension !== filterTargetExtension) {
          return false;
        }

        // Check Flag
        if (filterCheckFlag === 'CHECK_ONLY' && !s.isFlaggedCheck) return false;
        if (filterCheckFlag === 'CLEAN_ONLY' && s.isFlaggedCheck) return false;

        // Tracking Status
        const status = tracking[s.id]?.status || 'not_contacted';
        if (filterTrackingStatus !== 'ALL' && status !== filterTrackingStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        if (sortField === 'id') {
          valA = a.id;
          valB = b.id;
        } else if (sortField === 'salonName') {
          valA = a.salonName;
          valB = b.salonName;
        } else if (sortField === 'neighborhood') {
          valA = a.neighborhood || a.communeDaira;
          valB = b.neighborhood || b.communeDaira;
        } else if (sortField === 'communeDaira') {
          valA = a.communeDaira;
          valB = b.communeDaira;
        } else if (sortField === 'category') {
          valA = a.category;
          valB = b.category;
        } else if (sortField === 'outreachPriority') {
          valA = a.outreachPriority;
          valB = b.outreachPriority;
        } else if (sortField === 'verificationLabel') {
          valA = a.verificationLabel;
          valB = b.verificationLabel;
        } else if (sortField === 'activityLevel') {
          valA = a.activityLevel;
          valB = b.activityLevel;
        } else if (sortField === 'lastPostDate') {
          valA = a.lastPostDate;
          valB = b.lastPostDate;
        } else if (sortField === 'targetAreaExtension') {
          valA = a.targetAreaExtension;
          valB = b.targetAreaExtension;
        } else if (sortField === 'status') {
          valA = tracking[a.id]?.status || 'not_contacted';
          valB = tracking[b.id]?.status || 'not_contacted';
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [
    salons,
    tracking,
    searchTerm,
    filterNeighborhood,
    filterPriority,
    filterVerification,
    filterActivity,
    filterTargetExtension,
    filterCheckFlag,
    filterTrackingStatus,
    sortField,
    sortAsc,
  ]);

  const handleCopyPhone = (id: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث الشامل في كل الحقول: الاسم، الحي، الهاتف، الفئة، الملاحظات..."
            className="w-full text-xs sm:text-sm pr-10 pl-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              مسح
            </button>
          )}
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
          {/* Neighborhood filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">الحي / المنطقة:</label>
            <select
              value={filterNeighborhood}
              onChange={(e) => setFilterNeighborhood(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
            >
              <option value="ALL">كل الأحياء ({salons.length})</option>
              {neighborhoods.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">الأولوية:</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
            >
              <option value="ALL">كل الأولويات</option>
              <option value="A">أولوية A (عالية - 17)</option>
              <option value="B">أولوية B (متوسطة - 38)</option>
              <option value="C">أولوية C (منخفضة - 2)</option>
            </select>
          </div>

          {/* Tracking Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">حالة التتبع:</label>
            <select
              value={filterTrackingStatus}
              onChange={(e) => setFilterTrackingStatus(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
            >
              <option value="ALL">كل حالات التتبع</option>
              {Object.entries(TRACKING_STATUS_CONFIG).map(([k, cfg]) => (
                <option key={k} value={k}>
                  {cfg.labelAr}
                </option>
              ))}
            </select>
          </div>

          {/* Verification */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">مستوى التوثيق:</label>
            <select
              value={filterVerification}
              onChange={(e) => setFilterVerification(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
            >
              <option value="ALL">كل مستويات التوثيق</option>
              <option value="Verified">موثق بالكامل (Verified - 28)</option>
              <option value="Partially verified">موثق جزئياً (Partially - 29)</option>
            </select>
          </div>

          {/* Target / Extension */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">الهدف / الامتداد:</label>
            <select
              value={filterTargetExtension}
              onChange={(e) => setFilterTargetExtension(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
            >
              <option value="ALL">الكل (أهداف وامتدادات)</option>
              {targetExtensionOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Check Flag */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">شارة التدقيق (Check):</label>
            <select
              value={filterCheckFlag}
              onChange={(e) => setFilterCheckFlag(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
            >
              <option value="ALL">كل السجلات</option>
              <option value="CHECK_ONLY">الموسومة بتدقيق فقط</option>
              <option value="CLEAN_ONLY">بدون تنبيهات تدقيق</option>
            </select>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">مستوى النشاط:</label>
            <select
              value={filterActivity}
              onChange={(e) => setFilterActivity(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
            >
              <option value="ALL">كل الأنشطة</option>
              <option value="active">نشط (active)</option>
              <option value="low">منخفض (low)</option>
            </select>
          </div>
        </div>

        {/* Status & Column Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span>النتائج المعروضة:</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {filteredSalons.length}
            </span>
            <span>من إجمالي</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">{salons.length}</span>
            {filteredSalons.length < salons.length && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterNeighborhood('ALL');
                  setFilterPriority('ALL');
                  setFilterVerification('ALL');
                  setFilterActivity('ALL');
                  setFilterTargetExtension('ALL');
                  setFilterCheckFlag('ALL');
                  setFilterTrackingStatus('ALL');
                }}
                className="text-indigo-600 hover:underline mr-2 inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>

          {/* Column Visibility Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColPicker(!showColPicker)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium border border-slate-300 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>إظهار / إخفاء الأعمدة ({Object.values(visibleColumns).filter(Boolean).length})</span>
            </button>

            {showColPicker && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-40 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900">التحكم في أعمدة الجدول</span>
                  <div className="flex gap-2">
                    <button
                      onClick={showAllColumns}
                      className="text-indigo-600 hover:underline text-[11px]"
                    >
                      إظهار الكل
                    </button>
                    <button
                      onClick={resetDefaultColumns}
                      className="text-slate-500 hover:underline text-[11px]"
                    >
                      الافتراضي
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 py-1">
                  {ALL_COLUMNS.map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={!!visibleColumns[col.id]}
                        onChange={() => toggleColumn(col.id)}
                        className="rounded text-slate-900 focus:ring-slate-900"
                      />
                      <span>{col.labelAr}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 text-left">
                  <button
                    onClick={() => setShowColPicker(false)}
                    className="px-3 py-1 bg-slate-900 text-white rounded text-xs font-medium"
                  >
                    تم
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs divide-y divide-slate-200">
            <thead className="bg-slate-100/80 text-slate-700 sticky top-0 z-10 font-bold select-none">
              <tr>
                {/* Dynamically Render Visible Column Headers */}
                {ALL_COLUMNS.filter((c) => visibleColumns[c.id]).map((col) => (
                  <th
                    key={col.id}
                    onClick={() => handleSort(col.sortKey)}
                    className={`px-3.5 py-3 whitespace-nowrap ${
                      col.sortKey ? 'cursor-pointer hover:bg-slate-200/80 transition-colors' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.labelAr}</span>
                      {col.sortKey && sortField === col.sortKey && (
                        <span>
                          {sortAsc ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-900" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-900" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}

                {/* Fixed Actions Column */}
                <th className="px-3.5 py-3 text-center whitespace-nowrap bg-slate-100">الإجراءات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredSalons.length === 0 ? (
                <tr>
                  <td
                    colSpan={Object.values(visibleColumns).filter(Boolean).length + 1}
                    className="p-8 text-center text-slate-500"
                  >
                    لا توجد صالونات تطابق معايير الفلترة والبحث المحددة.
                  </td>
                </tr>
              ) : (
                filteredSalons.map((salon) => {
                  const currentTrack = tracking[salon.id] || { status: 'not_contacted' };
                  const statusCfg = TRACKING_STATUS_CONFIG[currentTrack.status as TrackingStatus] || TRACKING_STATUS_CONFIG.not_contacted;

                  return (
                    <tr
                      key={salon.id}
                      onClick={() => onSelectSalon(salon)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* ID */}
                      {visibleColumns.id && (
                        <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-slate-900 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span>{salon.id}</span>
                            {salon.isFlaggedCheck && (
                              <span
                                title={salon.checkFlags.join(' | ')}
                                className="inline-block px-1 py-0.2 rounded bg-amber-500 text-white text-[10px] font-bold"
                              >
                                Check
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Salon Name */}
                      {visibleColumns.salonName && (
                        <td className="px-3.5 py-2.5 whitespace-nowrap font-bold text-slate-900">
                          <div className="flex flex-col">
                            <span className="group-hover:text-indigo-600 transition-colors">
                              {salon.salonName}
                            </span>
                            {salon.matchedWithMarkdown && salon.markdownTop50Rank && (
                              <span className="text-[10px] text-purple-700 font-normal">
                                #{salon.markdownTop50Rank} في أفضل 50
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Neighborhood */}
                      {visibleColumns.neighborhood && (
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-700">
                          {salon.neighborhood || salon.communeDaira}
                        </td>
                      )}

                      {/* Outreach Priority */}
                      {visibleColumns.outreachPriority && (
                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              salon.outreachPriority === 'A'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : salon.outreachPriority === 'B'
                                ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                                : 'bg-slate-200 text-slate-800 border border-slate-300'
                            }`}
                          >
                            أولوية {salon.outreachPriority}
                          </span>
                        </td>
                      )}

                      {/* Tracking Status */}
                      {visibleColumns.trackingStatus && (
                        <td
                          className="px-3.5 py-2.5 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={currentTrack.status}
                            onChange={(e) =>
                              onQuickStatusChange(salon.id, e.target.value as TrackingStatus)
                            }
                            className={`text-xs p-1 rounded font-medium border ${statusCfg.bgColor} ${statusCfg.textColor} ${statusCfg.borderColor} focus:ring-1 focus:ring-slate-900 cursor-pointer`}
                          >
                            {Object.entries(TRACKING_STATUS_CONFIG).map(([stKey, cfg]) => (
                              <option key={stKey} value={stKey}>
                                {cfg.labelAr}
                              </option>
                            ))}
                          </select>
                        </td>
                      )}

                      {/* Phone */}
                      {visibleColumns.phoneWhatsApp && (
                        <td
                          className="px-3.5 py-2.5 whitespace-nowrap font-mono text-slate-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {salon.phoneWhatsApp ? (
                            <button
                              onClick={(e) => handleCopyPhone(salon.id, salon.phoneWhatsApp, e)}
                              className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors text-right"
                              title="انقر لنسخ الرقم"
                            >
                              {copiedPhoneId === salon.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                              )}
                              <span dir="ltr">{salon.phoneWhatsApp.split('|')[0].trim()}</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 italic">غير متوفر</span>
                          )}
                        </td>
                      )}

                      {/* Category */}
                      {visibleColumns.category && (
                        <td className="px-3.5 py-2.5 max-w-[200px] truncate text-slate-600">
                          {salon.category}
                        </td>
                      )}

                      {/* Commune/Daïra */}
                      {visibleColumns.communeDaira && (
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-600">
                          {salon.communeDaira}
                        </td>
                      )}

                      {/* Verification Label */}
                      {visibleColumns.verificationLabel && (
                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                              salon.verificationLabel === 'Verified'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {salon.verificationLabel === 'Verified' ? 'موثق بالكامل' : 'موثق جزئياً'}
                          </span>
                        </td>
                      )}

                      {/* Activity Level */}
                      {visibleColumns.activityLevel && (
                        <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-slate-600">
                          {salon.activityLevel}
                        </td>
                      )}

                      {/* Last Post Date */}
                      {visibleColumns.lastPostDate && (
                        <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-slate-600 text-[11px]">
                          {salon.lastPostDate}
                        </td>
                      )}

                      {/* Target Area Extension */}
                      {visibleColumns.targetAreaExtension && (
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-600 text-[11px]">
                          {salon.targetAreaExtension}
                        </td>
                      )}

                      {/* Maps Rating */}
                      {visibleColumns.mapsRatingReviews && (
                        <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-slate-600 text-[11px]">
                          {salon.mapsRatingReviews || '—'}
                        </td>
                      )}

                      {/* Google Maps Link */}
                      {visibleColumns.googleMapsUrl && (
                        <td
                          className="px-3.5 py-2.5 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {salon.googleMapsUrl ? (
                            <a
                              href={salon.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                              <span>الخريطة</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      )}

                      {/* Address */}
                      {visibleColumns.address && (
                        <td className="px-3.5 py-2.5 max-w-[220px] truncate text-slate-600 text-[11px]">
                          {salon.address || '—'}
                        </td>
                      )}

                      {/* Instagram */}
                      {visibleColumns.instagramUrl && (
                        <td className="px-3.5 py-2.5 max-w-[180px] truncate font-mono text-[11px]" dir="ltr">
                          {salon.instagramUrl || '—'}
                        </td>
                      )}

                      {/* Facebook */}
                      {visibleColumns.facebookUrl && (
                        <td className="px-3.5 py-2.5 max-w-[180px] truncate font-mono text-[11px]" dir="ltr">
                          {salon.facebookUrl || '—'}
                        </td>
                      )}

                      {/* TikTok */}
                      {visibleColumns.tiktokUrl && (
                        <td className="px-3.5 py-2.5 max-w-[180px] truncate font-mono text-[11px]" dir="ltr">
                          {salon.tiktokUrl || '—'}
                        </td>
                      )}

                      {/* Website/Booking */}
                      {visibleColumns.websiteBooking && (
                        <td className="px-3.5 py-2.5 max-w-[180px] truncate font-mono text-[11px]" dir="ltr">
                          {salon.websiteBooking || '—'}
                        </td>
                      )}

                      {/* Prices/Services */}
                      {visibleColumns.pricesServices && (
                        <td className="px-3.5 py-2.5 max-w-[200px] truncate text-slate-600 text-[11px]">
                          {salon.pricesServices || '—'}
                        </td>
                      )}

                      {/* Photo Quality */}
                      {visibleColumns.photoBrandingQuality && (
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-slate-600 text-[11px]">
                          {salon.photoBrandingQuality || '—'}
                        </td>
                      )}

                      {/* Digital Gap Note */}
                      {visibleColumns.digitalGapNote && (
                        <td className="px-3.5 py-2.5 max-w-[220px] truncate text-slate-600 text-[11px]">
                          {salon.digitalGapNote || '—'}
                        </td>
                      )}

                      {/* Duplicate Source IDs Merged */}
                      {visibleColumns.duplicateSourceIdsMerged && (
                        <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-blue-700 text-[11px]">
                          {salon.duplicateSourceIdsMerged || '—'}
                        </td>
                      )}

                      {/* Source URLs */}
                      {visibleColumns.sourceUrls && (
                        <td className="px-3.5 py-2.5 max-w-[200px] truncate font-mono text-[11px]" dir="ltr">
                          {salon.sourceUrls || '—'}
                        </td>
                      )}

                      {/* Actions */}
                      <td
                        className="px-3.5 py-2.5 whitespace-nowrap text-center bg-slate-50/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectSalon(salon)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                            title="عرض تفاصيل الصالون"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onCopyMessage(salon)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                            title="نسخ رسالة مخصصة"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARD LIST VIEW */}
      <div className="block md:hidden space-y-3">
        {filteredSalons.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
            لا توجد صالونات تطابق البحث الحالي.
          </div>
        ) : (
          filteredSalons.map((salon) => {
            const currentTrack = tracking[salon.id] || { status: 'not_contacted' };
            const statusCfg = TRACKING_STATUS_CONFIG[currentTrack.status as TrackingStatus] || TRACKING_STATUS_CONFIG.not_contacted;

            return (
              <div
                key={salon.id}
                onClick={() => onSelectSalon(salon)}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
              >
                {/* Card Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-mono text-xs font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-white">
                        {salon.id}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[11px] font-semibold ${
                          salon.outreachPriority === 'A'
                            ? 'bg-indigo-100 text-indigo-800'
                            : salon.outreachPriority === 'B'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        أولوية {salon.outreachPriority}
                      </span>
                      {salon.isFlaggedCheck && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-bold">
                          Check
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 truncate">
                      {salon.salonName}
                    </h3>
                  </div>

                  {/* Status Dropdown */}
                  <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    <select
                      value={currentTrack.status}
                      onChange={(e) =>
                        onQuickStatusChange(salon.id, e.target.value as TrackingStatus)
                      }
                      className={`text-xs p-1 rounded font-medium border ${statusCfg.bgColor} ${statusCfg.textColor} ${statusCfg.borderColor}`}
                    >
                      {Object.entries(TRACKING_STATUS_CONFIG).map(([stKey, cfg]) => (
                        <option key={stKey} value={stKey}>
                          {cfg.labelAr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subtitle Details */}
                <div className="text-xs text-slate-600 space-y-1">
                  <p>{salon.category}</p>
                  <p className="text-slate-500">
                    {salon.neighborhood || salon.communeDaira} · {salon.targetAreaExtension}
                  </p>
                </div>

                {/* Phone & Quick Actions */}
                <div
                  className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  {salon.phoneWhatsApp ? (
                    <button
                      onClick={(e) => handleCopyPhone(salon.id, salon.phoneWhatsApp, e)}
                      className="inline-flex items-center gap-1.5 text-slate-800 font-mono hover:text-indigo-600"
                    >
                      {copiedPhoneId === salon.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span dir="ltr">{salon.phoneWhatsApp.split('|')[0].trim()}</span>
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[11px]">لا يوجد هاتف مسجل</span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCopyMessage(salon)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded"
                      title="نسخ رسالة"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectSalon(salon)}
                      className="px-2.5 py-1 text-xs font-medium text-white bg-slate-900 rounded"
                    >
                      التفاصيل
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
