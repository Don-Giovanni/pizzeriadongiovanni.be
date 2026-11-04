import sys,re
# gen_home.py <menu index.html> <out> <extra head>
src,dst,extra=sys.argv[1],sys.argv[2],sys.argv[3]
m=open(src).read()
tpl=open(sys.argv[0].rsplit('/',1)[0]+'/home.tpl.html').read()
a=m.index('.intro{position:fixed');b=m.index('\n',m.index('@media (max-height:600px){.intro'))
css=m[a:b]
i=m.index('<div id="intro"');j=m.index('<div class="wrap langs"')
intro=m[i:j]
ms=open(sys.argv[0].rsplit('/',1)[0]+'/../make_site.py').read()
og=re.search(r'(<meta name="description".*?<meta name="twitter:card"[^>]*>\n)',ms,re.S).group(1)
out=tpl.replace('/*INTROCSS*/',css).replace('<!--INTRO-->',intro).replace('<!--HEAD-->',extra+og)
open(dst,'w').write(out);print('home ok',len(out))
