/* Academia técnica: lecciones animadas sobre el gráfico y ejercicios para entrenar el ojo.
   Todo se dibuja en vivo con las herramientas de MOTOR; los precios son de ejemplo, no de un activo real. */
var TECNICA=(function(){
'use strict';
var M=MOTOR.h,cl=M.cl,sg=M.sg,eo=M.eo,eio=M.eio,rebote=M.rebote,mez=M.mez,rgba=M.rgba,rr=M.rr,gr=M.gr,tx=M.tx,PI=Math.PI;
var INK='#F1F6F3',MUT='#94A69E',UP='#5FD0A0',DN='#F08A7B',AM='#EBB24A',VI='#B59CF0',AQ='#5CC6D6',F='Geist, system-ui, sans-serif';
var CAT={grafico:['Leer el gráfico','#7FB4F0','#5CC6D6'],niveles:['Niveles','#5FD0A0','#5CC6D6'],indicadores:['Indicadores','#B59CF0','#7FB4F0'],riesgo:['Riesgo','#EBB24A','#F08A7B']};
var VW=1000,MINI=false;

/* ---- datos de ejemplo ---- */
function azar(s){s=(s>>>0)||1;return function(){s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
// Velas que pasan por puntos [vela, precio]. Cada punto intermedio es el extremo exacto de su tramo, así los toques quedan limpios.
function serie(pts,sem,ruido,mecha){
  var r=azar(sem||7),n=pts[pts.length-1][0]+1,cs=[],k=0;ruido=ruido==null?.6:ruido;mecha=mecha==null?.9:mecha;
  for(var i=0;i<n;i++){
    while(k<pts.length-2&&i>=pts[k+1][0])k++;
    var a=pts[k],b=pts[k+1],w=.5-.5*Math.cos(cl((i-a[0])/((b[0]-a[0])||1))*PI),lo=Math.min(a[1],b[1]),hi=Math.max(a[1],b[1]),
        cc=mez(a[1],b[1],w)+(r()-.5)*2*ruido,o=i?cs[i-1].c:cc+(r()-.5)*ruido;
    cc=Math.min(hi,Math.max(lo,cc));o=Math.min(hi,Math.max(lo,o));
    var h=Math.min(hi,Math.max(o,cc)+r()*mecha),l=Math.max(lo,Math.min(o,cc)-r()*mecha);
    if(i===a[0]&&k>0){var pr=pts[k-1][1],v=a[1];
      if(v<pr&&v<b[1]){l=v;cc=Math.max(cc,v+.25+r()*mecha*.5);o=Math.max(o,v+.1);h=Math.max(h,o,cc)}
      else if(v>pr&&v>b[1]){h=v;cc=Math.min(cc,v-.25-r()*mecha*.5);o=Math.min(o,v-.1);l=Math.min(l,o,cc)}}
    cs.push({o:o,h:h,l:l,c:cc});
  }
  return cs;
}
function fijar(cs,i,v){cs[i]=v;var s=cs[i+1];if(s){s.o=v.c;s.h=Math.max(s.h,s.o);s.l=Math.min(s.l,s.o)}return cs}
function espejo(pts,m){return pts.map(function(q){return[q[0],2*m-q[1]]})}
function media(cs,n){var o=[],s=0;cs.forEach(function(v,i){s+=v.c;if(i>=n)s-=cs[i-n].c;o.push(i>=n-1?s/n:null)});return o}
function rsi(cs,n){var o=[null],g=0,p=0;for(var i=1;i<cs.length;i++){var d=cs[i].c-cs[i-1].c,u=Math.max(d,0),b=Math.max(-d,0);if(i<=n){g+=u/n;p+=b/n}else{g=(g*(n-1)+u)/n;p=(p*(n-1)+b)/n}o.push(i<n?null:p===0?100:100-100/(1+g/p))}return o}
function traza(pts,u){u=cl(u);for(var i=1;i<pts.length;i++)if(u<=pts[i][0])return mez(pts[i-1][1],pts[i][1],(u-pts[i-1][0])/((pts[i][0]-pts[i-1][0])||1));return pts[pts.length-1][1]}

/* ---- dibujo del gráfico ---- */
function marco(cs,b,ext){
  var lo=Infinity,hi=-Infinity;cs.forEach(function(v){lo=Math.min(lo,v.l);hi=Math.max(hi,v.h)});(ext||[]).forEach(function(v){lo=Math.min(lo,v);hi=Math.max(hi,v)});
  var pd=(hi-lo)*.08;lo-=pd;hi+=pd;var paso=b.w/cs.length;
  return{cs:cs,b:b,lo:lo,hi:hi,n:cs.length,paso:paso,bw:Math.max(1.4,paso*.62),x:function(i){return b.x+paso*(i+.5)},y:function(p){return b.y+b.h*(1-(p-lo)/(hi-lo))}};
}
function rejilla(c,G){c.strokeStyle='rgba(210,240,226,.06)';c.lineWidth=1;for(var k=0;k<=4;k++){var y=G.b.y+G.b.h*k/4;c.beginPath();c.moveTo(G.b.x,y);c.lineTo(G.b.x+G.b.w,y);c.stroke()}}
function velas(c,G,hasta,op){
  op=op||{};var n=Math.min(G.n,hasta);
  for(var i=0;i<Math.ceil(n);i++){
    var v=G.cs[i],f=Math.min(1,n-i),cc=mez(v.o,v.c,f),hh=Math.max(v.o,cc,mez(v.o,v.h,f)),ll=Math.min(v.o,cc,mez(v.o,v.l,f)),col=cc>=v.o?UP:DN,x=G.x(i);
    c.globalAlpha=(op.al?op.al(i):1);c.strokeStyle=col;c.lineWidth=Math.max(1,G.bw*.13);c.lineCap='butt';c.beginPath();c.moveTo(x,G.y(hh));c.lineTo(x,G.y(ll));c.stroke();
    var y0=G.y(Math.max(v.o,cc)),y1=G.y(Math.min(v.o,cc));rr(c,x-G.bw/2,y0,G.bw,Math.max(1.5,y1-y0),Math.min(G.bw*.16,3));c.fillStyle=col;c.fill();
  }
  c.globalAlpha=1;
}
function linea(c,G,cs,hasta,col,g){c.beginPath();for(var i=0;i<Math.min(G.n,Math.ceil(hasta));i++){var x=G.x(i),y=G.y(cs[i].c);c[i?'lineTo':'moveTo'](x,y)}c.strokeStyle=col;c.lineWidth=g||2.4;c.lineJoin='round';c.stroke()}
function curva(c,G,vals,desde,hasta,col,g,yf){yf=yf||G.y;c.beginPath();var on=false;for(var i=Math.max(0,desde);i<Math.min(vals.length,hasta);i++){if(vals[i]==null)continue;var x=G.x(i),y=yf(vals[i]);if(on)c.lineTo(x,y);else{c.moveTo(x,y);on=true}}c.strokeStyle=col;c.lineWidth=g||2.6;c.lineJoin=c.lineCap='round';c.stroke()}
function pastilla(c,s,x,y,col,z,al,a){
  if(MINI||a<=0||!s)return;c.save();c.globalAlpha*=cl(a);c.font='600 '+z+'px '+F;var w=c.measureText(s).width+z*1.3,h=z*1.8,x0=al==='left'?x:al==='right'?x-w:x-w/2;x0=Math.max(4,Math.min(VW-w-4,x0));
  rr(c,x0,y-h/2,w,h,h/2);c.fillStyle='rgba(7,11,10,.86)';c.fill();c.fillStyle=rgba(col,.2);c.fill();c.strokeStyle=col;c.lineWidth=1.4;c.stroke();
  c.textAlign='center';c.textBaseline='middle';c.fillStyle=INK;c.fillText(s,x0+w/2,y+z*.06);c.textBaseline='alphabetic';c.restore();
}
function nivel(c,G,pr,col,e,op){
  op=op||{};if(e<=0)return;var x0=op.x0!=null?G.x(op.x0)-G.paso/2:G.b.x,x1=op.x1!=null?G.x(op.x1)+G.paso/2:G.b.x+G.b.w,y=G.y(pr),xe=mez(x0,x1,eo(e));
  if(op.zona){var h=Math.abs(G.y(pr+op.zona)-y);c.fillStyle=rgba(col,(op.za||.15)*cl(e*2));c.fillRect(x0,y-h,xe-x0,h*2)}
  c.save();c.strokeStyle=col;c.lineWidth=op.g||2.2;c.globalAlpha*=op.al==null?1:op.al;if(op.dash!==false)c.setLineDash([9,7]);c.beginPath();c.moveTo(x0,y);c.lineTo(xe,y);c.stroke();c.restore();
  if(op.txt)pastilla(c,op.txt,op.izq?x0+6:x1-6,y+(op.abajo?op.z*1.5:-op.z*1.5),col,op.z,op.izq?'left':'right',sg(e,.5,1));
}
function anillo(c,x,y,r,col,a){if(a<=0)return;c.save();c.globalAlpha*=cl(a);c.strokeStyle=col;c.lineWidth=2.6;c.shadowColor=col;c.shadowBlur=16;c.beginPath();c.arc(x,y,r,0,PI*2);c.stroke();c.restore()}
function pop(c,x,y,r,col,e){if(e<=0||e>=1)return anillo(c,x,y,r,col,e>=1?1:0);anillo(c,x,y,r*(1+.9*(1-eo(e))),col,eo(e))}
function punto(c,x,y,col,r){c.save();c.fillStyle=col;c.shadowColor=col;c.shadowBlur=12;c.beginPath();c.arc(x,y,r,0,PI*2);c.fill();c.restore()}
function flechaL(c,x0,y0,x1,y1,col,g,e){e=e==null?1:eo(e);if(e<=0)return;var x=mez(x0,x1,e),y=mez(y0,y1,e),a=Math.atan2(y-y0,x-x0),k=g*4;c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=g;c.lineCap='round';c.beginPath();c.moveTo(x0,y0);c.lineTo(x-Math.cos(a)*k*.6,y-Math.sin(a)*k*.6);c.stroke();c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.cos(a-.45)*k,y-Math.sin(a-.45)*k);c.lineTo(x-Math.cos(a+.45)*k,y-Math.sin(a+.45)*k);c.closePath();c.fill();c.restore()}
function velaG(c,cx,bw,y,o,h,l,cc){
  var col=cc>=o?UP:DN;c.save();c.shadowColor=rgba(col,.55);c.shadowBlur=bw*.5;c.strokeStyle=col;c.lineWidth=Math.max(2,bw*.07);c.lineCap='round';c.beginPath();c.moveTo(cx,y(h));c.lineTo(cx,y(l));c.stroke();
  var y0=y(Math.max(o,cc)),y1=y(Math.min(o,cc));rr(c,cx-bw/2,y0,bw,Math.max(3,y1-y0),bw*.1);c.fillStyle=gr(c,cx-bw/2,0,cx+bw/2,0,col,rgba(col,.72));c.fill();c.restore();
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
  var c=S.c,y=function(v){return b.y+b.h*(1-v/100)};c.fillStyle='rgba(210,240,226,.035)';c.fillRect(b.x,b.y,b.w,b.h);
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
  curva(c,G,m,0,f+1,S.A,3.2);punto(c,G.x(f),G.y(m[f]),INK,5);pastilla(c,'Promedio de 20 velas',G.x(f-10),G.b.y+S.z*1.4,S.A,S.z*.85,'center',sg(S.p,.05,.12))},
 function(S){var c=S.c,cs=serie(MEDI,21,.9,1),m=media(cs,20),e=sg(S.p,.1,.5),G=graf(S,cs,cs.length,{al:function(){return mez(1,.18,e)}});curva(c,G,m,0,cs.length,S.A,mez(2,4.5,e));pastilla(c,'Media de 20',G.x(48),G.y(m[48])+S.z*2.4,S.A,S.z*.9,'center',sg(S.p,.4,.5))},
 function(S){var c=S.c,cs=serie(MEDI,21,.9,1),m=media(cs,20),h=ver(S,cs.length,.03,.8),G=graf(S,cs,h,{antes:function(G){c.fillStyle=rgba(UP,.12);c.beginPath();var on=false;for(var i=19;i<Math.min(cs.length,h);i++){var y=G.y(Math.max(cs[i].c,m[i]));c[on?'lineTo':'moveTo'](G.x(i),y);on=true}for(var j=Math.min(cs.length,Math.ceil(h))-1;j>=19;j--)c.lineTo(G.x(j),G.y(m[j]));c.fill()}});
  curva(c,G,m,0,h,S.A,3);pastilla(c,'Arriba y subiendo = alcista',G.b.x+G.b.w/2,G.b.y+S.z*1.4,UP,S.z*.95,'center',sg(S.p,.4,.5))},
 function(S){var c=S.c,cs=serie(MEDI,21,.9,1),m=media(cs,20);[28,44].forEach(function(i){cs[i].l=Math.min(cs[i].l,m[i]-.1)});var h=ver(S,cs.length),G=graf(S,cs,h);curva(c,G,m,0,h,S.A,3);
  [28,44].forEach(function(i){var a=sg(h,i+.5,i+2.5);pop(c,G.x(i),G.y(m[i]),S.z*1.2,UP,a);pastilla(c,'Rebota en la media',G.x(i),G.y(m[i])+S.z*2.6,UP,S.z*.85,'center',a)})},
 function(S){var c=S.c,P=[[0,116],[15,103],[20,105],[27,99],[40,111],[55,119]],cs=serie(P,31,.7,.9),r=media(cs,9),l=media(cs,21),h=ver(S,cs.length),G=graf(S,cs,h,{al:function(){return .6}}),x=-1;
  for(var i=28;i<cs.length;i++)if(r[i-1]!=null&&l[i-1]!=null&&r[i-1]<=l[i-1]&&r[i]>l[i]){x=i;break}
  curva(c,G,l,0,h,VI,3);curva(c,G,r,0,h,AQ,2.6);pastilla(c,'Rápida (9)',G.b.x+6,G.b.y+S.z*1.3,AQ,S.z*.8,'left',1);pastilla(c,'Lenta (21)',G.b.x+6,G.b.y+S.z*3.6,VI,S.z*.8,'left',1);
  var a=sg(h,28,30);anillo(c,G.x(27),G.y(99),S.z*1.1,AM,a);pastilla(c,'El giro fue acá',G.x(27),G.y(99)+S.z*2.4,AM,S.z*.85,'center',a);
  if(x>0){var b=sg(h,x+.5,x+2.5);pop(c,G.x(x),G.y(l[x]),S.z*1.2,AQ,b);pastilla(c,'El cruce avisa acá',G.x(x),G.y(l[x])-S.z*2.6,AQ,S.z*.85,'center',b)}},
 function(S){var c=S.c,P=[[0,105],[4,101],[8,107],[12,102],[16,108],[20,101],[24,107],[28,102],[32,108],[36,101],[40,106],[44,102],[48,107],[55,104]],cs=serie(P,41,.7,.9),r=media(cs,5),l=media(cs,13),h=ver(S,cs.length),G=graf(S,cs,h,{al:function(){return .55}});
  curva(c,G,l,0,h,VI,3);curva(c,G,r,0,h,AQ,2.6);for(var i=14;i<Math.min(cs.length,h);i++){if((r[i-1]-l[i-1])*(r[i]-l[i])<0){var a=sg(h,i+.5,i+2);anillo(c,G.x(i),G.y(l[i]),S.z*.75,DN,a);tx(c,'✗',G.x(i),G.y(l[i])-S.z*1.2,S.z*1.3,DN,'center',600)}}
  pastilla(c,'Rango: cruces falsos',G.b.x+G.b.w/2,G.b.y+S.z*1.4,DN,S.z*.95,'center',sg(S.p,.45,.55))}
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
  anillo(c,G.x(24),G.y(99.6),S.z*1.2,UP,a);anillo(c,G.x(i),y(v[i]),S.z*1,UP,a);pastilla(c,'Soporte + sobreventa: se suman',G.x(24),G.b.y+S.z*1.4,UP,S.z*.9,'center',sg(h,i+2,i+4))},
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

/* ---- dibujo de cada escena ---- */
function base(c,W,H,l,p,T){var k=CAT[l.cat],pt=H>W;VW=W;return{c:c,W:W,H:H,pt:pt,p:p,T:T,A:k[1],B:k[2],z:Math.min(W,H)*(pt?.036:.03),caja:pt?{x:W*.07,y:H*.19,w:W*.86,h:H*.72}:{x:W*.07,y:H*.185,w:W*.86,h:H*.5}}}
function dibujar(c,W,H,l,i,p,T){
  var S=base(c,W,H,l,p,T);MINI=false;c.textBaseline='alphabetic';M.fondo(c,W,H,T,S.A,S.B);
  var v=eo(sg(p,0,.06));c.save();c.globalAlpha=v;c.translate(0,(1-v)*10);
  c.globalAlpha=v*eo(sg(p,0,.12));tx(c,l.tit[i],W/2,H*(S.pt?.1:.11),Math.min(W,H)*(S.pt?.058:.054),INK,'center',600,W*.88);c.globalAlpha=v;
  l.esc[i](S);c.restore();c.globalAlpha=1;
}
function miniatura(c,W,H,l,T){
  var S=base(c,W,H,l,0,T),u=(T/7)%1;S.p=u<.85?u/.85:1;S.z=Math.min(W,H)*.05;S.caja={x:W*.05,y:H*.08,w:W*.9,h:H*.84};MINI=true;c.clearRect(0,0,W,H);c.textBaseline='alphabetic';
  try{l.esc[l.mini||0](S)}finally{MINI=false}
}

/* ---- ejercicios: cada uno tiene una respuesta objetiva ---- */
function ent(r,a,b){return a+Math.floor(r()*(b-a+1))}
function elegir(r,xs){return xs[Math.floor(r()*xs.length)]}
function zig(r,n,ini,paso,dir,amp){var pts=[[0,ini]],v=ini,i=0,arriba=r()<.5;while(i<n-1){var d=ent(r,3,6);i=Math.min(n-1,i+d);var m=(arriba?1:-1)*amp*(.7+r()*.6);v+=dir*paso*d/4.5+m;arriba=!arriba;pts.push([i,v])}return pts}
var EJ={
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
   dib:function(S,rev){var G=marco(cs.concat([{o:e,c:e,h:Math.max(st,ob),l:Math.min(st,ob)}]).slice(0,cs.length),S.caja,[st,ob]);rejilla(S.c,G);var x0=G.x(19),x1=G.b.x+G.b.w;S.c.fillStyle=rgba(DN,.2);S.c.fillRect(x0,Math.min(G.y(e),G.y(st)),x1-x0,Math.abs(G.y(st)-G.y(e)));S.c.fillStyle=rgba(UP,.18);S.c.fillRect(x0,Math.min(G.y(e),G.y(ob)),x1-x0,Math.abs(G.y(ob)-G.y(e)));velas(S.c,G,99);
    [[e,INK,'Entrada '+f(e)],[st,DN,'Stop '+f(st)],[ob,UP,'Objetivo '+f(ob)]].forEach(function(q){nivel(S.c,G,q[0],q[1],1,{x0:19,g:2,dash:false,txt:q[2],z:S.z*.85,abajo:q[0]===st?lg:!lg&&q[0]===ob})});if(rev){pastilla(S.c,'1R',x1-6,(G.y(e)+G.y(st))/2,DN,S.z*.9,'right',1);pastilla(S.c,m+'R',x1-6,(G.y(e)+G.y(ob))/2,UP,S.z*.9,'right',1)}}}}
};
var TIPOS=Object.keys(EJ),NOMBRE={tendencia:'Tendencia',nivel:'Niveles',vela:'Velas',ruptura:'Rupturas',media:'Medias',rsi:'RSI',patron:'Patrones',rr:'Riesgo'};
function ejercicio(tipo,semilla){var r=azar(semilla),e=EJ[tipo](r);e.tipo=tipo;return e}
function pintarEj(c,W,H,e,rev,T){VW=W;MINI=false;var pt=H>W,S={c:c,W:W,H:H,pt:pt,p:1,T:T||0,A:'#7FB4F0',B:'#5CC6D6',z:Math.min(W,H)*(pt?.038:.034),caja:{x:W*.05,y:H*.07,w:W*.9,h:H*(e.tipo==='vela'?.74:.86)}};c.fillStyle='#0a100d';c.fillRect(0,0,W,H);c.textBaseline='alphabetic';e.dib(S,rev)}
return{L:L,CAT:CAT,dibujar:dibujar,miniatura:miniatura,ejercicio:ejercicio,pintarEj:pintarEj,TIPOS:TIPOS,NOMBRE:NOMBRE,azar:azar};
})();
