# crudo: cartone bianco -> craft uniforme (colore del fondo vicino alla «Z»), disegni neri invariati.
# uso: python3 kraft.py originale.jpg out.jpg [maschera.jpg]
import cv2,numpy as np,sys
im=cv2.imread(sys.argv[1]);h,w=im.shape[:2]
hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV).astype(np.float32);H,S,V=hsv[...,0],hsv[...,1],hsv[...,2]
poly=np.array([(78,322),(255,205),(395,96),(672,94),(900,196),(900,560),(222,560),(108,382)],np.int32)
inbox=np.zeros((h,w),np.uint8);cv2.fillPoly(inbox,[poly],1)
hz=np.zeros((h,w),np.uint8)
cv2.fillPoly(hz,[np.array([(250,0),(650,0),(650,92),(470,92),(420,130),(390,200),(350,262),(290,264),(248,150)],np.int32),
                 np.array([(628,58),(900,58),(900,214),(760,212),(700,196),(650,176),(624,130)],np.int32)],1)
skin=(hz>0)&(((H<=24)|(H>=165))&(S>=50))
green=(H>=30)&(H<=95)&(S>=22)
# pizza: zona satura grande e centrale, buchi piccoli (grana) riempiti
sat=((S>55)&(H<=24)).astype(np.uint8)
big=np.zeros((h,w),np.uint8);cv2.ellipse(big,(493,300),(280,170),-14,0,360,1,-1);sat[big==0]=0
sat=cv2.morphologyEx(sat,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
inv=(1-sat).astype(np.uint8);n,lab,st,_=cv2.connectedComponentsWithStats(inv,4)
for i in range(1,n):
    x,y,ww,hh,a=st[i]
    if a<5000 and x>0 and y>0 and x+ww<w and y+hh<h:
        reg=(lab==i);
        # riempi solo se dentro l'ellisse ristretta della pizza (grana), non tra dita e cornicione
        if big[reg].mean()>0.99 and cv2.pointPolygonTest(cv2.ellipse2Poly((493,300),(250,140),-14,0,360,5),(float(x+ww/2),float(y+hh/2)),False)>0: sat[reg]=1
n,lab,st,_=cv2.connectedComponentsWithStats(sat,8);pz=np.zeros_like(sat)
for i in range(1,n):
    if st[i,4]>20000: pz[lab==i]=1
palm=np.zeros((h,w),np.uint8)   # palmo della mano sinistra (segnalato dal titolare 05.11)
cv2.fillPoly(palm,[np.array([(330,60),(402,60),(402,84),(410,108),(398,130),(386,150),(379,170),(372,192),(330,200)],np.int32)],1)
box=((inbox>0)&~skin&~green&(pz==0)&(palm==0)).astype(np.uint8)
box=cv2.morphologyEx(box,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
n,lab,st,_=cv2.connectedComponentsWithStats(box,8);k=np.zeros_like(box)
for i in range(1,n):
    if st[i,4]>300: k[lab==i]=1
box=k
a=cv2.GaussianBlur(box.astype(np.float32),(0,0),0.8)[...,None]
target=np.array([138,170,196],np.float32)          # BGR craft (fondo vicino alla Z)
vref=np.median(V[box>0]);r=np.clip(V/vref,0,1.6)
r=np.where(r<0.6,r,0.6+(r-0.6)*0.45)               # luci uniformi, disegni neri restano
res=im.astype(np.float32)*(1-a)+(target[None,None,:]*r[...,None])*a
cv2.imwrite(sys.argv[2],res.clip(0,255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,90])
if len(sys.argv)>3:
    m=im.copy();m[box>0]=(m[box>0]*0.4+np.array([0,0,255])*0.6).astype(np.uint8);cv2.imwrite(sys.argv[3],m)
