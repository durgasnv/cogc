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

print(f'Total rows in sheet: {len(team_details)}')
print(f'Unique team names (case-insensitive): {len(team_counts)}')
print('\nDuplicates (if any):')
for k, v in team_counts.items():
    if v > 1:
        matching = [d for d in team_details if d['name'].lower() == k]
        print(f'-> "{k}" ({v} times):')
        for m in matching:
            print(f'   Dept: {m["dept"]}, Year: {m["year"]}, Roll1: {m["r1"]}, Roll2: {m["r2"]}, Name: "{m["name"]}", Members: {m["m1"]} & {m["m2"]}')

print('\nFull unique cleaned list of teams:')
unique_names = []
seen = set()
for d in team_details:
    t = d['name']
    if t.lower() not in seen:
        seen.add(t.lower())
        unique_names.append(t)

print(json.dumps(unique_names, indent=2))
print(f'Total unique teams: {len(unique_names)}')
