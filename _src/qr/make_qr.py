import segno,sys
from PIL import Image, ImageDraw
# uso: make_qr.py <campagna> <file_uscita.png>
camp,out=sys.argv[1],sys.argv[2]
URL="https://pizzeriadongiovanni.be/?utm_source=qr&utm_campaign="+camp
q=segno.make(URL,error='h',micro=False)
q.save('/tmp/_q.png',scale=40,border=2,dark='#17120f',light='#ffffff')
qr=Image.open('/tmp/_q.png').convert('RGBA');W=qr.width;n=q.symbol_size(border=0)[0];mod=40
logo=Image.open('qr/logo-light.png').crop((0,0,643,360));logo=logo.crop(logo.getbbox())
box=int(n*0.22)*mod;pad=mod
c=Image.new('RGBA',(box,box),(0,0,0,0));d=ImageDraw.Draw(c);d.rounded_rectangle((0,0,box-1,box-1),radius=box//6,fill='white')
lw=box-2*pad;r=min(lw/logo.width,lw/logo.height);lg=logo.resize((int(logo.width*r),int(logo.height*r)),Image.LANCZOS)
c.alpha_composite(lg,((box-lg.width)//2,(box-lg.height)//2));qr.alpha_composite(c,((W-box)//2,(W-box)//2))
qr.convert('RGB').save(out);print(URL,'version',q.version)
