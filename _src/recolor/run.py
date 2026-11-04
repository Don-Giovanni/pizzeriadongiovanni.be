import numpy as np, cv2
from PIL import Image
im=cv2.imread('/mnt/user-data/attachments/a464727e-3923-54c4-affc-75acee6868a5/6f828bd3-image.jpg');h,w=im.shape[:2]
hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV).astype(np.float32);H,S,V=hsv[...,0],hsv[...,1],hsv[...,2]
yy,xx=np.mgrid[0:h,0:w]
poly=np.array([(272,494),(268,285),(300,238),(400,200),(550,180),(700,188),(800,222),(836,262),(808,300),(800,449)],np.int32)
opening=np.zeros((h,w),np.uint8);cv2.fillPoly(opening,[poly],1);opening=opening.astype(bool)
sillz=(xx>262)&(xx<835)&(yy>440)&(yy<615-xx*(105/835))
face=((H>=5)&(H<=12)&(S>70)&(((V>80)&(yy<620))|((V>35)&sillz))&~opening).astype(np.uint8)
cl=cv2.morphologyEx(face,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7)))
inv=(1-cl).astype(np.uint8);n,lab,stats,_=cv2.connectedComponentsWithStats(inv,8)
fill=cl.copy()
for i in range(1,n):
  if stats[i,cv2.CC_STAT_AREA]<4000: fill[lab==i]=1
n2,lab2,st2,_=cv2.connectedComponentsWithStats(fill,8);big=1+np.argmax(st2[1:,cv2.CC_STAT_AREA])
arch=(lab2==big)&~opening&~((xx>895)&(yy>398)&(yy<512)&((S<105)|(H>=11)))
zone=(xx>760)&(yy<245)&(H>=4)&(H<=22)&(S>55)
wall=zone&(H>=13)
arch=(arch|(zone&(H<13)))&~wall
gline=615-xx*(105/835)
gran=((yy>=gline)&~arch)|((yy>=505)&(xx>812))
leg=gran&(xx>=800)&(xx<=904)&(H<=22)&(S>40)
arch&=~leg
reflR=gran&(xx>904)&(yy>=516)&(H<=22)&(S>45)
reflL=(gran&~arch&(xx<800)&(H>=4)&(H<=12)&(S>60))|leg
def soft(m,s=0.9):return cv2.GaussianBlur(m.astype(np.float32),(0,0),s)[...,None]
def col(hue,sk,vk):
  o=hsv.copy();o[...,0]=hue;o[...,1]=np.clip(S*sk,0,255);o[...,2]=np.clip(V*vk,0,255)
  return cv2.cvtColor(o.astype(np.uint8),cv2.COLOR_HSV2BGR).astype(np.float32)
res=im.astype(np.float32)
for m,c in [(arch,col(178,1.0,0.74)),(wall,col(42,0.5,0.62)),(reflL,col(178,0.9,0.8)),(reflR,col(42,0.45,0.75))]:
  a=soft(m);res=res*(1-a)+c*a
res=res[:668].astype(np.uint8);cv2.imwrite('recolor/forno_rosso_verde.jpg',res,[cv2.IMWRITE_JPEG_QUALITY,92])
a=Image.open('/mnt/user-data/attachments/a464727e-3923-54c4-affc-75acee6868a5/6f828bd3-image.jpg').crop((0,0,1079,668));b=Image.open('recolor/forno_rosso_verde.jpg')
c=Image.new('RGB',(1079,1346),'white');c.paste(a,(0,0));c.paste(b,(0,678));c.save('recolor/prima_dopo_v3.jpg',quality=88)
z=cv2.resize(res[150:560,230:520],None,fx=2,fy=2);cv2.imwrite('recolor/z9.jpg',z)
