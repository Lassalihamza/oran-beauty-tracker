import json
import re

# Read the markdown database file
with open('public/assets/aistudio/______________________________________d9e75ace.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# Extract Top 50 from markdown
top_50 = []
# | # | الاسم كما ظهر | المنطقة | الأولوية | سبب الترتيب |
top_50_matches = re.findall(r'\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([ABC])\s*\|\s*([^|]+?)\s*\|', md_content)
for m in top_50_matches:
    rank, name, area, priority, reason = m
    top_50.append({
        "rank": int(rank.strip()),
        "name": name.strip(),
        "area": area.strip(),
        "priority": priority.strip(),
        "reason": reason.strip()
    })

print(f"Extracted {len(top_50)} items from Markdown Top 50 list")

# Write out top 50 to json
with open('src/data/top_50_md.json', 'w', encoding='utf-8') as f:
    json.dump(top_50, f, ensure_ascii=False, indent=2)
