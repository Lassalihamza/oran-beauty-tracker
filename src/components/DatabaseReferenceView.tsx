import React from 'react';
import { NEIGHBORHOODS_SHEET_DATA, DATABASE_MD_TEXT_SECTIONS } from '../data/salonsData';
import { BookOpen, FileSpreadsheet, ShieldAlert, CheckCircle, ExternalLink, MapPin } from 'lucide-react';

export const DatabaseReferenceView: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Introduction Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold font-display text-lg">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span>مرجع قاعدة البيانات وتقسيم الأحياء - ولاية وهران</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          تاريخ الفحص الميداني والرقمي: <strong className="text-slate-900">6 نوفمبر 2026</strong>.
          تتضمن هذه الصفحة التوثيق الكامل لجميع البيانات والتقسيمات الواردة في ملف Excel (الورقة الثانية: Neighborhoods and counts) بالإضافة إلى ملف تقرير قاعدة البيانات (Markdown) دون أي اختصار أو حذف.
        </p>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 font-mono">
          {DATABASE_MD_TEXT_SECTIONS.investigationMethod}
        </div>
      </div>

      {/* SECTION 1: Sheet 2 Table (Neighborhoods and counts) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>جدول إحصائيات الأحياء والفحص (Excel Sheet: Neighborhoods and counts)</span>
            </h3>
            <p className="text-xs text-slate-500">
              يعرض الحصيلة الكاملة للمرشحين الخام، المكررات، المستبعدات، وتوزيع الأولويات لكل حي وامتداداته
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-slate-100 text-slate-700">
            6 أحياء ومناطق رئيسية
          </span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs">
          <table className="w-full text-right divide-y divide-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-bold whitespace-nowrap">
              <tr>
                <th className="px-3.5 py-2.5">النطاق المطلوب</th>
                <th className="px-3.5 py-2.5">البلدية / الدائرة</th>
                <th className="px-3.5 py-2.5 text-center">مرشح خام</th>
                <th className="px-3.5 py-2.5 text-center">أهداف فريدة</th>
                <th className="px-3.5 py-2.5 text-center">موثق بالكامل</th>
                <th className="px-3.5 py-2.5 text-center">موثق جزئياً</th>
                <th className="px-3.5 py-2.5 text-center">مكررات مدمجة</th>
                <th className="px-3.5 py-2.5 text-center">امتدادات قريبة</th>
                <th className="px-3.5 py-2.5 text-center">أولويات الهدف (A/B/C)</th>
                <th className="px-3.5 py-2.5 text-center">أولويات الامتداد (A/B/C)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {NEIGHBORHOODS_SHEET_DATA.map((row) => (
                <tr key={row.neighborhood} className="hover:bg-slate-50">
                  <td className="px-3.5 py-3 font-sans font-bold text-slate-900 whitespace-nowrap">
                    {row.neighborhood}
                  </td>
                  <td className="px-3.5 py-3 font-sans text-slate-600 whitespace-nowrap">
                    {row.commune} / {row.daira}
                  </td>
                  <td className="px-3.5 py-3 text-center text-slate-700">{row.rawCandidates}</td>
                  <td className="px-3.5 py-3 text-center font-bold text-slate-900">{row.uniqueTargetRows}</td>
                  <td className="px-3.5 py-3 text-center text-emerald-700">{row.fullyVerifiedTarget}</td>
                  <td className="px-3.5 py-3 text-center text-amber-700">{row.partiallyVerifiedTarget}</td>
                  <td className="px-3.5 py-3 text-center text-slate-500">{row.duplicateRowsRemoved}</td>
                  <td className="px-3.5 py-3 text-center font-semibold text-blue-700">{row.nearbyExtensionRows}</td>
                  <td className="px-3.5 py-3 text-center whitespace-nowrap">
                    {row.priorityATarget} / {row.priorityBTarget} / {row.priorityCTarget}
                  </td>
                  <td className="px-3.5 py-3 text-center whitespace-nowrap">
                    {row.priorityAExtensions} / {row.priorityBExtensions} / {row.priorityCExtensions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed Locality Type & Boundary notes */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-slate-900 block">
            ملاحظات الحدود والتقسيم الجغرافي التفصيلية لكل منطقة:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {NEIGHBORHOODS_SHEET_DATA.map((row) => (
              <div key={row.neighborhood} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{row.neighborhood}</span>
                  <span className="text-[11px] text-slate-500">{row.commune}</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-sans">{row.localityType}</p>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-700">الامتدادات القريبة: </span>
                  {row.nearbyExtensions}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: Why counts remained under 15 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display">
            لماذا بقيت الأعداد دون 15 في كل منطقة؟
          </h3>
          <p className="text-xs text-slate-500">
            تفسير منهجي لأسباب عدم بلوغ عتبة 15 صالوناً مستوفياً للشروط في كل نطاق
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DATABASE_MD_TEXT_SECTIONS.whyUnder15.map((item, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-900 block">{item.area}</span>
              <p className="text-slate-700 leading-relaxed">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Priority Screening Rule & Digital Gap Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 font-display">
            قاعدة تحديد الأولوية التشغيلية (A / B / C)
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
            {DATABASE_MD_TEXT_SECTIONS.priorityRule}
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold shrink-0">
                أولوية A (17)
              </span>
              <span className="text-slate-600">
                نشاط خلال آخر 3 أشهر، قناة تواصل عامة، 1,000 متابع/إعجاب على الأقل، مع عدم وجود نظام حجز إلكتروني معلن.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold shrink-0">
                أولوية B (38)
              </span>
              <span className="text-slate-600">
                نشاط أو جمهور أقل، أو العنوان وفجوة الحجز غير محسومة قطعياً وبحاجة لتأكيد يدوي.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold shrink-0">
                أولوية C (2)
              </span>
              <span className="text-slate-600">
                توفر خيار حجز أو استعلام إلكتروني ظاهر في المصادر المفحوصة مسبقاً.
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 font-display">
            أنماط الظهور الرقمي وفجوة الحجز في النطاقات الأصلية
          </h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-right divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold">
                <tr>
                  <th className="px-3 py-2">المنطقة</th>
                  <th className="px-3 py-2 text-center">لا موقع/حجز ظاهر</th>
                  <th className="px-3 py-2 text-center">موقع بلا تأكيد حجز</th>
                  <th className="px-3 py-2 text-center">حجز إلكتروني مؤكد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {DATABASE_MD_TEXT_SECTIONS.digitalPatterns.map((p) => (
                  <tr key={p.area} className="hover:bg-slate-50">
                    <td className="px-3 py-1.5 font-sans font-medium text-slate-900">{p.area}</td>
                    <td className="px-3 py-1.5 text-center font-bold text-slate-800">{p.noBooking}</td>
                    <td className="px-3 py-1.5 text-center text-slate-600">{p.siteUnconfirmed}</td>
                    <td className="px-3 py-1.5 text-center font-bold text-emerald-700">{p.confirmedBooking}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 4: What Requires Manual Verification */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>ما يحتاج إلى تحقق يدوي (توجيهات التدقيق الميداني)</span>
          </h3>
          <p className="text-xs text-slate-500">
            خطوات سريعة وغير مكلفة للتثبت من الدبوس ومحدثات الحسابات قبل الانطلاق في المراسلات
          </p>
        </div>

        <ul className="space-y-2 text-xs text-slate-700">
          {DATABASE_MD_TEXT_SECTIONS.manualChecklist.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 p-2 rounded bg-slate-50 border border-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* SECTION 5: Audit Notes */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-slate-900 font-display">
          ملاحظات التدقيق والضبط المنهجي (Audit Notes)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-600">
          {DATABASE_MD_TEXT_SECTIONS.auditNotes.map((note, idx) => (
            <div key={idx} className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-start gap-2">
              <span className="font-mono text-slate-400 font-bold shrink-0">{idx + 1}.</span>
              <span className="leading-relaxed">{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
