import openpyxl
import json

wb = openpyxl.load_workbook('../updated_cogc.xlsx')
ws = wb['All Teams']
rows = list(ws.iter_rows(values_only=True))[1:]

team_counts = {}
team_details = []
for r in rows:
    if not any(r): continue
    dept, year, name, m1, r1, p1, m2, r2, p2 = r[:9]
    tname = str(name).strip() if name else ''
    if not tname: continue
    lower = tname.lower()
    team_counts[lower] = team_counts.get(lower, 0) + 1
    team_details.append({
        'dept': dept,
        'year': year,
        'name': tname,
        'm1': m1,
        'r1': r1,
        'p1': p1,
        'm2': m2,
        'r2': r2,
        'p2': p2
    })

# Format names cleanly, handling duplicates by adding lead member first name
seen_counts = {}
final_team_names = []
final_team_records = []

for d in team_details:
    base_name = d['name']
    lower = base_name.lower()
    if team_counts[lower] > 1:
        seen_counts[lower] = seen_counts.get(lower, 0) + 1
        m1_short = str(d['m1']).strip().split()[0] if d['m1'] else f'Team {seen_counts[lower]}'
        resolved_name = f"{base_name} ({m1_short})"
    else:
        resolved_name = base_name

    final_team_names.append(resolved_name)
    final_team_records.append({
        'name': resolved_name,
        'originalName': base_name,
        'department': d['dept'],
        'year': d['year'],
        'members': [
            {'name': d['m1'], 'roll': d['r1'], 'phone': str(d['p1'])},
            {'name': d['m2'], 'roll': d['r2'], 'phone': str(d['p2'])},
        ]
    })

# Sort alphabetically
final_team_names.sort(key=lambda s: s.lower())

with open('lib/data/registered-teams.json', 'w', encoding='utf-8') as f:
    json.dump(final_team_names, f, indent=2)

with open('lib/data/teams-detailed.json', 'w', encoding='utf-8') as f:
    json.dump(final_team_records, f, indent=2)

print(f"Generated registered-teams.json with {len(final_team_names)} teams.")
