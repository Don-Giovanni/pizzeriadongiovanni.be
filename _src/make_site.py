import sys
# Converte il menu dell'anteprima (artefatto) in pagina autonoma per il sito.
src, dst = sys.argv[1], sys.argv[2]
s = open(src).read()
s = s.replace('<title>Menu Don Giovanni</title>', '<title>Pizzeria Don Giovanni · Thuin</title>')
s = s.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
s = s.replace('href="tel:+32455111677" target="_blank" rel="noopener"', 'href="tel:+32455111677"')
s = s.replace('href="tel:${TEL}" target="_blank" rel="noopener"', 'href="tel:${TEL}"')
extra = sys.argv[3] if len(sys.argv) > 3 else ''
head = '''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Pizzeria au feu de bois à Thuin (Grand'Rue 1). Menu, prix, livraison et allergènes. Ouvert du mardi au dimanche, 17h–22h. Tél. 0455 11 16 77.">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Pizzeria Don Giovanni">
<meta property="og:title" content="Pizzeria Don Giovanni · Thuin">
<meta property="og:description" content="Pizzeria au feu de bois à Thuin. Menu, prix, livraison et allergènes. Du mardi au dimanche, 17h–22h · 0455 11 16 77.">
<meta property="og:url" content="https://pizzeriadongiovanni.be/">
<meta property="og:image" content="https://pizzeriadongiovanni.be/og-image.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="fr_BE">
<meta name="twitter:card" content="summary_large_image">
''' + extra + '''<meta name="theme-color" content="#0d0b0a">
<link rel="icon" href="favicon.ico" sizes="any"><link rel="icon" type="image/png" href="icon-512.png"><link rel="apple-touch-icon" href="apple-touch-icon.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
'''
i = s.index('<style>')
pre, rest = s[:i], s[i:]
j = rest.index('</style>') + len('</style>')
open(dst, 'w').write(head + pre + rest[:j] + '\n</head>\n<body>\n' + rest[j:] + '\n</body>\n</html>\n')
