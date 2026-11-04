import cv2,numpy as np,glob
A='/mnt/user-data/attachments/a464727e-3923-54c4-affc-75acee6868a5/'
im=cv2.imread(glob.glob(A+'6d9cdfdf*')[0]);h,w=im.shape[:2]
hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV).astype(np.float32);H,S,V=hsv[...,0],hsv[...,1],hsv[...,2]
yy,xx=np.mgrid[0:h,0:w]
orange=((H>=11)&(H<=21)&(S>115)&(yy<600)).astype(np.uint8)
n,lab,st,_=cv2.connectedComponentsWithStats(orange,8)
# componenti che toccano il bordo alto o destro in alto
keep=np.zeros_like(orange)
for i in range(1,n):
  x,y,ww,hh,a=st[i]
  if y<=3 and a>5000: keep[lab==i]=1
R=cv2.morphologyEx(keep,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(61,61)))
# non oltre il bordo della scatola: tieni solo dove sopra/vicino a muro
R=R&(cv2.dilate(keep,np.ones((25,25),np.uint8)))
Vm=cv2.medianBlur(V.astype(np.uint8),41).astype(np.float32);Sm=cv2.medianBlur(S.astype(np.uint8),41).astype(np.float32)
Hm=cv2.medianBlur(H.astype(np.uint8),41).astype(np.float32)
odd=(V<0.86*Vm)|(S<0.8*Sm)|(np.abs(H-Hm)>3)
chips=((R.astype(bool)&~keep.astype(bool))|(R.astype(bool)&odd)).astype(np.uint8)
near=(cv2.dilate(R,np.ones((41,41),np.uint8)).astype(bool))&~R.astype(bool)&(xx>330)&(xx<1500)&(yy>120)&(yy<260)&(V<120)&(S<140)
R=(R.astype(bool)|near).astype(np.uint8)
chips=((chips.astype(bool))|near).astype(np.uint8)
chips=cv2.dilate(chips,np.ones((7,7),np.uint8))&R
clean=cv2.inpaint(im,chips*255,9,cv2.INPAINT_TELEA)
hsv2=cv2.cvtColor(clean,cv2.COLOR_BGR2HSV).astype(np.float32)
o=hsv2.copy();o[...,0]=40;o[...,1]=np.clip(hsv2[...,1]*0.3,0,255);o[...,2]=np.clip(hsv2[...,2]*0.85,0,255)
green=cv2.cvtColor(o.astype(np.uint8),cv2.COLOR_HSV2BGR).astype(np.float32)
valid=(R.astype(bool)&~chips.astype(bool)).astype(np.float32)
num=cv2.GaussianBlur(green*valid[...,None],(0,0),12);den=cv2.GaussianBlur(valid,(0,0),12)[...,None]+1e-6
fillc=num/den
# texture: aggiungi il dettaglio fine del muro preso da una zona pulita traslata
tex=green-cv2.GaussianBlur(green,(0,0),6)
sh=np.roll(tex,-60,axis=1)
fillc=fillc+sh*0.8
cm=cv2.GaussianBlur(chips.astype(np.float32),(0,0),2)[...,None]
green=green*(1-cm)+fillc*cm
a=cv2.GaussianBlur(R.astype(np.float32),(0,0),1.5)[...,None]
res=(im*(1-a)+green*a).astype(np.uint8)
cv2.imwrite('recolor/pizza_verde.jpg',res,[cv2.IMWRITE_JPEG_QUALITY,90])
cv2.imwrite('recolor/pizza_cmp.jpg',cv2.resize(np.hstack([im[:700],res[:700]]),None,fx=0.35,fy=0.35))
