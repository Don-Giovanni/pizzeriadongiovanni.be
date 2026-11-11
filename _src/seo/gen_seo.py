import sys,re,json,datetime
# gen_seo.py <menu index.html> <cartella sito> main|prova
# - titolo/descrizione propri del menu, canonical su home e menu
# - scheda ristorante (JSON-LD) sulla home: orari = quelli del semaforo, chiusure = FIXED + CLOSED del menu
# - solo main: sitemap.xml, robots.txt, 404.html
src,D,mode=sys.argv[1],sys.argv[2],sys.argv[3]
S=sys.argv[0].rsplit('/',1)[0]
B='https://pizzeriadongiovanni.be/'
m=open(src).read()
def sub1(s,a,b):
    assert s.count(a)==1,(a[:50],s.count(a)); return s.replace(a,b)
# ---- menu
p=D+'/menu.html';s=open(p).read()
T='Menu &amp; prix · Pizzeria Don Giovanni, Thuin'
DS="Le menu de la Pizzeria Don Giovanni à Thuin : pizzas au feu de bois, pâtes, desserts et boissons, avec les prix. À emporter du mardi au dimanche, livraison du jeudi au dimanche."
s=sub1(s,'<title>Pizzeria Don Giovanni · Thuin</title>','<title>'+T+'</title>')
s=re.sub(r'<meta name="description" content="[^"]*">','<meta name="description" content="'+DS+'">\n<link rel="canonical" href="'+B+'menu.html">',s,count=1)
s=sub1(s,'<meta property="og:title" content="Pizzeria Don Giovanni · Thuin">','<meta property="og:title" content="'+T+'">')
s=re.sub(r'<meta property="og:description" content="[^"]*">','<meta property="og:description" content="'+DS+'">',s,count=1)
s=sub1(s,'<meta property="og:url" content="'+B+'">','<meta property="og:url" content="'+B+'menu.html">')
open(p,'w').write(s)
# ---- home
fixed=json.loads(re.search(r'const FIXED=(\[[^\]]*\])',m).group(1))
closed=re.findall(r'from:"(\d{4}-\d\d-\d\d)",to:"(\d{4}-\d\d-\d\d)"',re.search(r'^const CLOSED=\[.*?\];',m,re.M).group(0))
today=datetime.date.today();spec=[]
for md in fixed:
    mo,da=map(int,md.split('-'));d=datetime.date(today.year,mo,da)
    if d<today:d=datetime.date(today.year+1,mo,da)
    spec.append((d.isoformat(),d.isoformat()))
spec+=[(a,b) for a,b in closed if b>=today.isoformat()]
spec.sort()
ld={"@context":"https://schema.org","@type":"Restaurant","@id":B+"#restaurant","name":"Pizzeria Don Giovanni","url":B,
 "image":B+"og-image.jpg","logo":B+"icon-512.png","telephone":"+32455111677","email":"info@pizzeriadongiovanni.be",
 "servesCuisine":["Pizza","Italienne"],"hasMenu":B+"menu.html",
 "address":{"@type":"PostalAddress","streetAddress":"Grand'Rue 1","postalCode":"6530","addressLocality":"Thuin","addressCountry":"BE"},
 "geo":{"@type":"GeoCoordinates","latitude":50.339311,"longitude":4.2871456},
 "openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"opens":"17:00","closes":"22:00"}],
 "specialOpeningHoursSpecification":[{"@type":"OpeningHoursSpecification","validFrom":a,"validThrough":b,"opens":"00:00","closes":"00:00"} for a,b in spec]}
p=D+'/index.html';s=open(p).read()
tag='<link rel="canonical" href="'+B+'">\n<script type="application/ld+json">'+json.dumps(ld,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+'</script>\n'
s=sub1(s,'<meta name="theme-color"',tag+'<meta name="theme-color"') if s.count('<meta name="theme-color"')==1 else s.replace('<meta name="theme-color"',tag+'<meta name="theme-color"',1)
open(p,'w').write(s)
# ---- solo sito vero
if mode=='main':
    import shutil,subprocess
    shutil.copy(S+'/robots.txt',D+'/robots.txt');shutil.copy(S+'/404.html',D+'/404.html')
    urls=[('', 'menu/index.html','1.0'),('menu.html','menu/index.html','0.9'),('allergenes.html','menu/allergenes.html','0.5'),('livraison.html','menu/livraison.html','0.6')]
    x='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for u,f,pr in urls:
        try: lm=subprocess.check_output(['git','-C',S,'log','-1','--format=%cs','--',S+'/../'+f]).decode().strip() or today.isoformat()
        except Exception: lm=today.isoformat()
        x+='  <url><loc>'+B+u+'</loc><lastmod>'+lm+'</lastmod><priority>'+pr+'</priority></url>\n'
    open(D+'/sitemap.xml','w').write(x+'</urlset>\n')
print('seo ok',mode,len(spec),'chiusure')
