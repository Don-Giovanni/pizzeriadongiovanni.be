import cv2,numpy as np
im=cv2.imread('/mnt/user-data/attachments/a464727e-3923-54c4-affc-75acee6868a5/d1d842c5-image.jpg');h,w=im.shape[:2]
hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV).astype(np.float32);H,S,V=hsv[...,0],hsv[...,1],hsv[...,2]
wm=((H>=7)&(H<=17)&(((S>130)&(V>110))|((S>105)&(V>50)&(V<160)))).astype(np.uint8)
wm=cv2.morphologyEx(wm,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
n,lab,st,_=cv2.connectedComponentsWithStats(wm,8)
wall=np.zeros_like(wm)
for i in range(1,n):
  x,y,ww,hh,a=st[i]
  if a>3000 and (x<=2 or y<=2 or y+hh>=h-2): wall[lab==i]=1
inv=(1-wall).astype(np.uint8);n2,l2,s2,_=cv2.connectedComponentsWithStats(inv,8)
for i in range(1,n2):
  if s2[i,4]<3000: wall[l2==i]=1
yy,xx=np.mgrid[0:h,0:w]
strip=((xx>1150)&(xx<2250)&(yy>100)&(yy<300)&(H>=9)&(H<=14)&(S>100)&(V>90)).astype(np.uint8)
strip=cv2.morphologyEx(strip,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
wall=(wall|strip).astype(np.uint8)
cv2.imwrite('recolor/m_crudo.png',wall*255)
o=hsv.copy();o[...,0]=40;o[...,1]=np.clip(S*0.3,0,255);o[...,2]=np.clip(V*0.8,0,255)
g=cv2.cvtColor(o.astype(np.uint8),cv2.COLOR_HSV2BGR).astype(np.float32)
near=cv2.dilate(wall,np.ones((11,11),np.uint8)).astype(bool)&~wall.astype(bool)&(H>=6)&(H<=16)
wt=np.where(near,np.clip((S-72)/45,0,1),0)
a=np.maximum(cv2.GaussianBlur(wall.astype(np.float32),(0,0),1.5),cv2.GaussianBlur(wt.astype(np.float32),(0,0),1))[...,None]
res=(im*(1-a)+g*a).astype(np.uint8)
cv2.imwrite('recolor/crudo_verde.jpg',res,[cv2.IMWRITE_JPEG_QUALITY,90])
cv2.imwrite('recolor/crudo_cmp.jpg',cv2.resize(np.hstack([im,res]),None,fx=0.25,fy=0.25))
