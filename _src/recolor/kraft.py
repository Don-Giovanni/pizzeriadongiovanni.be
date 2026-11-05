# crudo.jpg: cartone bianco -> craft (disegni neri restano). uso: python3 kraft.py in.jpg out.jpg [anteprima.jpg]
import cv2,numpy as np,sys
im=cv2.imread(sys.argv[1]);h,w=im.shape[:2]
hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV).astype(np.float32);H,S,V=hsv[...,0],hsv[...,1],hsv[...,2]
box=((S<45)&(V>40)).astype(np.uint8)          # bianco/grigio/nero del cartone
poly=np.array([(76,322),(255,206),(398,108),(430,84),(690,88),(900,178),(900,560),(215,560)],np.int32)
inbox=np.zeros((h,w),np.uint8);cv2.fillPoly(inbox,[poly],1)
big=np.zeros((h,w),np.uint8);cv2.ellipse(big,(493,292),(285,175),-14,0,360,1,-1)
sat=((S>55)&(big>0)).astype(np.uint8)
sat=cv2.morphologyEx(sat,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(41,41)))
n,lab,st,_=cv2.connectedComponentsWithStats(sat,8);k=1+int(np.argmax(st[1:,4]));pz=(lab==k).astype(np.uint8)
ff=pz.copy();m=np.zeros((h+2,w+2),np.uint8);cv2.floodFill(ff,m,(0,0),1);pz=pz|(1-ff)
pz=cv2.erode(pz,np.ones((5,5),np.uint8))
keep=(box&inbox).astype(np.uint8);keep[pz>0]=0
keep=cv2.morphologyEx(keep,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
n,lab,st,_=cv2.connectedComponentsWithStats(keep,8)
k2=np.zeros_like(keep)
for i in range(1,n):
    if st[i,4]>400: k2[lab==i]=1
keep=cv2.morphologyEx(k2,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8));keep[pz>0]=0;keep[inbox==0]=0
a=cv2.GaussianBlur(keep.astype(np.float32),(0,0),1.2)[...,None]
kraft=np.array([128,172,212],np.float32)/255   # BGR del craft chiaro
res=im.astype(np.float32)*(1-a)+(im.astype(np.float32)*kraft)*a
cv2.imwrite(sys.argv[2],res.clip(0,255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,90])
if len(sys.argv)>3: cv2.imwrite(sys.argv[3],np.hstack([im,res.clip(0,255).astype(np.uint8)]))
