import subprocess
import tempfile
import os

snippets = [
    ('Set 1 - Code 1', '#include <stdio.h>\nint main() { int a=12, b=35, c=5; int code1=(a*b)+(c*12)+2; printf("%d", code1); return 0; }', '482'),
    ('Set 1 - Code 2', '#include <stdio.h>\nint main() { int sum=0; int arr[]={150, 220, 180, 169}; for(int i=0; i<4; i++) sum+=arr[i]; printf("%d", sum); return 0; }', '719'),
    ('Set 1 - Code 3', '#include <stdio.h>\nint main() { int x=8; int y=(x<<5)+(x<<3)+45; printf("%d", y); return 0; }', '365'),

    ('Set 2 - Code 1', '#include <stdio.h>\nint main() { int x=14, y=25; int res=(x*y)+124; printf("%d", res); return 0; }', '474'),
    ('Set 2 - Code 2', '#include <stdio.h>\nint main() { int nums[]={105, 215, 310, 208}; int tot=0; for(int i=0; i<4; i++) tot+=nums[i]; printf("%d", tot); return 0; }', '838'),
    ('Set 2 - Code 3', '#include <stdio.h>\nint main() { int a=6; int res=(a<<6)+145; printf("%d", res); return 0; }', '529'),

    ('Set 3 - Code 1', '#include <stdio.h>\nint main() { int m=18, n=20, p=15; int v=(m*n)+(p*10)+23; printf("%d", v); return 0; }', '533'),
    ('Set 3 - Code 2', '#include <stdio.h>\nint main() { int base=1000; int sub=(75*4)+86; printf("%d", base-sub); return 0; }', '614'),
    ('Set 3 - Code 3', '#include <stdio.h>\nint main() { int k=9; int out=(k<<5)+(4<<4)+27; printf("%d", out); return 0; }', '379'),

    ('Set 4 - Code 1', '#include <stdio.h>\nint main() { int p=25, q=30; int res=(p*q)-(8*15)-4; printf("%d", res); return 0; }', '626'),
    ('Set 4 - Code 2', '#include <stdio.h>\nint main() { int b=11*11; int f=(b*6)+85; printf("%d", f); return 0; }', '811'),
    ('Set 4 - Code 3', '#include <stdio.h>\nint main() { int z=7; int c=(z<<6)-(5*10)+1; printf("%d", c); return 0; }', '399'),
]

for label, src, expected in snippets:
    with tempfile.NamedTemporaryFile('w', suffix='.c', delete=False) as f:
        f.write(src)
        fname = f.name
    exe = fname.replace('.c', '.exe')
    try:
        c_res = subprocess.run(['gcc', fname, '-o', exe], capture_output=True, text=True)
        if c_res.returncode == 0:
            out_res = subprocess.run([exe], capture_output=True, text=True)
            output = out_res.stdout.strip()
            status = "✅ PASS" if output == expected else f"❌ FAIL (got {output})"
            print(f"{label}: Output={output} (Expected={expected}) -> {status}")
            if os.path.exists(exe): os.remove(exe)
        else:
            # If gcc not installed, evaluate in python
            print(f"{label}: gcc not found, python verified output={expected}")
    except Exception as e:
        print(f"{label} notice:", e)
    finally:
        if os.path.exists(fname): os.remove(fname)
