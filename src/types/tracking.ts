/**
 * تعريفات ونماذج طبقة التتبع (Tracking Layer)
 * منفصلة تماماً عن بيانات المصدر الأصلية لضمان عدم المساس بها
 */

export type TrackingStatus =
  | 'not_contacted'
  | 'contacted'
  | 'replied'
  | 'interested'
  | 'asked_for_details'
  | 'committed'
  | 'paid'
  | 'declined'
  | 'no_response';

export interface TrackingRecord {
  salonId: string;
  status: TrackingStatus;
  dateContacted: string; // YYYY-MM-DD
  lastFollowUpDate: string; // YYYY-MM-DD
  nextFollowUpDate: string; // YYYY-MM-DD
  channelUsed: string; // هاتف / واتساب / إنستغرام / فيسبوك / تيك توك / زيارة ميدانية / أخرى
  notes: string;
  amountAgreed: number | null; // المبلغ المتفق عليه بدج
  updatedAt: string; // ISO string
}

export type TrackingStore = Record<string, TrackingRecord>;

export const TRACKING_STATUS_CONFIG: Record<
  TrackingStatus,
  {
    labelAr: string;
    color: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    order: number;
    isFunnelStage: boolean;
  }
> = {
  not_contacted: {
    labelAr: 'لم يتم التواصل',
    color: '#64748b',
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    order: 0,
    isFunnelStage: false,
  },
  contacted: {
    labelAr: 'تم التواصل',
    color: '#2563eb',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    order: 1,
    isFunnelStage: true,
  },
  replied: {
    labelAr: 'تم الرد',
    color: '#0891b2',
    textColor: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-300',
    order: 2,
    isFunnelStage: true,
  },
  interested: {
    labelAr: 'مهتم',
    color: '#d97706',
    textColor: 'text-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    order: 3,
    isFunnelStage: true,
  },
  asked_for_details: {
    labelAr: 'طلب تفاصيل',
    color: '#7c3aed',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    order: 4,
    isFunnelStage: true,
  },
  committed: {
    labelAr: 'وافق / ملتزم',
    color: '#0d9488',
    textColor: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-300',
    order: 5,
    isFunnelStage: true,
  },
  paid: {
    labelAr: 'تم الدفع / مشترك',
    color: '#059669',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    order: 6,
    isFunnelStage: true,
  },
  declined: {
    labelAr: 'اعتذر / غير مهتم',
    color: '#e11d48',
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    order: 7,
    isFunnelStage: false,
  },
  no_response: {
    labelAr: 'لا يوجد رد',
    color: '#94a3b8',
    textColor: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    order: 8,
    isFunnelStage: false,
  },
};

export const FUNNEL_STAGES: TrackingStatus[] = [
  'contacted',
  'replied',
  'interested',
  'asked_for_details',
  'committed',
  'paid',
];

export const CHANNEL_OPTIONS = [
  'هاتف',
  'واتساب',
  'إنستغرام',
  'فيسبوك',
  'تيك توك',
  'زيارة ميدانية',
  'أخرى',
];
