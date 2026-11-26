/* Motor de video: dibuja cada escena como una función del tiempo, así se puede pausar, adelantar y ver nítida en cualquier pantalla. */
var MOTOR=(function(){
'use strict';
var INK='#F1F6F3',MUT='#94A69E',MINT='#5FD0A0',DOWN='#F08A7B',F='Geist, system-ui, sans-serif',PI=Math.PI;
function cl(x){return x<0?0:x>1?1:x}
function sg(p,a,b){return cl((p-a)/(b-a))}
function eo(x){x=cl(x);return 1-Math.pow(1-x,3)}
function eio(x){x=cl(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
function rebote(x){x=cl(x);var c=1.6;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)}
function mez(a,b,x){return a+(b-a)*x}
function rgba(h,a){var n=parseInt(h.slice(1),16);return'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'}
function rr(c,x,y,w,h,r){r=Math.min(r,Math.abs(w)/2,Math.abs(h)/2);c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h)}
function gr(c,x0,y0,x1,y1,a,b){var g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g}
function tx(c,s,x,y,z,col,al,peso,max){c.font=(peso||500)+' '+z+'px '+F;if(max){var w=c.measureText(s).width;if(w>max)c.font=(peso||500)+' '+(z*max/w)+'px '+F}c.textAlign=al||'left';c.fillStyle=col||INK;c.fillText(s,x,y)}
function lineas(c,s,z,peso,max){c.font=(peso||600)+' '+z+'px '+F;var o=[],l='';s.split(' ').forEach(function(w){var t=l?l+' '+w:w;if(c.measureText(t).width>max&&l){o.push(l);l=w}else l=t});o.push(l);return o}
function flecha(c,x,y,l,arriba,col,g){c.strokeStyle=col;c.lineWidth=g;c.lineCap=c.lineJoin='round';var d=arriba?-1:1;c.beginPath();c.moveTo(x,y-d*l/2);c.lineTo(x,y+d*l/2);c.moveTo(x-l*.32,y+d*l*.18);c.lineTo(x,y+d*l/2);c.lineTo(x+l*.32,y+d*l*.18);c.stroke()}
function persona(c,x,y,s,col){c.fillStyle=col;c.beginPath();c.arc(x,y-s*.62,s*.34,0,PI*2);c.fill();rr(c,x-s*.46,y-s*.2,s*.92,s*.9,s*.42);c.fill()}
function num(n){return n.toLocaleString('es-AR',{maximumFractionDigits:2})}

/* ---- ilustraciones: lienzo propio de 100 x 100 ---- */
var I={
fed:function(c,p,T,A,B){
  var v=p<.45?mez(.12,.86,eio(p/.45)):p<.62?.86+Math.sin(T*9)*.012:mez(.86,.4,eo((p-.62)/.3)),a0=PI*.8,a1=PI*2.2,r=38,cx=50,cy=56;
  c.lineCap='round';c.lineWidth=9;c.strokeStyle='rgba(210,240,226,.1)';c.beginPath();c.arc(cx,cy,r,a0,a1);c.stroke();
  c.strokeStyle=gr(c,12,0,88,0,MINT,A);c.beginPath();c.arc(cx,cy,r,a0,mez(a0,a1,v));c.stroke();
  for(var i=0;i<=10;i++){var t=mez(a0,a1,i/10);c.strokeStyle='rgba(241,246,243,.35)';c.lineWidth=.8;c.beginPath();c.moveTo(cx+Math.cos(t)*28,cy+Math.sin(t)*28);c.lineTo(cx+Math.cos(t)*(i%5?30.5:32),cy+Math.sin(t)*(i%5?30.5:32));c.stroke()}
  var n=mez(a0,a1,v);c.strokeStyle=INK;c.lineWidth=2.6;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(n)*27,cy+Math.sin(n)*27);c.stroke();c.fillStyle=INK;c.beginPath();c.arc(cx,cy,4.4,0,PI*2);c.fill();
  tx(c,p<.6?'La economía acelera':'La Fed frena',50,94,6.4,p<.6?MINT:A,'center',600);
},
cpi:function(c,p,T,A,B){
  var pr=mez(100,108,eio(sg(p,.35,.85)));
  [[34,'#5FD0A0',.02],[46,'#5CC6D6',.1],[57,'#F08A7B',.18],[67,'#EBB24A',.26]].forEach(function(o,i){var e=rebote(sg(p,o[2],o[2]+.22)),y=mez(-14,52-(i%2)*4,e);c.fillStyle=o[1];if(i%2){rr(c,o[0]-6,y-9,12,16,3);c.fill()}else{c.beginPath();c.arc(o[0],y,7.6,0,PI*2);c.fill()}});
  c.fillStyle=gr(c,20,50,80,86,rgba('#1c2923',1),rgba('#0c1411',1));c.strokeStyle=A;c.lineWidth=2;c.lineJoin='round';c.beginPath();c.moveTo(20,54);c.lineTo(80,54);c.lineTo(73,86);c.lineTo(27,86);c.closePath();c.fill();c.stroke();
  c.beginPath();c.arc(50,54,25,PI*1.04,PI*1.96);c.globalAlpha=.6;c.stroke();c.globalAlpha=1;
  for(var i=0;i<5;i++){c.strokeStyle=rgba(A,.3);c.lineWidth=1;c.beginPath();c.moveTo(29+i*10.5,59);c.lineTo(31.5+i*9.2,82);c.stroke()}
  var s=1+.12*Math.sin(cl(sg(p,.35,.9))*PI);c.save();c.translate(50,71);c.scale(s,s);rr(c,-17,-8,34,16,8);c.fillStyle=A;c.fill();tx(c,'$ '+num(Math.round(pr*10)/10),0,3.2,9,'#06110C','center',600);c.restore();
},
pce:function(c,p,T,A,B){
  var e=eio(sg(p,.35,.7)),carta=function(x,y,t,pz,col,al){c.globalAlpha=al;rr(c,x-18,y-22,36,44,6);c.fillStyle='#14201a';c.fill();c.strokeStyle=col;c.lineWidth=1.6;c.stroke();c.fillStyle=col;c.beginPath();c.arc(x,y-6,8,0,PI*2);c.fill();tx(c,t,x,y+10,6,INK,'center',600);tx(c,pz,x,y+18,5.6,col,'center',500);c.globalAlpha=1};
  carta(mez(36,14,e),mez(42,38,e),'Carne','$ '+num(Math.round(mez(10,14,eo(sg(p,.1,.35)))*10)/10),DOWN,mez(1,.28,e));
  carta(mez(112,58,e),42,'Pollo','$ 7',MINT,e);
  if(sg(p,.1,.35)>0&&e<.6)flecha(c,60,40,14,true,DOWN,2.6);
  tx(c,e<.4?'Sube la carne':'La gente cambia',50,80,6.4,e<.4?DOWN:MINT,'center',600);tx(c,e<.4?'':'y el índice lo nota',50,88,5.2,MUT,'center',400);
},
ppi:function(c,p,T,A,B){
  c.fillStyle='#1c2923';c.beginPath();c.moveTo(6,66);c.lineTo(6,42);c.lineTo(14,36);c.lineTo(14,42);c.lineTo(22,36);c.lineTo(22,42);c.lineTo(30,36);c.lineTo(30,66);c.closePath();c.fill();c.strokeStyle=A;c.lineWidth=1.4;c.stroke();
  rr(c,70,42,26,24,2);c.fillStyle='#1c2923';c.fill();c.strokeStyle=MINT;c.stroke();for(var k=0;k<4;k++){c.fillStyle=k%2?MINT:INK;c.fillRect(70+k*6.5,38,6.5,6)}
  for(var i=0;i<4;i++){var u=((p*1.5+i*.25)%1),x=mez(30,72,u),al=Math.sin(u*PI);c.globalAlpha=cl(al*2);rr(c,x-4.5,56,9,9,2);c.fillStyle=gr(c,x,56,x,65,A,B);c.fill();tx(c,'$'+Math.round(mez(10,16,u*eo(p*1.4))),x,52,4.6,INK,'center',500);c.globalAlpha=1}
  c.strokeStyle='rgba(210,240,226,.25)';c.lineWidth=1.4;c.setLineDash([3,3]);c.lineDashOffset=-T*8;c.beginPath();c.moveTo(30,68);c.lineTo(70,68);c.stroke();c.setLineDash([]);
  tx(c,'Fábrica',18,78,5.6,MUT,'center',500);tx(c,'Negocio',83,78,5.6,MUT,'center',500);
},
nfp:function(c,p,T,A,B){
  var tot=60,on=Math.floor(tot*eio(sg(p,.05,.9)));
  for(var i=0;i<tot;i++){var f=(i*37)%tot,x=9+(i%10)*9.1,y=22+Math.floor(i/10)*10.6,enc=f<on,s=enc?3.5+.35*Math.sin(T*3+i):3.1;if(enc){c.shadowColor=A;c.shadowBlur=8}persona(c,x,y,s,enc?(i%3?A:B):'rgba(210,240,226,.13)');c.shadowBlur=0}
  tx(c,'+'+num(Math.round(210*eio(sg(p,.05,.9))))+' mil empleos',50,92,7.4,INK,'center',600);
},
subsidios:function(c,p,T,A,B){
  var n=Math.round(mez(2,9,p<.6?eio(p/.6):1-eio((p-.6)/.4)*.75));
  rr(c,6,26,24,40,3);c.fillStyle='#1c2923';c.fill();c.strokeStyle=A;c.lineWidth=1.6;c.stroke();rr(c,10,32,16,14,2);c.fillStyle=rgba(A,.35);c.fill();tx(c,'Seguro',18,56,4.6,INK,'center',600);
  for(var i=0;i<n;i++)persona(c,36+i*7.2,58+Math.sin(T*2.4+i)*.5,4.2,i===n-1?DOWN:A);
  c.strokeStyle='rgba(210,240,226,.2)';c.lineWidth=1;c.beginPath();c.moveTo(4,68);c.lineTo(98,68);c.stroke();
  tx(c,p<.6?'La fila crece: más despidos':'La fila se acorta',50,83,6.2,p<.6?DOWN:MINT,'center',600);
},
pib:function(c,p,T,A,B){
  [['Consumo',66,30,A],['Inversión',44,15,B],['Gobierno',40,14,'#7FB4F0'],['Exportaciones netas',30,9,'#EBB24A']].forEach(function(b,i,bs){var e=rebote(sg(p,i*.17,i*.17+.28)),y0=84;for(var k=0;k<i;k++)y0-=bs[k][2]+2;var y=mez(-30,y0-b[2],e);if(e<=0)return;rr(c,50-b[1]/2,y,b[1],b[2],4);c.fillStyle=b[3];c.globalAlpha=.92;c.fill();c.globalAlpha=1;tx(c,b[0],50,y+b[2]/2+1.9,i?5:6.2,'#06110C','center',600,b[1]-3)});
  c.strokeStyle='rgba(210,240,226,.25)';c.lineWidth=1;c.beginPath();c.moveTo(12,86);c.lineTo(88,86);c.stroke();
},
consumo:function(c,p,T,A,B){
  rr(c,30,34,40,42,5);c.fillStyle='#1c2923';c.fill();c.strokeStyle=A;c.lineWidth=1.6;c.stroke();rr(c,35,39,30,12,2);c.fillStyle='#06110C';c.fill();
  for(var i=0;i<9;i++){c.fillStyle='rgba(210,240,226,.2)';c.beginPath();c.arc(39+(i%3)*11,58+Math.floor(i/3)*6.4,1.9,0,PI*2);c.fill()}
  var u=(p*2.2)%1,y=mez(8,36,eio(sg(u,0,.5))),ok=u>.55;c.save();rr(c,20,0,60,38,0);c.clip();rr(c,36,y-22,28,20,3);c.fillStyle=gr(c,36,0,64,0,A,B);c.fill();c.fillStyle='rgba(6,17,12,.5)';c.fillRect(36,y-17,28,4);c.restore();
  tx(c,ok?'Aprobado':'$ '+num(Math.round(sg(u,0,.5)*84)),50,47.4,6,ok?MINT:INK,'center',600);
  for(var k=0;k<6;k++){var h=eo(sg(p,k*.12,k*.12+.3))*(6+k*2.6);rr(c,76+k*3.6,78-h,2.6,h,1);c.fillStyle=rgba(MINT,.4+k*.1);c.fill()}
},
ism:function(c,p,T,A,B){
  var v=p<.5?mez(47,52.5,eio(p/.5)):mez(52.5,51,Math.sin((p-.5)*PI)),y=function(n){return mez(78,16,(n-44)/12)},arr=v>=50,col=arr?MINT:DOWN;
  rr(c,43,10,14,74,7);c.fillStyle='rgba(210,240,226,.08)';c.fill();c.save();rr(c,43,10,14,74,7);c.clip();c.fillStyle=gr(c,0,84,0,10,col,arr?B:'#EBB24A');c.fillRect(43,y(v)+Math.sin(T*3)*.4,14,90);c.restore();c.fillStyle=col;c.beginPath();c.arc(50,84,11,0,PI*2);c.fill();
  c.strokeStyle='#EBB24A';c.lineWidth=1.2;c.setLineDash([3,2.4]);c.beginPath();c.moveTo(22,y(50));c.lineTo(78,y(50));c.stroke();c.setLineDash([]);tx(c,'50',17,y(50)+2.2,6.6,'#EBB24A','center',600);
  tx(c,arr?'Expansión':'Contracción',62,y(v)+2,6.2,col,'left',600);tx(c,num(Math.round(v*10)/10),50,87,6.4,'#06110C','center',600);
},
bonos:function(c,p,T,A,B){
  var a=Math.sin(p*PI*2)*.28;c.fillStyle='#1c2923';c.strokeStyle='rgba(210,240,226,.3)';c.lineWidth=1.2;c.beginPath();c.moveTo(50,52);c.lineTo(60,78);c.lineTo(40,78);c.closePath();c.fill();c.stroke();
  c.save();c.translate(50,51);c.rotate(a);rr(c,-40,-1.6,80,3.2,1.6);c.fillStyle=INK;c.fill();
  [[-32,'Precio',MINT],[32,'Rendimiento',A]].forEach(function(o){c.save();c.translate(o[0],-11);c.rotate(-a);rr(c,-17,-8,34,16,5);c.fillStyle=o[2];c.fill();tx(c,o[1],0,2,5.2,'#06110C','center',600);c.restore()});c.restore();
  tx(c,a<-.03?'Sube el rendimiento':a>.03?'Sube el precio':'En equilibrio',50,92,6.2,a<-.03?A:a>.03?MINT:MUT,'center',600);
},
petroleo:function(c,p,T,A,B){
  [18,50,82].forEach(function(x,i){var v=mez(.22,.82,eio(sg(p,i*.12,.6+i*.12)));rr(c,x-13,22,26,52,4);c.fillStyle='rgba(210,240,226,.06)';c.fill();c.save();rr(c,x-13,22,26,52,4);c.clip();var y=74-52*v;c.fillStyle=gr(c,0,y,0,74,A,'#1d3a4a');c.beginPath();c.moveTo(x-13,74);for(var k=0;k<=13;k++)c.lineTo(x-13+k*2,y+Math.sin(k*.8+T*3+i)*1.1);c.lineTo(x+13,74);c.closePath();c.fill();c.restore();c.strokeStyle='rgba(210,240,226,.35)';c.lineWidth=1.2;rr(c,x-13,22,26,52,4);c.stroke()});
  tx(c,'Se llenan los tanques: sobra petróleo',50,88,5.6,INK,'center',600);
},
mundo:function(c,p,T,A,B){
  var a=mez(-.16,.2,eio(sg(p,.2,.7)));c.strokeStyle=INK;c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(50,22);c.lineTo(50,82);c.moveTo(36,83);c.lineTo(64,83);c.stroke();
  var px=function(s){return[50+s*33*Math.cos(a),26+s*33*Math.sin(a)*-1]};
  c.beginPath();c.moveTo(px(-1)[0],px(-1)[1]);c.lineTo(px(1)[0],px(1)[1]);c.stroke();
  [[-1,'BCE',B],[1,'Fed',A]].forEach(function(o){var q=px(o[0]);c.strokeStyle='rgba(210,240,226,.4)';c.lineWidth=.9;c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[0]-10,q[1]+22);c.moveTo(q[0],q[1]);c.lineTo(q[0]+10,q[1]+22);c.stroke();c.fillStyle=o[2];c.beginPath();c.arc(q[0],q[1]+22,12,0,PI);c.fill();tx(c,o[1],q[0],q[1]+29.6,5.6,'#06110C','center',600)});
  for(var i=0;i<10;i++){var u=(T*.35+i/10)%1,s=a>0?-1:1,q=px(s);c.globalAlpha=Math.sin(u*PI)*.9*cl(Math.abs(a)*7);c.fillStyle=s<0?B:A;c.beginPath();c.arc(mez(50-s*30,q[0],u),mez(20,q[1]+16,u)-Math.sin(u*PI)*14,1.5,0,PI*2);c.fill()}c.globalAlpha=1;
}};
function ilus(c,id,x,y,w,h,p,T,A,B){var s=Math.min(w,h)/100;c.save();c.translate(x+(w-100*s)/2,y+(h-100*s)/2);c.scale(s,s);I[id](c,cl(p),T,A,B);c.restore()}

/* ---- escenas ---- */
function fondo(c,W,H,T,A,B){
  c.fillStyle='#070B0A';c.fillRect(0,0,W,H);
  [[.12+.05*Math.sin(T*.3),.1,.75,A,.26],[.95,.3+.06*Math.cos(T*.25),.65,B,.2],[.5,1.15,.6,'#EBB24A',.1]].forEach(function(l){var g=c.createRadialGradient(W*l[0],H*l[1],0,W*l[0],H*l[1],Math.max(W,H)*l[2]);g.addColorStop(0,rgba(l[3],l[4]));g.addColorStop(1,rgba(l[3],0));c.fillStyle=g;c.fillRect(0,0,W,H)});
  for(var i=0;i<26;i++){var x=((i*97.3+T*(4+i%5))%110-5)/100*W,y=((i*53.7)%100)/100*H+Math.sin(T*.6+i)*6;c.fillStyle='rgba(241,246,243,'+(.05+.05*((i*7)%5)/5)+')';c.beginPath();c.arc(x,y,1+(i%3)*.6,0,PI*2);c.fill()}
}
var ESC=[
function(c,W,H,p,T,l,A,B,pt){
  var m=Math.min(W,H)*.08,k=A,tw=pt?W-m*2:W*.5,z=pt?W*.098:W*.056,ls=lineas(c,l.n,z,600,tw),y=pt?H*.56:H*.4-(ls.length-1)*z*.5;
  ilus(c,l.id,pt?W*.14:W*.56,pt?H*.06:H*.1,pt?W*.72:W*.38,pt?H*.4:H*.6,sg(p,.1,1),T,A,B);
  c.globalAlpha=eo(sg(p,0,.15));tx(c,CATN(l),m,y-z*1.15,z*.42,k,'left',500);c.globalAlpha=1;
  ls.forEach(function(s,i){var e=eo(sg(p,.06+i*.07,.28+i*.07));c.globalAlpha=e;tx(c,s,m,y+i*z*1.08+(1-e)*z*.6,z,gr(c,m,0,m+tw,0,INK,A),'left',600)});
  c.globalAlpha=eo(sg(p,.25,.45));tx(c,l.sub,m,y+ls.length*z*1.08+z*.1,z*.5,MUT,'left',400,tw);c.globalAlpha=1;
},
function(c,W,H,p,T,l,A,B,pt){ilus(c,l.id,W*.05,H*(pt?.04:.05),W*.9,H*(pt?.9:.71),p,T,A,B)},
function(c,W,H,p,T,l,A,B,pt){
  var e=l.ej,mx=Math.max(e[2],e[3]),mn=Math.min(e[2],e[3]),ba=mx-mn<mx*.4?mn-(mx-mn)*2.2:0;if(ba<0)ba=0;
  var bw=W*(pt?.24:.13),gap=W*(pt?.12:.09),x0=W/2-bw-gap/2,yb=H*(pt?.64:.66),hm=H*(pt?.36:.36),z=Math.min(W,H)*(pt?.06:.065);
  [[e[0],e[2],'rgba(210,240,226,.22)',.05],[e[1],e[3],null,.3]].forEach(function(b,i){var g=rebote(sg(p,b[3],b[3]+.28)),x=x0+i*(bw+gap),h=Math.max(6,hm*((b[1]-ba)/(mx-ba||1))*g);rr(c,x,yb-h,bw,h,bw*.14);c.fillStyle=b[2]||gr(c,x,yb-h,x,yb,A,B);c.fill();
    c.globalAlpha=sg(p,b[3],b[3]+.12);tx(c,num(Math.round(mez(ba,b[1],cl(g))*100)/100)+e[4],x+bw/2,yb-h-z*.45,z,INK,'center',600);tx(c,b[0],x+bw/2,yb+z*.95,z*.58,MUT,'center',500,bw+gap*.8);c.globalAlpha=1});
  var s=eo(sg(p,.6,.75));if(s>0){c.globalAlpha=s;var t='Mayor a lo previsto',zz=z*.66;c.font='600 '+zz+'px '+F;var w=c.measureText(t).width+zz*1.8;rr(c,W/2-w/2,H*.08-(1-s)*14,w,zz*2,zz);c.fillStyle=rgba(A,.2);c.fill();c.strokeStyle=A;c.lineWidth=1.5;c.stroke();tx(c,t,W/2,H*.08-(1-s)*14+zz*1.34,zz,INK,'center',600);c.globalAlpha=1}
  tx(c,'Ejemplo',W-Math.min(W,H)*.06,H*.07,z*.48,MUT,'right',400);
},
function(c,W,H,p,T,l,A,B,pt){
  var n=5,pos=l.cadena.map(function(_,i){return pt?[W*.5,H*(.1+i*.133)]:[W*(.1+i*.2),H*(.36+(i%2?.1:-.06))]}),z=pt?W*.046:W*.0205,bw=pt?W*.68:W*.168,bh=pt?H*.088:H*.2;
  for(var i=0;i<n-1;i++){var e=sg(p,.1+i*.16,.22+i*.16),a=pos[i],b=pos[i+1];if(e<=0)continue;c.strokeStyle=rgba(A,.55);c.lineWidth=Math.max(2,z*.12);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(mez(a[0],b[0],e),mez(a[1],b[1],e));c.stroke();if(e>=1)for(var k=0;k<2;k++){var u=(T*.7+k*.5+i*.2)%1;c.fillStyle=B;c.globalAlpha=Math.sin(u*PI);c.beginPath();c.arc(mez(a[0],b[0],u),mez(a[1],b[1],u),z*.24,0,PI*2);c.fill();c.globalAlpha=1}}
  l.cadena.forEach(function(s,i){var e=rebote(sg(p,.02+i*.16,.18+i*.16));if(e<=0)return;c.save();c.translate(pos[i][0],pos[i][1]);c.scale(e,e);c.globalAlpha=cl(e);rr(c,-bw/2,-bh/2,bw,bh,bh*(pt?.4:.16));c.fillStyle=i===0?gr(c,-bw/2,0,bw/2,0,A,B):'#14201a';c.fill();c.strokeStyle=i===n-1?A:'rgba(210,240,226,.2)';c.lineWidth=1.6;c.stroke();var ls=pt?[s]:lineas(c,s,z,600,bw*.84);ls.forEach(function(q,j){tx(c,q,0,(j-(ls.length-1)/2)*z*1.22+z*.35,z,i===0?'#06110C':INK,'center',600,bw*.88)});c.restore()});
},
function(c,W,H,p,T,l,A,B,pt){
  var xs=ACADEMIA.impacto(l,1,'inflacion').filter(function(x){return x.v!==0}).sort(function(a,b){return Math.abs(b.v)-Math.abs(a.v)}).slice(0,8),col=pt?2:4,fi=Math.ceil(xs.length/col),mg=Math.min(W,H)*.05,gp=mg*.45,w=(W-mg*2-gp*(col-1))/col,top=H*(pt?.12:.15),h=Math.min((H*(pt?.58:.58)-gp*(fi-1))/fi,w*(pt?.62:.75)),z=Math.min(w*.115,h*.2);
  tx(c,'Si sale mayor, suele pasar esto',W/2,H*(pt?.075:.095),Math.min(W,H)*(pt?.05:.052),INK,'center',600,W*.9);
  xs.forEach(function(x,i){var e=eo(sg(p,.06+i*.07,.26+i*.07)),cx=mg+(i%col)*(w+gp),cy=top+Math.floor(i/col)*(h+gp)+(1-e)*24;if(e<=0)return;var k=x.v>0?MINT:DOWN;c.globalAlpha=e;rr(c,cx,cy,w,h,z*.9);c.fillStyle='rgba(20,32,26,.92)';c.fill();c.strokeStyle=rgba(k,.5);c.lineWidth=1.4;c.stroke();
    c.save();rr(c,cx,cy,w,h,z*.9);c.clip();c.beginPath();for(var j=0;j<=24;j++){var u=j/24,vis=sg(p,.15+i*.06,.75+i*.03);if(u>vis)break;var yy=cy+h*.72-(x.v>0?1:-1)*(eio(u)-.5)*h*.36*Math.abs(x.v)/1.6+Math.sin(u*11+i*2)*h*.035;c[j?'lineTo':'moveTo'](cx+w*.06+u*w*.88,yy)}c.strokeStyle=k;c.lineWidth=Math.max(2,z*.16);c.lineJoin='round';c.stroke();c.restore();
    tx(c,x.n,cx+z*.8,cy+z*1.75,z,INK,'left',600,w-z*(1.9+Math.abs(x.v)*1.05));for(var f=0;f<Math.abs(x.v);f++)flecha(c,cx+w-z*1.2-f*z*1.05,cy+z*1.4,z*1.05,x.v>0,k,Math.max(2,z*.2));c.globalAlpha=1});
},
function(c,W,H,p,T,l,A,B,pt){
  /* La reacción al dato, en velas estilo TradingView: quieto antes, latigazo, y la dirección de verdad. */
  var P=function(u){return u<.3?Math.sin(u*40)*.06:u<.38?-mez(0,1,(u-.3)/.08):u<.55?mez(-1,.75,eio((u-.38)/.17)):.75+.22*(u-.55)/.45*Math.sin(u*20)+.12*(u-.55)},n=56,fin=sg(p,.04,.8),z=Math.min(W,H)*(pt?.042:.045);
  if(!dibujar.vr){var cs=[],pc=100;for(var i=0;i<n;i++){var u=i/(n-1),cc=100+P(u)*9+.35*Math.sin(i*2.3)+.25*Math.sin(i*5.1),o=i?pc:cc-.2,sp=i>=17&&i<=21?2.4:.45;cs.push({o:o,c:cc,h:Math.max(o,cc)+sp*(.4+.6*Math.abs(Math.sin(i*1.7))),l:Math.min(o,cc)-sp*(.4+.6*Math.abs(Math.cos(i*1.3)))});pc=cc}dibujar.vr=cs}
  var b=pt?{x:W*.07,y:H*.22,w:W*.84,h:H*.5}:{x:W*.07,y:H*.22,w:W*.85,h:H*.47},G=TECNICA.tv(c,W,b,dibujar.vr,1+fin*(n-1),[88,112]),k=Math.round(.3*(n-1)),xd=G.x(k);
  c.save();c.strokeStyle='#EBB24A';c.lineWidth=1.5;c.setLineDash([5,5]);c.beginPath();c.moveTo(xd,b.y);c.lineTo(xd,b.y+b.h);c.stroke();c.restore();
  tx(c,'Sale el dato',xd,b.y+b.h+z*1.4,z*.82,'#EBB24A','center',500);
  var s=sg(p,.36,.46)*(1-sg(p,.56,.62));if(s>0){c.globalAlpha=s;var i2=Math.round(.385*(n-1));tx(c,'¿Entraste acá?',G.x(i2)+z*.8,G.y(dibujar.vr[i2].l)+z*.4,z*.9,DOWN,'left',600);c.globalAlpha=1}
  var e=eo(sg(p,.62,.8));c.globalAlpha=e;tx(c,l.ojo,W/2,H*.1+(1-e)*12,Math.min(W,H)*(pt?.056:.062),INK,'center',600,W*.88);c.globalAlpha=1;
}];
function CATN(l){return ACADEMIA.CAT[l.cat][0]}
function dibujar(c,W,H,l,i,p,T){
  if(l.tec)return TECNICA.dibujar(c,W,H,l,i,p,T);
  var k=ACADEMIA.CAT[l.cat],pt=H>W;c.textBaseline='alphabetic';fondo(c,W,H,T,k[1],k[2]);
  var v=eo(sg(p,0,.06))*(1-.0*p);c.save();c.globalAlpha=v;c.translate(0,(1-v)*10);ESC[i](c,W,H,p,T,l,k[1],k[2],pt);c.restore();
}
function miniatura(c,W,H,l,T){if(l.tec)return TECNICA.miniatura(c,W,H,l,T);var k=ACADEMIA.CAT[l.cat];c.clearRect(0,0,W,H);c.textBaseline='alphabetic';var u=(T/7)%1;ilus(c,l.id,0,0,W,H,u<.8?u/.8:1,T,k[1],k[2])}
return{dibujar:dibujar,miniatura:miniatura,ESCENAS:ESC.length,h:{cl:cl,sg:sg,eo:eo,eio:eio,rebote:rebote,mez:mez,rgba:rgba,rr:rr,gr:gr,tx:tx,lineas:lineas,flecha:flecha,persona:persona,fondo:fondo}};
})();
