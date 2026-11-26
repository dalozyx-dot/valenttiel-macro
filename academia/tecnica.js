/* Academia técnica: lecciones animadas sobre el gráfico y ejercicios para entrenar el ojo.
   Todo se dibuja en vivo con las herramientas de MOTOR; los precios son de ejemplo, no de un activo real. */
var TECNICA=(function(){
'use strict';
var M=MOTOR.h,cl=M.cl,sg=M.sg,eo=M.eo,eio=M.eio,rebote=M.rebote,mez=M.mez,rgba=M.rgba,rr=M.rr,gr=M.gr,tx=M.tx,PI=Math.PI;
var INK='#F1F6F3',MUT='#94A69E',UP='#5FD0A0',DN='#F08A7B',AM='#EBB24A',VI='#B59CF0',AQ='#5CC6D6',F='Geist, system-ui, sans-serif';
var CAT={grafico:['Leer el gráfico','#7FB4F0','#5CC6D6'],niveles:['Niveles','#5FD0A0','#5CC6D6'],indicadores:['Indicadores','#B59CF0','#7FB4F0'],riesgo:['Riesgo','#EBB24A','#F08A7B'],setups:['Setups de entrada','#F2A65A','#5FD0A0'],metodo:['Método Valenttiel','#C9A649','#7FB4F0'],entradas:['Entradas del método','#C9A649','#26A69A']};
var VW=1000,MINI=false,MINIP=false;

/* ---- datos de ejemplo ---- */
function azar(s){s=(s>>>0)||1;return function(){s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function normal(r){var u=1-r(),v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*PI*v)}
// Velas que pasan por puntos [vela, precio]. Entre puntos, un puente browniano (ruido que suma cero) con envolvente senoidal:
// el precio llega exacto a cada punto, se mueve con naturalidad en el medio y cada punto intermedio es el extremo de su tramo.
function serie(pts,sem,ruido,mecha){
  var r=azar(sem||7),n=pts[pts.length-1][0]+1,cl0=[],cs=[];ruido=ruido==null?.6:ruido;mecha=mecha==null?.9:mecha;
  for(var k=0;k<pts.length-1;k++){
    var a=pts[k],b=pts[k+1],m=b[0]-a[0],W=[0],s=0,lo=Math.min(a[1],b[1]),hi=Math.max(a[1],b[1]),sig=ruido*.75;
    for(var j=1;j<=m;j++){s+=normal(r);W.push(s)}
    for(var j2=k?1:0;j2<=m;j2++){var u=m?j2/m:1,w=.5-.5*Math.cos(u*PI),pu=(W[j2]-u*W[m])/Math.sqrt(Math.max(1,m))*sig*2*Math.sin(u*PI);cl0.push(Math.min(hi,Math.max(lo,mez(a[1],b[1],w)+pu)))}
  }
  var ext={};pts.forEach(function(q,k){if(k&&k<pts.length-1){var p=pts[k-1][1],s2=pts[k+1][1];ext[q[0]]=q[1]<p&&q[1]<s2?'min':q[1]>p&&q[1]>s2?'max':''}});
  for(var i=0;i<n;i++){
    var c=cl0[i],o=i?cl0[i-1]:c+normal(r)*ruido*.3,vol=mecha*(.35+.65*Math.abs(normal(r))*.8),h=Math.max(o,c)+vol*r()*.9,l=Math.min(o,c)-vol*r()*.9,t=ext[i];
    var seg=0;while(seg<pts.length-2&&i>pts[seg+1][0])seg++;var A=pts[seg],B=pts[seg+1],lo2=Math.min(A[1],B[1]),hi2=Math.max(A[1],B[1]);
    if(i>0&&i===A[0]){var P0=pts[Math.max(0,seg-1)];lo2=Math.min(lo2,P0[1]);hi2=Math.max(hi2,P0[1])}
    h=Math.min(h,hi2);l=Math.max(l,lo2);
    if(t==='min'){l=A[0]===i?A[1]:B[1];c=Math.max(c,l+.3+r()*mecha*.4);o=Math.max(o,l+.12)}
    else if(t==='max'){h=A[0]===i?A[1]:B[1];c=Math.min(c,h-.3-r()*mecha*.4);o=Math.min(o,h-.12)}
    h=Math.max(h,o,c);l=Math.min(l,o,c);cs.push({o:o,h:h,l:l,c:c});
  }
  return cs;
}
/* Velas limpias para enseñar patrones: cada tramo va en una sola dirección (con alguna vela de pausa),
   los cuerpos varían con naturalidad y cada punto clave es el extremo exacto de su vela. */
function serieLimpia(pts,sem){
  var r=azar(sem||9),n=pts[pts.length-1][0]+1,C=[],X={},prev=pts[0][1];C[0]=prev;
  pts.forEach(function(q,k){if(k&&k<pts.length-1){var a=pts[k-1][1],b=pts[k+1][1];X[q[0]]=q[1]>a&&q[1]>b?'max':q[1]<a&&q[1]<b?'min':''}});
  for(var k=0;k<pts.length-1;k++){
    var a=pts[k],b=pts[k+1],m=b[0]-a[0];if(m<=0)continue;var ini=C[a[0]],d=b[1]-ini,w=[],s=0,j;
    for(j=0;j<m;j++){var x=.55+r()*.9;if(m>=3)x*=j<m*.6?1.15:.8;w.push(x);s+=x}
    var pausa=m>=5&&r()<.75?Math.floor(m*(.4+r()*.3)):-1;if(pausa>=0){w[pausa]=-.3*s/m;s=0;for(j=0;j<m;j++)s+=w[j]}
    for(j=0;j<m;j++)w[j]/=s;
    var acc=ini,avg=Math.abs(d)/m;for(j=1;j<=m;j++){acc+=w[j-1]*d;C[a[0]+j]=acc}
    var ex=X[b[0]];C[b[0]]=b[1]-(ex==='max'?1:ex==='min'?-1:0)*.3*avg;if(!ex)C[b[0]]=b[1];
  }
  var cs=[];for(var i=0;i<n;i++){
    var o=i?C[i-1]:C[0]-(C[1]-C[0])*.4,c=C[i],body=Math.abs(c-o),h=Math.max(o,c)+.06+body*r()*.22,l=Math.min(o,c)-.06-body*r()*.22;
    var seg=0;while(seg<pts.length-2&&i>pts[seg+1][0])seg++;var A=pts[seg],B=pts[seg+1],lo=Math.min(A[1],B[1]),hi=Math.max(A[1],B[1]);
    if(i>0&&i===A[0]){var P=pts[Math.max(0,seg-1)];lo=Math.min(lo,P[1]);hi=Math.max(hi,P[1])}
    h=Math.min(h,hi);l=Math.max(l,lo);if(X[i]==='max')h=B[0]===i?B[1]:A[1];if(X[i]==='min')l=B[0]===i?B[1]:A[1];
    cs.push({o:o,h:Math.max(h,o,c),l:Math.min(l,o,c),c:c});
  }
  return cs;
}
function fijar(cs,i,v){cs[i]=v;var s=cs[i+1];if(s){s.o=v.c;s.h=Math.max(s.h,s.o);s.l=Math.min(s.l,s.o)}return cs}
function espejo(pts,m){return pts.map(function(q){return[q[0],2*m-q[1]]})}
function media(cs,n){var o=[],s=0;cs.forEach(function(v,i){s+=v.c;if(i>=n)s-=cs[i-n].c;o.push(i>=n-1?s/n:null)});return o}
function rsi(cs,n){var o=[null],g=0,p=0;for(var i=1;i<cs.length;i++){var d=cs[i].c-cs[i-1].c,u=Math.max(d,0),b=Math.max(-d,0);if(i<=n){g+=u/n;p+=b/n}else{g=(g*(n-1)+u)/n;p=(p*(n-1)+b)/n}o.push(i<n?null:p===0?100:100-100/(1+g/p))}return o}
function traza(pts,u){u=cl(u);for(var i=1;i<pts.length;i++)if(u<=pts[i][0])return mez(pts[i-1][1],pts[i][1],(u-pts[i-1][0])/((pts[i][0]-pts[i-1][0])||1));return pts[pts.length-1][1]}

/* ---- dibujo del gráfico ---- */
// Paso "lindo" para la escala: 1, 2, 2,5 o 5 por una potencia de 10.
function paso5(x){var e=Math.pow(10,Math.floor(Math.log10(x))),f=x/e;return(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*e}
function marco(cs,b,ext){
  var lo=Infinity,hi=-Infinity;cs.forEach(function(v){lo=Math.min(lo,v.l);hi=Math.max(hi,v.h)});(ext||[]).forEach(function(v){lo=Math.min(lo,v);hi=Math.max(hi,v)});
  var pd=(hi-lo)*.07;lo-=pd;hi+=pd+(MINI?0:(hi-lo)*.09);var st=paso5((hi-lo)/4.5),paso=b.w/cs.length;
  return{cs:cs,b:b,lo:lo,hi:hi,st:st,n:cs.length,paso:paso,bw:Math.max(1.4,paso*.618),x:function(i){return b.x+paso*(i+.5)},y:function(p){return b.y+b.h*(1-(p-lo)/(hi-lo))}};
}
function px(c){var t=c.getTransform?c.getTransform():null;return t?Math.max(1,Math.abs(t.a)):1}
/* Estilo TradingView: panel oscuro, rejilla en las dos direcciones, escala de precios a la derecha,
   velas verde azulado y rojo con bordes rectos, leyenda OHLC y etiqueta del último precio. */
var TVUP='#26A69A',TVDN='#EF5350',TVBG='#131722',TVLN='rgba(54,58,69,.9)',TVGR='rgba(54,58,69,.42)',TVTX='#B2B5BE';
function escala(G){return Math.max(8,Math.min(11,G.b.h*.034,(VW-G.b.x-G.b.w)*.26))}
function fmtP(v,st){return v.toLocaleString('es-AR',{minimumFractionDigits:st<1?1:0,maximumFractionDigits:st<1?1:0})}
function panel(c,b,z){if(MINI)return;var x1=Math.min(VW-3,b.x+b.w+z*3.6);c.save();rr(c,b.x-z*.8,b.y-z*.8,x1-b.x+z*.8,b.h+z*1.6,6);c.fillStyle='rgba(19,23,34,.88)';c.fill();c.strokeStyle=TVLN;c.lineWidth=1;c.stroke();c.restore();
  c.save();c.strokeStyle=TVLN;c.lineWidth=1;c.beginPath();c.moveTo(b.x+b.w+.5,b.y-z*.8);c.lineTo(b.x+b.w+.5,b.y+b.h+z*.8);c.stroke();c.restore()}
function rejilla(c,G){
  var d=px(c),z=escala(G);panel(c,G.b,z);c.lineWidth=1/d;c.strokeStyle=TVGR;
  var cada=G.n>60?10:G.n>30?5:G.n>14?3:1;for(var i=cada-1;i<G.n;i+=cada){var x=Math.round(G.x(i)*d)/d+.5/d;c.beginPath();c.moveTo(x,G.b.y);c.lineTo(x,G.b.y+G.b.h);c.stroke()}
  for(var v=Math.ceil(G.lo/G.st)*G.st;v<=G.hi+1e-9;v+=G.st){var y=Math.round(G.y(v)*d)/d+.5/d;c.beginPath();c.moveTo(G.b.x,y);c.lineTo(G.b.x+G.b.w,y);c.stroke();
    if(!MINI){c.font='500 '+z+'px "Geist Mono", ui-monospace, monospace';c.textAlign='left';c.fillStyle=TVTX;c.globalAlpha=.75;c.fillText(fmtP(v,G.st),G.b.x+G.b.w+z*.5,y+z*.36);c.globalAlpha=1}}
}
// Velas alineadas a los píxeles: mecha de un píxel centrada y cuerpo rectangular, como en TradingView.
function velas(c,G,hasta,op){
  op=op||{};var n=Math.min(G.n,hasta),d=px(c),bw=Math.max(1,Math.round(G.bw*d))/d,mw=Math.max(1,Math.round(d)),ult=null;
  for(var i=0;i<Math.ceil(n);i++){
    var v=G.cs[i],f=Math.min(1,n-i),cc=mez(v.o,v.c,f),hh=Math.max(v.o,cc,mez(v.o,v.h,f)),ll=Math.min(v.o,cc,mez(v.o,v.l,f)),col=cc>=v.o?TVUP:TVDN;
    var x0=Math.round((G.x(i)-bw/2)*d)/d,xw=(Math.round((x0+bw/2)*d-mw/2)+mw/2)/d;
    c.globalAlpha=(op.al?op.al(i):1);c.strokeStyle=col;c.lineWidth=mw/d;c.lineCap='butt';c.beginPath();c.moveTo(xw,Math.round(G.y(hh)*d)/d);c.lineTo(xw,Math.round(G.y(ll)*d)/d);c.stroke();
    var y0=Math.round(G.y(Math.max(v.o,cc))*d)/d,y1=Math.round(G.y(Math.min(v.o,cc))*d)/d;c.fillStyle=col;c.fillRect(x0,y0,bw,Math.max(1/d,y1-y0));
    ult={o:v.o,h:hh,l:ll,c:cc,col:col};
  }
  c.globalAlpha=1;
  if(ult&&!MINI&&op.etiqueta!==false){var z=escala(G),y=Math.round(G.y(ult.c)*d)/d+.5/d,t=fmtP(ult.c,G.st<5?.1:1),w=Math.min(VW-3-(G.b.x+G.b.w)-1,z*3.4);
    if(w>z*1.5){c.fillStyle=ult.col;c.fillRect(G.b.x+G.b.w+1,y-z*.78,w,z*1.56);c.font='600 '+z+'px "Geist Mono", ui-monospace, monospace';c.textAlign='left';c.fillStyle='#fff';c.fillText(t,G.b.x+G.b.w+z*.45,y+z*.36)}
    if(op.leyenda!==false){c.font='500 '+z*.92+'px "Geist Mono", ui-monospace, monospace';c.textAlign='left';c.fillStyle='rgba(178,181,190,.45)';c.fillText('Ejemplo · 1h',G.b.x+z*.2,G.b.y+z*1.05)}}
}
// Curva monótona (Fritsch–Carlson): pasa por cada punto, sin pasarse de largo entre ellos.
function suave(c,P){
  var n=P.length;if(!n)return;c.moveTo(P[0][0],P[0][1]);if(n<3){for(var q=1;q<n;q++)c.lineTo(P[q][0],P[q][1]);return}
  var dx=[],m=[],t=[];for(var i=0;i<n-1;i++){dx.push(P[i+1][0]-P[i][0]);m.push((P[i+1][1]-P[i][1])/(dx[i]||1))}
  t.push(m[0]);for(i=1;i<n-1;i++)t.push(m[i-1]*m[i]<=0?0:(3*(dx[i-1]+dx[i]))/((2*dx[i]+dx[i-1])/m[i-1]+(dx[i]+2*dx[i-1])/m[i]));t.push(m[n-2]);
  for(i=0;i<n-1;i++){var h=dx[i]/3;c.bezierCurveTo(P[i][0]+h,P[i][1]+h*t[i],P[i+1][0]-h,P[i+1][1]-h*t[i+1],P[i+1][0],P[i+1][1])}
}
function linea(c,G,cs,hasta,col,g){var P=[];for(var i=0;i<Math.min(G.n,Math.ceil(hasta));i++)P.push([G.x(i),G.y(cs[i].c)]);c.beginPath();suave(c,P);c.strokeStyle=col;c.lineWidth=g||2.4;c.lineJoin=c.lineCap='round';c.stroke()}
function curva(c,G,vals,desde,hasta,col,g,yf){yf=yf||G.y;var P=[];for(var i=Math.max(0,desde);i<Math.min(vals.length,hasta);i++){if(vals[i]==null)continue;P.push([G.x(i),yf(vals[i])])}c.beginPath();suave(c,P);c.strokeStyle=col;c.lineWidth=g||2.6;c.lineJoin=c.lineCap='round';c.stroke()}
/* Anotaciones sobrias, como un gráfico profesional bien marcado: texto chico en color sobre fondo oscuro, sin bordes ni brillos. */
function pastilla(c,s,x,y,col,z,al,a){
  if(MINI||a<=0||!s)return;c.save();c.globalAlpha*=cl(a);var zz=Math.max(9,z*.86);c.font='500 '+zz+'px '+F;
  var w=c.measureText(s).width+zz*.9,h=zz*1.62,x0=al==='left'?x:al==='right'?x-w:x-w/2;x0=Math.max(4,Math.min(VW-w-4,x0));
  rr(c,x0,y-h/2,w,h,3);c.fillStyle='rgba(13,16,24,.8)';c.fill();
  c.textAlign='left';c.textBaseline='middle';c.fillStyle=col;c.fillText(s,x0+zz*.45,y+zz*.04);c.textBaseline='alphabetic';c.restore();
}
function nivel(c,G,pr,col,e,op){
  op=op||{};if(e<=0)return;var x0=op.x0!=null?G.x(op.x0)-G.paso/2:G.b.x,x1=op.x1!=null?G.x(op.x1)+G.paso/2:G.b.x+G.b.w,y=Math.round(G.y(pr))+.5,xe=mez(x0,x1,eo(e));
  if(op.zona){var h=Math.abs(G.y(pr+op.zona)-G.y(pr));c.fillStyle=rgba(col,Math.min(.14,(op.za||.12))*cl(e*2));c.fillRect(x0,y-h,xe-x0,h*2)}
  c.save();c.strokeStyle=col;c.lineWidth=Math.min(op.g||1.3,1.8);c.globalAlpha*=op.al==null?.9:op.al;if(op.dash!==false)c.setLineDash([6,5]);c.beginPath();c.moveTo(x0,y);c.lineTo(xe,y);c.stroke();c.restore();
  if(op.txt)pastilla(c,op.txt,op.izq?x0+4:x1-4,y+(op.abajo?op.z*1.25:-op.z*1.25),col,op.z,op.izq?'left':'right',sg(e,.5,1));
}
function anillo(c,x,y,r,col,a){if(a<=0)return;c.save();c.globalAlpha*=cl(a)*.9;c.strokeStyle=col;c.lineWidth=1.5;c.beginPath();c.arc(x,y,r,0,PI*2);c.stroke();c.restore()}
function pop(c,x,y,r,col,e){if(e<=0||e>=1)return anillo(c,x,y,r,col,e>=1?1:0);anillo(c,x,y,r*(1+.5*(1-eo(e))),col,eo(e))}
function punto(c,x,y,col,r){c.save();c.fillStyle=col;c.beginPath();c.arc(x,y,Math.min(r,3.6),0,PI*2);c.fill();c.restore()}
function flechaL(c,x0,y0,x1,y1,col,g,e){e=e==null?1:eo(e);if(e<=0)return;g=Math.min(g,2);var x=mez(x0,x1,e),y=mez(y0,y1,e),a=Math.atan2(y-y0,x-x0),k=g*4;c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=g;c.lineCap='round';c.beginPath();c.moveTo(x0,y0);c.lineTo(x-Math.cos(a)*k*.6,y-Math.sin(a)*k*.6);c.stroke();c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.cos(a-.45)*k,y-Math.sin(a-.45)*k);c.lineTo(x-Math.cos(a+.45)*k,y-Math.sin(a+.45)*k);c.closePath();c.fill();c.restore()}
function velaG(c,cx,bw,y,o,h,l,cc){
  var col=cc>=o?TVUP:TVDN,d=px(c),ww=Math.max(1,Math.round(bw*.055*d))/d;c.save();c.fillStyle=col;c.fillRect(Math.round((cx-ww/2)*d)/d,y(h),ww,y(l)-y(h));
  var y0=y(Math.max(o,cc)),y1=y(Math.min(o,cc));c.fillRect(Math.round((cx-bw/2)*d)/d,y0,Math.round(bw*d)/d,Math.max(2,y1-y0));c.restore();
}
function rotulo(c,x,y,xt,s,col,a,z){if(a<=0)return;c.save();c.globalAlpha*=cl(a);c.strokeStyle=rgba(col,.7);c.lineWidth=1.4;c.setLineDash([4,4]);c.beginPath();c.moveTo(x,y);c.lineTo(mez(x,xt,eo(a)),y);c.stroke();c.setLineDash([]);punto(c,x,y,col,3.4);c.restore();tx(c,s,xt+z*.5,y+z*.36,z,INK,xt<x?'right':'left',600);c.globalAlpha=1}
function texto(S,s,x,y,col,a,z,al){if(a<=0||MINI)return;var c=S.c;c.save();c.globalAlpha*=cl(a);tx(c,s,x,y+(1-cl(a))*8,z||S.z*1.15,col||INK,al||'center',600,S.W*.9);c.restore()}
function graf(S,cs,hasta,op){op=op||{};var G=marco(cs,S.caja,op.ext);rejilla(S.c,G);if(op.antes)op.antes(G);velas(S.c,G,hasta,op);return G}
function ver(S,n,a,b){return n*sg(S.p,a==null?.04:a,b==null?.82:b)}
function marcas(S,G,hasta,xs){xs.forEach(function(m){var a=sg(hasta,m[0]+.6,m[0]+2.6);if(a<=0)return;var x=G.x(m[0]),y=G.y(m[1]);punto(S.c,x,y,m[4]||S.A,4.2*Math.min(1,a*1.5));pastilla(S.c,m[2],x,y+(m[3]?-1:1)*S.z*1.8,m[4]||S.A,S.z*.82,'center',a)})}
function escalon(S,G,hasta,xs,col){var c=S.c;c.save();c.strokeStyle=rgba(col,.6);c.lineWidth=1.8;c.setLineDash([6,6]);for(var k=1;k<xs.length;k++){var a=sg(hasta,xs[k][0]+.6,xs[k][0]+2.6);if(a<=0)continue;var x0=G.x(xs[k-1][0]),y0=G.y(xs[k-1][1]),x1=G.x(xs[k][0]),y1=G.y(xs[k][1]);c.beginPath();c.moveTo(x0,y0);c.lineTo(mez(x0,x1,a),mez(y0,y1,a));c.stroke()}c.restore()}
function medidor(S,v,cx,cy,r,txt){
  var c=S.c,a0=PI,z=S.z;c.lineCap='butt';
  [[0,30,UP],[30,70,'rgba(210,240,226,.18)'],[70,100,DN]].forEach(function(s){c.strokeStyle=s[2];c.lineWidth=r*.16;c.beginPath();c.arc(cx,cy,r,a0+s[0]/100*PI,a0+s[1]/100*PI);c.stroke()});
  for(var k=0;k<=10;k++){var t=a0+k/10*PI;c.strokeStyle='rgba(241,246,243,.4)';c.lineWidth=1.2;c.beginPath();c.moveTo(cx+Math.cos(t)*r*.74,cy+Math.sin(t)*r*.74);c.lineTo(cx+Math.cos(t)*r*.8,cy+Math.sin(t)*r*.8);c.stroke()}
  var t=a0+cl(v/100)*PI,col=v>70?DN:v<30?UP:INK;c.strokeStyle=col;c.lineWidth=Math.max(3,r*.035);c.lineCap='round';c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(t)*r*.86,cy+Math.sin(t)*r*.86);c.stroke();punto(c,cx,cy,col,r*.06);
  tx(c,String(Math.round(v)),cx,cy-r*.28,r*.26,col,'center',600);if(txt)tx(c,txt,cx,cy+r*.24,z,MUT,'center',500);
  if(!MINI){tx(c,'Sobreventa',cx-r*1.02,cy+z*1.5,z*.9,UP,'center',600);tx(c,'Sobrecompra',cx+r*1.02,cy+z*1.5,z*.9,DN,'center',600)}
}
function panelRSI(S,G,b,vals,hasta){
  var c=S.c,y=function(v){return b.y+b.h*(1-v/100)};panel(c,b,escala({b:b}));
  c.fillStyle=rgba(DN,.08);c.fillRect(b.x,y(100),b.w,y(70)-y(100));c.fillStyle=rgba(UP,.08);c.fillRect(b.x,y(30),b.w,y(0)-y(30));
  c.save();c.setLineDash([5,5]);c.strokeStyle='rgba(241,246,243,.25)';c.lineWidth=1;[70,30].forEach(function(v){c.beginPath();c.moveTo(b.x,y(v));c.lineTo(b.x+b.w,y(v));c.stroke()});c.restore();
  curva(c,G,vals,0,hasta,VI,2.4,y);
  if(!MINI){tx(c,'RSI',b.x+6,b.y+S.z*1.1,S.z*.85,VI,'left',600);tx(c,'70',b.x+b.w-4,y(70)-4,S.z*.75,MUT,'right',500);tx(c,'30',b.x+b.w-4,y(30)+S.z*.95,S.z*.75,MUT,'right',500)}
  return y;
}
function cajas(S){var b=S.caja;return{p:{x:b.x,y:b.y,w:b.w,h:b.h*.62},o:{x:b.x,y:b.y+b.h*.7,w:b.w,h:b.h*.3}}}
function hastaPrecio(cs,hasta,pr,arriba,desde){for(var i=desde||0;i<Math.min(cs.length,hasta);i++)if(arriba?cs[i].c>pr:cs[i].c<pr)return i;return -1}

/* ---- series fijas de las lecciones ---- */
var SUBE=[[0,100],[6,108],[10,104],[17,113],[21,109],[28,118],[32,114],[39,123]],
    RANGO=[[0,104],[4,100],[9,110],[14,100],[19,110],[25,100],[31,110],[36,100.4],[40,105]],
    MT=[[0,100],[8,112],[14,105],[22,112],[28,106.5],[31,103],[34,105.2],[44,96]];

/* ---- lecciones ---- */
var L=[
{id:'velas',tec:1,cat:'grafico',n:'Velas japonesas',corto:'Velas',sub:'Cada vela cuenta una pelea',mini:2,
 tit:['Una vela, una pelea','Vela verde','Vela roja','La mecha cuenta la historia','El lugar importa','Una conversación'],
 t:['Cada vela resume una pelea entre compradores y vendedores durante un rato: un minuto, una hora o un día.',
  'El cuerpo va desde donde abrió hasta donde cerró. Si cerró más arriba es verde: ganaron los compradores.',
  'Si cerró más abajo es roja: ganaron los vendedores. Las mechas marcan hasta dónde llegó el precio y volvió.',
  'Una mecha larga abajo dice que vendieron fuerte, pero los compradores lo devolvieron para arriba.',
  'Una vela sola dice poco. Importa dónde aparece: en un piso, en un techo o en el medio de la nada.',
  'Leé las velas como una conversación: quién empuja, quién se cansa y quién toma el control.'],
 claves:['Cuerpo: de la apertura al cierre. Mechas: hasta dónde llegó y volvió.','Una mecha larga es un rechazo: alguien no dejó que el precio se quede ahí.','Elegí una temporalidad y respetala: la misma vela cuenta otra cosa en 5 minutos que en un día.'],
 trampa:'Operar una vela linda en el medio de la nada. Sin un nivel cerca, el patrón pierde casi todo su valor.',
 practica:'vela',
 q:[['Una vela verde significa que…',['Cerró más arriba de donde abrió','Subió todo el día sin bajar','Va a seguir subiendo'],0,'Solo dice cómo terminó la pelea en ese rato.'],
  ['¿Qué muestra una mecha larga abajo?',['Que nadie quiso comprar','Que vendieron fuerte pero lo devolvieron para arriba','Que el mercado cerró'],1,'Es un rechazo de los precios bajos.'],
  ['¿Dónde pesa más un martillo?',['En el medio de un rango','Sobre un soporte después de una caída','En cualquier lugar igual'],1,'El lugar le da sentido: un piso donde ya aparecieron compradores.']],
 esc:[
 function(S){var c=S.c,b=S.caja,u=sg(S.p,.04,.9),pts=[[0,100],[.22,106],[.45,97],[.72,107.5],[1,104]],pr=traza(pts,u),hi=100,lo=100;for(var j=0;j<=60;j++){var q=traza(pts,u*j/60);hi=Math.max(hi,q);lo=Math.min(lo,q)}
  var y=function(v){return b.y+b.h*(1-(v-94)/(111-94))},cx=S.W/2,bw=Math.min(b.w*.15,b.h*.3),d=traza(pts,u+.01)-traza(pts,u-.01);
  velaG(c,cx,bw,y,100,hi,lo,pr);c.save();c.setLineDash([3,5]);c.strokeStyle='rgba(241,246,243,.4)';c.lineWidth=1.2;c.beginPath();c.moveTo(cx+bw*.7,y(pr));c.lineTo(b.x+b.w*(S.pt?.84:.72),y(pr));c.stroke();c.restore();
  pastilla(c,'Precio',b.x+b.w*(S.pt?.84:.72),y(pr),INK,S.z*.9,'left',sg(S.p,.05,.12));
  var xs=S.pt?b.x+b.w*.02:b.x+b.w*.12;c.globalAlpha=d>0?1:.3;flechaL(c,xs+S.z*.8,y(100)+S.z*2,xs+S.z*.8,y(100)-S.z*2.4,UP,3);tx(c,'Compradores',xs+S.z*2,y(100)-S.z*.4,S.z*1.05,UP,'left',600);
  c.globalAlpha=d<0?1:.3;flechaL(c,xs+S.z*.8,y(100)+S.z*3,xs+S.z*.8,y(100)+S.z*7.4,DN,3);tx(c,'Vendedores',xs+S.z*2,y(100)+S.z*5.6,S.z*1.05,DN,'left',600);c.globalAlpha=1;
 },
 function(S){anat(S,98,109,95,106)},
 function(S){anat(S,106,109,95,98)},
 function(S){var c=S.c,b=S.caja,u=sg(S.p,.04,.82),pts=[[0,104],[.12,105],[.42,94.5],[.55,98],[.64,96.6],[1,105.6]],pr=traza(pts,u),hi=104,lo=104;for(var j=0;j<=60;j++){var q=traza(pts,u*j/60);hi=Math.max(hi,q);lo=Math.min(lo,q)}
  var y=function(v){return b.y+b.h*(1-(v-92)/(109-92))},cx=S.W*(S.pt?.5:.42),bw=Math.min(b.w*.13,b.h*.26);velaG(c,cx,bw,y,104,hi,lo,pr);
  var a=sg(S.p,.34,.42);pastilla(c,'Vendieron fuerte…',cx+bw*.8,y(lo),DN,S.z,'left',a);pastilla(c,'…y lo devolvieron',cx+bw*.8,y(Math.max(pr,104))-S.z*.2,UP,S.z,'left',sg(S.p,.66,.74));
  if(sg(S.p,.84,.9)>0)texto(S,'Rechazo de precios bajos',S.W/2,b.y+b.h+(S.pt?-S.z:S.z*1.4),AM,sg(S.p,.84,.92));
 },
 function(S){var cs=serie([[0,108],[5,100],[11,112],[18,104],[24,100],[36,116]],11,.5,.7),c=S.c;var o=cs[23].c;fijar(cs,24,{o:o,c:o+1.4,h:o+1.7,l:o-3.2});
  var h=ver(S,37,.03,.8),G=graf(S,cs,h,{antes:function(G){nivel(c,G,100,UP,sg(S.p,.02,.12),{zona:.7,dash:false,g:0,al:0})}});
  pastilla(c,'Piso',G.b.x+6,G.y(100)+S.z*1.6,UP,S.z*.85,'left',sg(S.p,.05,.12));var a=sg(h,25,27);anillo(c,G.x(24),G.y(cs[24].l+1.6),Math.max(G.paso*1.6,S.z*1.6),AM,a);pastilla(c,'Martillo en el piso',G.x(24),G.y(cs[24].l)+S.z*2.2,AM,S.z*.9,'center',a);
  if(h>=6){pop(c,G.x(5),G.y(100),S.z*.9,UP,sg(h,6,9))}
 },
 function(S){var cs=serie([[0,100],[12,112],[16,109],[24,118],[30,116.5],[39,104]],23,.6,.8),c=S.c,h=ver(S,40,.03,.86),G=graf(S,cs,h);
  [[7,'Empujan compradores',UP,107,true],[26,'Se cansan',AM,118,true],[35,'Toman el control los vendedores',DN,108,false]].forEach(function(m){var a=sg(h,m[0],m[0]+2);pastilla(c,m[1],G.x(m[0]),G.y(m[3])+(m[4]?-S.z*2.2:S.z*2.4),m[2],S.z*.92,'center',a)});
 }]},
{id:'tendencia',tec:1,cat:'grafico',n:'Tendencia: la escalera',corto:'Tendencia',sub:'Máximos y mínimos',mini:1,
 tit:['Ondas, no rectas','Alcista: una escalera que sube','Bajista: una escalera que baja','Lateral: un rango','Cuando se rompe la escalera','A favor de la corriente'],
 t:['El precio no va en línea recta. Sube y baja en ondas, como una escalera.',
  'En una tendencia alcista, cada máximo es más alto que el anterior, y cada mínimo también.',
  'En una bajista pasa al revés: máximos y mínimos cada vez más bajos.',
  'Si no hace ni una cosa ni la otra, está lateral: va y viene dentro de un rango.',
  'La tendencia cambia cuando se rompe la escalera: el precio pierde el último mínimo que la sostenía.',
  'Operar a favor de la tendencia es nadar con la corriente. En contra se puede, pero cuesta mucho más.'],
 claves:['Alcista: máximos y mínimos más altos. Bajista: más bajos.','El último mínimo de una suba es la línea que no tiene que perderse.','Mirá primero una temporalidad mayor: la tendencia grande manda.'],
 trampa:'Ver una vela roja y creer que cambió la tendencia. Hasta que no pierde el último mínimo, la escalera sigue en pie.',
 practica:'tendencia',
 q:[['Máximos cada vez más altos y mínimos cada vez más altos es…',['Tendencia alcista','Tendencia bajista','Un rango'],0,'Es una escalera que sube.'],
  ['¿Cuándo empieza a romperse una tendencia alcista?',['Con la primera vela roja','Cuando pierde el último mínimo','Cuando el RSI marca 70'],1,'Ahí se rompe la escalera.'],
  ['En un rango lateral…',['El precio va y viene entre un piso y un techo','Siempre sube','No hay velas'],0,'No hace máximos ni mínimos más altos ni más bajos.']],
 esc:[
 function(S){var c=S.c,cs=serie(SUBE,5,.3,.5),G=marco(cs,S.caja),e=sg(S.p,.04,.7);rejilla(c,G);
  c.save();c.setLineDash([8,8]);c.strokeStyle='rgba(241,246,243,.28)';c.lineWidth=2;c.beginPath();c.moveTo(G.x(0),G.y(100));c.lineTo(mez(G.x(0),G.x(39),e),mez(G.y(100),G.y(123),e));c.stroke();c.restore();
  linea(c,G,cs,40*e+1,gr(c,G.b.x,0,G.b.x+G.b.w,0,S.A,S.B),3);pastilla(c,'Así no',G.x(30),G.y(100+23*30/39)+S.z*2,MUT,S.z*.85,'center',sg(S.p,.5,.6));pastilla(c,'Así sí: en ondas',G.x(17),G.y(113)-S.z*2,S.A,S.z*.85,'center',sg(S.p,.6,.7));
 },
 function(S){var cs=serie(SUBE,5,.5,.7),h=ver(S,40),G=graf(S,cs,h),H=[[6,108,'Máx.',true,UP],[17,113,'Más alto',true,UP],[28,118,'Más alto',true,UP]],B=[[10,104,'Mín.',false,AQ],[21,109,'Más alto',false,AQ],[32,114,'Más alto',false,AQ]];escalon(S,G,h,H,UP);escalon(S,G,h,B,AQ);marcas(S,G,h,H.concat(B))},
 function(S){var cs=serie(espejo(SUBE,111.5),9,.5,.7),h=ver(S,40),G=graf(S,cs,h),H=[[10,119,'Máx.',true,DN],[21,114,'Más bajo',true,DN],[32,109,'Más bajo',true,DN]],B=[[6,115,'Mín.',false,AM],[17,110,'Más bajo',false,AM],[28,105,'Más bajo',false,AM]];escalon(S,G,h,H,DN);escalon(S,G,h,B,AM);marcas(S,G,h,H.concat(B))},
 function(S){var c=S.c,cs=serie(RANGO,3,.5,.7),e=sg(S.p,.05,.3),G=graf(S,cs,ver(S,41,.08,.9),{antes:function(G){c.fillStyle=rgba(S.A,.1*e);c.fillRect(G.b.x,G.y(110),(G.b.w)*eo(e),G.y(100)-G.y(110))}});nivel(c,G,110,DN,e,{txt:'Techo',z:S.z*.85});nivel(c,G,100,UP,e,{txt:'Piso',z:S.z*.85,abajo:true})},
 function(S){var c=S.c,P=[[0,100],[6,108],[10,104],[17,113],[21,109],[27,116],[39,100]],cs=serie(P,15,.5,.7),h=ver(S,40),G=graf(S,cs,h),k=hastaPrecio(cs,h,108.6,false,28);
  nivel(c,G,109,AQ,sg(S.p,.1,.3),{x0:21,txt:'Último mínimo',z:S.z*.85,abajo:true,izq:false});marcas(S,G,h,[[21,109,'Mín.',false,AQ],[27,116,'Máx.',true,UP]]);
  if(k>0){var a=sg(h,k+.5,k+2.5);pop(c,G.x(k),G.y(109),S.z*1.4,DN,a);pastilla(c,'Se rompió la escalera',G.x(k),G.y(109)+S.z*2.6,DN,S.z*.95,'center',a)}},
 function(S){var c=S.c,cs=serie(SUBE,5,.5,.7),G=graf(S,cs,40,{al:function(){return .5}}),e=sg(S.p,.05,.5);
  c.save();c.globalAlpha=.9;flechaL(c,G.x(1),G.y(100)+S.z,G.x(38),G.y(122)+S.z,UP,Math.max(5,S.z*.45),e);c.restore();pastilla(c,'A favor',G.x(20),G.y(111)+S.z*2.8,UP,S.z*.95,'center',sg(S.p,.4,.5));
  [[7,108,10,104],[18,113,21,109],[29,118,32,114]].forEach(function(m,i){var a=sg(S.p,.5+i*.08,.62+i*.08);flechaL(c,G.x(m[0]),G.y(m[1])-S.z*.6,G.x(m[2]),G.y(m[3])-S.z*.6,DN,3,a)});pastilla(c,'En contra: más difícil',G.x(31),G.y(114)+S.z*2.2,DN,S.z*.85,'center',sg(S.p,.7,.8));
 }]},
{id:'soportes',tec:1,cat:'niveles',n:'Soportes y resistencias',corto:'Soportes',sub:'Los pisos y techos del precio',mini:2,
 tit:['Soporte: un piso','Resistencia: un techo','Más toques, más miradas','Es una zona, no una línea','El techo se vuelve piso','Menos líneas, más claridad'],
 t:['Un soporte es un piso: una zona donde el precio cayó varias veces y rebotó, porque aparecieron compradores.',
  'Una resistencia es un techo: una zona donde subió varias veces y lo frenaron los vendedores.',
  'Mientras más veces se respeta un nivel, más gente lo mira. Por eso funciona.',
  'No es una línea exacta: es una zona. El precio puede pasarse un poco y volver.',
  'Cuando se rompe, muchas veces cambia de rol: el viejo techo pasa a ser el nuevo piso.',
  'Marcá pocos niveles y claros. Si llenás el gráfico de líneas, todo parece importante y nada lo es.'],
 claves:['Un nivel vale por las veces que lo respetaron y por lo fuerte que rebotó.','Marcalo como zona: el precio se pasa un poco antes de volver.','Un techo roto suele volverse piso, y al revés.'],
 trampa:'Poner el stop justo en la línea. Es donde más gente lo pone y donde el precio suele ir a buscarlo.',
 practica:'nivel',
 q:[['Un soporte es una zona donde…',['Aparecieron compradores varias veces','El precio nunca llega','Se cerró el mercado'],0,'Por eso el precio rebotó ahí.'],
  ['¿Por qué conviene pensarlo como zona?',['Porque el precio puede pasarse un poco y volver','Porque es más lindo','Porque las líneas no existen'],0,'Muchas mechas atraviesan el nivel y vuelven.'],
  ['Una resistencia que se rompe con fuerza suele…',['Desaparecer','Volverse soporte','Volverse más fuerte como techo'],1,'Es el cambio de rol.']],
 esc:[
 function(S){var c=S.c,cs=serie(RANGO,3,.5,.7),h=ver(S,41),G=graf(S,cs,h);nivel(c,G,100,UP,sg(S.p,.02,.2),{txt:'Soporte',z:S.z*.85,abajo:true});[4,14,25].forEach(function(i){var a=sg(h,i+.5,i+3);pop(c,G.x(i),G.y(100),S.z*1.2,UP,a);pastilla(c,'Rebote',G.x(i),G.y(100)+S.z*2.4,UP,S.z*.8,'center',a*(1-sg(h,i+8,i+10)))})},
 function(S){var c=S.c,cs=serie(RANGO,3,.5,.7),h=ver(S,41),G=graf(S,cs,h);nivel(c,G,110,DN,sg(S.p,.02,.2),{txt:'Resistencia',z:S.z*.85});[9,19,31].forEach(function(i){var a=sg(h,i+.5,i+3);pop(c,G.x(i),G.y(110),S.z*1.2,DN,a);pastilla(c,'Freno',G.x(i),G.y(110)-S.z*2.4,DN,S.z*.8,'center',a*(1-sg(h,i+8,i+10)))})},
 function(S){var c=S.c,cs=serie(RANGO,3,.5,.7),h=ver(S,41,.03,.9),G=graf(S,cs,h),n=[4,14,25,36].filter(function(i){return h>i+1}).length;
  nivel(c,G,100,UP,1,{dash:false,g:1.5+n*1.4,zona:.25+n*.18,za:.1+n*.05});[4,14,25,36].forEach(function(i,k){var a=sg(h,i+.5,i+2.5);punto(c,G.x(i),G.y(100),UP,5*a);pastilla(c,String(k+1),G.x(i),G.y(100)+S.z*2,UP,S.z*.85,'center',a)});
  pastilla(c,n+(n===1?' toque':' toques'),G.b.x+G.b.w-6,G.y(100)-S.z*1.8,UP,S.z*.95,'right',n?1:0)},
 function(S){var c=S.c,cs=serie(RANGO,3,.5,.7);[4,14,25].forEach(function(i,k){var v=cs[i];v.l=100-[.9,.5,1.1][k]});var G=graf(S,cs,41,{al:function(){return .85}}),e=eio(sg(S.p,.15,.55));
  c.fillStyle=rgba(UP,.2*e);var h=Math.abs(G.y(101.2)-G.y(98.8))*e;c.fillRect(G.b.x,G.y(100)-h/2,G.b.w,h);nivel(c,G,100,UP,1,{dash:false,g:2.2,al:1-e});
  [4,14,25].forEach(function(i){anillo(c,G.x(i),G.y(cs[i].l),S.z*.9,AM,sg(S.p,.55,.65))});pastilla(c,'Zona',G.b.x+6,G.y(100)+S.z*2.2,UP,S.z*.9,'left',e);pastilla(c,'Se pasan y vuelven',G.x(25),G.y(98)+S.z*2.6,AM,S.z*.85,'center',sg(S.p,.6,.7))},
 function(S){var c=S.c,P=[[0,96],[5,104],[10,97],[16,104],[21,98],[27,104],[31,110],[35,104.3],[44,116]],cs=serie(P,19,.5,.7),h=ver(S,45),G=graf(S,cs,h),k=hastaPrecio(cs,h,104.6,true,28),rot=k>0?sg(h,k,k+3):0;
  nivel(c,G,104,rot>.5?UP:DN,sg(S.p,.02,.15),{dash:true,g:2.4});pastilla(c,rot>.5?'Ahora es piso':'Techo',G.b.x+6,G.y(104)+(rot>.5?S.z*1.8:-S.z*1.8),rot>.5?UP:DN,S.z*.9,'left',1);
  if(h>36){pop(c,G.x(35),G.y(104.3),S.z*1.3,UP,sg(h,36,38));pastilla(c,'Techo → piso',G.x(35),G.y(104)+S.z*2.6,UP,S.z*.95,'center',sg(h,36,38))}},
 function(S){var c=S.c,cs=serie(RANGO,3,.5,.7),G=graf(S,cs,41,{al:function(){return .7}}),r=azar(4),e=sg(S.p,.05,.3),f=sg(S.p,.5,.7);
  for(var k=0;k<9;k++){var pr=100+r()*10;nivel(c,G,pr,k%2?AM:VI,e*(1-f),{g:1.4,dash:[5,5]})}nivel(c,G,100,UP,sg(S.p,.6,.8),{txt:'Piso',z:S.z*.85,abajo:true,g:2.6});nivel(c,G,110,DN,sg(S.p,.6,.8),{txt:'Techo',z:S.z*.85,g:2.6});
  texto(S,e<1||f<.5?'¿Cuál importa?':'Menos es más',S.W/2,G.b.y+G.b.h/2+S.z*.4,f>.5?S.A:AM,f>.5?sg(S.p,.7,.8):sg(S.p,.2,.3)*(1-sg(S.p,.45,.5)))}
 ]},
{id:'rupturas',tec:1,cat:'niveles',n:'Rupturas y trampas',corto:'Rupturas',sub:'¿Rompió o te engañó?',mini:0,
 tit:['La ruptura','La clave es el cierre','Solo la mecha: trampa','Los atrapados empujan al revés','Esperar que vuelva y respete','Dos preguntas antes de entrar'],
 t:['Una ruptura es cuando el precio atraviesa un soporte o una resistencia con fuerza.',
  'La clave está en el cierre. Si la vela cierra del otro lado, la ruptura vale más.',
  'Si solo lo atraviesa con la mecha y cierra de vuelta adentro, es una falsa ruptura: una trampa.',
  'Las trampas atrapan a los que entraron apurados. Cuando salen con pérdida, empujan el precio al revés.',
  'Una forma prudente: esperar que el precio vuelva a probar el nivel roto, y entrar si lo respeta.',
  'Antes de entrar por una ruptura, preguntate: ¿cerró afuera? ¿Volvió y respetó? Si no, esperá.'],
 claves:['Mirá el cierre de la vela, no la mecha.','El retesteo da una entrada con stop más corto.','Una falsa ruptura también es información: muchos quedaron del lado equivocado.'],
 trampa:'Entrar en el medio de la vela que rompe, antes de que cierre. Si vuelve adentro, quedaste atrapado.',
 practica:'ruptura',
 q:[['La vela pasa la resistencia con la mecha pero cierra abajo. Eso es…',['Una ruptura confirmada','Una posible falsa ruptura','Un soporte'],1,'El cierre quedó adentro.'],
  ['¿Qué es un retesteo?',['Que el precio vuelve a probar el nivel roto','Que el gráfico se reinicia','Volver a mirar las noticias'],0,'Si lo respeta, el viejo techo funciona como piso.'],
  ['¿Por qué una trampa puede empujar fuerte al revés?',['Porque los atrapados salen con pérdida','Porque se corta la luz','Porque la Fed habla'],0,'Sus órdenes de salida empujan en contra.']],
 esc:[
 function(S){var c=S.c,P=[[0,104],[5,110],[10,101],[16,110],[21,102],[27,110],[31,105],[36,117]],cs=serie(P,8,.5,.7),h=ver(S,37),G=graf(S,cs,h),k=hastaPrecio(cs,h,110.4,true,28);nivel(c,G,110,DN,sg(S.p,.02,.15),{txt:'Resistencia',z:S.z*.85,izq:true});
  if(k>0){var a=sg(h,k,k+3),x=G.x(k),y=G.y(110);pop(c,x,y,S.z*1.6,UP,a);for(var j=0;j<10;j++){var t=j/10*PI*2,d=S.z*(1+3*eo(a));c.globalAlpha=1-a;punto(c,x+Math.cos(t)*d,y+Math.sin(t)*d,j%2?UP:AM,2.4)}c.globalAlpha=1;pastilla(c,'¡Rompió!',x,y-S.z*3,UP,S.z,'center',a)}},
 function(S){zoom(S,[{o:106,h:107.5,l:105.2,c:107},{o:107,h:109.6,l:106.4,c:109},{o:109,h:109.8,l:107.8,c:108.2},{o:108.2,h:109.2,l:107.3,c:108.9},{o:108.9,h:113.2,l:108.5,c:112.6},{o:112.6,h:114,l:111.6,c:113.5}],4,'Cerró afuera ✓',UP)},
 function(S){zoom(S,[{o:106,h:107.5,l:105.2,c:107},{o:107,h:109.6,l:106.4,c:109},{o:109,h:109.8,l:107.8,c:108.2},{o:108.2,h:109.2,l:107.3,c:108.9},{o:108.9,h:113,l:108.4,c:109.4},{o:109.4,h:109.6,l:105.6,c:106}],4,'Solo la mecha ✗',DN)},
 function(S){var c=S.c,P=[[0,104],[5,110],[10,101],[16,110],[21,102],[27,110],[31,105],[34,109.5],[45,97]],cs=serie(P,8,.5,.7);fijar(cs,35,{o:cs[34].c,h:113.4,l:cs[34].c-.6,c:108.6});
  var h=ver(S,46),G=graf(S,cs,h);nivel(c,G,110,DN,sg(S.p,.02,.15),{z:S.z*.85});var a=sg(h,36,38);anillo(c,G.x(35),G.y(112),S.z*1.4,AM,a);pastilla(c,'Compraron acá',G.x(35),G.y(113.4)-S.z*1.6,AM,S.z*.85,'center',a);
  var b=sg(h,40,43);pastilla(c,'Atrapados: venden con pérdida',G.x(41),G.y(cs[Math.min(41,cs.length-1)].c)+S.z*3.2,DN,S.z*.9,'center',b);if(b>0)flechaL(c,G.x(36),G.y(111),G.x(43),G.y(100),DN,3,b)},
 function(S){var c=S.c,P=[[0,104],[5,110],[10,101],[16,110],[21,102],[27,110],[31,105],[34,116],[38,110.3],[47,122]],cs=serie(P,12,.5,.7),h=ver(S,48),G=graf(S,cs,h);nivel(c,G,110,h>36?UP:DN,sg(S.p,.02,.15),{z:S.z*.85});
  var a=sg(h,38.5,40.5);anillo(c,G.x(38),G.y(110.3),S.z*1.3,UP,a);pastilla(c,'Volvió y respetó: entrada prudente',G.x(38),G.y(110)+S.z*2.8,UP,S.z*.9,'center',a)},
 function(S){var c=S.c,b=S.caja,z=S.z*1.25,x=b.x+b.w*(S.pt?.06:.2),y0=b.y+b.h*.28;[['¿Cerró afuera del nivel?',.08],['¿Volvió y lo respetó?',.3]].forEach(function(r,i){var a=sg(S.p,r[1],r[1]+.1),ok=sg(S.p,r[1]+.12,r[1]+.2),y=y0+i*z*3;if(a<=0)return;c.globalAlpha=a;rr(c,x,y-z*1.1,z*1.6,z*1.6,z*.4);c.strokeStyle=UP;c.lineWidth=2;c.stroke();if(ok>0){c.strokeStyle=UP;c.lineWidth=3;c.beginPath();c.moveTo(x+z*.35,y-z*.3);c.lineTo(x+z*.7,y+z*.1);c.lineTo(mez(x+z*.7,x+z*1.3,ok),mez(y+z*.1,y-z*.75,ok));c.stroke()}tx(c,r[0],x+z*2.3,y,z,INK,'left',600,b.w*.8);c.globalAlpha=1});
  texto(S,'Si no: esperá. Siempre hay otra.',S.W/2,y0+z*7.6,AM,sg(S.p,.55,.65),z)}
 ]},
{id:'medias',tec:1,cat:'indicadores',n:'Medias móviles',corto:'Medias',sub:'El promedio que limpia el ruido',mini:0,
 tit:['El promedio de las últimas velas','Menos ruido','Arriba y subiendo','Un piso que se mueve','El cruce: avisa, pero tarde','En un rango, engañan'],
 t:['Una media móvil es el promedio de los últimos cierres. La de veinte promedia las últimas veinte velas.',
  'Suaviza el ruido: en vez de mirar cada salto, ves hacia dónde va el precio en general.',
  'Si el precio está arriba de la media y la media sube, la tendencia es alcista. Abajo y bajando, bajista.',
  'En tendencia, la media suele funcionar como un piso o un techo que se mueve.',
  'Cuando una media corta cruza a una larga, avisa un cambio. Pero llega tarde: es un promedio del pasado.',
  'En un rango, las medias se cruzan todo el tiempo y engañan. Sirven más cuando hay tendencia.'],
 claves:['Media corta: reacciona rápido. Media larga: muestra la tendencia de fondo.','Mirá la pendiente: una media plana es un mercado sin dirección.','Las más usadas: 20, 50 y 200.'],
 trampa:'Operar cada cruce de medias en un mercado lateral. Es donde más señales falsas dan.',
 practica:'media',
 q:[['La media de 20 es…',['El promedio de los últimos 20 cierres','El precio de hace 20 velas','El máximo de 20 días'],0,'Por eso suaviza los saltos.'],
  ['Precio arriba de una media que sube indica…',['Tendencia alcista','Tendencia bajista','Nada'],0,'Las dos cosas a la vez.'],
  ['¿Por qué el cruce de medias llega tarde?',['Porque es un promedio del pasado','Porque el gráfico se atrasa','Porque es aleatorio'],0,'Necesita varias velas para darse vuelta.']],
 esc:[
 function(S){var c=S.c,cs=serie(MEDI,21,.9,1),m=media(cs,20),n=cs.length,G=graf(S,cs,n,{al:function(){return .55}}),f=Math.floor(mez(19,n-1,eio(sg(S.p,.05,.88))));
  c.fillStyle=rgba(S.A,.12);c.fillRect(G.x(f-19)-G.paso/2,G.b.y,G.paso*20,G.b.h);c.strokeStyle=rgba(S.A,.5);c.lineWidth=1.2;c.strokeRect(G.x(f-19)-G.paso/2,G.b.y,G.paso*20,G.b.h);
  curva(c,G,m,0,f+1,S.A,3.2);punto(c,G.x(f),G.y(m[f]),INK,5);pastilla(c,'Promedio de 20 velas',G.x(f-10),G.b.y+S.z*3.2,S.A,S.z*.85,'center',sg(S.p,.05,.12))},
 function(S){var c=S.c,cs=serie(MEDI,21,.9,1),m=media(cs,20),e=sg(S.p,.1,.5),G=graf(S,cs,cs.length,{al:function(){return mez(1,.18,e)}});curva(c,G,m,0,cs.length,S.A,mez(2,4.5,e));pastilla(c,'Media de 20',G.x(48),G.y(m[48])+S.z*2.4,S.A,S.z*.9,'center',sg(S.p,.4,.5))},
 function(S){var c=S.c,cs=serie(MEDI,21,.9,1),m=media(cs,20),h=ver(S,cs.length,.03,.8),G=graf(S,cs,h,{antes:function(G){c.fillStyle=rgba(UP,.12);c.beginPath();var on=false;for(var i=19;i<Math.min(cs.length,h);i++){var y=G.y(Math.max(cs[i].c,m[i]));c[on?'lineTo':'moveTo'](G.x(i),y);on=true}for(var j=Math.min(cs.length,Math.ceil(h))-1;j>=19;j--)c.lineTo(G.x(j),G.y(m[j]));c.fill()}});
  curva(c,G,m,0,h,S.A,3);pastilla(c,'Arriba y subiendo = alcista',G.b.x+G.b.w/2,G.b.y-S.z*2.1,UP,S.z*.95,'center',sg(S.p,.4,.5))},
 function(S){var c=S.c,cs=serie(MEDI,21,.9,1),m=media(cs,20);[28,44].forEach(function(i){cs[i].l=Math.min(cs[i].l,m[i]-.1)});var h=ver(S,cs.length),G=graf(S,cs,h);curva(c,G,m,0,h,S.A,3);
  [28,44].forEach(function(i){var a=sg(h,i+.5,i+2.5);pop(c,G.x(i),G.y(m[i]),S.z*1.2,UP,a);pastilla(c,'Rebota en la media',G.x(i),G.y(m[i])+S.z*2.6,UP,S.z*.85,'center',a)})},
 function(S){var c=S.c,P=[[0,116],[15,103],[20,105],[27,99],[40,111],[55,119]],cs=serie(P,31,.7,.9),r=media(cs,9),l=media(cs,21),h=ver(S,cs.length),G=graf(S,cs,h,{al:function(){return .6}}),x=-1;
  for(var i=28;i<cs.length;i++)if(r[i-1]!=null&&l[i-1]!=null&&r[i-1]<=l[i-1]&&r[i]>l[i]){x=i;break}
  curva(c,G,l,0,h,VI,3);curva(c,G,r,0,h,AQ,2.6);pastilla(c,'Rápida (9)',G.b.x+6,G.b.y+S.z*3.2,AQ,S.z*.8,'left',1);pastilla(c,'Lenta (21)',G.b.x+6,G.b.y+S.z*5.4,VI,S.z*.8,'left',1);
  var a=sg(h,28,30);anillo(c,G.x(27),G.y(99),S.z*1.1,AM,a);pastilla(c,'El giro fue acá',G.x(27),G.y(99)+S.z*2.4,AM,S.z*.85,'center',a);
  if(x>0){var b=sg(h,x+.5,x+2.5);pop(c,G.x(x),G.y(l[x]),S.z*1.2,AQ,b);pastilla(c,'El cruce avisa acá',G.x(x),G.y(l[x])-S.z*2.6,AQ,S.z*.85,'center',b)}},
 function(S){var c=S.c,P=[[0,105],[4,101],[8,107],[12,102],[16,108],[20,101],[24,107],[28,102],[32,108],[36,101],[40,106],[44,102],[48,107],[55,104]],cs=serie(P,41,.7,.9),r=media(cs,5),l=media(cs,13),h=ver(S,cs.length),G=graf(S,cs,h,{al:function(){return .55}});
  curva(c,G,l,0,h,VI,3);curva(c,G,r,0,h,AQ,2.6);for(var i=14;i<Math.min(cs.length,h);i++){if((r[i-1]-l[i-1])*(r[i]-l[i])<0){var a=sg(h,i+.5,i+2);anillo(c,G.x(i),G.y(l[i]),S.z*.75,DN,a);tx(c,'✗',G.x(i),G.y(l[i])-S.z*1.2,S.z*1.3,DN,'center',600)}}
  pastilla(c,'Rango: cruces falsos',G.b.x+G.b.w/2,G.b.y-S.z*2.1,DN,S.z*.95,'center',sg(S.p,.45,.55))}
 ]},
{id:'rsi',tec:1,cat:'indicadores',n:'RSI: la fuerza',corto:'RSI',sub:'¿Se está cansando el movimiento?',mini:3,
 tit:['Un medidor de 0 a 100','Sobrecompra y sobreventa','Puede quedarse arriba','Divergencia: la fuerza se agota','Confirma, no decide','El tablero del auto'],
 t:['El RSI mide la fuerza del movimiento reciente, en una escala de cero a cien.',
  'Arriba de setenta se dice sobrecompra: subió mucho y rápido. Abajo de treinta, sobreventa.',
  'Ojo: sobrecompra no significa que va a bajar. En tendencias fuertes, el RSI puede quedarse arriba mucho tiempo.',
  'Lo más útil es la divergencia: el precio hace un máximo más alto, pero el RSI uno más bajo. La fuerza se agota.',
  'El RSI no da la entrada solo. Sirve para confirmar lo que ya ves en los niveles y en la tendencia.',
  'Usalo como el tablero del auto: te dice cómo viene el motor, no hacia dónde doblar.'],
 claves:['La configuración más usada es de 14 velas.','Sobrecompra no es señal de venta: es un aviso.','Las divergencias pesan más cuando aparecen sobre un nivel.'],
 trampa:'Vender solo porque el RSI pasó 70 en una tendencia fuerte. Puede seguir subiendo mucho más.',
 practica:'rsi',
 q:[['Un RSI de 78 indica…',['Sobrecompra','Sobreventa','Que el precio va a bajar seguro'],0,'Subió mucho y rápido, nada más.'],
  ['¿Qué es una divergencia bajista?',['Precio con máximo más alto y RSI con máximo más bajo','Precio y RSI suben juntos','El RSI en 50'],0,'El precio sube con menos fuerza.'],
  ['¿Cómo conviene usar el RSI?',['Para confirmar lo que ya ves en el gráfico','Como única razón para entrar','Para elegir el activo'],0,'Es un tablero, no un volante.']],
 esc:[
 function(S){var b=S.caja,r=Math.min(b.w*.3,b.h*.62),v=traza([[0,50],[.3,84],[.62,20],[.9,55],[1,55]],sg(S.p,.04,.92));medidor(S,v,S.W/2,b.y+b.h*.8,r,'Fuerza reciente')},
 function(S){var c=S.c,K=cajas(S),P=[[0,100],[8,103],[18,118],[24,112],[30,104],[37,95],[46,103]],cs=serie(P,51,.9,.8),v=rsi(cs,8),h=ver(S,cs.length),G=marco(cs,K.p);rejilla(c,G);velas(c,G,h);panelRSI(S,G,K.o,v,h);
  var i1=pico(v,10,24,true),i2=pico(v,26,40,false),y=function(x){return K.o.y+K.o.h*(1-x/100)};if(i1>0){pastilla(c,'Sobrecompra',G.x(i1),y(v[i1])-S.z*1.6,DN,S.z*.8,'center',sg(h,i1+1,i1+3))}if(i2>0){pastilla(c,'Sobreventa',G.x(i2),y(v[i2])+S.z*1.6,UP,S.z*.8,'center',sg(h,i2+1,i2+3))}},
 function(S){var c=S.c,K=cajas(S),P=[[0,100],[6,106],[8,105],[14,112],[16,111],[22,119],[24,118],[30,126],[32,125],[40,134]],cs=serie(P,61,.4,.6),v=rsi(cs,8),h=ver(S,cs.length),G=marco(cs,K.p);rejilla(c,G);velas(c,G,h);var y=panelRSI(S,G,K.o,v,h);
  pastilla(c,'RSI arriba de 70…',G.x(22),y(85),DN,S.z*.8,'center',sg(h,22,25));pastilla(c,'…y el precio sigue subiendo',G.x(30),G.y(119),UP,S.z*.85,'center',sg(h,32,36))},
 function(S){var c=S.c,K=cajas(S),P=[[0,100],[8,112],[13,106],[17,110],[19,107.5],[23,111.5],[25,109.5],[30,114],[38,104]],cs=serie(P,71,.7,.6),v=rsi(cs,8),h=ver(S,cs.length),G=marco(cs,K.p);rejilla(c,G);velas(c,G,h);var y=panelRSI(S,G,K.o,v,h),r1=pico(v,6,10,true),r2=pico(v,27,31,true),a=sg(h,31,34);
  if(a>0){c.save();c.lineWidth=2.6;c.strokeStyle=UP;c.globalAlpha=a;c.beginPath();c.moveTo(G.x(8),G.y(112));c.lineTo(G.x(30),G.y(114));c.stroke();c.strokeStyle=DN;c.beginPath();c.moveTo(G.x(r1),y(v[r1]));c.lineTo(G.x(r2),y(v[r2]));c.stroke();c.restore();
   pastilla(c,'Precio: más alto',G.x(19),G.y(113)-S.z*1.8,UP,S.z*.8,'center',a);pastilla(c,'RSI: más bajo',G.x(19),y((v[r1]+v[r2])/2)-S.z*1.6,DN,S.z*.8,'center',a);texto(S,'Divergencia',G.b.x+G.b.w*.82,G.b.y+G.b.h*.82,AM,sg(h,34,37))}},
 function(S){var c=S.c,K=cajas(S),P=[[0,112],[6,100],[12,110],[16,109],[24,99.6],[34,110]],cs=serie(P,81,.7,.6),v=rsi(cs,8),h=ver(S,cs.length),G=marco(cs,K.p);rejilla(c,G);nivel(c,G,100,UP,sg(S.p,.02,.15),{zona:.6,txt:'Soporte',z:S.z*.8,abajo:true});velas(c,G,h);var y=panelRSI(S,G,K.o,v,h),i=pico(v,18,27,false),a=sg(h,i+1,i+3);
  anillo(c,G.x(24),G.y(99.6),S.z*1.2,UP,a);anillo(c,G.x(i),y(v[i]),S.z*1,UP,a);pastilla(c,'Soporte + sobreventa: se suman',G.b.x+G.b.w/2,G.b.y-S.z*2.1,UP,S.z*.9,'center',sg(h,i+2,i+4))},
 function(S){var b=S.caja,r=Math.min(b.w*.28,b.h*.6),v=60+18*Math.sin(S.T*.9);medidor(S,v,S.W/2,b.y+b.h*.78,r,'Cómo viene el motor');texto(S,'No te dice hacia dónde doblar',S.W/2,b.y+b.h*.78+r*.24+S.z*2.4,AM,sg(S.p,.4,.5))}
 ]},
{id:'dobles',tec:1,cat:'grafico',n:'Doble techo y doble piso',corto:'Doble techo',sub:'Cuando el precio no puede pasar',mini:2,
 tit:['Dos intentos que fallan','El cuello','Se confirma al romper el cuello','Una referencia de objetivo','El doble piso: el espejo','Siempre con stop'],
 t:['Un doble techo aparece cuando el precio intenta pasar un máximo dos veces y no puede.',
  'Entre los dos intentos queda un valle. Esa línea se llama cuello, y es la que importa.',
  'El patrón se confirma recién cuando el precio cierra debajo del cuello. Antes es solo una sospecha.',
  'Una referencia de objetivo: medir la altura del patrón y proyectarla desde el cuello hacia abajo.',
  'El doble piso es el espejo: dos intentos de bajar que fallan, y la confirmación cuando rompe el cuello hacia arriba.',
  'Ningún patrón es seguro. Por eso siempre va con stop: si el precio vuelve arriba del techo, la idea murió.'],
 claves:['Sin romper el cuello no hay patrón, hay sospecha.','La altura proyectada es una referencia, no una promesa.','Funciona mejor después de una tendencia larga.'],
 trampa:'Vender en el segundo techo antes de que rompa el cuello. Muchas veces el precio termina pasando.',
 practica:'patron',
 q:[['¿Cuándo se confirma un doble techo?',['Al tocar el segundo techo','Al cerrar debajo del cuello','Cuando el RSI baja'],1,'Antes es solo una sospecha.'],
  ['¿Cómo se proyecta el objetivo de referencia?',['La altura del patrón desde el cuello','El doble del precio','No se puede'],0,'Es una referencia, no una promesa.'],
  ['El doble piso es…',['Dos intentos de bajar que fallan','Dos techos','Una tendencia bajista'],0,'Es el espejo del doble techo.']],
 esc:[
 function(S){var c=S.c,cs=serie(MT,13,.45,.6),h=ver(S,30,.03,.85),G=graf(S,cs,h);nivel(c,G,112,DN,sg(h,22,25),{x0:4,x1:26,g:1.8});marcas(S,G,h,[[8,112,'1.º intento',true,DN],[22,112,'2.º intento',true,DN]])},
 function(S){var c=S.c,cs=serie(MT,13,.45,.6),G=graf(S,cs,30);nivel(c,G,112,DN,1,{x0:4,x1:26,g:1.8,al:.6});nivel(c,G,105,AM,sg(S.p,.1,.4),{x0:10,g:2.6,txt:'Cuello',z:S.z*.9,abajo:true});pop(c,G.x(14),G.y(105),S.z*1.2,AM,sg(S.p,.1,.3))},
 function(S){var c=S.c,cs=serie(MT,13,.45,.6),h=mez(30,45,sg(S.p,.05,.8)),G=graf(S,cs,h),k=hastaPrecio(cs,h,104.6,false,29);nivel(c,G,105,AM,1,{x0:10,g:2.4});
  if(k>0){var a=sg(h,k+.5,k+2.5);pop(c,G.x(k),G.y(105),S.z*1.3,DN,a);pastilla(c,'Cerró abajo: confirmado',G.x(k),G.y(105)+S.z*2.8,DN,S.z*.9,'center',a)}else pastilla(c,'Todavía es sospecha',G.x(26),G.y(105)+S.z*2.6,MUT,S.z*.85,'center',1)},
 function(S){var c=S.c,cs=serie(MT,13,.45,.6),G=graf(S,cs,45,{al:function(i){return i>32?.35:1}}),x=G.x(18),a=sg(S.p,.08,.35),b=sg(S.p,.4,.7);nivel(c,G,105,AM,1,{x0:10,g:2});nivel(c,G,112,DN,1,{x0:4,x1:26,g:1.6,al:.6});
  flechaL(c,x,G.y(105),x,G.y(112),AM,3,a);pastilla(c,'Altura',x-S.z*.6,G.y(108.5),AM,S.z*.8,'right',a);var x2=G.x(36);flechaL(c,x2,G.y(105),x2,G.y(98),AM,3,b);nivel(c,G,98,UP,b,{x0:30,g:2,txt:'Referencia',z:S.z*.85,abajo:true})},
 function(S){var c=S.c,cs=serie(espejo(MT,106),17,.45,.6),h=ver(S,45),G=graf(S,cs,h),k=hastaPrecio(cs,h,107.4,true,29);nivel(c,G,107,AM,sg(S.p,.3,.5),{x0:10,g:2.4,txt:'Cuello',z:S.z*.85});marcas(S,G,h,[[8,100,'1.º',false,UP],[22,100,'2.º',false,UP]]);
  if(k>0)pastilla(c,'Rompió hacia arriba',G.x(k),G.y(107)-S.z*2.6,UP,S.z*.9,'center',sg(h,k+.5,k+2.5))},
 function(S){var c=S.c,cs=serie(MT,13,.45,.6),G=graf(S,cs,mez(30,45,sg(S.p,.05,.6)));nivel(c,G,105,AM,1,{x0:10,g:2});nivel(c,G,112.8,DN,sg(S.p,.1,.35),{g:2.6,txt:'Stop: si vuelve acá, la idea murió',z:S.z*.85,izq:true});
  texto(S,'Ningún patrón es seguro',S.W/2,G.b.y+G.b.h+(S.pt?-S.z*.6:S.z*1.6),AM,sg(S.p,.5,.6))}
 ]},
{id:'riesgo',tec:1,cat:'riesgo',n:'Stop, objetivo y R',corto:'Riesgo',sub:'Cuánto arriesgás para ganar cuánto',mini:2,
 tit:['Tres precios antes de entrar','Dónde va el stop','Una R','Ganar acertando menos de la mitad','El stop decide el tamaño','Primero el riesgo'],
 t:['Antes de entrar, todo plan tiene tres precios: dónde entrás, dónde salís si te equivocás y dónde tomás ganancia.',
  'El stop va donde la idea deja de tener sentido: debajo del soporte, no en un número cualquiera.',
  'Lo que arriesgás entre la entrada y el stop es una R. Si el objetivo está al doble de distancia, buscás dos R.',
  'Con objetivos de dos R, podés equivocarte seis de cada diez veces y aun así terminar ganando.',
  'El tamaño sale del stop: si el stop es más ancho, operás menos lotes. Así la pérdida máxima es siempre la misma.',
  'Primero el riesgo, después la ganancia. Así te quedás en el juego el tiempo suficiente para mejorar.'],
 claves:['Entrada, stop y objetivo se deciden antes de entrar.','1R es lo que perdés si sale mal. Medí todo en R.','La calculadora de Valenttiel te da los lotes exactos para tu stop.'],
 trampa:'Mover el stop más lejos cuando el precio se acerca. Convierte una pérdida chica en una grande.',
 practica:'rr',
 q:[['Entrada 100, stop 98, objetivo 106. ¿Cuántas R buscás?',['1R','2R','3R'],2,'Arriesgás 2 para ganar 6: tres veces lo arriesgado.'],
  ['¿Dónde conviene el stop?',['Donde la idea deja de tener sentido','En un número redondo','Lo más lejos posible'],0,'Por ejemplo, debajo del soporte.'],
  ['Si el stop es el doble de ancho, para arriesgar lo mismo…',['Operás el doble de lotes','Operás la mitad de lotes','No cambia nada'],1,'La pérdida máxima queda igual.']],
 esc:[
 function(S){var c=S.c,cs=serie(RIES,91,.5,.7),G=graf(S,cs,23);[[103,INK,'Entrada 103',.06],[99,DN,'Stop 99',.3],[111,UP,'Objetivo 111',.54]].forEach(function(r){nivel(c,G,r[0],r[1],sg(S.p,r[3],r[3]+.15),{x0:22,x1:cs.length-1,g:2.4,dash:false,txt:r[2],z:S.z*.9})})},
 function(S){var c=S.c,cs=serie(RIES,91,.5,.7),G=graf(S,cs,23,{antes:function(G){nivel(c,G,100,UP,1,{zona:.6,dash:false,g:0,al:0})}});pastilla(c,'Soporte',G.b.x+6,G.y(100)+S.z*1.7,UP,S.z*.8,'left',1);
  var m=sg(S.p,.1,.25)*(1-sg(S.p,.42,.5));nivel(c,G,101.6,DN,m,{x0:20,x1:cs.length-1,g:2,txt:'Acá no: adentro del ruido ✗',z:S.z*.85});nivel(c,G,99,UP,sg(S.p,.5,.65),{x0:20,x1:cs.length-1,g:2.4,dash:false,txt:'Debajo del soporte ✓',z:S.z*.85,abajo:true});nivel(c,G,103,INK,1,{x0:22,x1:cs.length-1,g:2,dash:false})},
 function(S){var c=S.c,cs=serie(RIES,91,.5,.7),h=mez(23,cs.length,sg(S.p,.45,.9)),G=graf(S,cs,h),x0=G.x(22),x1=G.x(cs.length-1),a=sg(S.p,.05,.2),b=sg(S.p,.2,.35);
  c.fillStyle=rgba(DN,.22*a);c.fillRect(x0,G.y(103),(x1-x0),G.y(99)-G.y(103));c.fillStyle=rgba(UP,.2*b);c.fillRect(x0,G.y(111),(x1-x0),G.y(103)-G.y(111));velas(c,G,h);
  pastilla(c,'1R',x1-S.z,(G.y(103)+G.y(99))/2,DN,S.z,'right',a);pastilla(c,'2R',x1-S.z,(G.y(111)+G.y(103))/2,UP,S.z,'right',b);var k=hastaPrecio(cs,h,110.9,true,23);if(k>0)pastilla(c,'Objetivo: +2R',G.x(k),G.y(111)-S.z*2,UP,S.z,'center',sg(h,k,k+2))},
 function(S){var c=S.c,b=S.caja,R=[0,1,0,0,1,0,0,1,0,1],col=S.pt?5:10,w=Math.min(b.w/col*.86,S.z*5),g=(b.w-w*col)/(col+1),tot=0,n=0;R.forEach(function(x,i){var a=rebote(sg(S.p,.05+i*.065,.15+i*.065));if(a<=0)return;n++;tot+=x?2:-1;var cx=b.x+g+(i%col)*(w+g),cy=b.y+b.h*.14+Math.floor(i/col)*w*1.25;c.save();c.translate(cx+w/2,cy+w/2);c.scale(a,a);rr(c,-w/2,-w/2,w,w,w*.22);c.fillStyle=rgba(x?UP:DN,.2);c.fill();c.strokeStyle=x?UP:DN;c.lineWidth=2;c.stroke();tx(c,x?'+2R':'−1R',0,w*.12,w*.27,INK,'center',600);c.restore()});
  var y=b.y+b.h*.14+Math.ceil(10/col)*w*1.25+S.z*3.6;tx(c,(tot>0?'+':tot<0?'−':'')+Math.abs(tot)+'R',S.W/2,y,S.z*3.4,tot>0?UP:tot<0?DN:INK,'center',600);texto(S,n===10?'Acertaste 4 de 10 y ganaste':'Operación '+n+' de 10',S.W/2,y+S.z*2.4,MUT,1,S.z*1.05)},
 function(S){var c=S.c,b=S.caja,z=S.z;[[20,'0,5 lotes',.05],[40,'0,25 lotes',.35]].forEach(function(r,i){var a=sg(S.p,r[2],r[2]+.15),y=b.y+b.h*(.18+i*.36),wm=b.w*.42,w=wm*r[0]/40*eo(a);if(a<=0)return;c.globalAlpha=a;tx(c,'Stop de '+r[0]+' pips',b.x,y,z*1.05,INK,'left',600);rr(c,b.x,y+z*.8,w,z*1.1,z*.55);c.fillStyle=rgba(DN,.6);c.fill();
   tx(c,r[1],b.x+b.w,y+z*1.7,z*1.6,S.A,'right',600);tx(c,'Pérdida máxima: USD 100',b.x+b.w,y+z*3.3,z*.9,MUT,'right',500);c.globalAlpha=1});texto(S,'Riesgo fijo, tamaño variable',S.W/2,b.y+b.h*.94,AM,sg(S.p,.65,.75))},
 function(S){var c=S.c,b=S.caja,cx=S.W/2,cy=b.y+b.h*.42,r=Math.min(b.w,b.h)*.26,e=rebote(sg(S.p,.05,.35));c.save();c.translate(cx,cy);c.scale(e,e);c.beginPath();c.moveTo(0,-r);c.quadraticCurveTo(r*.9,-r*.8,r*.85,-r*.55);c.quadraticCurveTo(r*.85,r*.5,0,r);c.quadraticCurveTo(-r*.85,r*.5,-r*.85,-r*.55);c.quadraticCurveTo(-r*.9,-r*.8,0,-r);c.closePath();c.fillStyle=gr(c,-r,-r,r,r,rgba(S.A,.35),rgba(S.B,.15));c.fill();c.strokeStyle=S.A;c.lineWidth=3;c.stroke();tx(c,'1R',0,r*.16,r*.5,INK,'center',600);c.restore();
  texto(S,'Primero el riesgo. Después, la ganancia.',cx,cy+r+S.z*2.6,INK,sg(S.p,.35,.45),S.z*1.2)}
 ]}];
var MEDI=[[0,100],[8,107],[13,102],[22,112],[28,106.5],[38,118],[44,112.5],[55,124]],RIES=[[0,108],[6,100],[12,107],[18,100.4],[22,103],[34,112]];
function pico(v,a,b,max){var k=-1;for(var i=a;i<=b&&i<v.length;i++){if(v[i]==null)continue;if(k<0||(max?v[i]>v[k]:v[i]<v[k]))k=i}return k}
function anat(S,o,h,l,cc){
  var c=S.c,b=S.caja,y=function(v){return b.y+b.h*(1-(v-92)/(112-92))},cx=S.W*(S.pt?.34:.4),bw=Math.min(b.w*.13,b.h*.26),e=rebote(sg(S.p,.02,.2)),z=S.z,arr=cc>o;
  c.save();c.translate(cx,y(102));c.scale(e,e);c.translate(-cx,-y(102));velaG(c,cx,bw,y,o,h,l,cc);c.restore();
  [['Máximo',h,0],[arr?'Cierre':'Apertura',Math.max(o,cc),1],[arr?'Apertura':'Cierre',Math.min(o,cc),1],['Mínimo',l,0]].forEach(function(r,k){rotulo(c,cx+(r[2]?bw*.5:0),y(r[1]),cx+bw*1.25,r[0],r[2]?(arr?UP:DN):MUT,sg(S.p,.18+k*.12,.28+k*.12),z)});
  var a=sg(S.p,.7,.8),xl=cx-bw*.8;if(a>0){c.save();c.globalAlpha=a;c.strokeStyle=rgba(INK,.5);c.lineWidth=1.4;c.beginPath();c.moveTo(xl+6,y(Math.max(o,cc)));c.lineTo(xl,y(Math.max(o,cc)));c.lineTo(xl,y(Math.min(o,cc)));c.lineTo(xl+6,y(Math.min(o,cc)));c.stroke();c.restore();
   tx(c,'Cuerpo',xl-z*.5,y((o+cc)/2)+z*.35,z,INK,'right',600);tx(c,'Mecha',xl-z*.5,y((h+Math.max(o,cc))/2)+z*.35,z*.9,MUT,'right',500);tx(c,'Mecha',xl-z*.5,y((l+Math.min(o,cc))/2)+z*.35,z*.9,MUT,'right',500);c.globalAlpha=1}
}
function zoom(S,cs,k,txt,col){
  var c=S.c,b=S.caja,G=marco(cs,{x:b.x+b.w*(S.pt?0:.16),y:b.y,w:b.w*(S.pt?1:.68),h:b.h},[104,115]),h=mez(1,cs.length,sg(S.p,.04,.7));rejilla(c,G);nivel(c,G,110,AM,1,{g:2,txt:'Nivel',z:S.z*.85,izq:true});velas(c,G,h);
  var a=sg(h,k+1,k+1.6);if(a>0){var v=cs[k];anillo(c,G.x(k),G.y(v.c),S.z*.9,col,a);pastilla(c,txt,G.x(k)+G.bw*.8,col===UP?G.y(v.c)-S.z*2.6:G.y(v.h),col,S.z,'left',a);pastilla(c,'Cierre',G.x(k)-G.bw,G.y(v.c),INK,S.z*.75,'right',a)}
}

/* ---- setups de entrada: seis escenas iguales para todos (contexto, zona, gatillo, plan, resultado, cuándo no) ---- */
function f1(x){return x.toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1})}
function preparar(l){
  if(l._st)return l._st;var st=l.setup(),cs=st.cs,i;st.hit=cs.length-1;st.corto=st.o<st.e;for(i=st.gat+1;i<cs.length;i++)if(st.corto?cs[i].l<=st.o:cs[i].h>=st.o){st.hit=i;break}
  st.no=st.no();l._st=st;return st;
}
function zonaDib(S,G,z,txt,a){if(!z||a<=0)return;nivel(S.c,G,z[0],z[3]||UP,a,{x0:z[2],zona:z[1],dash:false,g:0,al:0,za:.17});pastilla(S.c,txt,z[2]!=null?G.x(z[2])+4:G.b.x+6,z[2]!=null?G.y(z[0]+z[1])-S.z*1.5:G.y(z[0]-z[1])+S.z*1.6,UP,S.z*.85,'left',sg(a,.4,1))}
function gS(S,st,h,k){var G=graf(S,st.cs,h,{ext:[st.s,st.o],antes:function(G){zonaDib(S,G,st.zona,k<=2?st.zonaTxt:'',k===0?0:1)}});if(st.extra)st.extra(S,G,h,k);return G}
function lineasPlan(S,G,st,a,b,cc,izq){
  var x=st.gat,R=Math.round((st.o-st.e)/(st.e-st.s)*10)/10;
  [[st.e,INK,'Entrada '+f1(st.e),a],[st.s,DN,'Stop '+f1(st.s),b],[st.o,UP,'Objetivo '+f1(st.o)+' ('+String(R).replace('.',',')+'R)',cc]].forEach(function(q,j){nivel(S.c,G,q[0],q[1],q[3],{x0:x,g:2.4,dash:false,txt:q[2],z:S.z*.85,abajo:st.corto?j!==1:j===1,izq:izq})});
}
var SET=[
function(S){var st=preparar(S.l),h=ver(S,st.ctx+1,.03,.75),G=gS(S,st,h,0);pastilla(S.c,st.ctxTxt,G.b.x+G.b.w/2,G.b.y-S.z*2.1,S.A,S.z*.95,'center',sg(S.p,.55,.65))},
function(S){var st=preparar(S.l),h=mez(st.ctx+1,st.gat,sg(S.p,.04,.7)),G=gS(S,st,h,1)},
function(S){var st=preparar(S.l),h=mez(st.gat,st.gat+1,sg(S.p,.08,.45)),G=gS(S,st,h,2),v=st.cs[st.gat],a=sg(S.p,.45,.55);anillo(S.c,G.x(st.gat),G.y((v.h+v.l)/2),Math.max(S.z*1.3,(G.y(v.l)-G.y(v.h))*.75),AM,a);pastilla(S.c,st.gatTxt,G.x(st.gat),G.y(v.l)+S.z*2.6,AM,S.z*.92,'center',a)},
function(S){var st=preparar(S.l),G=gS(S,st,st.gat+1,3);lineasPlan(S,G,st,sg(S.p,.04,.2),sg(S.p,.25,.42),sg(S.p,.5,.68))},
function(S){var st=preparar(S.l),c=S.c,h=mez(st.gat+1,st.hit+1,sg(S.p,.04,.72)),G=graf(S,st.cs,h,{ext:[st.s,st.o],antes:function(G){zonaDib(S,G,st.zona,'',1);var x0=G.x(st.gat),x1=G.b.x+G.b.w;c.fillStyle=rgba(DN,.18);c.fillRect(x0,G.y(st.e),x1-x0,G.y(st.s)-G.y(st.e));c.fillStyle=rgba(UP,.16);c.fillRect(x0,G.y(st.o),x1-x0,G.y(st.e)-G.y(st.o))}});
  if(st.extra)st.extra(S,G,h,4);lineasPlan(S,G,st,1,1,1,true);var a=sg(h,st.hit+.6,st.hit+1.4);if(a>0){pop(c,G.x(st.hit),G.y(st.o),S.z*1.3,UP,a);pastilla(c,'Objetivo alcanzado: +'+String(Math.round((st.o-st.e)/(st.e-st.s)*10)/10).replace('.',',')+'R ✓',G.b.x+G.b.w/2,G.b.y-S.z*2.1,UP,S.z*1.05,'center',a)}},
function(S){var st=preparar(S.l),n=st.no,c=S.c,h=ver(S,n.cs.length,.03,.68),G=graf(S,n.cs,h,{antes:function(G){zonaDib(S,G,n.zona||st.zona,'',n.zona===null?0:1)}});if(n.extra)n.extra(S,G,h);var a=sg(S.p,.7,.8);
  if(n.i>=0){anillo(c,G.x(n.i),G.y(n.cs[n.i].c),S.z*1.2,DN,a);pastilla(c,n.txt,G.x(n.i),G.y(n.cs[n.i].c)+S.z*2.6,DN,S.z*.92,'center',a)}pastilla(c,'✗ No hay setup',G.b.x+G.b.w/2,G.b.y-S.z*2.1,DN,S.z*1.05,'center',sg(S.p,.8,.9))}
];
function piso(S,G,pr,txt,col,a){nivel(S.c,G,pr,col,a,{g:2,txt:txt,z:S.z*.8,izq:true,abajo:col===UP})}
L.push(
{id:'pullback',tec:1,cat:'setups',n:'Setup: pullback en tendencia',corto:'Pullback',sub:'Comprar el retroceso, no la euforia',mini:4,
 tit:['El contexto: tendencia alcista','La zona: el viejo techo','El gatillo: vela de rechazo','El plan: entrada, stop y objetivo','Así se ve cuando sale','Cuándo no hay setup'],
 t:['El setup más clásico: comprar el retroceso dentro de una tendencia. Primero, que haya escalera: máximos y mínimos más altos.',
  'Esperás que el precio vuelva a una zona clara. Acá, el viejo techo, que ahora debería funcionar como piso.',
  'En la zona no entrás a ciegas: esperás una vela que muestre compradores, como un martillo o una vela verde fuerte.',
  'Entrada apenas arriba de esa vela. Stop debajo de su mínimo y de la zona. Objetivo: el doble de lo que arriesgás.',
  'Si la tendencia sigue, el precio retoma la escalera y llega al objetivo. Ganás dos R.',
  'Si el precio cierra debajo de la zona, la idea murió antes de empezar. Sin vela de rechazo, no hay entrada.'],
 claves:['Tendencia, zona y gatillo: los tres juntos.','El stop va donde la idea deja de valer: debajo de la vela y de la zona.','Si no aparece el gatillo, no hay operación. Esperar también es operar.'],
 trampa:'Comprar apenas el precio toca la zona, sin esperar la vela que confirma que aparecieron compradores.',
 check:['La tendencia es clara: máximos y mínimos más altos','El precio volvió a una zona marcada antes','Apareció una vela de rechazo en la zona','El stop va debajo de esa vela y de la zona','El objetivo está al menos a 2R'],
 practica:['setup','stop'],
 q:[['¿Qué tres cosas necesita este setup?',['Tendencia, zona y gatillo','Una noticia, el RSI y suerte','Solo una vela verde'],0,'Si falta una, no hay setup.'],
  ['¿Dónde va el stop?',['Debajo de la vela gatillo y de la zona','Arriba de la entrada','En un número redondo cualquiera'],0,'Ahí la idea deja de tener sentido.'],
  ['El precio cierra con fuerza debajo de la zona. ¿Qué hacés?',['Compro igual, ya va a subir','Nada: no hay setup y espero','Compro el doble'],1,'La zona no aguantó: la idea murió.']],
 setup:function(){var P=[[0,100],[6,108],[10,104],[17,113],[21,109],[27,116.5],[32,113.2],[45,121.5]],cs=serieLimpia(P,131,.5,.7);fijar(cs,32,{o:Math.min(cs[31].c,113.7),h:114.6,l:112.4,c:114.4});
  return{cs:cs,ctx:27,gat:32,zona:[113,.6],zonaTxt:'Viejo techo, nuevo piso',ctxTxt:'Máximos y mínimos más altos',gatTxt:'Martillo en la zona',e:114.8,s:111.9,o:120.6,
   extra:function(S,G,h,k){if(k===0){var H=[[6,108,'',true,UP],[17,113,'',true,UP],[27,116.5,'',true,UP]],B=[[10,104,'',false,AQ],[21,109,'',false,AQ]];escalon(S,G,h,H,UP);escalon(S,G,h,B,AQ);marcas(S,G,h,H.concat(B))}},
   no:function(){var c2=serieLimpia([[0,100],[6,108],[10,104],[17,113],[21,109],[27,116.5],[34,109.5],[41,107.5]],133,.5,.7);return{cs:c2,i:hastaPrecio(c2,99,112.2,false,28),txt:'Cerró debajo de la zona'}}}}},
{id:'retesteo',tec:1,cat:'setups',n:'Setup: ruptura y retesteo',corto:'Retesteo',sub:'Entrar cuando el nivel ya cambió de rol',mini:4,
 tit:['El contexto: un rango','Rompe y cierra afuera','El gatillo: rechazo en el retesteo','El plan: entrada, stop y objetivo','Así se ve cuando sale','Cuándo no hay setup'],
 t:['Este setup aprovecha un nivel roto. Primero, un rango claro: un techo que frenó al precio varias veces.',
  'El precio rompe el techo y la vela cierra afuera. Todavía no entrás: perseguir la vela es caro y arriesgado.',
  'Esperás que vuelva a probar el nivel desde arriba. Si aparece una vela de rechazo, el viejo techo ya funciona como piso.',
  'Entrada arriba de la vela de rechazo. Stop debajo del nivel. Objetivo: dos veces lo que arriesgás.',
  'Con el nivel defendido, el precio sigue su camino y alcanza el objetivo.',
  'Si después de romper vuelve a cerrar adentro del rango, fue una trampa. No hay retesteo válido: se descarta.'],
 claves:['Ruptura con cierre, retesteo y vela de rechazo.','El retesteo te da un stop más corto que entrar en la ruptura.','No siempre vuelve: a veces el setup se pierde, y está bien.'],
 trampa:'Entrar en la vela de ruptura por miedo a quedarte afuera.',
 check:['Había un techo claro, tocado varias veces','Una vela cerró afuera del techo','El precio volvió a probar el nivel desde arriba','Apareció una vela de rechazo en el nivel','El objetivo está al menos a 2R'],
 practica:['setup','stop','ruptura'],
 q:[['¿Cuándo entrás en este setup?',['En la vela que rompe','Cuando vuelve al nivel y aparece un rechazo','Antes de que rompa'],1,'Esperás que el nivel cambie de rol.'],
  ['¿Dónde va el stop?',['Debajo del nivel roto','Arriba del último máximo','No hace falta'],0,'Si vuelve abajo del nivel, la idea murió.'],
  ['Rompe y al rato cierra adentro del rango. Eso es…',['Un retesteo perfecto','Una posible trampa: se descarta','Señal de comprar más'],1,'El nivel no cambió de rol.']],
 setup:function(){var cs=serieLimpia([[0,104],[5,110],[10,101],[16,110],[21,102],[27,110],[31,105],[34,116],[38,110.4],[50,124]],141,.5,.7);fijar(cs,38,{o:Math.min(cs[37].c,111),h:112.1,l:109.8,c:111.9});
  return{cs:cs,ctx:31,gat:38,zona:[110,.5],zonaTxt:'Techo roto',ctxTxt:'Un techo que frenó tres veces',gatTxt:'Rechazo en el nivel',e:112.4,s:109.3,o:118.6,
   extra:function(S,G,h,k){if(k===0){piso(S,G,110,'Techo',DN,sg(S.p,.05,.25));[5,16,27].forEach(function(i){pop(S.c,G.x(i),G.y(110),S.z*1.1,DN,sg(h,i+.5,i+2.5))})}if(k===1){var b=hastaPrecio(G.cs,h,110.6,true,31);if(b>0)pastilla(S.c,'Cerró afuera',G.x(b),G.y(G.cs[b].h)-S.z*1.8,UP,S.z*.85,'center',sg(h,b+.6,b+1.6))}},
   no:function(){var c2=serieLimpia([[0,104],[5,110],[10,101],[16,110],[21,102],[27,110],[31,105],[34,113],[38,106],[44,103]],143,.5,.7);return{cs:c2,i:hastaPrecio(c2,99,109.2,false,34),txt:'Volvió adentro del rango'}}}}},
{id:'barrida',tec:1,cat:'setups',n:'Setup: falsa ruptura',corto:'Falsa ruptura',sub:'Usar la trampa a tu favor',mini:4,
 tit:['El contexto: un rango claro','La barrida: rompe con la mecha','El gatillo: cierra adentro','El plan: entrada, stop y objetivo','Así se ve cuando sale','Cuándo no hay setup'],
 t:['Este setup usa las trampas a tu favor. Necesitás un rango claro, con un piso respetado varias veces.',
  'El precio perfora el piso con una mecha. Muchos venden, y saltan los stops de los que compraron abajo.',
  'Pero la vela cierra de vuelta adentro del rango. Esa es la señal: la ruptura falló.',
  'Entrada al cierre de esa vela. Stop debajo de la mecha. Objetivo: dos R, sin pasar el otro lado del rango.',
  'Los atrapados salen con pérdida y empujan el precio hacia el otro lado del rango.',
  'Si la vela cierra afuera del piso, no es trampa: es una ruptura de verdad. Ahí no se compra.'],
 claves:['La clave es el cierre de vuelta adentro del rango.','El stop va debajo de la mecha: si la pierde, la idea murió.','El otro lado del rango es un objetivo natural.'],
 trampa:'Comprar mientras la mecha todavía se está formando. Si cierra abajo, era una ruptura real.',
 check:['Hay un rango claro, con piso tocado varias veces','La vela perforó el piso solo con la mecha','La vela cerró de vuelta adentro del rango','El stop va debajo de la mecha','El objetivo entra antes del techo del rango'],
 practica:['ruptura','stop','setup'],
 q:[['¿Cuál es la señal de este setup?',['Que la vela cierre debajo del piso','Que la mecha perfore el piso y la vela cierre adentro','Que el RSI llegue a 50'],1,'La ruptura falló: es una trampa.'],
  ['¿Dónde va el stop?',['Debajo de la mecha','En el medio del rango','Arriba del techo'],0,'Si el precio vuelve a perder la mecha, la idea murió.'],
  ['La vela cierra con fuerza debajo del piso. Es…',['Una falsa ruptura','Una ruptura real: no se compra','Un doble piso'],1,'El cierre quedó afuera.']],
 setup:function(){var cs=serieLimpia([[0,106],[5,100],[10,109],[16,100.2],[21,109.5],[27,100.4],[31,105],[34,101],[46,110.4]],151,.5,.7);var o=cs[34].c;fijar(cs,35,{o:o,h:Math.max(o,101.9)+.2,l:98.3,c:101.9});
  return{cs:cs,ctx:27,gat:35,zona:[100,.5],zonaTxt:'Piso del rango',ctxTxt:'Un piso respetado tres veces',gatTxt:'Mecha abajo, cierre adentro',e:101.9,s:97.8,o:110.1,
   extra:function(S,G,h,k){if(k<2)piso(S,G,110,'Techo',DN,1)},
   no:function(){var c2=serieLimpia([[0,106],[5,100],[10,109],[16,100.2],[21,109.5],[27,100.4],[31,105],[34,101],[37,96.5],[44,94]],153,.5,.7);return{cs:c2,i:hastaPrecio(c2,99,99.3,false,33),txt:'Cerró afuera: ruptura real'}}}}},
{id:'rebote-media',tec:1,cat:'setups',n:'Setup: rebote en la media',corto:'Rebote en la media',sub:'La media como piso que se mueve',mini:4,
 tit:['El contexto: media que sube','El retroceso a la media','El gatillo: rebota con fuerza','El plan: entrada, stop y objetivo','Así se ve cuando sale','Cuándo no hay setup'],
 t:['Un setup simple para tendencias: el precio arriba de la media de veinte, y la media apuntando para arriba.',
  'Esperás un retroceso hasta la media. En tendencia, suele funcionar como un piso que se mueve.',
  'Cuando toca la media aparece una vela verde que rebota. Ese es el gatillo.',
  'Entrada arriba de esa vela. Stop debajo de su mínimo. Objetivo: dos veces lo arriesgado.',
  'El precio retoma la tendencia y llega al objetivo.',
  'Si la media está plana y el precio la cruza todo el tiempo, no hay tendencia. Este setup no se usa en rangos.'],
 claves:['Media con pendiente: sin pendiente no hay setup.','Mejor en el primer o segundo retroceso a la media, no en el quinto.','La vela gatillo tiene que cerrar arriba de la media.'],
 trampa:'Usarlo en un mercado lateral, donde la media está plana y el precio la cruza todo el tiempo.',
 check:['La media de 20 apunta para arriba','El precio retrocedió hasta la media','Una vela verde rebotó y cerró arriba de la media','El stop va debajo de esa vela','El objetivo está al menos a 2R'],
 practica:['media','setup','stop'],
 q:[['¿Qué tiene que hacer la media para usar este setup?',['Estar plana','Apuntar a favor de la operación','Cruzarse con el precio seguido'],1,'Sin pendiente no hay tendencia.'],
  ['¿Cuál es el gatillo?',['Que el precio toque la media','Una vela que rebota y cierra arriba de la media','Que pase una hora'],1,'Tocar no alcanza: tiene que rebotar.'],
  ['La media está plana y el precio la cruza todo el tiempo. ¿Qué hacés?',['Uso el setup igual','No lo uso: no hay tendencia','Pongo el stop más cerca'],1,'Es un rango: las medias engañan.']],
 setup:function(){var cs=serieLimpia([[0,100],[8,107],[13,102],[22,112],[29,108],[42,120]],161,.6,.8),m=media(cs,20),mv=m[29];fijar(cs,29,{o:mv+.5,h:mv+1.9,l:mv-.3,c:mv+1.7});var m2=media(cs,20),v=cs[29],e=v.h+.2,s=v.l-.4;
  return{cs:cs,ctx:22,gat:29,zona:null,ctxTxt:'Precio arriba de una media que sube',gatTxt:'Rebota en la media',e:e,s:s,o:e+2*(e-s),
   extra:function(S,G,h,k){curva(S.c,G,m2,0,h,S.A,3);pastilla(S.c,'Media de 20',G.x(24),G.y(m2[24])+S.z*2.2,S.A,S.z*.8,'center',k===0?sg(S.p,.4,.5):k===1?1:0)},
   no:function(){var c2=serieLimpia([[0,105],[4,101],[8,107],[12,102],[16,108],[20,101],[24,107],[28,102],[32,108],[36,101],[40,106],[44,103]],163,.7,.9),m3=media(c2,20);return{cs:c2,zona:null,i:-1,txt:'',extra:function(S,G,h){curva(S.c,G,m3,0,h,S.A,3);pastilla(S.c,'Media plana: sin tendencia',G.b.x+G.b.w/2,G.y(m3[c2.length-1])+S.z*3,AM,S.z*.92,'center',sg(S.p,.6,.7))}}}}}}
);
/* Datos de setups que sirven para comprar o, dados vuelta, para vender. */
function pullbackData(cor){var m=110,f=function(x){return cor?2*m-x:x},P=[[0,100],[6,108],[10,104],[17,113],[21,109],[27,116.5],[32,113.2],[45,121.5]],cs=serieLimpia(P,131,.5,.7);fijar(cs,32,{o:Math.min(cs[31].c,113.7),h:114.6,l:112.4,c:114.4});if(cor)cs=voltear(cs,m);
  return{cs:cs,ctx:27,gat:32,zona:[f(113),.6],zonaTxt:cor?'Viejo piso, nuevo techo':'Viejo techo, nuevo piso',ctxTxt:cor?'Máximos y mínimos más bajos':'Máximos y mínimos más altos',gatTxt:cor?'Estrella fugaz en la zona':'Martillo en la zona',e:f(114.8),s:f(111.9),o:f(120.6),
   extra:function(S,G,h,k){if(k===0){var H=[[6,f(108),'',true,cor?DN:UP],[17,f(113),'',true,cor?DN:UP],[27,f(116.5),'',true,cor?DN:UP]],B=[[10,f(104),'',false,AQ],[21,f(109),'',false,AQ]];escalon(S,G,h,H,cor?DN:UP);escalon(S,G,h,B,AQ);marcas(S,G,h,H.concat(B))}},
   no:function(){var c2=serieLimpia([[0,100],[6,108],[10,104],[17,113],[21,109],[27,116.5],[34,109.5],[41,107.5]],133,.5,.7);if(cor)c2=voltear(c2,m);return{cs:c2,i:hastaPrecio(c2,99,f(112.2),cor,28),txt:cor?'Cerró arriba de la zona':'Cerró debajo de la zona'}}}}
function dobleData(cor){var m=106,f=function(x){return cor?2*m-x:x},cs=serieLimpia([[0,112],[8,100],[14,106],[22,100.2],[28,108],[31,106.3],[44,114.5]],171,.5,.7);fijar(cs,31,{o:Math.min(cs[30].c,106.9),h:107.6,l:105.7,c:107.4});if(cor)cs=voltear(cs,m);
  return{cs:cs,ctx:24,gat:31,zona:[m,.45],zonaTxt:'Cuello',ctxTxt:cor?'Dos intentos de subir que fallan':'Dos intentos de bajar que fallan',gatTxt:'Rechazo en el cuello',e:f(107.8),s:f(105.2),o:f(113),
   extra:function(S,G,h,k){if(k===0){marcas(S,G,h,[[8,f(100),'1.º',cor,cor?DN:UP],[22,f(100.2),'2.º',cor,cor?DN:UP]]);nivel(S.c,G,f(100),cor?DN:UP,sg(h,22,25),{x0:4,x1:26,g:1.6})}
    if(k===1){var b=hastaPrecio(G.cs,h,f(106.6),!cor,23);if(b>0)pastilla(S.c,'Rompió el cuello',G.x(b),cor?G.y(G.cs[b].l)+S.z*1.8:G.y(G.cs[b].h)-S.z*1.8,cor?DN:UP,S.z*.85,'center',sg(h,b+.6,b+1.6))}},
   no:function(){var c2=serieLimpia([[0,112],[8,100],[14,106],[22,100.2],[26,105.6],[33,98]],173,.5,.7);if(cor)c2=voltear(c2,m);return{cs:c2,zona:[m,.45],i:hastaPrecio(c2,99,f(99.5),cor,26),txt:cor?'No rompió el cuello y superó el techo':'No rompió el cuello y perdió el piso'}}}}
function banderaData(){var cs=serieLimpia([[0,100],[4,101],[12,112],[15,110.6],[17,111.4],[20,109.8],[22,110.3],[23,109.4],[36,121]],181,.35,.45),o=cs[23].c;fijar(cs,24,{o:o,h:112.3,l:Math.min(o,109.6)-.1,c:112});var top=function(i){return 112.2-.17*(i-12)};
  return{cs:cs,ctx:12,gat:24,zona:null,ctxTxt:'Un impulso fuerte: el mástil',gatTxt:'Rompe la bandera con cierre',e:112.5,s:108.9,o:119.7,
   extra:function(S,G,h,k){var c=S.c;if(k===0){var a=sg(h,10,13);flechaL(c,G.x(2),G.y(100.5),G.x(12),G.y(112),S.A,3,a);pastilla(c,'Mástil',G.x(7),G.y(106)-S.z*1.4,S.A,S.z*.85,'right',a)}
    if(k>=1&&k<4){var a2=k===1?sg(h,16,20):1;c.save();c.globalAlpha*=a2;c.strokeStyle=AM;c.lineWidth=2;c.setLineDash([7,6]);c.beginPath();c.moveTo(G.x(12),G.y(top(12)));c.lineTo(G.x(25),G.y(top(25)));c.moveTo(G.x(14),G.y(top(14)-2.5));c.lineTo(G.x(25),G.y(top(25)-2.5));c.stroke();c.restore();pastilla(c,'Bandera',G.x(18),G.y(top(18))-S.z*1.6,AM,S.z*.85,'center',a2)}},
   no:function(){var c2=serieLimpia([[0,100],[4,101],[12,112],[15,110.6],[17,111.4],[20,109.8],[23,109.4],[27,105.5],[34,104]],183,.35,.45);return{cs:c2,zona:null,i:hastaPrecio(c2,99,107.8,false,23),txt:'Se cayó: ya no es bandera'}}}}
L.forEach(function(l){if(l.id==='pullback')l.setup=function(){return pullbackData(false)}});
L.push(
{id:'pullback-venta',tec:1,cat:'setups',n:'Setup: venta en pullback',corto:'Venta en pullback',sub:'Vender el rebote, no el pánico',mini:4,
 tit:['El contexto: tendencia bajista','La zona: el viejo piso','El gatillo: rechazo arriba','El plan: entrada, stop y objetivo','Así se ve cuando sale','Cuándo no hay setup'],
 t:['Es el espejo del pullback alcista: vender el rebote dentro de una tendencia bajista, con máximos y mínimos cada vez más bajos.',
  'Esperás que el precio suba hasta una zona clara. Acá, el viejo piso, que ahora debería funcionar como techo.',
  'En la zona esperás una vela que muestre vendedores, como una estrella fugaz: mecha larga arriba y cierre abajo.',
  'Entrada apenas debajo de esa vela. Stop arriba de su máximo y de la zona. Objetivo: el doble de lo que arriesgás.',
  'Si la tendencia sigue, el precio retoma la bajada y llega al objetivo.',
  'Si el precio cierra arriba de la zona, el viejo piso no aguantó como techo. Sin rechazo, no hay venta.'],
 claves:['Vender también es operar: es el mismo setup, dado vuelta.','El stop va arriba de la vela gatillo y de la zona.','En las caídas el precio suele moverse más rápido: respetá el tamaño.'],
 trampa:'Vender en el medio de una caída fuerte, lejos de cualquier zona, porque parece que no para.',
 check:['La tendencia es bajista: máximos y mínimos más bajos','El precio subió hasta una zona marcada antes','Apareció una vela de rechazo arriba en la zona','El stop va arriba de esa vela y de la zona','El objetivo está al menos a 2R'],
 practica:['setup','stop'],
 q:[['En un pullback bajista, ¿dónde se busca vender?',['En un rebote hacia una zona','Después de una caída enorme','En cualquier vela roja'],0,'Se vende el rebote, no el pánico.'],
  ['¿Dónde va el stop en esta venta?',['Arriba de la vela gatillo y de la zona','Debajo de la entrada','No lleva stop'],0,'Si el precio pasa por arriba, la idea murió.'],
  ['¿Qué vela muestra vendedores en la zona?',['Un martillo','Una estrella fugaz: mecha larga arriba','Cualquier vela verde'],1,'El precio subió y lo empujaron de vuelta.']],
 setup:function(){return pullbackData(true)}},
{id:'bandera',tec:1,cat:'setups',n:'Setup: bandera alcista',corto:'Bandera',sub:'Una pausa antes de seguir',mini:4,
 tit:['El contexto: un impulso fuerte','La bandera: una pausa ordenada','El gatillo: rompe la bandera','El plan: entrada, stop y objetivo','Así se ve cuando sale','Cuándo no hay setup'],
 t:['Después de una subida fuerte, el mercado suele tomar aire. Esa subida rápida se llama mástil.',
  'La pausa forma una bandera: un canal chico y ordenado, apenas inclinado en contra, con velas pequeñas.',
  'El gatillo es una vela que rompe la parte de arriba de la bandera y cierra afuera.',
  'Entrada arriba de esa vela. Stop debajo del mínimo de la bandera. Objetivo: dos veces lo arriesgado.',
  'Si los compradores vuelven, el precio retoma la subida con la fuerza del mástil.',
  'Si la pausa se cae con velas grandes y rompe para abajo, ya no es una bandera: es un giro. No hay compra.'],
 claves:['La bandera tiene que ser chica comparada con el mástil.','Velas pequeñas en la pausa: los vendedores no tienen fuerza.','Sin cierre afuera de la bandera, no hay gatillo.'],
 trampa:'Comprar en el medio de la bandera, antes de que rompa. Si se cae, quedás atrapado adentro.',
 check:['Hubo una subida fuerte y rápida: el mástil','La pausa es chica y ordenada, con velas pequeñas','Una vela cerró arriba de la bandera','El stop va debajo del mínimo de la bandera','El objetivo está al menos a 2R'],
 practica:['setup','stop','tendencia'],
 q:[['¿Qué es el mástil de una bandera?',['La subida fuerte antes de la pausa','La línea del stop','El volumen del día'],0,'Es el impulso que la bandera pausa.'],
  ['¿Cómo tiene que ser la bandera?',['Chica y ordenada, con velas pequeñas','Más grande que el mástil','Con velas rojas enormes'],0,'Muestra que los vendedores no tienen fuerza.'],
  ['¿Cuándo está el gatillo?',['Cuando una vela cierra arriba de la bandera','Apenas empieza la pausa','Cuando el RSI marca 30'],0,'Sin cierre afuera no hay entrada.']],
 setup:banderaData},
{id:'doble-piso',tec:1,cat:'setups',n:'Setup: doble piso confirmado',corto:'Doble piso',sub:'Dos intentos fallidos y un cuello roto',mini:4,
 tit:['El contexto: dos intentos de bajar','Rompe el cuello','El gatillo: retesteo del cuello','El plan: entrada, stop y objetivo','Así se ve cuando sale','Cuándo no hay setup'],
 t:['Después de una caída, el precio intenta perder el mismo piso dos veces y no puede. Los vendedores se quedan sin fuerza.',
  'El patrón se confirma cuando el precio cierra arriba del cuello, el máximo entre los dos pisos.',
  'El setup prudente espera que vuelva a probar el cuello desde arriba y lo rechace.',
  'Entrada arriba de la vela de rechazo. Stop debajo del cuello. Objetivo: dos veces lo arriesgado.',
  'Con el cuello convertido en piso, el precio sigue subiendo hasta el objetivo.',
  'Si no logra romper el cuello y pierde el piso, el patrón falló. Sin cuello roto, no hay compra.'],
 claves:['Sin cuello roto no hay doble piso: hay sospecha.','El retesteo da un stop más corto que entrar en la ruptura.','La altura del patrón da una referencia de objetivo.'],
 trampa:'Comprar en el segundo piso, antes de romper el cuello, convencido de que el patrón ya está.',
 check:['Hubo dos intentos de bajar al mismo piso','Una vela cerró arriba del cuello','El precio volvió a probar el cuello desde arriba','Apareció una vela de rechazo en el cuello','El objetivo está al menos a 2R'],
 practica:['patron','setup','stop'],
 q:[['¿Cuándo se confirma el doble piso?',['En el segundo piso','Cuando cierra arriba del cuello','Cuando el precio baja'],1,'Antes es solo una sospecha.'],
  ['En este setup, ¿dónde va el stop?',['Debajo del cuello','Arriba del cuello','En el primer piso, sin importar la distancia'],0,'Si vuelve abajo del cuello, la idea murió.'],
  ['No rompe el cuello y pierde el piso. ¿Qué hacés?',['Compro igual','Nada: el patrón falló','Compro el doble'],1,'Sin cuello roto no hay setup.']],
 setup:function(){return dobleData(false)}},
{id:'doble-techo',tec:1,cat:'setups',n:'Setup: doble techo confirmado',corto:'Doble techo',sub:'El espejo para vender',mini:4,
 tit:['El contexto: dos intentos de subir','Rompe el cuello','El gatillo: retesteo del cuello','El plan: entrada, stop y objetivo','Así se ve cuando sale','Cuándo no hay setup'],
 t:['Después de una subida, el precio intenta pasar el mismo techo dos veces y no puede. Los compradores se cansan.',
  'El patrón se confirma cuando el precio cierra debajo del cuello, el mínimo entre los dos techos.',
  'El setup prudente espera que vuelva a probar el cuello desde abajo y lo rechace.',
  'Entrada debajo de la vela de rechazo. Stop arriba del cuello. Objetivo: dos veces lo arriesgado.',
  'Con el cuello convertido en techo, el precio sigue bajando hasta el objetivo.',
  'Si no rompe el cuello y supera los techos, el patrón falló. Sin cuello roto, no hay venta.'],
 claves:['Es el doble piso dado vuelta: mismas reglas, para vender.','El retesteo desde abajo es la entrada prudente.','Si supera los dos techos, la idea se terminó.'],
 trampa:'Vender en el segundo techo, antes de que rompa el cuello. Muchas veces el precio termina pasando.',
 check:['Hubo dos intentos de subir al mismo techo','Una vela cerró debajo del cuello','El precio volvió a probar el cuello desde abajo','Apareció una vela de rechazo en el cuello','El objetivo está al menos a 2R'],
 practica:['patron','setup','stop'],
 q:[['¿Cuándo se confirma el doble techo?',['Al tocar el segundo techo','Cuando cierra debajo del cuello','Cuando sube el volumen'],1,'Antes es solo una sospecha.'],
  ['En esta venta, ¿dónde va el stop?',['Arriba del cuello','Debajo de la entrada','Lo más lejos posible'],0,'Si vuelve arriba del cuello, la idea murió.'],
  ['El precio supera los dos techos. ¿Qué pasó?',['El patrón falló','Se confirmó la venta','Nada importante'],0,'Sin cuello roto no hay setup.']],
 setup:function(){return dobleData(true)}}
);
L.forEach(function(l){if(l.cat==='setups')l.esc=SET});
/* ---- Método Valenttiel (SMC + LIT): lecciones anotadas sobre un mismo gráfico ----
   Cada escena dice qué velas mostrar y qué marcas dibujar. Las marcas aparecen en el momento (en) o cuando nace una vela (vi). */
var GOLD='#C9A649';
function velasM(vm){var cs=serieLimpia(vm.pts,vm.sem,vm.ruido==null?.45:vm.ruido,vm.mecha==null?.6:vm.mecha);Object.keys(vm.mods||{}).map(Number).sort(function(a,b){return a-b}).forEach(function(i){fijar(cs,i,vm.mods[i])});return cs}
function marcaM(S,G,cs,h,m){
  if(m.ifn&&m.i==null)m.i=m.ifn(cs);var c=S.c,a=m.vi!=null?sg(h,m.vi+.6,m.vi+1.6):sg(S.p,m.en==null?.15:m.en,(m.en==null?.15:m.en)+.15),col=m.c||GOLD,z=S.z;if(m.fin)a*=1-sg(S.p,m.fin,m.fin+.08);if(a<=0)return;
  var X0=function(i){return i==null?G.b.x:G.x(i)-G.paso/2},X1=function(i){return i==null?G.b.x+G.b.w:G.x(i)+G.paso/2};
  if(m.t==='niv')nivel(c,G,m.p,col,a,{x0:m.x0,x1:m.x1,txt:m.txt,z:z*.85,abajo:m.abajo,izq:m.izq,dash:m.dash});
  else if(m.t==='zona'||m.t==='caja'){var p0=m.p0,p1=m.p1;if(m.t==='caja'){p0=Infinity;p1=-Infinity;for(var k=m.i0;k<=m.i1;k++){p0=Math.min(p0,cs[k].l);p1=Math.max(p1,cs[k].h)}}
    var x0=X0(m.i0),x1=m.t==='caja'?X1(m.i1):X1(m.i1),y0=G.y(Math.max(p0,p1)),y1=G.y(Math.min(p0,p1));c.save();c.globalAlpha*=a;c.fillStyle=rgba(col,.11);c.fillRect(x0,y0,(x1-x0)*eo(a),y1-y0);c.strokeStyle=rgba(col,.42);c.lineWidth=1;c.strokeRect(Math.round(x0)+.5,Math.round(y0)+.5,Math.round((x1-x0)*eo(a)),Math.round(y1-y0));c.restore();
    if(m.txt)pastilla(c,m.txt,m.t==='caja'||m.izq?x0+4:x0+(x1-x0)*eo(a)-6,m.t==='caja'?y0-z*1.5:m.izq?y1+z*1.4:(y0+y1)/2,col,z*.82,m.t==='caja'||m.izq?'left':'right',a)}
  else if(m.t==='marca'){var x=G.x(m.i),y=G.y(m.p);punto(c,x,y,col,4.2*Math.min(1,a*1.5));pastilla(c,m.txt,x,y+(m.arriba?-1:1)*z*1.9,col,z*.82,'center',a)}
  else if(m.t==='anillo'){var x2=G.x(m.i),y2=G.y(m.p);anillo(c,x2,y2,Math.min(z*2,Math.max(z*1.2,G.paso*.9)),col,a);if(m.txt)pastilla(c,m.txt,x2,y2+(m.arriba?-1:1)*z*2.6,col,z*.88,'center',a)}
  else if(m.t==='flecha'){flechaL(c,G.x(m.i0),G.y(m.p0),G.x(m.i1),G.y(m.p1),col,3,a);if(m.txt)pastilla(c,m.txt,G.x(m.i1),G.y(m.p1)+(m.arriba?-1:1)*z*1.9,col,z*.85,'center',sg(a,.7,1))}
  else if(m.t==='top')pastilla(c,m.txt,G.b.x+G.b.w/2,G.b.y-z*2.1,col,z*.95,'center',a);
  else if(m.t==='ses'){var x3=X0(m.i0),x4=X1(m.i1);c.save();c.globalAlpha*=a;c.fillStyle=rgba(col,.09);c.fillRect(x3,G.b.y,x4-x3,G.b.h);c.restore();pastilla(c,m.txt,(x3+x4)/2,G.b.y+G.b.h-z*1.3,col,z*.82,'center',a)}
  else if(m.t==='fib'){var lo=m.p0,hi=m.p1,lv=function(f){return hi-f*(hi-lo)},xa=G.x(m.i1);
    if(m.pd){c.save();c.globalAlpha*=a;c.fillStyle=rgba(DN,.1);c.fillRect(xa,G.y(hi),G.b.x+G.b.w-xa,G.y(lv(.5))-G.y(hi));c.fillStyle=rgba(UP,.1);c.fillRect(xa,G.y(lv(.5)),G.b.x+G.b.w-xa,G.y(lo)-G.y(lv(.5)));c.restore();
      pastilla(c,'Premium: caro',G.b.x+G.b.w-6,(G.y(hi)+G.y(lv(.5)))/2,DN,z*.82,'right',a);pastilla(c,'Descuento: barato',G.b.x+G.b.w-6,(G.y(lv(.5))+G.y(lo))/2,UP,z*.82,'right',a)}
    if(m.ote){var b2=sg(S.p,m.ote,m.ote+.15);c.save();c.globalAlpha*=b2;c.fillStyle=rgba(GOLD,.22);c.fillRect(xa,G.y(lv(.62)),G.b.x+G.b.w-xa,G.y(lv(.79))-G.y(lv(.62)));c.restore();pastilla(c,'Zona óptima 0,62–0,79',xa+6,G.y(lv(.79))+z*1.5,GOLD,z*.82,'left',b2)}
    (m.niv||[0,.5,1]).forEach(function(f){var y=G.y(lv(f));c.save();c.globalAlpha*=a*.85;c.strokeStyle=f===.5?GOLD:'rgba(178,181,190,.6)';c.lineWidth=1;c.setLineDash(f===.5?[6,5]:[]);c.beginPath();c.moveTo(xa,y);c.lineTo(G.b.x+G.b.w,y);c.stroke();c.restore();
      c.save();c.globalAlpha*=a;tx(c,String(f).replace('.',','),m.i0===m.i1?xa+G.paso*.55:xa-4,y+z*.3,z*.78,TVTX,m.i0===m.i1?'left':'right',500);c.restore()});
    c.save();c.globalAlpha*=a*.5;c.strokeStyle=TVTX;c.setLineDash([3,4]);c.beginPath();c.moveTo(G.x(m.i0),G.y(lo));c.lineTo(G.x(m.i1),G.y(hi));c.stroke();c.restore()}
  else if(m.t==='lista')m.items.forEach(function(s,k){var b3=sg(S.p,(m.en||.1)+k*.14,(m.en||.1)+k*.14+.12);pastilla(c,s,m.izq?G.b.x+6:G.b.x+G.b.w-6,G.b.y+z*(3.3+k*2.3),m.cs?m.cs[k]:col,z*.88,m.izq?'left':'right',b3)});
}
function escM(i){return function(S){var l=S.l;if(!l._cs)l._cs=velasM(l.vm);var cs=l._cs,sc=l.sc[i],h=mez(sc.h[0]+1,sc.h[1]+1,sg(S.p,.04,.75)),G=graf(S,cs,h,{ext:l.vm.ext,antes:function(G){(sc.an||[]).forEach(function(m){if(m.t==='ses'||m.t==='zona'||m.t==='fib')marcaM(S,G,cs,h,m)})}});
  (sc.an||[]).forEach(function(m){if(m.t!=='ses'&&m.t!=='zona'&&m.t!=='fib')marcaM(S,G,cs,h,m)})}}
function lecM(o){o.tec=1;o.cat='metodo';o.esc=[0,1,2,3,4,5].map(escM);o.mini=o.mini||Math.min(5,o.sc.length-1);return o}
var NV=GOLD,LQ='#7FB4F0';
/* Definiciones oficiales del Mapa Maestro de Teorías (v2). Nivel público: Redes y Comunidad, más el mapa de la Secuencia.
   Las teorías propias del bloque 6 (Premium) no se enseñan acá: solo se nombran como adelanto. */
var METODO=[
lecM({id:'liquidez',n:'Liquidez: el motor del precio',corto:'Liquidez',sub:'El precio se mueve buscando liquidez',
 vm:{ext:[97.5,113.5],pts:[[0,104],[8,110],[13,100.2],[18,110],[24,100.2],[29,108.5],[42,98.4]],sem:201,mods:{30:{o:108.5,h:111.6,l:108.2,c:109.1}}},
 tit:['Cada máximo esconde órdenes','Liquidez arriba de los máximos','Liquidez debajo de los mínimos','Equal highs: un imán','El precio va a buscarla','Si tomó arriba, va abajo'],
 t:['El precio no se mueve por patrones: se mueve buscando liquidez. La liquidez son órdenes acumuladas: stops y entradas pendientes.',
  'Encima de los máximos se juntan los stops de los que venden. El institucional necesita esas órdenes para llenar posiciones grandes.',
  'Debajo de los mínimos se juntan los stops de los que compran. Máximos y mínimos previos, PDH, PDL y el rango de Asia son liquidez.',
  'Dos máximos al mismo precio, los equal highs, parecen un techo fuerte. Para el método son un imán: ahí hay un pozo de stops.',
  'El precio va a buscar esa liquidez. La toma con una mecha, dispara los stops y vuelve con rechazo: eso es un sweep.',
  'Si el precio tomó la liquidez mayor de un lado, el objetivo lógico es la del otro lado del rango.'],
 sc:[{h:[0,19],an:[{t:'marca',i:8,p:110,txt:'Stops',arriba:true,c:LQ,vi:8},{t:'marca',i:18,p:110,txt:'Stops',arriba:true,c:LQ,vi:18},{t:'marca',i:13,p:100.2,txt:'Stops',arriba:false,c:LQ,vi:13}]},
  {h:[19,19],an:[{t:'zona',p0:110,p1:111.3,i0:6,txt:'Liquidez arriba',c:LQ,en:.1}]},
  {h:[19,29],an:[{t:'zona',p0:110,p1:111.3,i0:6,c:LQ,en:0},{t:'zona',p0:98.9,p1:100.2,i0:11,txt:'Liquidez abajo',c:LQ,en:.2}]},
  {h:[29,29],an:[{t:'niv',p:110,txt:'Equal highs',c:NV,x0:6,en:.05},{t:'top',txt:'La mayoría ve un doble techo',c:TVTX,en:.3,fin:.55},{t:'top',txt:'El método ve un pozo de stops',c:NV,en:.62}]},
  {h:[29,30],an:[{t:'niv',p:110,c:NV,x0:6,en:0},{t:'anillo',i:30,p:111,txt:'Sweep',arriba:true,c:NV,en:.5}]},
  {h:[30,42],an:[{t:'zona',p0:98.9,p1:100.2,i0:11,c:LQ,en:0},{t:'flecha',i0:31,p0:109.5,i1:41,p1:99.6,c:DN,txt:'Va por la liquidez del otro lado',en:.2}]}],
 claves:['Liquidez: máximos y mínimos previos, equal highs y lows, PDH, PDL y rango de Asia.','Cuanto más obvio el nivel, más stops junta.','Si tomó la liquidez mayor de un lado, el objetivo es la del otro.'],
 trampa:'Poner el stop justo arriba de los equal highs, donde lo pone todo el mundo.',practica:['ruptura','nivel'],
 q:[['¿Qué es la liquidez para el método?',['Órdenes acumuladas: stops y entradas pendientes','La cantidad de plata del broker','El volumen del día'],0,'El institucional las necesita para llenar posiciones grandes.'],
  ['Para el método, dos máximos iguales son…',['Un techo imposible de romper','Un imán: un pozo de stops','Una señal de compra'],1,'El nivel obvio es un objetivo.'],
  ['El precio tomó la liquidez mayor de arriba. ¿Cuál es el objetivo lógico?',['Más arriba siempre','La liquidez del otro lado del rango','Ninguno'],1,'Si tomó arriba, va abajo.']]}),
lecM({id:'barrido',n:'Sweep: la luz amarilla',corto:'Sweep',sub:'Mecha que barre la liquidez y vuelve',
 vm:{ext:[100,113.5],pts:[[0,104],[5,110],[9,106],[14,110],[18,107.4],[19,108.6],[31,101.5]],sem:211,mecha:.5,mods:{20:{o:108.6,h:111.4,l:108.3,c:109.1},21:{o:109.1,h:109.3,l:105.6,c:105.9}}},
 tit:['Un nivel obvio','1 · Toma el nivel','2 · Cierra adentro','3 · Rechazo','Mecha no es estructura','Amarillo no es verde'],
 t:['Todo sweep empieza con un nivel obvio. Acá, dos máximos iguales: la liquidez que todos ven.',
  'La mecha supera el nivel y dispara los stops que estaban arriba.',
  'Pero la vela cierra de vuelta adentro. El precio no fue aceptado arriba.',
  'Y vuelve con rechazo: la vela siguiente se va con fuerza para el otro lado.',
  'Mecha que rompe y vuelve es liquidez. Cuerpo que cierra afuera es estructura. No confundas un sweep con una ruptura.',
  'El sweep es la luz amarilla: algo está pasando. La luz verde es el CHoCH con Imbalance. Entrar solo con el sweep es cruzar en amarillo.'],
 sc:[{h:[0,19],an:[{t:'niv',p:110,txt:'Equal highs',c:NV,x0:3,en:.3}]},
  {h:[19,20],an:[{t:'niv',p:110,c:NV,x0:3,en:0},{t:'marca',i:20,p:111.4,txt:'La mecha pasa el nivel',arriba:true,c:LQ,en:.55}]},
  {h:[20,20],an:[{t:'niv',p:110,c:NV,x0:3,en:0},{t:'anillo',i:20,p:109.1,txt:'Cierra adentro',c:NV,en:.3}]},
  {h:[20,21],an:[{t:'niv',p:110,c:NV,x0:3,en:0},{t:'flecha',i0:21,p0:109.5,i1:21,p1:105.2,c:DN,txt:'Rechazo',en:.5}]},
  {h:[21,21],an:[{t:'niv',p:110,c:NV,x0:3,en:0},{t:'lista',items:['Mecha que vuelve = liquidez','Cuerpo afuera = estructura'],cs:[NV,TVTX],en:.15}]},
  {h:[21,31],an:[{t:'niv',p:110,c:NV,x0:3,en:0},{t:'lista',items:['Sweep: luz amarilla','CHoCH + Imbalance: luz verde'],cs:[AM,UP],en:.2}]}],
 claves:['Sweep: mecha que barre la liquidez y vuelve con rechazo.','Mecha que rompe y vuelve = liquidez. Cuerpo afuera = estructura.','Solo con el sweep no se entra: falta el CHoCH con Imbalance.'],
 trampa:'Entrar apenas ves la mecha. Entrar solo con el sweep es cruzar en amarillo.',practica:['ruptura','setup'],
 q:[['¿Qué es un sweep?',['Una mecha que barre la liquidez y vuelve con rechazo','Un cierre de cuerpo afuera del nivel','Una vela sin mechas'],0,'Es la luz amarilla: algo está pasando.'],
  ['La vela pasa el máximo y cierra arriba, y se queda ahí. Es…',['Un sweep','Una ruptura: el cuerpo cerró afuera','Un Imbalance'],1,'Cuerpo que cierra afuera es estructura.'],
  ['¿Alcanza con el sweep para entrar?',['Sí','No: falta el CHoCH con Imbalance','Solo los lunes'],1,'El sweep es amarillo; el verde es el CHoCH con Imbalance.']]}),
lecM({id:'estructura',n:'Estructura: BOS, CHoCH y mínimo fuerte',corto:'Estructura',sub:'La marea y las olas',
 vm:{ext:[99,113.5],pts:[[0,100],[5,105],[8,102.5],[13,108],[16,105],[21,111],[25,106.8],[28,108.9],[36,101.5]],sem:231},
 tit:['Swings válidos','BOS: la tendencia sigue','Mínimo fuerte y máximo débil','Un máximo más bajo','CHoCH: cambia el carácter','La marea y las olas'],
 t:['La estructura es la escalera del precio. Un máximo o un mínimo solo cuenta si después hubo un pullback real que tomó liquidez.',
  'BOS: el precio rompe el último máximo con cierre de cuerpo. Confirma que la tendencia continúa.',
  'El mínimo que originó el último BOS es el mínimo fuerte: el que la tendencia tiene que proteger. El último máximo es débil: es liquidez y objetivo.',
  'Primera advertencia: el precio ya no logra superar el máximo débil.',
  'CHoCH: un cierre de cuerpo debajo del mínimo fuerte, con desplazamiento. Una mecha que rompe y vuelve no cuenta: eso es un sweep.',
  'Regla del método: se opera a favor de la estructura externa, la marea. La interna, las olas, solo da el momento de entrar.'],
 sc:[{h:[0,21],an:[{t:'marca',i:5,p:105,txt:'H',arriba:true,c:UP,vi:5},{t:'marca',i:8,p:102.5,txt:'HL',c:LQ,vi:8},{t:'marca',i:13,p:108,txt:'HH',arriba:true,c:UP,vi:13},{t:'marca',i:16,p:105,txt:'HL',c:LQ,vi:16},{t:'marca',i:21,p:111,txt:'HH',arriba:true,c:UP,vi:21}]},
  {h:[21,21],an:[{t:'niv',p:105,x0:5,x1:12,txt:'BOS',c:UP,en:.1},{t:'niv',p:108,x0:13,x1:19,txt:'BOS',c:UP,en:.4}]},
  {h:[21,25],an:[{t:'niv',p:105,x0:16,txt:'Mínimo fuerte',c:NV,abajo:true,en:.15},{t:'marca',i:21,p:111,txt:'Máximo débil',arriba:true,c:LQ,en:.5}]},
  {h:[25,28],an:[{t:'niv',p:105,x0:16,c:NV,en:0},{t:'marca',i:28,p:108.9,txt:'LH',arriba:true,c:DN,vi:28}]},
  {h:[28,33],an:[{t:'niv',p:105,x0:16,c:NV,en:0},{t:'anillo',ifn:function(cs){for(var i=29;i<cs.length;i++)if(cs[i].c<105)return i;return 31},p:105,txt:'CHoCH: cierra el cuerpo abajo',c:DN,en:.55}]},
  {h:[33,36],an:[{t:'niv',p:105,x0:16,c:NV,en:0},{t:'lista',items:['BOS: la tendencia sigue','CHoCH: posible cambio','Opero a favor de la externa'],cs:[UP,DN,NV],en:.15}]}],
 claves:['Swing válido: solo cuenta si hubo un pullback real que tomó liquidez.','Mínimo fuerte: el HL que originó el último BOS. Máximo débil: el último HH.','BOS y CHoCH se validan con cierre de cuerpo; el CHoCH, además, con desplazamiento.'],
 trampa:'Ver un CHoCH en 1 minuto y creer que cambió la tendencia de H1. Las olas no cambian la marea.',practica:['tendencia'],
 q:[['¿Cuál es el mínimo fuerte en una tendencia alcista?',['El HL que originó el último BOS','El último mínimo que veas','El mínimo del día'],0,'Es el nivel que la tendencia tiene que proteger.'],
  ['Una mecha rompe el mínimo fuerte, pero la vela cierra arriba. ¿Es CHoCH?',['Sí','No: es un sweep','Es un BOS'],1,'Solo un cierre de cuerpo con desplazamiento valida el CHoCH.'],
  ['Externa alcista; en 5 minutos el pullback marca un CHoCH bajista. ¿Vendo?',['Sí','No: es la estructura interna del pullback','Vendo el doble'],1,'Se opera a favor de la marea.']]}),
lecM({id:'premium-descuento',n:'Rango actual y rebalanceo',corto:'Rango actual',sub:'Premium, descuento y niveles 50 a 90 %',
 vm:{pts:[[0,101.5],[4,100],[9,105.2],[11,102.5],[16,112],[20,108],[22,109.2],[25,102.25],[37,115]],sem:251,ext:[99,116]},
 tit:['El rango actual','Premium y descuento','Compras en descuento','Niveles 50, 70, 80 y 90 %','Va a donde está la liquidez','El nivel no es la entrada'],
 t:['El rango actual es el último alto y el bajo que generó ese alto, marcado en H1. No el rango que ya pasó: el que está operando ahora.',
  'Se traza el rango con Fibonacci. Arriba del cincuenta por ciento es premium, caro. Abajo es descuento, barato.',
  'Compras solo en descuento, ventas solo en premium. En el equilibrio no hay ventaja.',
  'El precio tiende a rebalancearse. Los niveles de reacción del método son el cincuenta, setenta, ochenta y noventa por ciento.',
  'Dónde reacciona depende de la liquidez. Si la liquidez está en el ochenta, el precio va a buscarla aunque ya haya tocado el cincuenta.',
  'El nivel te dice dónde mirar, no cuándo entrar. La entrada sale en M5, cuando el precio llega y confirma.'],
 sc:[{h:[0,16],an:[{t:'marca',i:4,p:100,txt:'Bajo que generó el alto',c:LQ,en:.5},{t:'marca',i:16,p:112,txt:'Alto del rango',arriba:true,c:LQ,vi:16}]},
  {h:[16,18],an:[{t:'fib',i0:4,p0:100,i1:16,p1:112,pd:true,en:.15}]},
  {h:[18,20],an:[{t:'fib',i0:4,p0:100,i1:16,p1:112,pd:true,en:0},{t:'top',txt:'Compras en descuento · ventas en premium',c:UP,en:.3}]},
  {h:[20,22],an:[{t:'fib',i0:4,p0:100,i1:16,p1:112,niv:[0,.5,.7,.8,.9,1],en:0}]},
  {h:[22,25],an:[{t:'fib',i0:4,p0:100,i1:16,p1:112,niv:[0,.5,.7,.8,.9,1],en:0},{t:'marca',i:11,p:102.5,txt:'Liquidez en el 80 %',c:NV,en:.1},{t:'anillo',i:25,p:102.3,txt:'Va a buscarla',c:NV,vi:25}]},
  {h:[25,37],an:[{t:'fib',i0:4,p0:100,i1:16,p1:112,niv:[0,.5,.7,.8,.9,1],en:0},{t:'top',txt:'H1 dice dónde · M5 dice cuándo',c:NV,en:.5}]}],
 claves:['Rango actual: el último alto y el bajo que generó ese alto, en H1.','Niveles de reacción: 50, 70, 80 y 90 %. La liquidez decide cuál.','Compras debajo del 50 %, ventas arriba. En el equilibrio no hay ventaja.'],
 trampa:'Comprar en el 50 % cuando la liquidez está más abajo. Ese rebote suele ser un amague en el medio de la cancha.',practica:['rr','setup'],
 q:[['¿Cómo se marca el rango actual?',['El último alto y el bajo que generó ese alto','El máximo y el mínimo del mes','Cualquier tramo'],0,'El rango que está operando ahora.'],
  ['Narrativa alcista y el precio está en el 70 % de arriba del rango (premium). ¿Compro?',['Sí','No: espero que baje a descuento','Compro el doble'],1,'Compras solo en descuento.'],
  ['¿Qué te dice el nivel de Fibonacci?',['Dónde mirar, no cuándo entrar','El precio exacto de entrada','Nada'],0,'La entrada sale en M5 con confirmación.']]}),
lecM({id:'imbalance',n:'Imbalance: la huella institucional',corto:'Imbalance',sub:'Solo alguien pesado deja un pozo',
 vm:{ext:[96,112.5],pts:[[0,104],[5,110],[9,106],[14,110],[19,108.6],[23,101.8],[27,105.2],[38,97]],sem:221,mecha:.5,mods:{20:{o:108.6,h:109.4,l:107.6,c:107.9},21:{o:107.9,h:108,l:103.4,c:103.7},22:{o:103.7,h:104.6,l:102.2,c:102.6}}},
 tit:['El desplazamiento','Queda un hueco: el Imbalance','La huella del pesado','Dónde va la orden','Mitiga el borde','Y sigue su camino'],
 t:['Después del sweep aparece el desplazamiento: velas grandes que muestran la intención del dinero institucional.',
  'El desplazamiento deja un hueco donde el precio pasó sin negociar: el Imbalance.',
  'Una zapatilla deja una marca suave; una bota de cien kilos deja un pozo. Solo alguien pesado deja Imbalance.',
  'En Base 1, la orden límite va en el borde del Imbalance. Una entrada más equilibrada usa la mitad, el cincuenta por ciento.',
  'El precio vuelve, mitiga el borde del Imbalance y es rechazado. No hace falta perseguir la vela grande.',
  'Desde ahí retoma la dirección del desplazamiento, hacia la liquidez mayor.'],
 sc:[{h:[14,22],an:[{t:'caja',i0:20,i1:22,c:LQ,txt:'Desplazamiento',vi:22}]},
  {h:[22,22],an:[{t:'zona',p0:104.6,p1:107.6,i0:20,txt:'Imbalance',c:NV,en:.35},{t:'marca',i:20,p:107.6,txt:'Vela 1',arriba:true,c:TVTX,en:.12},{t:'marca',i:22,p:104.6,txt:'Vela 3',arriba:false,c:TVTX,en:.22}]},
  {h:[22,24],an:[{t:'zona',p0:104.6,p1:107.6,i0:20,txt:'Imbalance',c:NV,en:0},{t:'top',txt:'Solo alguien pesado deja un pozo',c:NV,en:.3}]},
  {h:[24,24],an:[{t:'zona',p0:104.6,p1:107.6,i0:20,c:NV,en:0},{t:'niv',p:104.6,x0:20,txt:'Borde · Base 1',c:UP,abajo:true,en:.15},{t:'niv',p:106.1,x0:20,txt:'50 % · equilibrada',c:NV,en:.45}]},
  {h:[24,27],an:[{t:'zona',p0:104.6,p1:107.6,i0:20,c:NV,en:0},{t:'niv',p:104.6,x0:20,c:UP,en:0},{t:'anillo',i:27,p:105,txt:'Mitiga el borde',arriba:true,c:NV,vi:27}]},
  {h:[27,38],an:[{t:'zona',p0:104.6,p1:107.6,i0:20,c:NV,en:0},{t:'flecha',i0:28,p0:104.6,i1:37,p1:97.8,c:DN,en:.25}]}],
 claves:['Imbalance: el hueco que deja un desplazamiento fuerte. Siempre se dice Imbalance.','Entradas: agresiva en el borde (Base 1), equilibrada en el 50 %.','No persigas la vela grande: el precio da una segunda oportunidad.'],
 trampa:'Entrar en la vela del desplazamiento por miedo a quedarte afuera.',practica:['imbalance','setup'],
 q:[['¿Qué es el Imbalance?',['El hueco que deja un desplazamiento fuerte','Una vela pequeña','El stop'],0,'Es la huella institucional.'],
  ['En Base 1, ¿dónde va la orden límite?',['En el borde del Imbalance','En la vela grande','En el mínimo del día'],0,'La entrada más simple del método.'],
  ['¿Por qué el Imbalance indica dinero institucional?',['Porque solo alguien pesado deja un pozo','Porque es rojo','Porque es lunes'],0,'Una zapatilla deja una marca; una bota de 100 kilos, un pozo.']]}),
lecM({id:'order-block',n:'Order block e IFC',corto:'Order block',sub:'El OB deja la liquidez, el IFC la toma',
 vm:{ext:[99,113.5],pts:[[0,110],[6,104],[9,106],[16,101.6],[20,106.5],[25,101.6],[36,112]],sem:241,mods:{17:{o:101.9,h:102.2,l:100.4,c:100.7},18:{o:100.7,h:104.2,l:100.2,c:104},19:{o:104,h:106.3,l:103.8,c:106}}},
 tit:['La última vela contraria','El IFC roba la liquidez','Se marca el cuerpo','Los 5 filtros','Mitigación y reacción','Si lo atraviesa: breaker'],
 t:['Un order block es la última vela contraria antes del impulso. En una subida, la última vela bajista.',
  'La vela siguiente es el IFC: roba la liquidez de la anterior, la envuelve y deja Imbalance. El order block deja la liquidez; el IFC la toma.',
  'La zona se marca con el cuerpo de la vela, no con la mecha. La mecha sirve para leer el falso toque.',
  'Para operarlo, el método pide cinco filtros: que haya tomado liquidez, desplazado, roto estructura, que esté en la zona correcta y sin mitigar.',
  'La primera vuelta del precio a la zona es la mitigación. Si la zona aguanta, el precio reacciona y continúa.',
  'Si el precio atraviesa el bloque con desplazamiento, cambia de rol: es un breaker block. El piso se vuelve techo.'],
 sc:[{h:[0,17],an:[{t:'anillo',i:17,p:101.3,txt:'Última vela contraria',c:NV,vi:17}]},
  {h:[17,19],an:[{t:'caja',i0:18,i1:18,c:UP,txt:'IFC: roba y envuelve',vi:18}]},
  {h:[19,20],an:[{t:'zona',p0:100.7,p1:101.9,i0:17,txt:'OB · cuerpo',c:NV,en:.2}]},
  {h:[20,20],an:[{t:'zona',p0:100.7,p1:101.9,i0:17,c:NV,en:0},{t:'lista',items:['✓ Tomó liquidez','✓ Desplazó','✓ Rompió estructura','✓ Zona correcta','✓ Sin mitigar'],c:UP,en:.05}]},
  {h:[20,36],an:[{t:'zona',p0:100.7,p1:101.9,i0:17,c:NV,en:0},{t:'anillo',i:25,p:102,txt:'Mitigación',arriba:true,c:NV,vi:25},{t:'flecha',i0:27,p0:103.5,i1:35,p1:111,c:UP,en:.75}]},
  {h:[36,36],an:[{t:'zona',p0:100.7,p1:101.9,i0:17,c:NV,en:0},{t:'niv',p:100.7,x0:17,txt:'Si lo atraviesa: breaker block',c:DN,abajo:true,en:.2}]}],
 claves:['OB: la última vela contraria antes del impulso. IFC: la vela a favor que roba su liquidez y deja Imbalance.','La zona se marca con el cuerpo de la vela raíz.','5 filtros: liquidez, desplazamiento, ruptura de estructura, zona correcta y sin mitigar.'],
 trampa:'Marcar cualquier vela como order block. Si no pasa los cinco filtros, no se opera.',practica:['setup','nivel'],
 q:[['¿Qué es un order block alcista?',['La última vela bajista antes del impulso','Cualquier vela verde','El máximo del día'],0,'La última vela contraria.'],
  ['¿Qué hace el IFC?',['Roba la liquidez de la vela anterior, la envuelve y deja Imbalance','Marca el stop','Nada'],0,'El OB deja la liquidez; el IFC la toma.'],
  ['¿Con qué se marca la zona?',['Con el cuerpo de la vela','Con la mecha','Con el volumen'],0,'La mecha sirve para leer el falso toque.']]}),
lecM({id:'sesiones',n:'Killzones y Power of 3',corto:'Killzones',sub:'Acumulación, manipulación y distribución',
 vm:{ext:[102.4,108.4],pts:[[0,105],[3,106],[6,104.2],[9,105.9],[12,104.1],[15,105.6],[18,103.2],[22,107],[26,105.8],[38,111.5]],sem:261,ruido:.3,mecha:.4},
 tit:['A · Acumulación en Asia','La apertura de medianoche','M · Manipulación en Londres','El primer movimiento miente','D · Distribución en Nueva York','Horarios en Argentina'],
 t:['Toda vela diaria tiene tres actos: acumulación, manipulación y distribución. Primero, Asia acumula: arma un rango tranquilo.',
  'La apertura de medianoche de Nueva York es la referencia del día: arriba es caro, abajo es barato. Los extremos de Asia son la liquidez a barrer.',
  'En la killzone de Londres llega la manipulación: un movimiento mentiroso que cae debajo de la apertura y barre el mínimo de Asia.',
  'El primer movimiento fuerte del día muchas veces es la mentira. Después del sweep, el precio se da vuelta.',
  'En Nueva York llega la distribución: el movimiento real y expansivo hacia la liquidez objetivo del día.',
  'En Argentina, con horario de invierno en Estados Unidos: Londres de cuatro a siete y Nueva York de nueve a doce. La ventana del método es de diez y media a doce y media.'],
 sc:[{h:[0,15],an:[{t:'ses',i0:0,i1:15,txt:'Asia · A',c:LQ,en:.05},{t:'niv',p:106,x0:0,txt:'Máximo de Asia',c:LQ,en:.5},{t:'niv',p:104.1,x0:0,txt:'Mínimo de Asia',c:LQ,abajo:true,en:.6}]},
  {h:[15,15],an:[{t:'ses',i0:0,i1:15,txt:'Asia · A',c:LQ,en:0},{t:'niv',p:105,x0:0,txt:'Apertura 00:00 NY',c:NV,en:.1},{t:'top',txt:'Arriba caro · abajo barato',c:NV,en:.4}]},
  {h:[15,19],an:[{t:'ses',i0:0,i1:15,txt:'Asia · A',c:LQ,en:0},{t:'ses',i0:16,i1:24,txt:'Londres · M',c:NV,en:.05},{t:'niv',p:104.1,x0:0,c:LQ,en:0},{t:'niv',p:105,x0:0,c:NV,en:0},{t:'anillo',i:18,p:103.4,txt:'Sweep del mínimo de Asia',c:NV,vi:18}]},
  {h:[19,24],an:[{t:'ses',i0:0,i1:15,txt:'Asia · A',c:LQ,en:0},{t:'ses',i0:16,i1:24,txt:'Londres · M',c:NV,en:0},{t:'niv',p:105,x0:0,c:NV,en:0},{t:'flecha',i0:19,p0:103.8,i1:23,p1:106.8,c:UP,en:.3}]},
  {h:[24,38],an:[{t:'ses',i0:0,i1:15,txt:'Asia · A',c:LQ,en:0},{t:'ses',i0:16,i1:24,txt:'Londres · M',c:NV,en:0},{t:'ses',i0:25,i1:38,txt:'Nueva York · D',c:UP,en:.05}]},
  {h:[38,38],an:[{t:'ses',i0:0,i1:15,txt:'Asia · A',c:LQ,en:0},{t:'ses',i0:16,i1:24,txt:'Londres · M',c:NV,en:0},{t:'ses',i0:25,i1:38,txt:'Nueva York · D',c:UP,en:0},{t:'lista',items:['Asia: 22 a 2 h','Londres: 4 a 7 h','Nueva York: 9 a 12 h','Ventana: 10:30 a 12:30'],cs:[LQ,NV,UP,AM],izq:true,en:.15}]}],
 claves:['Power of 3: acumulación (Asia), manipulación (Londres) y distribución (Nueva York).','La apertura de medianoche de NY separa caro de barato en el día.','Horas de Argentina con invierno en EE. UU.; de marzo a noviembre, restá una hora. Para otros países, convertí desde la hora de Nueva York.'],
 trampa:'Operar todo el día. Fuera de la killzone hay menos volumen y más rangos falsos: no opero todo el día, opero mi ventana.',practica:['ruptura','nivel'],
 q:[['¿Qué suele pasar en Asia?',['Acumulación: se arma el rango','Distribución','Nada nunca'],0,'Sus extremos son la liquidez a barrer.'],
  ['Narrativa alcista. En Londres el precio rompe con fuerza el mínimo de Asia. ¿Vendo?',['Sí','No: probablemente es la manipulación','Vendo el doble'],1,'Se espera sweep y CHoCH alcista.'],
  ['¿Cuál es la ventana operativa del método en Argentina?',['De 10:30 a 12:30','De 15 a 18','Todo el día'],0,'Dos horas dentro de Nueva York.']]})
];
/* La Secuencia de la Liquidez usa las mismas seis escenas que los setups. */
METODO.push({id:'modelo',tec:1,cat:'metodo',n:'La secuencia de la liquidez',corto:'La secuencia',sub:'Cinco fases: si falta una, no hay setup',mini:4,esc:SET,
 tit:['Fase 1 · ¿A qué liquidez va?','Fases 2 a 4 · Premium, sweep y CHoCH','Fase 5 · Mitiga el Imbalance','El plan: entrada, stop y objetivo','Así se ve cuando sale','Cuándo no hay setup'],
 t:['La secuencia de la liquidez tiene cinco fases. Fase uno, el contexto: ¿hacia qué liquidez va el precio? Acá, los mínimos iguales de abajo.',
  'Fase dos: ventas solo en premium. Fases tres y cuatro: el precio barre el inducement de arriba, cierra adentro y rompe con desplazamiento, dejando un Imbalance.',
  'Fase cinco, la ejecución: no se persigue la vela. Se espera que el precio vuelva y mitigue el borde del Imbalance.',
  'Venta con orden límite en el borde del Imbalance. Stop detrás del sweep. Objetivo: la liquidez de abajo.',
  'El precio cae y toma los mínimos iguales. En el primer objetivo se cierra un parcial y el stop pasa a breakeven.',
  'Si el precio cierra arriba de los máximos y se queda, no fue un sweep: fue una ruptura real. Si falta una fase, no hay setup.'],
 claves:['Contexto, zona correcta, inducement, sweep con CHoCH e Imbalance, y ejecución.','Stop detrás del extremo del sweep, nunca dentro de la zona barrida.','Primero el destino, después el punto de partida.'],
 trampa:'Forzar la secuencia: ver un inducement o un CHoCH donde no lo hay porque tenés ganas de operar.',
 check:['Tengo clara la liquidez objetivo','Estoy en premium o descuento correcto','El inducement ya fue barrido','Hay CHoCH con cuerpo y desplazamiento','Existe Imbalance para la entrada','Stop detrás del sweep y riesgo calculado','La relación riesgo/beneficio es de 1:2 o más'],
 practica:['imbalance','ruptura','stop'],
 q:[['¿Cuáles son las cinco fases en orden?',['Contexto, zona, inducement, sweep + CHoCH + Imbalance, ejecución','Entrada, stop, objetivo, parcial y salida','Sweep, entrada, contexto, zona y stop'],0,'Si falta una, no hay setup.'],
  ['¿Dónde va el stop?',['Detrás del extremo del sweep','Dentro de la zona barrida','Lo más cerca posible de la entrada'],0,'Nunca dentro de la zona barrida.'],
  ['Ves un CHoCH en premium y la narrativa es alcista. ¿Comprás?',['Sí','No: la señal está en la zona equivocada','Compro el doble'],1,'El contexto manda sobre la confirmación.']],
 setup:function(){var cs=serieLimpia([[0,103],[6,110],[12,98],[18,110],[24,98.1],[28,108.6],[34,103.6],[36,107.5],[50,97.4]],271,.45,.55);
  [[29,{o:108.6,h:110.9,l:108.3,c:109.2}],[30,{o:109.2,h:109.4,l:108.6,c:108.8}],[31,{o:108.8,h:108.9,l:105,c:105.3}],[32,{o:105.3,h:107.2,l:104.8,c:105}]].forEach(function(q){fijar(cs,q[0],q[1])});
  return{cs:cs,ctx:28,gat:36,zona:[107.9,.7,30,GOLD],zonaTxt:'Imbalance',ctxTxt:'Liquidez arriba y abajo: ¿a cuál va?',gatTxt:'Mitiga el borde del Imbalance',e:107.2,s:111.2,o:98.3,
   extra:function(S,G,h,k){if(k===0){nivel(S.c,G,110,GOLD,sg(S.p,.1,.3),{x0:4,txt:'Equal highs · inducement',z:S.z*.85});nivel(S.c,G,98,LQ,sg(S.p,.3,.5),{x0:10,txt:'Equal lows · objetivo',z:S.z*.85,abajo:true})}
    if(k===1){nivel(S.c,G,104,TVTX,sg(S.p,.05,.2),{txt:'50 % · arriba es premium',z:S.z*.8});anillo(S.c,G.x(29),G.y(110.6),S.z*1.3,GOLD,sg(h,29.6,30.6));pastilla(S.c,'Sweep',G.x(29),G.y(110.9)-S.z*2.2,GOLD,S.z*.85,'center',sg(h,29.6,30.6))}},
   no:function(){var c2=serieLimpia([[0,103],[6,110],[12,98],[18,110],[24,98.1],[28,108.6],[32,112.6],[37,110.8],[48,115]],273,.45,.55);return{cs:c2,i:hastaPrecio(c2,99,110.5,true,28),txt:'Cerró arriba y se quedó: ruptura real'}}}}});
/* Orden pedagógico del Mapa Maestro: liquidez, sweep, estructura, rango, Imbalance, OB, tiempo y, al final, la secuencia. */
var ORDENM=['liquidez','barrido','estructura','premium-descuento','imbalance','order-block','sesiones','modelo'];
METODO.sort(function(a,b){return ORDENM.indexOf(a.id)-ORDENM.indexOf(b.id)});
METODO.forEach(function(l){L.push(l)});

/* ---- Niveles del método: todo se ve gratis como demo; cada nivel privado enseña la profundidad ---- */
var NIVELES={'Comunidad':{n:'Nivel 1 · Comunidad',d:'Los fundamentos completos del método, con tareas y foro de capturas.',mas:['Fundamentos completos con tareas corregidas','Plantilla de TradingView del método','Comunidad de traders que operan igual que vos']},
 'Grupal':{n:'Nivel 2 · Mentoría grupal',d:'El método completo H1 + M5 con práctica en vivo cada semana.',mas:['El método H1 + M5 aplicado en vivo','Práctica semanal y PDF de cada clase','Revisión de tus gráficos en la sesión']},
 '1 a 1':{n:'Nivel 3 · 1 a 1',d:'Tu plan operativo propio, con corrección personal de cada trade.',mas:['Corrección personal de cada operación','Tu plan operativo y tu diario de trading','Filtros finos y gestión emocional']},
 'Premium':{n:'Nivel 4 · Premium',d:'Las teorías propias en profundidad, fondeo y ejecución en vivo.',mas:['Las teorías propias del método en profundidad','Gestión de cuenta fondeada','Ejecución en vivo y revisión semanal']}};
var ORDN=['Comunidad','Grupal','1 a 1','Premium'];
[['liquidez','Comunidad'],['barrido','Grupal'],['estructura','Grupal'],['premium-descuento','Grupal'],['imbalance','Comunidad'],['order-block','Grupal'],['sesiones','Comunidad'],['modelo','Grupal']].forEach(function(q){L.forEach(function(l){if(l.id===q[0])l.nivel=q[1]})});

/* Plan de la operación dibujado como la herramienta de posición de TradingView. */
var marcaM0=marcaM;
marcaM=function(S,G,cs,h,m){
  if(m.t!=='plan')return marcaM0(S,G,cs,h,m);
  var c=S.c,z=S.z,a=sg(S.p,m.en==null?.15:m.en,(m.en==null?.15:m.en)+.2);if(a<=0)return;
  var x0=G.x(m.i0)-G.paso/2,x1=G.b.x+G.b.w,cor=m.o<m.e,R=Math.round(Math.abs((m.o-m.e)/(m.e-m.s))*10)/10,Rs=String(R).replace('.',',');
  c.save();c.globalAlpha*=a;c.fillStyle=rgba(DN,.12);c.fillRect(x0,Math.min(G.y(m.e),G.y(m.s)),x1-x0,Math.abs(G.y(m.s)-G.y(m.e)));c.fillStyle=rgba(UP,.1);c.fillRect(x0,Math.min(G.y(m.e),G.y(m.o)),x1-x0,Math.abs(G.y(m.o)-G.y(m.e)));c.restore();
  [[m.e,INK,'Entrada'],[m.s,DN,'Stop'],[m.o,UP,'Objetivo 1:'+Rs]].forEach(function(q,j){nivel(c,G,q[0],q[1],a,{x0:m.i0,g:2,dash:false,txt:q[2],z:z*.8,abajo:cor?j!==1:j===1})});
  if(m.res){var hi=-1;for(var k=m.i0+1;k<Math.min(cs.length,Math.ceil(h));k++)if(cor?cs[k].l<=m.o:cs[k].h>=m.o){hi=k;break}
    if(hi>0){var b=sg(h,hi+.6,hi+1.4);pastilla(c,'Objetivo ✓ +'+Rs+'R',G.b.x+G.b.w/2,G.b.y-z*2.1,UP,z,'center',b)}}
};
var velasM0=velasM;velasM=function(vm){if(vm.cs)return vm.cs.map(function(v){return{o:v[0],h:v[1]+.22,l:v[2]-.22,c:v[3]}});var cs=serieLimpia(vm.pts,vm.sem);Object.keys(vm.mods||{}).map(Number).sort(function(a,b){return a-b}).forEach(function(i){var q=vm.mods[i];fijar(cs,i,{o:cs[i-1]?cs[i-1].c:q.o,h:q.h,l:q.l,c:q.c})});return cs};
function fijo(xs){return(xs||[]).map(function(m){var o={};for(var k in m)o[k]=m[k];o.en=0;delete o.vi;if(o.t==='anillo'||o.t==='marca'||o.t==='caja'||o.t==='flecha')delete o.txt;return o})}
/* Una entrada = 4 escenas: contexto, gatillo, plan y resultado. */
function entrada(d){
  var n=d.cs.length,plan={t:'plan',e:d.e,s:d.s,o:d.o,i0:d.i0},hi=-Infinity,lo=Infinity;d.cs.forEach(function(v){hi=Math.max(hi,v[1]);lo=Math.min(lo,v[2])});
  var iz=function(xs){return(xs||[]).map(function(m){if(m.t==='zona'||m.t==='niv')m.izq=true;return m})},A0=iz(d.a0),A1=iz(d.a1),Z=iz(d.z);
  var o=lecM({id:d.id,n:d.n,corto:d.corto,sub:d.sub,nivel:d.nivel,mas:d.mas,vm:{cs:d.cs,ext:[Math.min(lo,d.s,d.o)-.6,Math.max(hi,d.s,d.o)+.6]},
   tit:d.tit||['El contexto','El gatillo','El plan','El resultado'],t:d.t,claves:d.claves,trampa:d.trampa,q:d.q,practica:d.practica||['setup','stop'],
   sc:[{h:[0,d.k1],an:A0},{h:[d.k1,d.k2],an:fijo(A0).concat(A1)},{h:[d.k2,d.k3],an:fijo(A0).concat(fijo(A1)).concat(Z).concat([Object.assign({},plan,{en:.2})])},{h:[d.k3,n-1],an:fijo(A0).concat(fijo(A1)).concat(fijo(Z)).concat([Object.assign({},plan,{en:0,res:1})])}]});
  o.cat='entradas';o.mini=3;return o;
}
var BASE=[[110,110.4,107.8,108],[108,108.3,106,106.3],[106.3,106.6,103.6,104],[104,106.2,103.8,105.9],[105.9,106.1,104.6,104.8],[104.8,105,102.6,103],[103,103.2,100.6,101]];
var CH={t:'niv',p:106.2,x0:3,txt:'CH',c:TVTX,en:.5};
var ENTRADAS=[
entrada({id:'entrada-choch',n:'Entrada con CHoCH',corto:'Con CHoCH',sub:'Rompe con cuerpo y vuelve a la zona',nivel:'Grupal',
 cs:BASE.concat([[101,104.8,100.9,104.5],[104.5,106.9,104.3,106.7],[106.7,106.9,105.1,105.3],[105.3,105.5,103.4,103.7],[103.7,103.9,102.7,103],[103,106.4,102.8,106.2],[106.2,109.6,106,109.4],[109.4,113.8,109.2,113.6],[113.6,117.6,113.4,117.4]]),
 k1:7,k2:8,k3:11,i0:11,e:103,s:100.3,o:111.1,a0:[CH],a1:[{t:'anillo',i:8,p:106.5,txt:'CHoCH: cierra el cuerpo arriba',arriba:true,c:UP,vi:8}],z:[{t:'zona',p0:101,p1:103,i0:6,txt:'Zona',c:NV,en:.05}],
 t:['El precio cae, hace un máximo interno, el CH, y marca un mínimo nuevo. Todavía no hay nada para comprar.',
  'Una vela cierra el cuerpo arriba del CH: es el CHoCH. El carácter cambió.',
  'Se espera la vuelta a la zona del mínimo. Entrada en el borde, stop debajo del mínimo y objetivo a tres veces el riesgo.',
  'El precio mitiga la zona y sale con fuerza hacia el objetivo.'],
 claves:['El CHoCH se valida con cierre de cuerpo, no con mecha.','La entrada va en la vuelta a la zona, no en la vela que rompe.','Stop debajo del mínimo que originó el CHoCH.'],
 trampa:'Comprar en la vela del CHoCH, lejos de la zona y con el stop gigante.',
 q:[['¿Qué valida el CHoCH?',['Un cierre de cuerpo arriba del CH','Una mecha que lo toca','Que pase una hora'],0,'Cuerpo, no mecha.'],['¿Dónde se entra?',['En la vuelta a la zona del mínimo','En la vela que rompe','Arriba de todo'],0,'Se espera la mitigación.'],['¿Dónde va el stop?',['Debajo del mínimo de la zona','Arriba de la entrada','Sin stop'],0,'Ahí la idea deja de valer.']]}),
entrada({id:'entrada-sin-choch',n:'Entrada sin CHoCH',corto:'Sin CHoCH',sub:'Entrar antes de la ruptura',nivel:'Premium',
 cs:[[110,110.5,108,108.3],[108.3,108.5,106.2,106.5],[106.5,108.9,106.3,108.6],[108.6,108.8,105,105.3],[105.3,105.5,103.2,103.5],[103.5,107.4,103.3,107.1],[107.1,107.3,104,104.3],[104.3,106.1,104.1,105.8],[105.8,106,102.4,102.7],[102.7,102.9,100.6,101],[101,103.6,100.8,103.4],[103.4,104.6,102.5,102.9],[102.9,107.4,102.7,107.1],[107.1,111.9,106.9,111.6],[111.6,116.4,111.4,116.1]],
 k1:9,k2:10,k3:11,i0:11,e:102.9,s:100.3,o:110.7,a0:[{t:'flecha',i0:2,p0:109.1,i1:7,p1:106.3,c:LQ,txt:'$$$ máximos descendentes',arriba:true,en:.5}],a1:[{t:'anillo',i:10,p:102.2,txt:'Reacción en la zona',c:NV,vi:10}],z:[{t:'zona',p0:101,p1:102.9,i0:9,txt:'Zona',c:NV,en:.05}],
 t:['Mientras cae, el precio deja máximos cada vez más bajos. Arriba se acumula liquidez: el $$$ que va a buscar después.',
  'En la zona aparece la reacción. Acá no se espera el CHoCH: la liquidez de arriba ya es el objetivo.',
  'Entrada en la zona, stop debajo del mínimo y objetivo en la liquidez de los máximos.',
  'El precio barre los máximos descendentes y llega al objetivo. Exige mucha lectura: es nivel avanzado.'],
 claves:['Sin CHoCH: se entra antes de la ruptura, con la liquidez de arriba como objetivo.','Solo en zonas respaldadas y con liquidez cercana creada.','Es una entrada de lectura avanzada: se practica en el nivel Premium.'],
 trampa:'Usarla sin experiencia. Sin la ruptura como filtro, una mala lectura cuesta caro.',
 q:[['¿Qué se usa como objetivo en la entrada sin CHoCH?',['La liquidez de los máximos descendentes','El mínimo','Nada'],0,'El $$$ de arriba.'],['¿Para quién es esta entrada?',['Para el nivel avanzado','Para el primer día','Para todos sin práctica'],0,'Exige mucha lectura.'],['¿Qué filtro se saltea?',['La ruptura de estructura','El stop','La zona'],0,'Por eso necesita zonas respaldadas.']]}),
entrada({id:'entrada-induccion',n:'Entrada por inducción',corto:'Inducción',sub:'La zona cercana que deja el retroceso',nivel:'Premium',
 cs:BASE.concat([[101,106.9,100.9,106.6],[106.6,106.8,104.9,105.2],[105.2,105.4,104.2,104.5],[104.5,106.3,104.3,106],[106,109.5,105.8,109.3],[109.3,113.2,109.1,112.9]]),
 k1:6,k2:7,k3:9,i0:9,e:105.2,s:103.9,o:109.1,a0:[CH],a1:[{t:'anillo',i:7,p:106.4,txt:'CHoCH',arriba:true,c:UP,vi:7}],z:[{t:'zona',p0:104.3,p1:105.2,i0:8,txt:'Zona de inducción',c:NV,en:.05}],
 t:['El precio cae a la zona del mínimo y rompe el CH con una vela grande.',
  'Después del CHoCH no vuelve hasta el mínimo: retrocede poco y deja una zona chica más arriba. Esa es la inducción.',
  'Entrada en esa zona cercana, stop debajo de ella y objetivo a tres veces el riesgo.',
  'El precio la respeta y continúa. Quien esperaba el mínimo se quedó afuera.'],
 claves:['No siempre vuelve a la zona extrema: se opera lo más cercano que cumpla factores.','La zona de inducción tiene que tener liquidez previa.','Stop corto: debajo de la zona de inducción.'],
 trampa:'Esperar siempre el mínimo y quedarte afuera del movimiento.',
 q:[['¿Dónde se entra en la entrada por inducción?',['En la zona cercana que deja el retroceso','Siempre en el mínimo','En la vela grande'],0,'Lo más cercano que cumpla factores.'],['¿Qué pasa con quien espera el mínimo?',['Se queda afuera','Gana más','Nada'],0,'El precio no vuelve tan lejos.'],['¿Dónde va el stop?',['Debajo de la zona de inducción','Debajo del mínimo mayor siempre','Arriba'],0,'Stop corto.']]}),
entrada({id:'entrada-induccion-2',n:'Entrada por inducción en continuación',corto:'Inducción 2',sub:'La pausa después del impulso',nivel:'Premium',
 cs:BASE.concat([[101,104.8,100.9,104.5],[104.5,106.9,104.3,106.7],[106.7,107,105.6,105.9],[105.9,109.8,105.7,109.6],[109.6,109.9,108.4,108.7],[108.7,109.2,107.6,107.9],[107.9,108.3,107.3,107.6],[107.6,111.3,107.4,111.1],[111.1,114.8,110.9,114.6],[114.6,117.9,114.4,117.6]]),
 k1:8,k2:10,k3:13,i0:13,e:107.6,s:106.3,o:111.5,a0:[CH,{t:'anillo',i:8,p:106.5,txt:'CHoCH',arriba:true,c:UP,vi:8}],a1:[{t:'caja',i0:10,i1:10,txt:'Impulso',c:UP,vi:10}],z:[{t:'zona',p0:106.6,p1:107.6,i0:10,txt:'Zona de inducción',c:NV,en:.05}],
 t:['Después del CHoCH, el precio ya está en tendencia nueva.',
  'Un impulso fuerte deja una zona en su base. Las velas rojas que siguen son la pausa, no un giro.',
  'Entrada en la zona del impulso, stop debajo de ella y objetivo a tres veces el riesgo.',
  'La pausa termina y el precio continúa. Es la misma lógica, en continuación.'],
 claves:['Cada impulso deja una zona en su base: ahí se apoya la continuación.','Las velas rojas en la pausa son liquidez, no cambio de tendencia.','Se opera a favor del CHoCH ya confirmado.'],
 trampa:'Vender las velas rojas de la pausa, en contra de la estructura nueva.',
 q:[['¿Qué son las velas rojas después del impulso?',['Una pausa que deja liquidez','Un cambio de tendencia','Nada'],0,'Se opera a favor.'],['¿Dónde está la zona?',['En la base del impulso','En el máximo','En el mínimo del día'],0,'Ahí se apoya la continuación.'],['¿A favor de qué se opera?',['Del CHoCH ya confirmado','De las velas rojas','De la noticia'],0,'Estructura nueva.']]}),
entrada({id:'entrada-envolvente',n:'Entrada envolvente',corto:'Envolvente',sub:'Una vela que se come a la anterior',nivel:'Grupal',
 cs:[[110,110.4,108.2,108.5],[108.5,108.7,106.6,106.9],[106.9,107.1,105,105.3],[105.3,107.6,105.1,107.3],[107.3,107.5,105.6,105.9],[105.9,106.1,103.6,103.9],[103.9,104.1,101.4,101.7],[101.6,104.6,100.9,104.3],[104.3,106.1,104.1,105.9],[105.9,106.3,104.8,105.1],[105.1,108.9,104.9,108.7],[108.7,113.1,108.5,112.9],[112.9,116.9,112.7,116.6]],
 k1:6,k2:7,k3:8,i0:8,e:104.3,s:100.6,o:115.4,a0:[{t:'zona',p0:100.9,p1:103,i0:5,txt:'Zona de H1',c:NV,en:.4}],a1:[{t:'caja',i0:6,i1:7,txt:'Envolvente',c:UP,vi:7}],z:[],
 t:['El precio cae hasta la zona marcada en H1.',
  'Aparece una vela verde que barre el mínimo de la roja y cierra por encima de su máximo: la envuelve.',
  'Entrada al cierre de la envolvente, stop debajo de su mínimo y objetivo a tres veces el riesgo.',
  'Los compradores tomaron el control y el precio sale hacia el objetivo. Es una de las entradas de Base 1.'],
 claves:['La envolvente barre el extremo de la vela anterior y cierra más allá de su cuerpo.','Solo cuenta dentro de la zona correcta.','Es entrada de Base 1: simple y en M5.'],
 trampa:'Operar una envolvente en el medio del rango, sin zona ni liquidez.',
 q:[['¿Qué hace una vela envolvente alcista?',['Barre el mínimo de la roja y cierra arriba de su cuerpo','Cierra igual que abre','Tiene solo mecha'],0,'Se come a la anterior.'],['¿Dónde tiene que aparecer?',['En la zona correcta','En cualquier lado','En el medio del rango'],0,'Sin zona no hay setup.'],['¿Dónde va el stop?',['Debajo del mínimo de la envolvente','Arriba','Sin stop'],0,'Donde la idea deja de valer.']]}),
entrada({id:'entrada-doblecandle',n:'Entrada doblecandle',corto:'Doblecandle',sub:'Dos velas que forman la zona',nivel:'Grupal',
 cs:[[110,110.4,108.2,108.5],[108.5,108.7,106.4,106.7],[106.7,108.4,106.5,108.1],[108.1,108.3,105.7,106],[106,106.2,104.3,104.6],[104.6,104.8,101.2,101.5],[101.5,104.2,101.1,103.9],[103.9,105.4,103.7,105.2],[105.2,105.5,104.1,104.4],[104.4,108.6,104.2,108.3],[108.3,112.8,108.1,112.5],[112.5,116.2,112.3,116]],
 k1:5,k2:6,k3:8,i0:7,e:103.9,s:100.6,o:113.8,a0:[],a1:[{t:'caja',i0:5,i1:6,txt:'Doblecandle',c:UP,vi:6}],z:[{t:'zona',p0:101.5,p1:103.9,i0:5,txt:'Zona',c:NV,en:.05}],
 t:['El precio cae con fuerza hasta el mínimo.',
  'Una vela roja y una verde del mismo tamaño, una al lado de la otra: la verde devuelve todo lo que bajó la roja. Juntas forman la zona.',
  'Entrada en el borde de la zona, stop debajo de las dos velas y objetivo a tres veces el riesgo.',
  'El precio vuelve a la zona, la respeta y sale.'],
 claves:['Dos velas opuestas y parecidas: la segunda devuelve el recorrido de la primera.','La zona va del cuerpo de una al de la otra.','Stop debajo del mínimo de las dos.'],
 trampa:'Llamar doblecandle a dos velas cualquiera fuera de zona.',
 q:[['¿Qué forma la doblecandle?',['Una vela roja y una verde opuestas que forman la zona','Dos velas verdes','Un doji'],0,'La segunda devuelve el recorrido.'],['¿Dónde va el stop?',['Debajo de las dos velas','Arriba de la entrada','En el medio'],0,'Ahí deja de valer.'],['¿Dónde se entra?',['En el borde de la zona','En el máximo','Sin zona'],0,'Se espera la vuelta.']]}),
entrada({id:'entrada-fractales',n:'Entrada por fractales',corto:'Fractales',sub:'Zonas escalonadas que se repiten',nivel:'Grupal',
 cs:[[111,111.3,109.6,109.9],[109.9,111.6,109.7,111.4],[111.4,111.6,104.2,104.6],[104.6,104.8,102.6,102.9],[102.9,103.1,101.1,101.4],[101.4,104.9,101.2,104.6],[104.6,105,103.3,103.6],[103.6,106.9,103.4,106.6],[106.6,106.8,105.2,105.5],[105.5,105.7,104.1,104.4],[104.4,108.6,104.2,108.3],[108.3,108.6,106.4,106.7],[106.7,107,105.6,105.9],[105.9,111.9,105.7,111.6],[111.6,116.4,111.4,116.2]],
 k1:7,k2:10,k3:12,i0:11,e:106.6,s:104,o:114.4,a0:[{t:'zona',p0:101.4,p1:102.9,i0:4,txt:'Zona 1',c:NV,en:.5}],a1:[{t:'zona',p0:104.4,p1:105.5,i0:9,txt:'Zona 2',c:NV,vi:10}],z:[{t:'zona',p0:105.9,p1:106.6,i0:11,txt:'Zona 3',c:GOLD,en:.05}],
 t:['El precio cae, deja una primera zona en el mínimo e impulsa.',
  'Cada impulso deja una zona nueva un escalón más arriba. El patrón se repite en escala: eso es un fractal.',
  'Entrada en la zona más cercana, stop debajo de la anterior y objetivo a tres veces el riesgo.',
  'El precio sube en escalones, apoyándose en cada zona.'],
 claves:['Cada impulso deja su zona: se forman escalones.','Se opera la zona más cercana que cumpla factores.','El stop va debajo del escalón anterior.'],
 trampa:'Esperar siempre la primera zona y no ver los escalones que deja la tendencia.',
 q:[['¿Qué es un fractal en esta entrada?',['El mismo patrón de zona que se repite en escalones','Un indicador','Una noticia'],0,'Cada impulso deja una zona.'],['¿Qué zona se opera?',['La más cercana que cumpla factores','Siempre la primera','Ninguna'],0,'Lo más cercano.'],['¿Dónde va el stop?',['Debajo del escalón anterior','Arriba','En el máximo'],0,'Si pierde el escalón, cambió la lectura.']]}),
entrada({id:'entrada-ifc',n:'Entrada por IFC',corto:'Por IFC',sub:'La vela que roba la liquidez y deja Imbalance',nivel:'Grupal',
 cs:[[110,110.3,108.4,108.7],[108.7,110.2,108.5,109.9],[109.9,110.1,106.3,106.6],[106.6,106.8,105,105.3],[105.3,107.6,105.1,107.3],[107.3,107.5,104.6,104.9],[104.9,104.95,102.6,102.9],[102.9,106.1,102.2,105.9],[105.9,108.6,105.6,108.3],[108.3,108.5,106,106.3],[106.3,106.5,105.4,105.7],[105.7,109.8,105.5,109.5],[109.5,113.9,109.3,113.6],[113.6,117.8,113.4,117.5]],
 k1:6,k2:8,k3:10,i0:9,e:105.6,s:101.9,o:116.7,a0:[{t:'anillo',i:6,p:103.8,txt:'OB: última vela contraria',c:NV,vi:6}],a1:[{t:'caja',i0:7,i1:7,txt:'IFC: roba y envuelve',c:UP,vi:7}],z:[{t:'zona',p0:104.95,p1:105.6,i0:7,txt:'Imbalance',c:GOLD,en:.05}],
 t:['En la zona, la última vela roja es el order block: deja la liquidez.',
  'La vela siguiente es el IFC: barre el mínimo de la roja, la envuelve y deja un Imbalance.',
  'Orden límite en el borde del Imbalance, stop debajo del IFC y objetivo en la liquidez mayor.',
  'El precio mitiga el Imbalance y sale. No te quedes corto: si la lógica marca la liquidez mayor, ese es el objetivo.'],
 claves:['El OB deja la liquidez; el IFC la toma.','La orden va en el borde del Imbalance que deja el IFC.','Stop debajo del IFC; objetivo en la liquidez mayor.'],
 trampa:'Confundir el IFC con el order block: el OB es la vela contraria, el IFC la que roba y envuelve.',
 q:[['¿Cuál es el IFC?',['La vela a favor que roba la liquidez de la anterior y deja Imbalance','La última vela contraria','Cualquier vela verde'],0,'El OB es la contraria.'],['¿Dónde va la orden?',['En el borde del Imbalance del IFC','En el máximo','En el mínimo del día'],0,'La entrada más simple de Base 1.'],['¿Dónde va el stop?',['Debajo del IFC','Arriba de la entrada','En el medio'],0,'Si lo pierde, la idea murió.']]}),
entrada({id:'entrada-50',n:'Entrada al 50',corto:'Al 50',sub:'La mitad de la vela del impulso',nivel:'Grupal',
 cs:[[110,110.3,108.6,108.9],[108.9,109.1,107,107.3],[107.3,108.9,107.1,108.6],[108.6,108.8,106.2,106.5],[106.5,106.7,104.4,104.7],[104.7,104.9,102.8,103.1],[103.1,110.4,102.5,110.1],[110.1,110.3,108.8,109.1],[109.1,109.4,106.4,106.9],[106.9,110.9,106.7,110.6],[110.6,114.9,110.4,114.6],[114.6,118.6,114.4,118.3]],
 k1:5,k2:6,k3:8,i0:7,e:106.45,s:102.1,o:115.15,a0:[],a1:[{t:'fib',i0:6,p0:102.5,i1:6,p1:110.4,niv:[0,.5,1],en:.4}],z:[],
 t:['El precio cae hasta la zona.',
  'Sale una vela de impulso enorme. Se traza Fibonacci sobre esa vela: cero arriba, uno abajo y el cincuenta en el medio.',
  'Orden límite en el cincuenta por ciento de la vela, stop debajo de su mínimo y objetivo a dos veces el riesgo.',
  'El precio retrocede justo a la mitad y continúa. Es la entrada equilibrada.'],
 claves:['Fibonacci sobre la vela del impulso: 0, 0,5 y 1.','La orden va en el 0,5: la mitad del recorrido.','Stop debajo del mínimo de la vela.'],
 trampa:'Perseguir la vela grande en vez de esperar el retroceso a la mitad.',
 q:[['¿Sobre qué se traza el Fibonacci en esta entrada?',['Sobre la vela del impulso','Sobre todo el mes','Sobre el RSI'],0,'0 arriba, 1 abajo.'],['¿Dónde va la orden?',['En el 0,5','En el 0','En el 1'],0,'La mitad del recorrido.'],['¿Qué tipo de entrada es?',['Equilibrada','Agresiva','Sin stop'],0,'Ni en el borde ni en el extremo.']]})
];
/* Set Ups A y B: ventas dibujadas como en TradingView: línea de entrada, stop gris arriba y objetivo azul abajo. */
function setAB(d){
  var o={id:d.id,tec:1,cat:'entradas',n:d.n,corto:d.corto,sub:d.sub,nivel:d.nivel,mas:d.mas,mini:3,tit:d.tit,t:d.t,claves:d.claves,trampa:d.trampa,q:d.q,practica:['stop','rr']};
  o.esc=[0,1,2,3].map(function(k){return function(S){var c=S.c,b=S.caja,w=b.w/3,y=function(v){return b.y+b.h*(1-(v-60)/(112-60))};
    if(!MINI){panel(c,b,S.z)}
    d.vars.forEach(function(v,j){var foco=k===3||k===j,a=foco?1:.28,x=b.x+w*j+w*.08,bw=Math.min(w*.12,S.z*1.8),e=v.e,s=v.s;c.save();c.globalAlpha*=a;
      var xb=x+bw*2.6,xe=b.x+w*(j+1)-w*.06,ap=k===3?1:k===j?sg(S.p,.35,.55):k>j?1:0;
      if(ap>0){c.save();c.globalAlpha*=ap;c.fillStyle='rgba(178,181,190,.28)';c.fillRect(xb,y(s),xe-xb,y(e)-y(s));c.fillStyle='rgba(120,150,255,.3)';c.fillRect(xb,y(e),xe-xb,y(64)-y(e));c.strokeStyle=INK;c.lineWidth=1.5;c.beginPath();c.moveTo(v.xl===0?x+bw/2:x+bw*1.5+bw/2,y(e));c.lineTo(xe,y(e));c.stroke();c.restore();
        if(foco&&(!MINI||MINIP)){pastilla(c,'Stop',xe-4,(y(s)+y(e))/2,TVTX,S.z*.75,'right',ap);pastilla(c,'Entrada',xb+4,y(e)+S.z*1.4,INK,S.z*.75,'left',ap);pastilla(c,'Objetivo',xe-4,(y(e)+y(64))/2,'#7896FF',S.z*.75,'right',ap)}}
      v.velas.forEach(function(q,i){var cx=x+bw/2+i*bw*1.5,col=q[3]>=q[0]?TVUP:TVDN;c.fillStyle=col;c.fillRect(cx-.75,y(q[1]),1.5,y(q[2])-y(q[1]));c.fillRect(cx-bw/2,y(Math.max(q[0],q[3])),bw,Math.max(2,y(Math.min(q[0],q[3]))-y(Math.max(q[0],q[3]))))});
      if(!MINI)tx(c,String(j+1),x+bw,b.y+b.h-S.z*.6,S.z*1.1,foco?GOLD:TVTX,'center',600);c.restore()});
    if(!MINI&&k<3)pastilla(c,d.notas[k],b.x+b.w/2,b.y-S.z*2.1,GOLD,S.z*.9,'center',sg(S.p,.1,.25));
    if(!MINI&&k===3)pastilla(c,d.regla,b.x+b.w/2,b.y-S.z*2.1,GOLD,S.z*.9,'center',sg(S.p,.1,.25))}});
  return o;
}
ENTRADAS.push(
setAB({id:'setups-a',n:'Set Ups A',corto:'Set Ups A',sub:'Venta por ruptura del mínimo de la vela',nivel:'1 a 1',
 vars:[{velas:[[104,105,97,99],[85,105.5,83,104.5]],e:97,s:106},{velas:[[104,105.5,97,98.5],[78,104.6,76,104]],e:78,s:105.5},{velas:[[104,105.5,97,98.5],[104,107,86,87]],e:86,s:107.5}],
 notas:['1 · Vela que no supera el máximo','2 · Envolvente que se agota','3 · Continuación bajista'],regla:'Misma regla: entrada en el mínimo, stop arriba del máximo',
 tit:['Variante 1','Variante 2','Variante 3','La regla de las tres'],
 t:['Set Ups A son ventas. En la primera variante, la vela blanca sube pero no supera el máximo de la negra. La orden va en el mínimo de referencia.',
  'En la segunda, una vela grande sube hasta el máximo y se agota. La orden va en su mínimo, con el stop arriba del máximo.',
  'En la tercera, una segunda vela negra confirma la caída. La orden va en su mínimo.',
  'La regla es la misma en las tres: entrada en el mínimo, stop arriba del máximo y un objetivo amplio en la liquidez de abajo.'],
 claves:['Son ventas: entrada en el mínimo de la vela de referencia.','Stop gris arriba del máximo; objetivo azul amplio abajo.','La relación riesgo/beneficio es grande porque el stop es corto.'],
 trampa:'Usar el patrón fuera de la zona de premium o en contra de la estructura.',
 q:[['¿Qué son los Set Ups A?',['Ventas por ruptura del mínimo de la vela','Compras','Indicadores'],0,'Entrada en el mínimo.'],['¿Dónde va el stop?',['Arriba del máximo','Debajo de la entrada','No lleva'],0,'La caja gris.'],['¿Por qué el objetivo es tan amplio?',['Porque el stop es corto y el objetivo es la liquidez de abajo','Porque sí','Por la noticia'],0,'Riesgo chico, recorrido grande.']]}),
setAB({id:'setups-b',n:'Set Ups B',corto:'Set Ups B',sub:'Venta después del sweep del máximo',nivel:'1 a 1',
 vars:[{velas:[[102,104,99,100],[96,110,96,100]],e:96,s:108,xl:1},{velas:[[102,104,99,100],[98,105,93,99.5]],e:98,s:104,xl:1},{velas:[[95,110,94,99],[79,103,75,97]],e:79,s:103.5,xl:1}],
 notas:['1 · Mecha larga arriba: sweep','2 · Doji con mechas a los dos lados','3 · Sweep y vela de caída'],regla:'Misma regla: sweep arriba, entrada en el mínimo del cuerpo',
 tit:['Variante 1','Variante 2','Variante 3','La regla de las tres'],
 t:['Set Ups B también son ventas. En la primera variante, la vela blanca barre el máximo con una mecha larga y vuelve: es un sweep. La orden va en el mínimo de su cuerpo.',
  'En la segunda, la vela queda indecisa, con mechas a los dos lados. La orden va en el mínimo de su cuerpo.',
  'En la tercera, después del sweep aparece una vela que ya cae. La orden va en el mínimo de esa vela.',
  'La regla: primero el sweep del máximo, después la entrada en el mínimo del cuerpo, con el stop arriba de la mecha.'],
 claves:['Primero el sweep del máximo, después la venta.','La orden va en el mínimo del cuerpo de la vela que barre.','Stop arriba de la mecha del sweep.'],
 trampa:'Vender antes de que la vela cierre: si cierra arriba del máximo, no fue sweep.',
 q:[['¿Qué tiene que pasar antes de la venta en Set Ups B?',['Un sweep del máximo','Una noticia','Un cruce de medias'],0,'Mecha arriba que vuelve.'],['¿Dónde va la orden?',['En el mínimo del cuerpo de la vela','En el máximo','En el medio'],0,'Ruptura del cuerpo.'],['¿Dónde va el stop?',['Arriba de la mecha del sweep','Debajo de la entrada','No lleva'],0,'Si supera la mecha, la idea murió.']]})
);
ENTRADAS.forEach(function(l){l.tec=1;l.cat='entradas';L.push(l)});

/* Conceptos que faltaban y demos de las teorías propias (la profundidad queda en los niveles privados). */
var DEMOS=[
lecM({id:'inducement',n:'Inducement: la carnada',corto:'Inducement',sub:'La liquidez fácil antes de la zona real',nivel:'Grupal',
 vm:{ext:[98.5,113],pts:[[0,108],[3,100.4],[8,108.2],[12,104.6],[14,106.2],[17,104],[18,104.8],[20,101.1],[30,112]],sem:281},
 tit:['La zona real','El inducement','Barre la carnada','Recién ahí, la zona'],
 t:['El institucional es un pescador: va donde hay cardumen. Abajo está la zona real, el order block en descuento.',
  'Justo encima queda un mínimo interno obvio. El minorista compra ahí y pone su stop debajo: esa es la carnada, el inducement.',
  'El precio barre ese mínimo y saca a todos por stop. Esas ventas forzadas son la liquidez que necesita el institucional.',
  'Recién después mitiga la zona real y se expande. Zona protegida por un inducement ya barrido: alta probabilidad.'],
 sc:[{h:[0,8],an:[{t:'zona',p0:100.4,p1:101.4,i0:2,txt:'Zona real',c:NV,en:.4}]},
  {h:[8,14],an:[{t:'zona',p0:100.4,p1:101.4,i0:2,txt:'Zona real',c:NV,en:0},{t:'niv',p:104.6,x0:12,txt:'IDM · los minoristas compran',c:LQ,vi:12}]},
  {h:[14,18],an:[{t:'zona',p0:100.4,p1:101.4,i0:2,c:NV,en:0},{t:'niv',p:104.6,x0:12,txt:'IDM',c:LQ,en:0},{t:'anillo',i:17,p:104.2,txt:'Barre el IDM',c:LQ,vi:17}]},
  {h:[18,30],an:[{t:'zona',p0:100.4,p1:101.4,i0:2,txt:'Zona real',c:NV,en:0},{t:'niv',p:104.6,x0:12,txt:'IDM',c:LQ,en:0},{t:'anillo',i:20,p:101.3,txt:'Mitiga la zona real',c:NV,vi:20}]}],
 claves:['Inducement (IDM): la liquidez fácil antes de la zona real.','Zona sin inducement delante = zona débil.','Donde está el miedo del minorista, está la liquidez del institucional.'],
 trampa:'Entrar en la zona antes de que se barra el inducement.',practica:['ruptura','nivel'],
 q:[['¿Qué es el inducement?',['La liquidez fácil antes de la zona real','El objetivo final','Un indicador'],0,'La carnada.'],['Tengo un OB en descuento y arriba un mínimo interno sin tocar. ¿Entro ya?',['Sí','No: espero que barra ese mínimo','Entro el doble'],1,'Si llega sin tomar esa liquidez, puede atravesar la zona.'],['¿Qué zona tiene más probabilidad?',['La protegida por un IDM ya barrido','La que no tiene nada delante','Cualquiera'],0,'Ya se tomó la carnada.']]}),
lecM({id:'breaker',n:'OB en quiebre: breaker block',corto:'Breaker',sub:'El piso que se vuelve techo',nivel:'Grupal',
 vm:{ext:[96.5,112],pts:[[0,101],[4,104.8],[5,104],[9,110],[13,106.6],[15,107.8],[20,101],[24,104.5],[32,97.5]],sem:291},
 tit:['Un order block','Lo atraviesa con desplazamiento','Cambia de rol','Vuelve y rechaza'],
 t:['En la subida, la última vela contraria antes del impulso es un order block alcista.',
  'Más tarde, el precio lo atraviesa con desplazamiento y cierra el cuerpo abajo. El bloque se rompió.',
  'Un bloque atravesado cambia de rol: se vuelve breaker block. El piso ahora es techo.',
  'Cuando el precio vuelve desde abajo, el breaker lo rechaza. Ahí se buscan ventas.'],
 sc:[{h:[0,9],an:[{t:'anillo',i:5,p:104.4,txt:'Última vela contraria',c:NV,vi:5},{t:'zona',p0:104,p1:104.8,i0:5,txt:'Order block',c:UP,izq:true,vi:7}]},
  {h:[9,20],an:[{t:'zona',p0:104,p1:104.8,i0:5,txt:'Order block',c:UP,izq:true,en:0},{t:'anillo',ifn:function(cs){for(var i=14;i<cs.length;i++)if(cs[i].c<104)return i;return 17},p:104,txt:'Cierra el cuerpo abajo',c:DN,en:.6}]},
  {h:[20,20],an:[{t:'zona',p0:104,p1:104.8,i0:5,txt:'Breaker: ahora es techo',c:DN,izq:true,en:.15}]},
  {h:[20,32],an:[{t:'zona',p0:104,p1:104.8,i0:5,txt:'Breaker',c:DN,izq:true,en:0},{t:'anillo',i:24,p:104.4,txt:'Rechazo: se buscan ventas',arriba:true,c:DN,vi:24}]}],
 claves:['Breaker: un order block atravesado con desplazamiento.','Cambia de rol: el piso se vuelve techo, y al revés.','Se valida con cierre de cuerpo del otro lado.'],
 trampa:'Seguir comprando en un bloque que ya fue atravesado con cuerpo.',practica:['ruptura','setup'],
 q:[['¿Qué es un breaker block?',['Un OB atravesado con desplazamiento que cambia de rol','Un OB nuevo','Una vela doji'],0,'El piso se vuelve techo.'],['¿Qué valida que el bloque se rompió?',['Un cierre de cuerpo del otro lado','Una mecha','El volumen'],0,'Cuerpo, no mecha.'],['Después de romperse un OB alcista, ¿qué se busca en el retesteo?',['Ventas','Compras','Nada'],0,'Ahora es techo.']]}),
lecM({id:'doble-mitigacion',n:'Doble mitigación',corto:'Doble mitigación',sub:'La zona se activa en dos tiempos',nivel:'Premium',
 vm:{ext:[99.5,115],pts:[[0,110],[5,102.3],[10,108.2],[13,103.5],[16,107],[20,102.8],[30,114]],sem:301},
 tit:['La zona','1.er tiempo: toque con mecha','2.º tiempo: mitiga el cuerpo','Sale el movimiento real'],
 t:['Una teoría propia del método. Partimos de una zona marcada con el cuerpo de la vela raíz.',
  'Primer tiempo: el precio toca la zona solo con la mecha. Es un toque falso: crea liquidez.',
  'Segundo tiempo: vuelve y mitiga el cuerpo de la zona. Ahí sale el movimiento real.',
  'Esto es la demo. Cómo filtrar cada tiempo y dónde entrar se enseña en el nivel Premium.'],
 sc:[{h:[0,10],an:[{t:'zona',p0:102.3,p1:103.8,i0:4,txt:'Zona · cuerpo de la vela raíz',c:NV,izq:true,en:.4}]},
  {h:[10,16],an:[{t:'zona',p0:102.3,p1:103.8,i0:4,txt:'Zona',c:NV,izq:true,en:0},{t:'anillo',i:13,p:103.7,txt:'1.er tiempo: solo la mecha',c:LQ,vi:13}]},
  {h:[16,20],an:[{t:'zona',p0:102.3,p1:103.8,i0:4,txt:'Zona',c:NV,izq:true,en:0},{t:'marca',i:13,p:103.5,txt:'1',c:LQ,en:0},{t:'anillo',i:20,p:103.1,txt:'2.º tiempo: mitiga el cuerpo',c:NV,vi:20}]},
  {h:[20,30],an:[{t:'zona',p0:102.3,p1:103.8,i0:4,txt:'Zona',c:NV,izq:true,en:0},{t:'marca',i:13,p:103.5,txt:'1',c:LQ,en:0},{t:'marca',i:20,p:102.8,txt:'2',c:NV,en:0},{t:'top',txt:'La entrada exacta: nivel Premium',c:GOLD,en:.4}]}],
 claves:['Primer toque con mecha: falso, crea liquidez.','Segundo tiempo: mitigación del cuerpo, donde sale el movimiento real.','La lectura completa es Premium.'],
 trampa:'Entrar en el primer toque con mecha, que es justo el que crea la liquidez.',practica:['setup'],
 q:[['En la doble mitigación, el primer toque con mecha es…',['Falso: crea liquidez','La entrada principal','El stop'],0,'Prepara el segundo tiempo.'],['¿Dónde sale el movimiento real?',['En la mitigación del cuerpo','En la mecha','Nunca'],0,'Segundo tiempo.'],['¿Con qué se marca la zona?',['Con el cuerpo de la vela raíz','Con la mecha','Con una línea cualquiera'],0,'La mecha se usa para leer el falso toque.']]}),
lecM({id:'tres-toques',n:'Teoría de los 3 toques',corto:'3 toques',sub:'Qué toque se opera y cuál no',nivel:'Premium',
 vm:{ext:[99.5,115],pts:[[0,110],[5,102.6],[9,106.4],[13,102.2],[17,105.4],[19,103.9],[21,104.7],[24,101.95],[33,114]],sem:311},
 tit:['1.er toque: no se opera','2.º toque: la entrada principal','El 3.er toque','La regla de los toques'],
 t:['Otra teoría propia. El primer toque a la zona genera la primera reacción y deja liquidez. Es el que más engaña: no se opera.',
  'El segundo toque barre esa liquidez y suele dar el movimiento limpio. Es la entrada principal, siempre con una envolvente a favor.',
  'El tercer toque llega después de una acumulación, con sweep. Solo se opera en zonas respaldadas.',
  'Cuándo un toque es válido y cómo se confirma se enseña completo en el nivel Premium.'],
 sc:[{h:[0,9],an:[{t:'zona',p0:101.7,p1:103,i0:4,txt:'Zona',c:NV,izq:true,en:.2},{t:'anillo',i:5,p:102.8,txt:'1.er toque: deja liquidez',c:LQ,vi:5}]},
  {h:[9,16],an:[{t:'zona',p0:101.7,p1:103,i0:4,txt:'Zona',c:NV,izq:true,en:0},{t:'niv',p:102.6,x0:5,x1:13,c:LQ,en:0},{t:'anillo',i:13,p:102.4,txt:'2.º: barre y entra',c:UP,vi:13}]},
  {h:[16,26],an:[{t:'zona',p0:101.7,p1:103,i0:4,txt:'Zona',c:NV,izq:true,en:0},{t:'caja',i0:17,i1:21,txt:'Acumulación',c:TVTX,vi:21},{t:'anillo',i:24,p:102.2,txt:'3.º: solo si la zona respalda',c:AM,vi:24}]},
  {h:[24,26],an:[{t:'zona',p0:101.7,p1:103,i0:4,txt:'Zona',c:NV,izq:true,en:0},{t:'lista',items:['1.er toque: deja liquidez','2.º toque: la entrada','3.er toque: solo si respalda'],cs:[LQ,UP,AM],en:.1}]}],
 claves:['No se opera el primer toque: deja liquidez.','El segundo barre esa liquidez: entrada principal, con envolvente.','El tercero, después de acumular, solo en zonas respaldadas.'],
 trampa:'Entrar en el primer toque, que es el que más engaña.',practica:['setup','nivel'],
 q:[['¿Se opera el primer toque?',['No: deja liquidez','Sí, siempre','Solo los viernes'],0,'Es el que más engaña.'],['¿Cuál es la entrada principal?',['El segundo toque','El primero','Ninguno'],0,'Barre la liquidez del primero.'],['¿Con qué se confirma cada toque?',['Con una envolvente a favor','Con el RSI','Con una noticia'],0,'Sin envolvente no hay toque operable.']]}),
lecM({id:'vela-contraria',n:'Vela contraria',corto:'Vela contraria',sub:'Cuando el precio no necesita ir tan lejos',nivel:'Premium',
 vm:{ext:[98.5,120],pts:[[0,100.6],[2,100],[7,106.8],[8,105.9],[12,111],[16,105.65],[27,118.5]],sem:321},
 tit:['Una vela de otro color','Su extremo es liquidez','El retroceso la toma','Y sigue'],
 t:['En plena subida aparece una sola vela bajista. Es la vela contraria.',
  'Debajo de su mínimo quedan stops: es liquidez suficiente. Muchos esperan el bajo mayor para comprar.',
  'En el retroceso, el precio toma el mínimo de la vela contraria, no el bajo mayor.',
  'Y continúa. La vela contraria ya hizo el trabajo; quien esperaba el bajo mayor quedó afuera. La lectura fina es Premium.'],
 sc:[{h:[0,12],an:[{t:'anillo',i:8,p:106.3,txt:'Vela contraria',c:DN,vi:8}]},
  {h:[12,12],an:[{t:'anillo',i:8,p:106.3,c:DN,en:0},{t:'niv',p:105.9,x0:8,txt:'IDM: mínimo de la vela contraria',c:LQ,en:.1},{t:'niv',p:100,x0:2,txt:'Bajo mayor · no se toca',c:TVTX,abajo:true,en:.4}]},
  {h:[12,16],an:[{t:'niv',p:105.9,x0:8,txt:'IDM',c:LQ,en:0},{t:'niv',p:100,x0:2,txt:'Bajo mayor',c:TVTX,abajo:true,en:0},{t:'anillo',i:16,p:105.8,txt:'Toma la vela contraria',c:LQ,vi:16}]},
  {h:[16,27],an:[{t:'niv',p:105.9,x0:8,txt:'IDM',c:LQ,en:0},{t:'niv',p:100,x0:2,txt:'Bajo mayor: nunca se tocó',c:TVTX,abajo:true,en:0},{t:'flecha',i0:17,p0:106.5,i1:26,p1:117.5,c:UP,en:.3}]}],
 claves:['Vela contraria: una vela de color opuesto dentro del impulso.','Su extremo funciona como inducción.','El precio la toma en lugar de ir al bajo mayor.'],
 trampa:'Esperar siempre el bajo mayor y quedarte afuera del movimiento.',practica:['setup','tendencia'],
 q:[['¿Qué es la vela contraria?',['Una vela de color opuesto dentro del impulso','Un doji','La vela del día'],0,'En una subida, una vela bajista.'],['¿Qué toma el precio en el retroceso?',['El extremo de la vela contraria','Siempre el bajo mayor','Nada'],0,'Es liquidez suficiente.'],['¿Qué le pasa a quien espera el bajo mayor?',['Se queda afuera','Gana más','Nada'],0,'La vela contraria ya hizo el trabajo.']]}),
lecM({id:'rompimiento-123',n:'Patrón de rompimiento 1, 2, 3',corto:'Rompimiento 1-2-3',sub:'Avisa, habilita y continúa',nivel:'Premium',
 vm:{ext:[101,114],pts:[[0,103.4],[4,106],[7,102.8],[10,106.8],[13,103.4],[17,107.8],[19,106.5],[22,110],[24,109],[31,113.4]],sem:331},
 tit:['Rompimiento 1: avisa','Rompimiento 2: habilita','Rompimiento 3: continuación','La regla'],
 t:['El precio rompe un nivel por primera vez. Es un aviso, no una entrada: el primero muchas veces es falso.',
  'Vuelve a romper en la misma dirección. Ahora sí: el segundo rompimiento habilita la entrada.',
  'El tercero es continuación: se gestiona lo que ya está abierto.',
  'El primero avisa, el segundo confirma la intención y el tercero continúa. La ejecución fina es Premium.'],
 sc:[{h:[0,13],an:[{t:'niv',p:106,x0:0,txt:'Nivel',c:GOLD,izq:true,en:.2},{t:'anillo',i:10,p:106.5,txt:'1 · Avisa y vuelve',arriba:true,c:LQ,vi:10}]},
  {h:[13,19],an:[{t:'niv',p:106,x0:0,txt:'Nivel',c:GOLD,izq:true,en:0},{t:'marca',i:10,p:106.8,txt:'1',arriba:true,c:LQ,en:0},{t:'anillo',i:17,p:107.4,txt:'2 · Habilita la entrada',arriba:true,c:UP,vi:17}]},
  {h:[19,24],an:[{t:'niv',p:106,x0:0,txt:'Nivel',c:GOLD,izq:true,en:0},{t:'marca',i:10,p:106.8,txt:'1',arriba:true,c:LQ,en:0},{t:'marca',i:17,p:107.8,txt:'2',arriba:true,c:UP,en:0},{t:'anillo',i:22,p:109.6,txt:'3 · Continuación',arriba:true,c:GOLD,vi:22}]},
  {h:[24,31],an:[{t:'niv',p:106,x0:0,c:GOLD,en:0},{t:'lista',items:['1 · Avisa','2 · Habilita','3 · Continúa'],cs:[LQ,UP,GOLD],izq:true,en:.1}]}],
 claves:['Rompimiento 1: aviso, suele ser falso.','Rompimiento 2: habilita la entrada.','Rompimiento 3: continuación, se gestiona.'],
 trampa:'Entrar en el primer rompimiento, que muchas veces es falso.',practica:['ruptura'],
 q:[['¿Qué hace el primer rompimiento?',['Avisa: suele ser falso','Habilita la entrada','Cierra el trade'],0,'Es un aviso.'],['¿Cuál habilita la entrada?',['El segundo','El primero','El tercero'],0,'Confirma la intención.'],['¿Qué se hace en el tercero?',['Se gestiona lo abierto','Se entra con todo','Se vende'],0,'Es continuación.']]})
];
DEMOS.forEach(function(l){L.push(l)});

var ORDM=['liquidez','inducement','barrido','estructura','premium-descuento','imbalance','order-block','breaker','sesiones','modelo','doble-mitigacion','tres-toques','vela-contraria','rompimiento-123'];
(function(){var m=L.filter(function(l){return l.cat==='metodo'}).sort(function(a,b){return ORDM.indexOf(a.id)-ORDM.indexOf(b.id)}),r=L.filter(function(l){return l.cat!=='metodo'});L.length=0;r.concat(m).forEach(function(l){L.push(l)})})();
var PROPIAS=[['Doble mitigación','La zona se activa en dos tiempos.'],['Teoría de los 3 toques','Qué toque se opera y cuál no.'],['Vela contraria','Cuando el precio no necesita ir tan lejos.'],['Patrón de rompimiento 1, 2, 3','Cuál rompimiento avisa y cuál habilita.'],['Bloque extremo vs decisional','Cuál manda cuando dos zonas compiten.'],['Entradas sin quiebre','Lectura fina en M1, nivel Premium.']];



/* ---- dibujo de cada escena ---- */
function base(c,W,H,l,p,T){var k=CAT[l.cat],pt=H>W;VW=W;return{l:l,c:c,W:W,H:H,pt:pt,p:p,T:T,A:k[1],B:k[2],z:Math.min(W,H)*(pt?.036:.03),caja:pt?{x:W*.07,y:H*.2,w:W*.84,h:H*.71}:{x:W*.07,y:H*.205,w:W*.85,h:H*.48}}}
function dibujar(c,W,H,l,i,p,T){
  var S=base(c,W,H,l,p,T);MINI=false;c.textBaseline='alphabetic';M.fondo(c,W,H,T,S.A,S.B);
  var v=eo(sg(p,0,.06));c.save();c.globalAlpha=v;c.translate(0,(1-v)*10);
  c.globalAlpha=v*eo(sg(p,0,.12));tx(c,l.tit[i],W/2,H*(S.pt?.095:.088),Math.min(W,H)*(S.pt?.058:.054),INK,'center',600,W*.88);c.globalAlpha=v;
  l.esc[i](S);c.restore();c.globalAlpha=1;
}
function miniatura(c,W,H,l,T){
  var S=base(c,W,H,l,0,T),u=(T/7)%1;S.p=u<.85?u/.85:1;S.z=Math.min(W,H)*.05;S.caja={x:W*.05,y:H*.08,w:W*.9,h:H*.84};MINI=true;MINIP=false;c.clearRect(0,0,W,H);c.textBaseline='alphabetic';
  try{l.esc[l.mini||0](S)}finally{MINI=false;MINIP=false}
}

/* ---- ejercicios: cada uno tiene una respuesta objetiva ---- */
function ent(r,a,b){return a+Math.floor(r()*(b-a+1))}
function elegir(r,xs){return xs[Math.floor(r()*xs.length)]}
function zig(r,n,ini,paso,dir,amp){var pts=[[0,ini]],v=ini,i=0,arriba=r()<.5;while(i<n-1){var d=ent(r,3,6);i=Math.min(n-1,i+d);var m=(arriba?1:-1)*amp*(.7+r()*.6);v+=dir*paso*d/4.5+m;arriba=!arriba;pts.push([i,v])}return pts}
function voltear(cs,m){return cs.map(function(v){return{o:2*m-v.o,c:2*m-v.c,h:2*m-v.l,l:2*m-v.h}})}
function base3(r){var Z=100+r()*3,lo=Z-8-r()*2,pts=[[0,lo],[6,Z-2.5],[10,Z-5.5],[16,Z],[20,Z-3],[26,Z+5+r()*2],[31,Z+.9]];return{Z:Z,cs:serieLimpia(pts,ent(r,1,9e5),.45,.6)}}
var EJ={
 imbalance:function(r){var baj=r()<.5,b0=100+r()*2,cs=serie([[0,b0],[6,b0+2],[10,b0-1],[16,b0+.5]],ent(r,1,9e5),.4,.5),x=cs[cs.length-1].c,g=1.4+r()*1.2;
  var c1={o:x,h:x+.6,l:x-.5,c:x+.4},c2={o:c1.c,h:c1.c+4.3,l:c1.c-.1,c:c1.c+4},c3={o:c2.c,l:c1.h+g,c:c2.c+.6,h:c2.c+1};cs.push(c1,c2,c3);var pv=c3.c;for(var k=0;k<3;k++){var nv=pv+.3+r()*.8;cs.push({o:pv,c:nv,h:nv+r()*.4,l:Math.max(c3.l+.2,pv-r()*.4)});pv=nv}
  var bot=c1.h,top=c3.l,mid=(bot+top)/2,par=elegir(r,[[top,top+g*.6],[bot,bot-g*.6],[top,bot-g*.6],[bot,top+g*.6]]),i1=cs.length-6,m=mid;
  if(baj){cs=voltear(cs,m);bot=2*m-c3.l;top=2*m-c1.h;par=par.map(function(v){return 2*m-v})}
  var ls=[mid].concat(par).sort(function(a,b){return b-a}),ok=ls.indexOf(mid);
  return{preg:'Desplazamiento '+(baj?'bajista':'alcista')+' con Imbalance. ¿Qué línea marca el 50 % del Imbalance?',ops:['A','B','C'],ok:ok,exp:'Es la mitad exacta entre '+(baj?'el mínimo de la vela 1 y el máximo de la vela 3':'el máximo de la vela 1 y el mínimo de la vela 3')+'. Ahí el método espera la entrada.',
   dib:function(S,rev){var G=graf(S,cs,99,{ext:ls,antes:function(G){var x0=G.x(i1)-G.paso/2,x1=G.b.x+G.b.w;S.c.fillStyle=rgba(GOLD,.16);S.c.fillRect(x0,G.y(Math.max(bot,top)),x1-x0,G.y(Math.min(bot,top))-G.y(Math.max(bot,top)));pastilla(S.c,'Imbalance',x0+4,G.y(Math.max(bot,top))-S.z*1.5,GOLD,S.z*.85,'left',1)}});
    ls.forEach(function(v,j){nivel(S.c,G,v,rev?(j===ok?UP:MUT):AQ,1,{x0:i1-6,g:j===ok&&rev?3:2,txt:'ABC'[j],z:S.z*1.05})})}}},
 setup:function(r){var k=r()<.5?0:ent(r,1,2),cor=r()<.5,b=base3(r),Z=b.Z,cs=b.cs,u=cs[cs.length-1].c,v=[{o:Math.min(u,Z+.9),l:Z-.5,c:Z+1.5,h:Z+1.7},{o:Math.min(u,Z+.8),h:Math.min(u,Z+.8)+.2,l:Z-2.5,c:Z-2.1},{o:Math.max(u,Z+1.5),h:Math.max(u,Z+1.5)+.2,l:Z-.25,c:Z-.1}][k];cs.push(v);if(cor){cs=voltear(cs,Z);v=cs[cs.length-1]}
  return{preg:cor?'Tendencia bajista y el precio volvió a la zona. Mirá la última vela: ¿hay setup de venta?':'Tendencia alcista y el precio volvió a la zona. Mirá la última vela: ¿hay setup de compra?',ops:[cor?'Sí: entro abajo de la vela':'Sí: entro arriba de la vela','No: espero'],ok:k?1:0,
   exp:(cor?['Mecha larga arriba y cierre debajo de la zona: aparecieron vendedores.','Cerró con fuerza arriba de la zona: la idea murió.','Vela verde sin rechazo: todavía no hay gatillo. Se espera.']:['Mecha larga abajo y cierre arriba de la zona: aparecieron compradores.','Cerró con fuerza debajo de la zona: la idea murió.','Vela roja sin rechazo: todavía no hay gatillo. Se espera.'])[k],
   dib:function(S,rev){var G=graf(S,cs,99,{ext:cor?[Z+3,Z-9]:[Z-3,Z+9],antes:function(G){zonaDib(S,G,[Z,.6],'Zona',1)}});anillo(S.c,G.x(cs.length-1),G.y((v.h+v.l)/2),Math.max(S.z*1.4,(G.y(v.l)-G.y(v.h))*.8),rev?(k?DN:UP):INK,.8)}}},
 stop:function(r){var cor=r()<.5,b=base3(r),Z=b.Z,cs=b.cs,u=cs[cs.length-1].c,v={o:Math.min(u,Z+.9),l:Z-.5,c:Z+1.5,h:Z+1.7};cs.push(v);var e=v.h+.2,ok=v.l-.5,dec=[['arriba',e+1.8+r()],['ajustado',Z+.7],['lejos',ok-3.5-r()*1.5]].sort(function(){return r()-.5}).slice(0,2),f=function(x){return cor?2*Z-x:x};
  if(cor){cs=voltear(cs,Z);e=f(e);ok=f(ok);dec=dec.map(function(d){return[d[0],f(d[1])]})}
  var ls=[ok].concat(dec.map(function(d){return d[1]})).sort(function(a,b){return b-a}),k=ls.indexOf(ok),mal=dec.map(function(d){return d[0]});
  return{preg:cor?'Venta abajo de la estrella fugaz. ¿Qué línea es el stop correcto del setup?':'Compra arriba del martillo. ¿Qué línea es el stop correcto del setup?',ops:['A','B','C'],ok:k,exp:(cor?'Justo arriba de la mecha de la vela y de la zona':'Justo debajo de la mecha del martillo y de la zona')+': ahí la idea deja de valer.'+(mal.indexOf('ajustado')>=0?' Adentro de la vela, el ruido te saca.':'')+(mal.indexOf('lejos')>=0?' Muy lejos arriesgás de más sin motivo.':'')+(mal.indexOf('arriba')>=0?(cor?' Del lado de la ganancia':' Arriba de la entrada')+' no protege nada.':''),
   dib:function(S,rev){var G=graf(S,cs,99,{ext:ls.concat([cor?Z-9:Z+9,e]),antes:function(G){zonaDib(S,G,[Z,.6],'Zona',1)}});nivel(S.c,G,e,INK,1,{x0:cs.length-2,g:2,dash:false});ls.forEach(function(x,j){nivel(S.c,G,x,rev?(j===k?UP:MUT):DN,1,{x0:cs.length-6,g:j===k&&rev?3:2,txt:'ABC'[j],z:S.z*1.05})})}}},
 tendencia:function(r){var k=ent(r,0,2),dir=[1,-1,0][k],pts=zig(r,44,100,dir?2.2:0,dir,dir?2.6:3.2);if(!dir){pts=pts.map(function(q,i){return[q[0],i%2?104+r()*1.2:98.5+r()*1.2]})}var cs=serie(pts,ent(r,1,9e5),.5,.7);
  return{preg:'¿Qué tendencia ves?',ops:['Alcista','Bajista','Lateral'],ok:k,exp:['Máximos y mínimos cada vez más altos: una escalera que sube.','Máximos y mínimos cada vez más bajos: una escalera que baja.','Va y viene entre un piso y un techo, sin escalones.'][k],
   dib:function(S,rev){var G=graf(S,cs,cs.length);if(rev)escalon(S,G,99,pts.slice(1,-1),[UP,DN,AM][k])}}},
 nivel:function(r){var sop=r()<.5,L=100,pts=[[0,sop?106:94]],i=0,t=0;while(i<38){i+=ent(r,4,6);t++;pts.push([i,t%2?(sop?L:L):(sop?L+5+r()*3:L-5-r()*3)])}
  if(!sop)pts=pts.map(function(q,j){return j&&j%2?[q[0],100]:q});var cs=serie(pts,ent(r,1,9e5),.5,.7),sg2=sop?1:-1,cand=[L+sg2*(2.1+r()*.9),L+sg2*(4.1+r()*.6),L-sg2*(2.4+r()*1.4)].sort(function(){return r()-.5}),otros=cand.slice(0,2),ls=[L].concat(otros).sort(function(a,b){return b-a}),ok=ls.indexOf(L);
  return{preg:sop?'¿Cuál línea es el soporte más claro?':'¿Cuál línea es la resistencia más clara?',ops:['A','B','C'],ok:ok,exp:sop?'Es la que el precio tocó varias veces y rebotó.':'Es la que el precio tocó varias veces y lo frenaron.',
   dib:function(S,rev){var G=graf(S,cs,cs.length,{ext:ls});ls.forEach(function(v,j){nivel(S.c,G,v,rev?(j===ok?UP:MUT):AQ,1,{g:j===ok&&rev?3:2,txt:'ABC'[j],z:S.z*1.1,izq:true})});if(rev)pts.forEach(function(q){if(Math.abs(q[1]-L)<.01)anillo(S.c,G.x(q[0]),G.y(L),S.z*.9,UP,1)})}}},
 vela:function(r){var tipos=[['martillo','¿Cuál muestra rechazo de los precios bajos (mecha larga abajo)?'],['estrella','¿Cuál muestra rechazo de los precios altos (mecha larga arriba)?'],['doji','¿Cuál muestra indecisión (casi sin cuerpo)?'],['llena','¿Cuál cerró en su máximo, sin mecha arriba?']],
   q=elegir(r,tipos),resto=tipos.filter(function(x){return x!==q}),ok=ent(r,0,2),xs=[];resto.sort(function(){return r()-.5});for(var j=0,m=0;j<3;j++)xs.push(j===ok?q[0]:resto[m++][0]);
   var V={martillo:function(){var o=103+r(),c=o+.6+r()*.5;return{o:o,c:c,h:c+.2,l:o-4.5}},estrella:function(){var o=97+r(),c=o-.6-r()*.5;return{o:o,c:c,h:o+4.5,l:c-.2}},doji:function(){var o=100+r()*2-1;return{o:o,c:o+.08,h:o+2.4,l:o-2.3}},llena:function(){var o=98+r(),c=o+4;return{o:o,c:c,h:c,l:o-.9}}},cs=xs.map(function(t){return V[t]()});
   return{preg:q[1],ops:['A','B','C'],ok:ok,exp:{martillo:'El precio bajó fuerte y lo devolvieron para arriba.',estrella:'Subió fuerte y lo empujaron de vuelta para abajo.',doji:'Abrió y cerró casi en el mismo precio: nadie ganó.',llena:'Los compradores dominaron hasta el final.'}[q[0]],
    dib:function(S,rev){var b=S.caja,y=function(v){return b.y+b.h*(1-(v-91)/(110-91))},bw=Math.min(b.w*.12,b.h*.2);cs.forEach(function(v,j){var cx=b.x+b.w*(.2+j*.3);S.c.globalAlpha=rev&&j!==ok?.35:1;velaG(S.c,cx,bw,y,v.o,v.h,v.l,v.c);S.c.globalAlpha=1;tx(S.c,'ABC'[j],cx,b.y+b.h+S.z*.2,S.z*1.4,rev&&j===ok?UP:INK,'center',600)})}}},
 ruptura:function(r){var ok=r()<.5?0:1,res=r()<.6,L=110,pts=[[0,104]],i=0,t=0;while(i<26){i+=ent(r,4,5);t++;pts.push([i,t%2?L:L-7+r()*3])}if(pts[pts.length-1][1]===L)pts.push([i+3,L-4]);i=pts[pts.length-1][0];pts.push([i+3,L-1.2]);
  if(!res)pts=espejo(pts,105);var cs=serie(pts,ent(r,1,9e5),.45,.6),u=cs[cs.length-1].c,s=res?1:-1,lv=res?L:100,ex=ok===0?{o:u,c:lv+s*(1.6+r()),h:0,l:0}:{o:u,c:lv-s*(.6+r()*.5),h:0,l:0};
  if(res){ex.h=ok?lv+2.4+r():Math.max(ex.c,u)+.4;ex.l=Math.min(ex.o,ex.c)-.4}else{ex.l=ok?lv-2.4-r():Math.min(ex.c,u)-.4;ex.h=Math.max(ex.o,ex.c)+.4}cs.push(ex);
  var sig=[],pv=ex.c;for(var k=0;k<7;k++){var nv=pv+s*(ok?-1:1)*(.8+r()*.9);sig.push({o:pv,c:nv,h:Math.max(pv,nv)+r()*.5,l:Math.min(pv,nv)-r()*.5});pv=nv}var todo=cs.concat(sig);
  return{preg:'Mirá la última vela contra el nivel. ¿Qué es?',ops:['Ruptura: cerró afuera','Falsa ruptura: solo la mecha'],ok:ok,exp:ok?'La mecha pasó, pero el cierre volvió adentro: trampa.':'El cierre quedó del otro lado del nivel: la ruptura vale más.',
   dib:function(S,rev){var G=marco(todo.map(function(v){return{o:v.o,c:v.c,h:Math.min(v.h,lv+12),l:Math.max(v.l,lv-12)}}).slice(0,1).concat(cs),S.caja,[lv+12,lv-12]);G.paso=S.caja.w/todo.length;G.bw=Math.max(1.4,G.paso*.62);G.n=todo.length;G.cs=todo;G.x=function(i){return S.caja.x+G.paso*(i+.5)};rejilla(S.c,G);nivel(S.c,G,lv,AM,1,{g:2,txt:res?'Resistencia':'Soporte',z:S.z*.85,izq:true});velas(S.c,G,rev?todo.length:cs.length);anillo(S.c,G.x(cs.length-1),G.y(ex.c),S.z*.9,INK,rev?0:.8)}}},
 media:function(r){var cruce=r()<.5;if(cruce){var arr=r()<.5,P=arr?[[0,112],[16,101],[24,103],[30,99],[44,109]]:[[0,99],[16,110],[24,108],[30,112],[44,102]];var cs=serie(P,ent(r,1,9e5),.6,.8),a=media(cs,8),b=media(cs,20);
   return{preg:'La media rápida (celeste) y la lenta (violeta) acaban de cruzarse. ¿Qué cruce es?',ops:['Cruce alcista','Cruce bajista'],ok:arr?0:1,exp:arr?'La rápida pasó por arriba de la lenta: el promedio reciente sube.':'La rápida pasó por debajo de la lenta: el promedio reciente baja.',dib:function(S){var G=graf(S,cs,cs.length,{al:function(){return .5}});curva(S.c,G,b,0,99,VI,3);curva(S.c,G,a,0,99,AQ,2.6)}}}
  var k=ent(r,0,2),dir=[1,-1,0][k],pts=zig(r,50,100,dir?2:0,dir,2.6);if(!dir)pts=pts.map(function(q,i){return[q[0],i%2?104:98.5]});var cs2=serie(pts,ent(r,1,9e5),.6,.8),m=media(cs2,20);
  return{preg:'Con la media de 20, ¿qué dice el gráfico?',ops:['Alcista: arriba y subiendo','Bajista: abajo y bajando','Sin tendencia: media plana'],ok:k,exp:['El precio está arriba y la media sube.','El precio está abajo y la media baja.','La media está plana y el precio la cruza todo el tiempo.'][k],dib:function(S){var G=graf(S,cs2,cs2.length,{al:function(){return .7}});curva(S.c,G,m,0,99,S.A,3.2)}}},
 rsi:function(r){var k=ent(r,0,2),cs,v,n=0;do{var b=100+r()*4,pts=[[0,b],[10,b+5],[18,b+1]];if(k===0)pts.push([24,b+2],[36,b+14]);else if(k===1)pts.push([24,b],[36,b-13]);else pts.push([22,b+4],[26,b+1],[30,b+4],[33,b+1.5],[36,b+3]);cs=serie(pts,ent(r,1,9e5),.35,.5);v=rsi(cs,14);n++}while(n<30&&!((k===0&&v[36]>72)||(k===1&&v[36]<28)||(k===2&&v[36]>40&&v[36]<60)));
  return{preg:'¿En qué zona terminó el RSI?',ops:['Sobrecompra','Sobreventa','Neutral'],ok:k,exp:'Terminó en '+Math.round(v[36])+'. '+['Arriba de 70: subió mucho y rápido. No es señal de venta sola.','Abajo de 30: bajó mucho y rápido. No es señal de compra sola.','Entre 30 y 70: sin exceso de fuerza.'][k],
   dib:function(S,rev){var K=cajas(S),G=marco(cs,K.p);rejilla(S.c,G);velas(S.c,G,99);var y=panelRSI(S,G,K.o,v,99);if(rev)pastilla(S.c,String(Math.round(v[36])),G.x(36),y(v[36]),VI,S.z*.9,'right',1)}}},
 patron:function(r){var k=ent(r,0,2),pts;if(k===0)pts=[[0,99],[8,112],[14,105.5],[22,111.8],[28,106],[31,103.5],[36,104.5],[42,98]];else if(k===1)pts=espejo([[0,99],[8,112],[14,105.5],[22,111.8],[28,106],[31,103.5],[36,104.5],[42,98]],106);else{var up=r()<.5;pts=[[0,100],[7,106],[11,103],[18,109],[22,106],[29,112],[33,109],[42,115]];if(!up)pts=espejo(pts,107)}
  pts=pts.map(function(q){return[q[0],q[1]+(r()-.5)*.8]});var cs=serie(pts,ent(r,1,9e5),.45,.6);
  return{preg:'¿Qué patrón ves?',ops:['Doble techo','Doble piso','Ninguno de los dos'],ok:k,exp:['Dos intentos de pasar el mismo máximo, y el cuello roto hacia abajo.','Dos intentos de perder el mismo mínimo, y el cuello roto hacia arriba.','Es una tendencia en escalera: no hay dos intentos fallidos en el mismo nivel.'][k],
   dib:function(S,rev){var G=graf(S,cs,99);if(rev&&k<2){nivel(S.c,G,pts[3][1],k?UP:DN,1,{x0:5,x1:25,g:2});nivel(S.c,G,pts[2][1],AM,1,{x0:12,g:2,txt:'Cuello',z:S.z*.85,abajo:!k})}}}},
 rr:function(r){var lg=r()<.5,e=ent(r,180,260)/2,d=ent(r,2,8)/2,m=ent(r,1,3),st=lg?e-d:e+d,ob=lg?e+d*m:e-d*m,pts=lg?[[0,e+3],[8,e-d+.3],[14,e+1.5],[20,e]]:[[0,e-3],[8,e+d-.3],[14,e-1.5],[20,e]],cs=serie(pts,ent(r,1,9e5),.4,.6),f=function(x){return x.toLocaleString('es-AR',{maximumFractionDigits:1})};
  return{preg:(lg?'Compra':'Venta')+' en '+f(e)+', stop en '+f(st)+', objetivo en '+f(ob)+'. ¿Qué relación riesgo/beneficio tiene?',ops:['1 a 1','1 a 2','1 a 3'],ok:m-1,exp:'Arriesgás '+f(d)+' para ganar '+f(d*m)+(m>1?': '+m+' veces lo arriesgado.':': lo mismo que arriesgás.'),
   dib:function(S,rev){var G=marco(cs.concat([{o:e,c:e,h:Math.max(st,ob),l:Math.min(st,ob)}]).slice(0,cs.length),S.caja,[st,ob]);rejilla(S.c,G);var x0=G.x(19),x1=G.b.x+G.b.w;S.c.fillStyle=rgba(DN,.2);S.c.fillRect(x0,Math.min(G.y(e),G.y(st)),x1-x0,Math.abs(G.y(st)-G.y(e)));S.c.fillStyle=rgba(UP,.18);S.c.fillRect(x0,Math.min(G.y(e),G.y(ob)),x1-x0,Math.abs(G.y(ob)-G.y(e)));velas(S.c,G,99,{etiqueta:false});
    [[e,INK,'Entrada '+f(e)],[st,DN,'Stop '+f(st)],[ob,UP,'Objetivo '+f(ob)]].forEach(function(q){nivel(S.c,G,q[0],q[1],1,{x0:19,g:2,dash:false,txt:q[2],z:S.z*.85,abajo:q[0]===st?lg:!lg&&q[0]===ob})});if(rev){pastilla(S.c,'1R',x1-6,(G.y(e)+G.y(st))/2,DN,S.z*.9,'right',1);pastilla(S.c,m+'R',x1-6,(G.y(e)+G.y(ob))/2,UP,S.z*.9,'right',1)}}}}
};
var TIPOS=Object.keys(EJ),NOMBRE={tendencia:'Tendencia',nivel:'Niveles',vela:'Velas',ruptura:'Rupturas',media:'Medias',rsi:'RSI',patron:'Patrones',rr:'Riesgo',setup:'Setups',stop:'Stops',imbalance:'Imbalance'};
function ejercicio(tipo,semilla){var r=azar(semilla),e=EJ[tipo](r);e.tipo=tipo;return e}
function pintarEj(c,W,H,e,rev,T){VW=W;MINI=false;var pt=H>W,S={c:c,W:W,H:H,pt:pt,p:1,T:T||0,A:'#7FB4F0',B:'#5CC6D6',z:Math.min(W,H)*(pt?.038:.034),caja:{x:W*.05,y:H*.07,w:W*.9,h:H*(e.tipo==='vela'?.74:.86)}};c.fillStyle='#0E1118';c.fillRect(0,0,W,H);c.textBaseline='alphabetic';e.dib(S,rev)}
function tv(c,W,b,cs,hasta,ext){VW=W;MINI=false;var G=marco(cs,b,ext);rejilla(c,G);velas(c,G,hasta);return G}
return{tv:tv,velasM:velasM,PROPIAS:PROPIAS,NIVELES:NIVELES,ORDN:ORDN,L:L,CAT:CAT,dibujar:dibujar,miniatura:miniatura,ejercicio:ejercicio,pintarEj:pintarEj,TIPOS:TIPOS,NOMBRE:NOMBRE,azar:azar};
})();
