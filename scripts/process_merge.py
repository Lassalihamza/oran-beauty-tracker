import json
import csv
import re

columns = [
    "ID",
    "Commune/daïra",
    "Neighborhood",
    "Salon name (as listed)",
    "Category",
    "Address as listed",
    "Google Maps link",
    "Maps rating and reviews (snapshot date)",
    "Public business phone/WhatsApp",
    "Instagram link and followers (snapshot date)",
    "Facebook link and followers/likes (snapshot date)",
    "TikTok link and followers (snapshot date)",
    "Website or booking (yes/no + link)",
    "Last post date seen",
    "Activity level",
    "Prices or services visible",
    "Photo and branding quality",
    "Digital gap note",
    "Outreach priority (A/B/C + one-line reason)",
    "Date checked",
    "Source URLs",
    "Verification label",
    "Target area or nearest-area extension",
    "Duplicate source IDs merged"
]

rows = []
with open('scripts/prospects_raw.tsv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')
    for r in reader:
        if not r or not r[0].strip():
            continue
        # pad to 24 columns if needed
        while len(r) < 24:
            r.append("")
        row_dict = {}
        for idx, col in enumerate(columns):
            row_dict[col] = r[idx].strip()
        rows.append(row_dict)

print(f"Total rows parsed: {len(rows)}")
assert len(rows) == 57, f"Expected 57 rows, got {len(rows)}"

# Load Top 50 markdown
with open('src/data/top_50_md.json', 'r', encoding='utf-8') as f:
    top_50 = json.load(f)

# Normalize salon name for matching
def norm_name(n):
    return re.sub(r'[^a-zA-Z0-9]', '', n.lower())

# Match rows with Top 50
matched_count = 0
for row in rows:
    salon_name = row["Salon name (as listed)"]
    # Try exact match or normalized match
    match = None
    for item in top_50:
        if item["name"].strip().lower() == salon_name.strip().lower() or norm_name(item["name"]) == norm_name(salon_name):
            match = item
            break
        # also check substring match if contains
        if item["name"].strip().lower() in salon_name.strip().lower() or salon_name.strip().lower() in item["name"].strip().lower():
            match = item
            break
    
    if match:
        row["md_top_50_rank"] = match["rank"]
        row["md_name_ar"] = match["name"]
        row["md_area_ar"] = match["area"]
        row["md_priority"] = match["priority"]
        row["md_reason"] = match["reason"]
        matched_count += 1
    else:
        row["md_top_50_rank"] = None
        row["md_name_ar"] = None
        row["md_area_ar"] = None
        row["md_priority"] = None
        row["md_reason"] = None

print(f"Total matched with Top 50: {matched_count} / {len(top_50)}")

# Check unmatched top 50 items
matched_ranks = {r["md_top_50_rank"] for r in rows if r["md_top_50_rank"]}
unmatched_top50 = [item for item in top_50 if item["rank"] not in matched_ranks]
if unmatched_top50:
    print(f"Unmatched top 50 items: {[i['name'] for i in unmatched_top50]}")
    # Let's inspect them and map them!

# Detect check flags (discrepancy, uncertain, conflicts, multiple phones, etc.)
flagged_count = 0
for row in rows:
    flags = []
    # Check if there is [uncertain]
    for k, v in row.items():
        if isinstance(v, str):
            if "[uncertain" in v.lower() or "conflict" in v.lower() or "number differs" in v.lower() or "differs" in v.lower():
                flags.append(f"ملاحظة عدم تطابق في حقل {k}: {v}")
    
    # Check if duplicate merged
    if row["Duplicate source IDs merged"]:
        flags.append(f"تم دمج معرّف مكرر من المصدر: {row['Duplicate source IDs merged']}")
    
    # Check if priority differs between Excel and MD
    if row["md_priority"] and row["Outreach priority (A/B/C + one-line reason)"].split("—")[0].strip() != row["md_priority"]:
        flags.append(f"اختلاف أولوية: الإكسل ({row['Outreach priority (A/B/C + one-line reason)'].split('—')[0].strip()}) مقابل القاعدة ({row['md_priority']})")
    
    # Check if address / phone has '|' indicating multiple conflicting records
    if "|" in row["Public business phone/WhatsApp"]:
        flags.append("أرقام هواتف متعددة من مصادر مختلفة تحتاج تدقيق")
    if "|" in row["Address as listed"]:
        flags.append("صيغتا عنوان مختلفتان بين مصادر البحث")
    if "|" in row["Website or booking (yes/no + link)"]:
        flags.append("بيانات حجز/موقع متعددة المصادر")

    row["check_flags"] = flags
    row["is_flagged_check"] = len(flags) > 0
    if row["is_flagged_check"]:
        flagged_count += 1

print(f"Total flagged with 'check' badge: {flagged_count} / {len(rows)}")

# Save to src/data/prospects_merged.json
with open('src/data/prospects_merged.json', 'w', encoding='utf-8') as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)
print("Saved to src/data/prospects_merged.json")
