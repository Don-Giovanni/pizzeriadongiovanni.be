#!/usr/bin/env python3
"""Simboli dei 14 allergeni (16.11.2026). Icone: Erudus Allergen & Dietary Icon Set, licenza MIT (LICENSE-erudus.txt),
https://github.com/Erudus/erudus-icons . Qui: 14 file in svg/ (01-14, ordine dell'allegato II del reg. UE 1169/2011).
Uso: python3 _src/alg_icons/build.py   -> scrive sprite.html (ritagliata sul disegno, alleggerita con svgo se c'è)
e la incolla in menu/index.html tra <!--ALGI--> e <!--/ALGI-->. gen_alg.py la legge da sprite.html."""
import re,glob,os,subprocess,json,tempfile
H=os.path.dirname(os.path.abspath(__file__));S=os.path.dirname(H)
from playwright.sync_api import sync_playwright
files=sorted(glob.glob(H+'/svg/*.svg'));assert len(files)==14,files
inner=[]
for f in files:
    s=open(f).read();s=re.sub(r'<\?xml.*?\?>|<!--.*?-->','',s,flags=re.S)
    inner.append(s[s.index('>',s.index('<svg'))+1:s.rindex('</svg>')].strip())
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page()
    pg.set_content('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="640" height="640">'+''.join(f'<g id="g{i}">{x}</g>' for i,x in enumerate(inner))+'</svg>')
    bb=pg.evaluate('[...Array(14)].map((_,i)=>{const r=document.getElementById("g"+i).getBBox();return [r.x,r.y,r.width,r.height]})');b.close()
sym=[]
for i,(x,(bx,by,bw,bh)) in enumerate(zip(inner,bb)):
    m=max(bw,bh)+2;vx=bx+bw/2-m/2;vy=by+bh/2-m/2
    sym.append(f'<symbol id="ai{i+1}" viewBox="{vx:.2f} {vy:.2f} {m:.2f} {m:.2f}">{x}</symbol>')
svg='<svg xmlns="http://www.w3.org/2000/svg">'+''.join(sym)+'</svg>'
t=tempfile.mkdtemp();open(t+'/a.svg','w').write(svg)
cfg=t+'/c.mjs';open(cfg,'w').write('export default {multipass:true,floatPrecision:1,plugins:[{name:"preset-default",params:{overrides:{cleanupIds:false,removeHiddenElems:false,removeUselessDefs:false}}}]}')
try:
    subprocess.run(['npx','--no-install','svgo','--config',cfg,t+'/a.svg','-o',t+'/b.svg'],check=True,capture_output=True,cwd=os.environ.get('SVGO_DIR','.'))
    o=open(t+'/b.svg').read()
    if o.count('<symbol')==14:svg=o
except Exception as e:print('svgo non usato:',e)
lic=' '.join(open(H+'/LICENSE-erudus.txt').read().split())
out='<!--ALGI--><svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><!-- Allergen icons: Erudus Allergen & Dietary Icon Set. '+lic.replace('--','- -')+' -->'+svg[svg.index('>')+1:]+'<!--/ALGI-->'
assert out.count('<symbol')==14
open(H+'/sprite.html','w').write(out)
m=S+'/menu/index.html';s=open(m).read()
assert '<!--ALGI-->' in s,'manca il segnaposto <!--ALGI--><!--/ALGI--> in menu/index.html'
s=re.sub(r'<!--ALGI-->.*?<!--/ALGI-->',lambda _:out,s,flags=re.S);open(m,'w').write(s)
print('sprite',len(out),'caratteri')
