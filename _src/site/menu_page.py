import sys
p=sys.argv[1];s=open(p).read()
a='<div class="wrap langs" role="group" aria-label="Langue · Taal · Language · Lingua">'
assert s.count(a)==1
s=s.replace(a,a+'\n  <a class="home" href="index.html" aria-label="Accueil"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg></a>')
s=s.replace('</style>','.langs .home{margin-right:auto;display:inline-flex;align-items:center;color:var(--muted);border:1px solid var(--line);border-radius:6px;padding:2px 8px;text-decoration:none}.langs .home:hover{color:var(--fg)}\n</style>',1)
s=s.replace('<link rel="canonical"','<link rel="x"')
open(p,'w').write(s);print('menu ok')
