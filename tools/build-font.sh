#!/bin/zsh
# Rebuilds assets/fonts/inter-latin.woff2 from the full Inter variable TTF.
# Run this after adding copy that uses a glyph the current subset does not carry
# (a new accented letter, a new symbol). Needs fonttools + brotli:
#   python3 -m venv /tmp/fontenv && /tmp/fontenv/bin/pip install fonttools brotli
set -e
DIR="${0:A:h}/.."
PY="${PYFTSUBSET:-/tmp/fontenv/bin/pyftsubset}"
[ -x "$PY" ] || { echo "pyftsubset not found at $PY (set PYFTSUBSET)"; exit 1; }

python3 - "$DIR" <<'PYEOF' > /tmp/releaf-unicodes.txt
import re,glob,sys,os
d=sys.argv[1]; chars=set()
for f in [os.path.join(d,'index.html')]+glob.glob(os.path.join(d,'assets/css/*.css')):
    t=open(f,encoding='utf8').read()
    t=re.sub(r'&#(\d+);', lambda m: chr(int(m.group(1))), t)
    for e,c in [('&middot;','·'),('&rarr;','→'),('&mdash;','—'),('&frac12;','½'),
                ('&times;','×'),('&ndash;','–'),('&rsquo;','’'),('&ldquo;','“'),('&rdquo;','”')]:
        t=t.replace(e,c)
    chars |= set(t)
used={ord(c) for c in chars if ord(c) < 0x2E80}
g=set()
for a,b in [(0x20,0xFF),(0x131,0x131),(0x152,0x153),(0x2BB,0x2BC),(0x2C6,0x2C6),(0x2DA,0x2DA),
            (0x2DC,0x2DC),(0x2000,0x206F),(0x2074,0x2074),(0x20AC,0x20AC),(0x2122,0x2122),
            (0x2191,0x2193),(0x2212,0x2212),(0x2215,0x2215),(0x2080,0x2089),(0x2264,0x2265),
            (0xB5,0xB5),(0xFEFF,0xFEFF),(0xFFFD,0xFFFD)]:
    g |= set(range(a,b+1))
print(','.join(f'U+{c:04X}' for c in sorted(used|g)))
PYEOF

"$PY" "$DIR/assets/fonts/inter-variable.ttf" \
  --unicodes-file=/tmp/releaf-unicodes.txt --flavor=woff2 \
  --layout-features='kern,liga,calt,tnum,frac,sups,subs' \
  --output-file="$DIR/assets/fonts/inter-latin.woff2" \
  --no-hinting --desubroutinize --drop-tables+=DSIG
ls -lh "$DIR/assets/fonts/inter-latin.woff2"
