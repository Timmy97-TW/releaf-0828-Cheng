#!/bin/zsh
# Bumps the ?v= on the stylesheets, the script and the embedded big-picture page
# so a browser holding an old copy of any of them picks up the new build.
set -e
DIR="${0:A:h}/.."
python3 - "$DIR" <<'PY'
import re, sys, time, os
d = sys.argv[1]; p = os.path.join(d, 'index.html')
h = open(p, encoding='utf8').read(); v = str(int(time.time()))
h = re.sub(r'(assets/(?:css/[a-z]+\.css|js/update\.js))\?v=\d+', r'\1?v=' + v, h)
h = re.sub(r'(bigpicture/index\.html)(\?v=\d+)?', r'\1?v=' + v, h)
open(p, 'w', encoding='utf8').write(h)
print('cache-busted to v=' + v)
PY
