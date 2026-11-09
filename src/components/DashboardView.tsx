import React, { useMemo } from 'react';
import { MergedSalon } from '../data/salonsData';
import { TrackingStore, TrackingStatus, FUNNEL_STAGES, TRACKING_STATUS_CONFIG } from '../types/tracking';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Banknote,
  ArrowRight,
  Eye,
  MapPin,
} from 'lucide-react';

interface DashboardViewProps {
  salons: MergedSalon[];
  tracking: TrackingStore;
  onSelectSalon: (salon: MergedSalon) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ salons, tracking, onSelectSalon }) => {
  // Today's date in local time YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // 1. Funnel data calculated ONLY from tracking data
  // Stages: contacted -> replied -> interested -> asked_for_details -> committed -> paid
  const funnelData = useMemo(() => {
    // Count salons currently at or beyond each funnel stage, or in each stage
    // To calculate proper pipeline conversion:
    // Stage counts:
    const stageCounts: Record<TrackingStatus, number> = {
      not_contacted: 0,
      contacted: 0,
      replied: 0,
      interested: 0,
      asked_for_details: 0,
      committed: 0,
      paid: 0,
      declined: 0,
      no_response: 0,
    };

    Object.values(tracking).forEach((rec) => {
      if (rec.status && stageCounts[rec.status] !== undefined) {
        stageCounts[rec.status]++;
      }
    });

    // Funnel progressive numbers:
    // For a sales pipeline:
    // 'paid' reached paid (order 6)
    // 'committed' reached at least committed (order 5)
    // 'asked_for_details' reached order 4
    // 'interested' reached order 3
    // 'replied' reached order 2
    // 'contacted' reached order 1
    // Let's count how many total are at each stage or progressed through it
    const stagesOrdered: TrackingStatus[] = [
      'contacted',
      'replied',
      'interested',
      'asked_for_details',
      'committed',
      'paid',
    ];

    // Cumulative reached: anyone who is at stage i or higher (excluding declined / no_response unless reached)
    // Or direct count in that specific stage + higher stages:
    const orderMap: Record<TrackingStatus, number> = {
      not_contacted: 0,
      declined: 0,
      no_response: 0,
      contacted: 1,
      replied: 2,
      interested: 3,
      asked_for_details: 4,
      committed: 5,
      paid: 6,
    };

    const reachedCounts = stagesOrdered.map((st) => {
      const targetOrder = orderMap[st];
      const count = Object.values(tracking).filter((rec) => orderMap[rec.status] >= targetOrder).length;
      return { stage: st, count };
    });

    const topCount = reachedCounts[0].count; // Total contacted

    return stagesOrdered.map((st, idx) => {
      const cfg = TRACKING_STATUS_CONFIG[st];
      const count = reachedCounts[idx].count;
      const prevCount = idx === 0 ? count : reachedCounts[idx - 1].count;
      const overallConversion = topCount > 0 ? ((count / topCount) * 100).toFixed(1) : '0.0';
      const stepConversion = prevCount > 0 ? ((count / prevCount) * 100).toFixed(1) : '0.0';

      return {
        key: st,
        name: cfg.labelAr,
        count,
        color: cfg.color,
        overallConversion,
        stepConversion,
      };
    });
  }, [tracking]);

  // 2. Count of salons per neighborhood
  const neighborhoodData = useMemo(() => {
    const counts: Record<string, number> = {};
    salons.forEach((s) => {
      const area = s.neighborhood || s.communeDaira;
      counts[area] = (counts[area] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [salons]);

  // 3. Count of salons per priority (A / B / C)
  const priorityData = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0 };
    salons.forEach((s) => {
      if (s.outreachPriority in counts) {
        counts[s.outreachPriority]++;
      }
    });

    return [
      { name: 'أولوية A (عالية)', priority: 'A', count: counts.A, color: '#4f46e5' },
      { name: 'أولوية B (متوسطة)', priority: 'B', count: counts.B, color: '#0891b2' },
      { name: 'أولوية C (منخفضة)', priority: 'C', count: counts.C, color: '#64748b' },
    ];
  }, [salons]);

  // 4. Today's contacts
  const todayContacts = useMemo(() => {
    return salons.filter((s) => {
      const t = tracking[s.id];
      if (!t) return false;
      return t.dateContacted === todayStr || t.lastFollowUpDate === todayStr;
    });
  }, [salons, tracking, todayStr]);

  // 5. Follow up today list sorted by next follow-up date
  const followUpList = useMemo(() => {
    return salons
      .filter((s) => {
        const t = tracking[s.id];
        return t && t.nextFollowUpDate;
      })
      .map((s) => {
        const t = tracking[s.id]!;
        const date = t.nextFollowUpDate;
        let urgency: 'overdue' | 'today' | 'upcoming' = 'upcoming';
        if (date < todayStr) urgency = 'overdue';
        else if (date === todayStr) urgency = 'today';

        return {
          salon: s,
          tracking: t,
          urgency,
          date,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [salons, tracking, todayStr]);

  // Summary Metrics
  const totalContacted = useMemo(() => {
    return Object.values(tracking).filter((t) => t.status !== 'not_contacted').length;
  }, [tracking]);

  const totalAmountAgreed = useMemo(() => {
    return Object.values(tracking).reduce((sum, t) => sum + (t.amountAgreed || 0), 0);
  }, [tracking]);

  const paidCount = useMemo(() => {
    return Object.values(tracking).filter((t) => t.status === 'paid').length;
  }, [tracking]);

  return (
    <div className="space-y-6">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">صالونات تم التواصل معها</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalContacted}
            </span>
            <span className="text-xs text-slate-500">من {salons.length}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${(totalContacted / salons.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">تواصلات اليوم ({todayStr})</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {todayContacts.length}
            </span>
            <span className="text-xs text-slate-500">صالون مسجل اليوم</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {todayContacts.length > 0 ? 'نشاط مسجل اليوم' : 'لا يوجد تواصلات مسجلة اليوم بعد'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">متابعات تستحق اليوم أو متأخرة</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {followUpList.filter((f) => f.urgency === 'today' || f.urgency === 'overdue').length}
            </span>
            <span className="text-xs text-slate-500">بحاجة لاتصال</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {followUpList.filter((f) => f.urgency === 'overdue').length > 0 ? (
              <span className="text-rose-600 font-medium">
                {followUpList.filter((f) => f.urgency === 'overdue').length} متابعة متأخرة
              </span>
            ) : (
              'لا توجد مواعيد متأخرة'
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">المبالغ المتفق عليها (دج)</span>
            <Banknote className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {totalAmountAgreed.toLocaleString('ar-DZ')}
            </span>
            <span className="text-xs text-slate-500 font-mono">DZD</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            من {paidCount} صالون مدفوع / مشترك
          </p>
        </div>
      </div>

      {/* CHART 1: Funnel Pipeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display">
            مسار التحويل والمبيعات (Sales Outreach Funnel)
          </h3>
          <p className="text-xs text-slate-500">
            الوحدة: عدد الصالونات في كل مرحلة ومعدل التحويل (محسوبة حصراً من بيانات التتبع الشخصية)
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" allowDecimals={false} domain={[0, 'dataMax + 1']} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 12, fill: '#334155' }}
              />
              <Tooltip
                formatter={(value: any, name: any, item: any) => [
                  `${value} صالون (تحويل إجمالي: ${item.payload.overallConversion}%)`,
                  'العدد',
                ]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Small Data Table Alternative beneath chart */}
        <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
          <table className="w-full text-right divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold">
              <tr>
                <th className="px-3 py-2">مرحلة القمع</th>
                <th className="px-3 py-2 text-center">العدد (صالون)</th>
                <th className="px-3 py-2 text-center">التحويل من المرحلة السابقة</th>
                <th className="px-3 py-2 text-center">التحويل الإجمالي من أول تواصل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {funnelData.map((f) => (
                <tr key={f.key} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-sans font-medium text-slate-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: f.color }} />
                    {f.name}
                  </td>
                  <td className="px-3 py-2 text-center font-bold text-slate-800">{f.count}</td>
                  <td className="px-3 py-2 text-center text-slate-600">{f.stepConversion}%</td>
                  <td className="px-3 py-2 text-center font-semibold text-slate-900">{f.overallConversion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Charts: Neighborhoods + Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 2: Salons per Neighborhood */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              توزيع الصالونات حسب الأحياء والمناطق
            </h3>
            <p className="text-xs text-slate-500">الوحدة: عدد الصالونات لكل نطاق جغرافي</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={neighborhoodData.slice(0, 7)} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10, fill: '#475569' }}
                  height={45}
                />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(val: any) => [`${val} صالون`, 'العدد']} />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table Alternative */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs max-h-40 overflow-y-auto">
            <table className="w-full text-right divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0">
                <tr>
                  <th className="px-3 py-1.5">الحي / المنطقة</th>
                  <th className="px-3 py-1.5 text-center">العدد</th>
                  <th className="px-3 py-1.5 text-center">النسبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {neighborhoodData.map((n) => (
                  <tr key={n.name} className="hover:bg-slate-50">
                    <td className="px-3 py-1.5 font-sans text-slate-800">{n.name}</td>
                    <td className="px-3 py-1.5 text-center font-bold text-slate-900">{n.count}</td>
                    <td className="px-3 py-1.5 text-center text-slate-500">
                      {((n.count / salons.length) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CHART 3: Salons per Priority */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              توزيع الصالونات حسب أولوية التواصل (A / B / C)
            </h3>
            <p className="text-xs text-slate-500">
              الوحدة: عدد الصالونات (A نشاط خلال 3 أشهر + 1k متابع؛ B متابع/نشاط غير محسوم؛ C حجز مؤكد)
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(val: any) => [`${val} صالون`, 'العدد']} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table Alternative */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-right divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold">
                <tr>
                  <th className="px-3 py-1.5">الأولوية</th>
                  <th className="px-3 py-1.5 text-center">العدد</th>
                  <th className="px-3 py-1.5 text-center">النسبة</th>
                  <th className="px-3 py-1.5">المعنى التشغيلي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {priorityData.map((p) => (
                  <tr key={p.priority} className="hover:bg-slate-50">
                    <td className="px-3 py-1.5 font-sans font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </td>
                    <td className="px-3 py-1.5 text-center font-bold text-slate-900">{p.count}</td>
                    <td className="px-3 py-1.5 text-center text-slate-500">
                      {((p.count / salons.length) * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-1.5 font-sans text-slate-600 text-[11px]">
                      {p.priority === 'A'
                        ? 'فرصة عالية وفجوة حجز مؤكدة'
                        : p.priority === 'B'
                        ? 'بحاجة لتأكيد العنوان أو الجمهور'
                        : 'يملك خيار حجز إلكتروني مسبقاً'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Follow Up Today & Overdue List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>جدول المتابعات القادمة والمتأخرة</span>
            </h3>
            <p className="text-xs text-slate-500">
              مرتبة حسب تاريخ المتابعة القادمة لتنظيم جدول اتصالاتك اليومية
            </p>
          </div>
          <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
            {followUpList.length} صالون مجدول
          </span>
        </div>

        {followUpList.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-300">
            لا توجد مواعيد متابعة مجدولة حالياً. يمكنك تحديد تاريخ "المتابعة القادمة" من نافذة تفاصيل أي صالون.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-right divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold">
                <tr>
                  <th className="px-3.5 py-2">تاريخ المتابعة</th>
                  <th className="px-3.5 py-2">الحالة والملحاحية</th>
                  <th className="px-3.5 py-2">اسم الصالون</th>
                  <th className="px-3.5 py-2">الهاتف</th>
                  <th className="px-3.5 py-2">آخر ملاحظة</th>
                  <th className="px-3.5 py-2 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {followUpList.map((item) => (
                  <tr
                    key={item.salon.id}
                    onClick={() => onSelectSalon(item.salon)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-3.5 py-2.5 font-mono text-slate-900 font-semibold whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      {item.urgency === 'overdue' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold text-[11px]">
                          <AlertCircle className="w-3 h-3" />
                          متأخر
                        </span>
                      ) : item.urgency === 'today' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[11px]">
                          <Clock className="w-3 h-3" />
                          مستحق اليوم!
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                          قادم
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 font-medium text-slate-900">
                      {item.salon.salonName}
                      <span className="text-slate-400 font-normal mr-1.5 text-[11px]">
                        ({item.salon.neighborhood || item.salon.communeDaira})
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-slate-700 whitespace-nowrap" dir="ltr">
                      {item.salon.phoneWhatsApp ? item.salon.phoneWhatsApp.split('|')[0].trim() : '—'}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600 max-w-[200px] truncate">
                      {item.tracking.notes || '—'}
                    </td>
                    <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSalon(item.salon);
                        }}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
