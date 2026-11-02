#!/bin/bash
# Regenerate moon/img/nearside.webp from solar-system/tex/2k_moon.jpg (needs Chrome; texture loads over http)
cd "$(dirname "$0")/.."
python3 -m http.server 8766 >/dev/null 2>&1 & SRV=$!
sleep 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --virtual-time-budget=20000 --dump-dom http://localhost:8766/tools/gen_moon_sprites.html 2>/dev/null | python3 -c "
import sys,re,json,base64,html
t=sys.stdin.read(); m=re.search(r'<pre id=\"out\">(.*?)</pre>',t,re.S)
d=json.loads(html.unescape(m.group(1)))
for k,v in d.items():
    open('moon/img/'+k+'.webp','wb').write(base64.b64decode(v.split(',',1)[1])); print(k, len(v)*3//4)
"
kill $SRV
