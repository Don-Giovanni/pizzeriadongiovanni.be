import cv2,numpy as np
im=cv2.imread('/mnt/user-data/attachments/a464727e-3923-54c4-affc-75acee6868a5/18c56e50-image.jpg');h,w=im.shape[:2]
hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV).astype(np.float32);H,S,V=hsv[...,0],hsv[...,1],hsv[...,2]
yy,xx=np.mgrid[0:h,0:w]
wm=((H>=7)&(H<=17)&(S>70)&(yy<1250)).astype(np.uint8)
n,lab,st,_=cv2.connectedComponentsWithStats(wm,8)
keep=np.zeros_like(wm)
for i in range(1,n):
  if st[i,1]<=3 and st[i,4]>20000: keep[lab==i]=1
# chiudi piccoli buchi (rumore) ma non oggetti grandi
inv=(1-keep).astype(np.uint8);n2,l2,s2,_=cv2.connectedComponentsWithStats(inv,8)
for i in range(1,n2):
  if s2[i,4]<400: keep[l2==i]=1
wall=keep.astype(bool)
o=hsv.copy();o[...,0]=40;o[...,1]=np.clip(S*0.37,0,255);o[...,2]=np.clip(V*0.82,0,255)
green=cv2.cvtColor(o.astype(np.uint8),cv2.COLOR_HSV2BGR).astype(np.float32)
a=cv2.GaussianBlur(wall.astype(np.float32),(0,0),1.5)[...,None]
res=im.astype(np.float32)*(1-a)+green*a
# forno: scurire
om=((S<50)&(V<150)&(xx>1080)&(yy>560)).astype(np.uint8)
n3,l3,s3,_=cv2.connectedComponentsWithStats(om,8);big=1+np.argmax(s3[1:,4]);oven=(l3==big).astype(np.uint8)
oven=cv2.morphologyEx(oven,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))
k=np.clip((150-V)/150,0,1)  # più scuro dove è già scuro
fac=1-0.38*cv2.GaussianBlur(oven.astype(np.float32),(0,0),3)
res=res*fac[...,None]
res=np.clip(res,0,255).astype(np.uint8)
cv2.imwrite('recolor/mascotte_verde.jpg',res,[cv2.IMWRITE_JPEG_QUALITY,90])
cv2.imwrite('recolor/m_oven.png',oven*255)
cv2.imwrite('recolor/masc_cmp.jpg',cv2.resize(np.hstack([im,res]),None,fx=0.25,fy=0.25))
