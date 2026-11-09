/**
 * دوال التخزين المحلي، التصدير، والاستيراد
 * تضمن حفظ البيانات بشكل آمن ومستقل تماماً عن بيانات المصدر الأصلية
 */

import { MergedSalon } from '../data/salonsData';
import { TrackingRecord, TrackingStore } from '../types/tracking';

const TRACKING_STORAGE_KEY = 'oran_beauty_salon_tracking_v1';
const TEMPLATE_STORAGE_KEY = 'oran_beauty_msg_template_v1';

export function loadTrackingStore(): TrackingStore {
  try {
    const raw = localStorage.getItem(TRACKING_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as TrackingStore;
    }
  } catch (err) {
    console.error('Failed to load tracking data from localStorage:', err);
  }
  return {};
}

export function saveTrackingStore(store: TrackingStore): boolean {
  try {
    localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch (err) {
    console.error('Failed to save tracking data to localStorage:', err);
    return false;
  }
}

export function loadMessageTemplate(): string {
  try {
    const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    // The template starts EMPTY. Do not write sales copy.
    return raw !== null ? raw : '';
  } catch {
    return '';
  }
}

export function saveMessageTemplate(tmpl: string): void {
  try {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, tmpl);
  } catch (err) {
    console.error('Failed to save message template:', err);
  }
}

/**
 * تصدير البيانات إلى JSON يشمل بيانات الصالونات مع بيانات التتبع
 */
export function exportDataToJSON(salons: MergedSalon[], tracking: TrackingStore): void {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    totalSalons: salons.length,
    trackingRecordsCount: Object.keys(tracking).length,
    trackingStore: tracking,
    salons: salons.map((salon) => ({
      id: salon.id,
      salonName: salon.salonName,
      neighborhood: salon.neighborhood,
      category: salon.category,
      communeDaira: salon.communeDaira,
      phoneWhatsApp: salon.phoneWhatsApp,
      outreachPriority: salon.outreachPriority,
      verificationLabel: salon.verificationLabel,
      tracking: tracking[salon.id] || null,
      rawFields: salon.rawFields,
    })),
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `oran_salons_backup_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * تصدير البيانات إلى CSV بترميز UTF-8 مع BOM لضمان العرض الصحيح للغة العربية في Excel
 */
export function exportDataToCSV(salons: MergedSalon[], tracking: TrackingStore): void {
  // Columns list
  const headers = [
    'المعرف (ID)',
    'اسم الصالون',
    'البلدية / الدائرة',
    'الحي / المنطقة',
    'الفئة والتخصص',
    'العنوان الكامل',
    'رابط الخريطة Maps',
    'تقييم ومراجعات Maps',
    'رقم الهاتف / واتساب',
    'رابط إنستغرام والمتابعون',
    'رابط فيسبوك والمتابعون',
    'رابط تيك توك والمتابعون',
    'الموقع أو رابط الحجز',
    'تاريخ آخر منشور',
    'مستوى النشاط',
    'الأسعار والخدمات الظاهرة',
    'جودة الصور والهوية',
    'ملاحظة الفجوة الرقمية',
    'أولوية التواصل والسبب',
    'تاريخ الفحص',
    'المصادر المستند إليها',
    'مستوى التوثيق',
    'نطاق الهدف أو الامتداد',
    'المعرفات المكررة المدمجة',
    // حقول التتبع الشخصي
    'حالة التتبع',
    'تاريخ أول تواصل',
    'تاريخ آخر متابعة',
    'تاريخ المتابعة القادمة',
    'القناة المستخدمة',
    'المبلغ المتفق عليه (دج)',
    'ملاحظات التواصل الحرة',
    'تاريخ آخر تحديث للتتبع',
  ];

  function escapeCSV(val: string | number | null | undefined): string {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  const rows: string[] = [];
  rows.push(headers.map(escapeCSV).join(','));

  for (const s of salons) {
    const t = tracking[s.id] || null;
    const row = [
      s.id,
      s.salonName,
      s.communeDaira,
      s.neighborhood,
      s.category,
      s.address,
      s.googleMapsUrl,
      s.mapsRatingReviews,
      s.phoneWhatsApp,
      s.instagramUrl,
      s.facebookUrl,
      s.tiktokUrl,
      s.websiteBooking,
      s.lastPostDate,
      s.activityLevel,
      s.pricesServices,
      s.photoBrandingQuality,
      s.digitalGapNote,
      s.outreachPriorityFull,
      s.dateChecked,
      s.sourceUrls,
      s.verificationLabel,
      s.targetAreaExtension,
      s.duplicateSourceIdsMerged,
      // Tracking fields
      t ? t.status : 'not_contacted',
      t ? t.dateContacted : '',
      t ? t.lastFollowUpDate : '',
      t ? t.nextFollowUpDate : '',
      t ? t.channelUsed : '',
      t && t.amountAgreed !== null ? t.amountAgreed : '',
      t ? t.notes : '',
      t ? t.updatedAt : '',
    ];
    rows.push(row.map(escapeCSV).join(','));
  }

  // Prepend UTF-8 BOM so Excel opens Arabic correctly
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `oran_salons_prospects_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * استيراد بيانات التتبع من ملف JSON احتياطي
 */
export function importTrackingFromJSON(jsonText: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonText);
    let targetStore: TrackingStore = {};

    if (parsed.trackingStore && typeof parsed.trackingStore === 'object') {
      targetStore = parsed.trackingStore;
    } else if (typeof parsed === 'object' && parsed !== null) {
      // Check if it's direct key-value
      for (const [key, val] of Object.entries(parsed)) {
        if (val && typeof val === 'object' && 'status' in (val as Record<string, unknown>)) {
          targetStore[key] = val as TrackingRecord;
        }
      }
    }

    const count = Object.keys(targetStore).length;
    if (count === 0) {
      return { success: false, count: 0, error: 'الملف لا يحتوي على سجلات تتبع صالحة' };
    }

    const existing = loadTrackingStore();
    const merged = { ...existing, ...targetStore };
    saveTrackingStore(merged);
    return { success: true, count };
  } catch (err) {
    return { success: false, count: 0, error: (err as Error).message || 'خطأ في معالجة ملف JSON' };
  }
}
