import json
import csv
import re

# 1. Read TSV
with open('scripts/prospects_raw.tsv', 'r', encoding='utf-8') as f:
    lines = [l.rstrip('\r\n') for l in f if l.strip()]

columns = [
    'id', 'communeDaira', 'neighborhood', 'salonName', 'category',
    'address', 'googleMapsUrl', 'mapsRatingReviews',
    'phoneWhatsApp', 'instagramUrl', 'facebookUrl', 'tiktokUrl',
    'websiteBooking', 'lastPostDate', 'activityLevel',
    'pricesServices', 'photoBrandingQuality', 'digitalGapNote',
    'outreachPriority', 'dateChecked', 'sourceUrls',
    'verificationLabel', 'targetAreaExtension', 'duplicateSourceIdsMerged'
]

raw_columns = [
    'ID', 'Commune/daïra', 'Neighborhood', 'Salon name (as listed)', 'Category',
    'Address as listed', 'Google Maps link', 'Maps rating and reviews (snapshot date)',
    'Public business phone/WhatsApp', 'Instagram link and followers (snapshot date)',
    'Facebook link and followers/likes (snapshot date)', 'TikTok link and followers (snapshot date)',
    'Website or booking (yes/no + link)', 'Last post date seen', 'Activity level',
    'Prices or services visible', 'Photo and branding quality', 'Digital gap note',
    'Outreach priority (A/B/C + one-line reason)', 'Date checked', 'Source URLs',
    'Verification label', 'Target area or nearest-area extension', 'Duplicate source IDs merged'
]

# Read Top 50 Markdown
with open('src/data/top_50_md.json', 'r', encoding='utf-8') as f:
    top_50 = json.load(f)

def norm_name(n):
    return re.sub(r'[^a-zA-Z0-9]', '', n.lower())

salons = []

for line in lines:
    parts = line.split('\t')
    row_id = parts[0]
    
    wb_idx = None
    for i, p in enumerate(parts):
        if any(p.startswith(prefix) for prefix in ['Yes', 'No link', 'No website', 'No external']):
            wb_idx = i
            break
            
    head = parts[:7]
    middle = parts[7:wb_idx]
    tail = parts[wb_idx:]
    if len(tail) == 11:
        tail.append('')
    
    rating = ''
    phone = ''
    insta = ''
    fb = ''
    tiktok = ''
    for item in middle:
        item_str = item.strip()
        if not item_str: continue
        if '/5' in item_str and ('review' in item_str or 'Google Maps' in item_str):
            rating = item_str
        elif 'instagram.com' in item_str:
            insta = item_str
        elif 'facebook.com' in item_str:
            fb = item_str
        elif 'tiktok.com' in item_str:
            tiktok = item_str
        elif any(c.isdigit() for c in item_str) or 'Appointment' in item_str:
            phone = item_str
        elif 'followers' in item_str or 'likes' in item_str:
            if 'fb' in item_str.lower() or 'facebook' in item_str.lower() or 'likes' in item_str.lower():
                fb = item_str
            else:
                insta = item_str
                
    aligned_row = head + [rating, phone, insta, fb, tiktok] + tail
    
    raw_dict = {raw_columns[i]: aligned_row[i] for i in range(24)}
    
    # Matching with Top 50 Markdown
    salon_name = raw_dict["Salon name (as listed)"]
    match = None
    for item in top_50:
        if item["name"].strip().lower() == salon_name.strip().lower() or norm_name(item["name"]) == norm_name(salon_name):
            match = item
            break
        if item["name"].strip().lower() in salon_name.strip().lower() or salon_name.strip().lower() in item["name"].strip().lower():
            match = item
            break
            
    # Extract priority code
    prio_raw = raw_dict["Outreach priority (A/B/C + one-line reason)"]
    priority_letter = prio_raw[0] if prio_raw and prio_raw[0] in ['A', 'B', 'C'] else 'B'
    
    # Flags and discrepancies
    check_flags = []
    for k, v in raw_dict.items():
        if "[uncertain" in v.lower() or "conflict" in v.lower() or "number differs" in v.lower() or "differs" in v.lower():
            check_flags.append(f"تنبيه عدم تطابق أو عدم تأكد في ({k}): {v}")
            
    if raw_dict["Duplicate source IDs merged"]:
        check_flags.append(f"تم دمج معرّف مكرر من المصدر الأصلي: {raw_dict['Duplicate source IDs merged']}")
        
    if "|" in raw_dict["Public business phone/WhatsApp"]:
        check_flags.append("أرقام هواتف متعددة من مصادر مختلفة تحتاج تأكيداً")
    if "|" in raw_dict["Address as listed"]:
        check_flags.append("صيغتا عنوان مختلفتان بين مصادر البحث")
    if "|" in raw_dict["Website or booking (yes/no + link)"]:
        check_flags.append("بيانات حجز/موقع متعددة المصادر")
        
    if match and match["priority"] != priority_letter:
        check_flags.append(f"اختلاف أولوية: الإكسل ({priority_letter}) مقابل ملف القاعدة ({match['priority']})")
        
    salon_obj = {
        "id": raw_dict["ID"],
        "communeDaira": raw_dict["Commune/daïra"],
        "neighborhood": raw_dict["Neighborhood"],
        "salonName": raw_dict["Salon name (as listed)"],
        "category": raw_dict["Category"],
        "address": raw_dict["Address as listed"],
        "googleMapsUrl": raw_dict["Google Maps link"],
        "mapsRatingReviews": raw_dict["Maps rating and reviews (snapshot date)"],
        "phoneWhatsApp": raw_dict["Public business phone/WhatsApp"],
        "instagramUrl": raw_dict["Instagram link and followers (snapshot date)"],
        "facebookUrl": raw_dict["Facebook link and followers/likes (snapshot date)"],
        "tiktokUrl": raw_dict["TikTok link and followers (snapshot date)"],
        "websiteBooking": raw_dict["Website or booking (yes/no + link)"],
        "lastPostDate": raw_dict["Last post date seen"],
        "activityLevel": raw_dict["Activity level"],
        "pricesServices": raw_dict["Prices or services visible"],
        "photoBrandingQuality": raw_dict["Photo and branding quality"],
        "digitalGapNote": raw_dict["Digital gap note"],
        "outreachPriority": priority_letter,
        "outreachPriorityFull": raw_dict["Outreach priority (A/B/C + one-line reason)"],
        "dateChecked": raw_dict["Date checked"],
        "sourceUrls": raw_dict["Source URLs"],
        "verificationLabel": raw_dict["Verification label"],
        "targetAreaExtension": raw_dict["Target area or nearest-area extension"],
        "duplicateSourceIdsMerged": raw_dict["Duplicate source IDs merged"],
        
        # Markdown database cross-reference
        "matchedWithMarkdown": match is not None,
        "markdownTop50Rank": match["rank"] if match else None,
        "markdownNameAr": match["name"] if match else None,
        "markdownAreaAr": match["area"] if match else None,
        "markdownPriority": match["priority"] if match else None,
        "markdownReason": match["reason"] if match else None,
        
        # Integrity & discrepancies
        "isFlaggedCheck": len(check_flags) > 0,
        "checkFlags": check_flags,
        
        # Untouched raw row cells
        "rawFields": raw_dict
    }
    salons.append(salon_obj)

print(f"Total salons processed: {len(salons)}")
print(f"Total matched with markdown: {sum(1 for s in salons if s['matchedWithMarkdown'])}")
print(f"Total flagged with check: {sum(1 for s in salons if s['isFlaggedCheck'])}")

# Write to TypeScript file
ts_code = f"""/**
 * قاعدة بيانات صالونات وهران - بيانات مدمجة كاملة بدون نقصان أو تعديل
 * Oran Beauty Salons Prospects Dataset
 * Generated: 2026-11-06
 */

export interface RawSalonFields {{
  "ID": string;
  "Commune/daïra": string;
  "Neighborhood": string;
  "Salon name (as listed)": string;
  "Category": string;
  "Address as listed": string;
  "Google Maps link": string;
  "Maps rating and reviews (snapshot date)": string;
  "Public business phone/WhatsApp": string;
  "Instagram link and followers (snapshot date)": string;
  "Facebook link and followers/likes (snapshot date)": string;
  "TikTok link and followers (snapshot date)": string;
  "Website or booking (yes/no + link)": string;
  "Last post date seen": string;
  "Activity level": string;
  "Prices or services visible": string;
  "Photo and branding quality": string;
  "Digital gap note": string;
  "Outreach priority (A/B/C + one-line reason)": string;
  "Date checked": string;
  "Source URLs": string;
  "Verification label": string;
  "Target area or nearest-area extension": string;
  "Duplicate source IDs merged": string;
}}

export interface MergedSalon {{
  id: string;
  communeDaira: string;
  neighborhood: string;
  salonName: string;
  category: string;
  address: string;
  googleMapsUrl: string;
  mapsRatingReviews: string;
  phoneWhatsApp: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  websiteBooking: string;
  lastPostDate: string;
  activityLevel: string;
  pricesServices: string;
  photoBrandingQuality: string;
  digitalGapNote: string;
  outreachPriority: 'A' | 'B' | 'C';
  outreachPriorityFull: string;
  dateChecked: string;
  sourceUrls: string;
  verificationLabel: 'Verified' | 'Partially verified' | 'Unverified' | 'Contradicted';
  targetAreaExtension: string;
  duplicateSourceIdsMerged: string;
  
  matchedWithMarkdown: boolean;
  markdownTop50Rank: number | null;
  markdownNameAr: string | null;
  markdownAreaAr: string | null;
  markdownPriority: string | null;
  markdownReason: string | null;
  
  isFlaggedCheck: boolean;
  checkFlags: string[];
  
  rawFields: RawSalonFields;
}}

export interface NeighborhoodStat {{
  neighborhood: string;
  localityType: string;
  commune: string;
  daira: string;
  nearbyExtensions: string;
  rawCandidates: number;
  uniqueTargetRows: number;
  fullyVerifiedTarget: number;
  partiallyVerifiedTarget: number;
  duplicateRowsRemoved: number;
  excludedNoActivity: number;
  nearbyExtensionRows: number;
  priorityATarget: number;
  priorityBTarget: number;
  priorityCTarget: number;
  priorityAExtensions: number;
  priorityBExtensions: number;
  priorityCExtensions: number;
  geographySources: string;
}}

export const EXCEL_ROW_COUNT = 57;

export const SALONS_DATA: MergedSalon[] = {json.dumps(salons, ensure_ascii=False, indent=2)};

export const NEIGHBORHOODS_SHEET_DATA: NeighborhoodStat[] = [
  {{
    neighborhood: "وسط وهران — Place des Victoires / Es-Sedikia",
    localityType: "Place des Victoires is a place/square landmark used as a city-centre locator, not a commune or daira. Es-Sedikia/Cité Seddikia is an urban suburb/neighborhood; Es Seddikia is also an official communal delegation within Oran commune. — High confidence Cité Seddikia is in Commune d'Oran / Daïra d'Oran: the OSM-derived map record explicitly says so, and Gazette decree 19-270 creates the Es Seddikia communal delegation and defines included neighborhoods.",
    commune: "Oran",
    daira: "Oran",
    nearbyExtensions: "Point du Jour; Gambetta / Cité Gambetta; Cité Macta / Hammou Boutlelis delegation; El Emir / central Oran; Sidi El Houari",
    rawCandidates: 16,
    uniqueTargetRows: 1,
    fullyVerifiedTarget: 1,
    partiallyVerifiedTarget: 0,
    duplicateRowsRemoved: 0,
    excludedNoActivity: 0,
    nearbyExtensionRows: 1,
    priorityATarget: 1,
    priorityBTarget: 0,
    priorityCTarget: 0,
    priorityAExtensions: 1,
    priorityBExtensions: 0,
    priorityCExtensions: 0,
    geographySources: "https://wilayaoran.dz/category/dairas-et-communes/; https://www.joradp.dz/FTP/jo-francais/2019/F2019063.pdf; https://mapcarta.com/fr/N3328380588"
  }},
  {{
    neighborhood: "Bir El Djir",
    localityType: "Formal commune and town; also the name of a daira. Distinguish the commune from the town-centre locality and its surrounding suburbs. — High confidence for commune and daira: the official Wilaya directory lists Daïra Bir El Djir and its commune.",
    commune: "Bir El Djir",
    daira: "Bir El Djir",
    nearbyExtensions: "Haï Khmesti; Haï El Riyad; Belgaïd; Canastel; Hassi Bounif",
    rawCandidates: 48,
    uniqueTargetRows: 5,
    fullyVerifiedTarget: 4,
    partiallyVerifiedTarget: 1,
    duplicateRowsRemoved: 0,
    excludedNoActivity: 0,
    nearbyExtensionRows: 0,
    priorityATarget: 2,
    priorityBTarget: 2,
    priorityCTarget: 1,
    priorityAExtensions: 0,
    priorityBExtensions: 0,
    priorityCExtensions: 0,
    geographySources: "https://wilayaoran.dz/category/dairas-et-communes/; https://en.wikipedia.org/wiki/Da%C3%AFras_de_la_wilaya_d%27Oran; https://mapcarta.com/17353426"
  }},
  {{
    neighborhood: "Es Sénia",
    localityType: "Formal commune and town; also the seat/name of a daira. Suburb names are map-based; expanding to Sidi Chami or El Kerma crosses commune boundaries, though they are within the same daira.",
    commune: "Es Sénia",
    daira: "Es Sénia",
    nearbyExtensions: "Marhaba; Soufi Zoubida; El Nakhil; Sidi Chami; El Kerma",
    rawCandidates: 36,
    uniqueTargetRows: 8,
    fullyVerifiedTarget: 4,
    partiallyVerifiedTarget: 4,
    duplicateRowsRemoved: 3,
    excludedNoActivity: 0,
    nearbyExtensionRows: 4,
    priorityATarget: 4,
    priorityBTarget: 4,
    priorityCTarget: 0,
    priorityAExtensions: 1,
    priorityBExtensions: 2,
    priorityCExtensions: 1,
    geographySources: "https://wilayaoran.dz/category/dairas-et-communes/; https://wilayaoran.dz/daira-d-es-senia/; https://www.joradp.dz/FTP/jo-francais/2020/F2020047.pdf"
  }},
  {{
    neighborhood: "Hai Sabah",
    localityType: "Informal neighborhood/urban-area name with duplicate or overlapping mapped usages; the Hai Sabah tram-stop/local-area point is mapped in Bir El Djir, while a HAI ES SABAH postal-address record is mapped in Sidi Chami.",
    commune: "Bir El Djir / Sidi Chami",
    daira: "Bir El Djir / Es Sénia",
    nearbyExtensions: "Bir El Djir town centre; Haï El Riyad; Haï Khmesti; Sidi Chami / Cité Essabah; Hassi Bounif",
    rawCandidates: 31,
    uniqueTargetRows: 8,
    fullyVerifiedTarget: 3,
    partiallyVerifiedTarget: 5,
    duplicateRowsRemoved: 3,
    excludedNoActivity: 0,
    nearbyExtensionRows: 4,
    priorityATarget: 1,
    priorityBTarget: 7,
    priorityCTarget: 0,
    priorityAExtensions: 4,
    priorityBExtensions: 0,
    priorityCExtensions: 0,
    geographySources: "https://wilayaoran.dz/category/dairas-et-communes/; https://mapcarta.com/N2273847474; https://mapcarta.com/N14030963047"
  }},
  {{
    neighborhood: "Canastel",
    localityType: "Residential area/suburb label, not a commune. Oran's 2019 official communal-delegation scheme names El Menzeh; Canastel is also used for mapped residential land and a wider neighborhood area.",
    commune: "Oran (El Menzeh)",
    daira: "Oran",
    nearbyExtensions: "Haï El Menzah; Hai Nakhil Canastel; Belgaïd; Bir El Djir; Frange Maritime",
    rawCandidates: 41,
    uniqueTargetRows: 8,
    fullyVerifiedTarget: 4,
    partiallyVerifiedTarget: 4,
    duplicateRowsRemoved: 2,
    excludedNoActivity: 1,
    nearbyExtensionRows: 4,
    priorityATarget: 1,
    priorityBTarget: 7,
    priorityCTarget: 0,
    priorityAExtensions: 0,
    priorityBExtensions: 4,
    priorityCExtensions: 0,
    geographySources: "https://www.joradp.dz/FTP/jo-francais/2019/F2019063.pdf; https://mapcarta.com/17349588; https://www.openstreetmap.org/way/478798974"
  }},
  {{
    neighborhood: "Akid Lotfi",
    localityType: "Informal suburb/neighborhood name in map data; separately, Colonel Lotfi is an official communal delegation within Oran commune under the 2019 Gazette decree. The mapped pin is assigned to Bir El Djir.",
    commune: "Bir El Djir / Oran",
    daira: "Bir El Djir / Oran",
    nearbyExtensions: "Frange Maritime; Haï Khmesti; Bir El Djir town centre; Canastel / Haï El Menzah",
    rawCandidates: 36,
    uniqueTargetRows: 14,
    fullyVerifiedTarget: 10,
    partiallyVerifiedTarget: 4,
    duplicateRowsRemoved: 0,
    excludedNoActivity: 0,
    nearbyExtensionRows: 0,
    priorityATarget: 2,
    priorityBTarget: 12,
    priorityCTarget: 0,
    priorityAExtensions: 0,
    priorityBExtensions: 0,
    priorityCExtensions: 0,
    geographySources: "https://www.joradp.dz/FTP/jo-francais/2019/F2019063.pdf; https://mapcarta.com/N853403244; https://mapcarta.com/17353426"
  }}
];

export const DATABASE_MD_TEXT_SECTIONS = {{
  title: "قاعدة بيانات صالونات التجميل في وهران",
  checkDate: "6 نوفمبر 2026",
  investigationMethod: "البحث اقتصر على المعلومات المنشورة علناً عن الأنشطة التجارية. لم يتم التواصل أو المتابعة أو الإعجاب أو التعليق أو المراسلة أو التسجيل في أي منصة.",
  whyUnder15: [
    {{ area: "وسط وهران — Place des Victoires / Es-Sedikia", reason: "النطاق المركزي ضيق؛ ثبت نشاط واحد داخل الهدف. أُدرج Gambetta كامتداد منفصل، ولم تُنقل الأنشطة المجاورة إلى الهدف." }},
    {{ area: "Bir El Djir", reason: "ثبتت خمسة أسماء في النطاق المحدد. حُذفت النسخ المكررة، وفُصلت الأحياء المسماة الأخرى في طلبك؛ لم يبق سجل إضافي مستقل يطابق شرط المصدر والنشاط كامتداد خاص بهذه الدفعة." }},
    {{ area: "Es Sénia", reason: "ثبتت ثمانية أسماء في Es Sénia وأربعة امتدادات قريبة. البقية لم تستوفِ إثبات الموقع/النشاط أو كانت مكررة أو خارج النطاق الإداري." }},
    {{ area: "Hai Sabah", reason: "ثبتت ثمانية أسماء في الهدف وأربعة امتدادات. الالتباس بين Bir El Djir وSidi Chami استلزم استبعاد النسخ غير المحسومة وعدم عدّ الاسم المكرر مرتين." }},
    {{ area: "Canastel", reason: "ثبتت ثمانية أسماء في الهدف وأربعة امتدادات. استُبعد سجل واحد لأن آخر نشاط مؤرخ كان 2026-03-28، كما أن بعض النتائج لم تثبت موقع Canastel أو نشاطاً حديثاً." }},
    {{ area: "Akid Lotfi", reason: "ثبتت 14 اسماً في الهدف. لم يتوفر اسم مستقل إضافي في الامتداد المجاور يستوفي شروط المصدر والنشاط؛ لذلك لم يُضف اسم لمجرد بلوغ 15." }}
  ],
  priorityRule: "لجعل A قابلة للتدقيق، استخدمت عتبة تشغيلية: نشاط خلال آخر ثلاثة أشهر، قناة عامة للتواصل، 1,000 متابع/إعجاب معلن على الأقل، ولم يظهر موقع أو رابط حجز في المصادر المفحوصة. B تعني أن الجمهور أو حداثة النشاط أو الموقع/الحجز أضعف أو غير محسوم. C تعني ظهور خيار حجز/استعلام إلكتروني. لا تعني عبارة «لم يظهر رابط» أن الموقع غير موجود قطعاً.",
  digitalPatterns: [
    {{ area: "وسط وهران — Place des Victoires / Es-Sedikia", noBooking: 1, siteUnconfirmed: 0, confirmedBooking: 0 }},
    {{ area: "Bir El Djir", noBooking: 4, siteUnconfirmed: 0, confirmedBooking: 1 }},
    {{ area: "Es Sénia", noBooking: 8, siteUnconfirmed: 0, confirmedBooking: 0 }},
    {{ area: "Hai Sabah", noBooking: 7, siteUnconfirmed: 1, confirmedBooking: 0 }},
    {{ area: "Canastel", noBooking: 7, siteUnconfirmed: 1, confirmedBooking: 0 }},
    {{ area: "Akid Lotfi", noBooking: 14, siteUnconfirmed: 0, confirmedBooking: 0 }}
  ],
  manualChecklist: [
    "افتح دبوس Maps لكل اسم وتحقق من الشارع والبلدية، خاصة Hai Sabah وCanastel وAkid Lotfi وMillenium. بعض روابط Maps هي روابط بحث لا بطاقة نشاط مباشرة.",
    "تحقق من آخر منشور وتاريخه الدقيق على صفحة النشاط. بعض النتائج أظهرت تاريخاً نسبياً مثل «منذ أسبوعين».",
    "افحص حقل الخدمات/الحجز على الموقع أو الملف الاجتماعي للتأكد من وجود نظام حجز فعلي؛ زر WhatsApp أو الرسائل ليس نظام حجز بالضرورة.",
    "راجع اختلافات الهاتف والجمهور المسجلة في الصفوف المدمجة؛ تأكد من الرقم في صفحة النشاط العامة قبل استخدامه.",
    "الخانات الفارغة تشمل خصوصاً تقييمات Maps وأعداد المتابعين لبعض الصفحات، ومستوى الصور/الهوية عندما لم تتوفر صور عامة كافية. لا تعتبرها أصفاراً.",
    "أرخص تحقق يدوي: افتح رابط Maps المجاني ثم صفحة Facebook/Instagram العامة لمرشحي A أولاً؛ خلال دقيقة أو دقيقتين سجّل دبوس العنوان، تاريخ أحدث منشور، ورابط الحجز إن ظهر. لا حاجة لأداة مدفوعة أو لمراسلة النشاط في هذه المرحلة.",
    "أُعيد فحص 14 نشاطاً فريداً من العينة المسجلة في سجلات الأحياء مقابل مصدر عام ثانٍ؛ هذا يتجاوز 10% من قاعدة البيانات النهائية. معرّفات العينة وروابط المقارنة محفوظة في ملاحظات البحث ومصادر الصفوف."
  ],
  auditNotes: [
    "مرشح خام هو اسم أو سجل ظهر أثناء البحث قبل استبعاد الصفحات القديمة أو المكررة أو غير المطابقة.",
    "موثق بالكامل وموثق جزئياً يصفان قوة الإثبات المتاحة، ولا يخلطان مع الامتدادات المجاورة. الامتداد القريب لا يرفع عدد المنطقة الأصلية.",
    "ظهرت 208 مرشحاً خاماً. بعد دمج 8 سجلات مكررة واستبعاد 1 سجل قديم، بقيت 57 شركة فريدة: 44 في النطاقات المطلوبة و13 في امتدادات قريبة. منها 28 موثقة بالكامل و29 موثقة جزئياً.",
    "توزيع الأولويات للسجلات الفريدة، بما فيها الامتدادات: A 17، B 38، C 2.",
    "الأكثر في الهدف من حيث عدم ظهور رابط موقع/حجز: Akid Lotfi (14)، ثم Es Sénia (8)، ثم Hai Sabah وCanastel (7 لكل منهما).",
    "في قاعدة البيانات كلها، بما فيها الامتدادات، لم يظهر رابط في 53 من 57 صفاً؛ ظهر موقع بلا تأكيد حجز في 2، وخيار حجز/استعلام صريح في 2.",
    "ظهرت روابط أو حسابات Instagram ضمن 33 سجلاً، وFacebook ضمن 27، وTikTok ضمن 4.",
    "استُبعد سجل واحد من Canastel لأن آخر نشاط مؤرخ كان 2026-03-28 (خارج نافذة 6 أشهر)."
  ]
}};
"""

with open('src/data/salonsData.ts', 'w', encoding='utf-8') as f:
    f.write(ts_code)

print("src/data/salonsData.ts successfully written!")
