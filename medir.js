/* Cuenta visitas sin nombre, contacto ni IP. Se puede apagar desde el pie de página.
   Para no contar tus propias visitas: abrí la web una vez con ?nocontar al final. */
(function(){
'use strict';
var local=/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
if(!local&&location.hostname!=='dalozyx-dot.github.io')return;
var API=local?'http://localhost:3100/api/visita':'https://leads-vbm4.vercel.app/api/visita';
var K='vt-visita',KP='vt-persona',KN='vt-no-contar',CADA=60000,CORTE=30*60000,QUIETO=10*60000;
var q=new URLSearchParams(location.search),calc=/\/calculadora\//.test(location.pathname)?'calculadora':/\/reto\//.test(location.pathname)?'reto':/\/academia\//.test(location.pathname)?'academia':'';
function leer(s,k){try{return s.getItem(k)}catch(e){return null}}
function poner(s,k,v){try{s.setItem(k,v)}catch(e){}}
function sacar(s,k){try{s.removeItem(k)}catch(e){}}
if(q.has('nocontar'))poner(localStorage,KN,'1');
var no=function(){return leer(localStorage,KN)==='1'||navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'};

/* Aviso y botón del pie */
document.querySelectorAll('[data-medir]').forEach(function(p){
  var b=document.createElement('button');b.type='button';b.style.cssText='background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer';
  var pinta=function(){p.firstChild.textContent=no()?'No estamos contando tus visitas. ':'Contamos visitas de forma anónima: sin tu nombre, tu contacto ni tu IP. ';b.textContent=no()?'Volver a contarlas':'No contarme';b.hidden=no()&&leer(localStorage,KN)!=='1'};
  p.textContent='';p.append(document.createTextNode(''),b);pinta();
  b.addEventListener('click',function(){
    if(no()){sacar(localStorage,KN);arrancar()}else{poner(localStorage,KN,'1');sacar(localStorage,KP);sacar(sessionStorage,K);parar()}
    pinta();
  });
});

var v=null,reloj=0,desde=0,toque=Date.now();
function uuid(){
  if(crypto.randomUUID)return crypto.randomUUID();
  var b=crypto.getRandomValues(new Uint8Array(16));b[6]=b[6]&15|64;b[8]=b[8]&63|128;
  var h=Array.from(b,function(x){return x.toString(16).padStart(2,'0')}).join('');
  return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
}
function nueva(){
  var p=leer(localStorage,KP),vuelve=!!p;if(!p){p=uuid();poner(localStorage,KP,p)}
  var ref='';try{var h=new URL(document.referrer).hostname;if(h!==location.hostname)ref=h}catch(e){}
  return{id:uuid(),persona:p,vuelve:vuelve,pasos:[],acciones:[],ref:ref,etiqueta:q.get('desde')||q.get('utm_source')||'',ms:0,t:Date.now()};
}
function abrir(){
  var g=null;try{g=JSON.parse(leer(sessionStorage,K))}catch(e){}
  v=g&&g.id&&Date.now()-g.t<CORTE?g:nueva();
}
function activo(){return !document.hidden&&Date.now()-toque<QUIETO}
function suma(){var n=Date.now();if(desde)v.ms+=Math.min(n-desde,CADA*2);desde=activo()?n:0}
function enviar(cierra){
  if(!v||no())return;
  suma();v.t=Date.now();poner(sessionStorage,K,JSON.stringify(v));
  try{fetch(API,{method:'POST',keepalive:true,credentials:'omit',headers:{'Content-Type':'text/plain'},body:JSON.stringify({id:v.id,persona:v.persona,vuelve:v.vuelve,pasos:v.pasos,acciones:v.acciones,ref:v.ref,etiqueta:v.etiqueta,segundos:Math.round(v.ms/1000),cerrada:!!cierra})}).catch(function(){})}catch(e){}
}
function paso(p){if(v&&v.pasos[v.pasos.length-1]!==p){v.pasos.push(p);v.pasos=v.pasos.slice(-40)}}
function seccion(){var h=location.hash.slice(1);return calc?calc:['activos','en-vivo','historial','aprender','sumate'].indexOf(h)>=0?h:'hoy'}
function accion(a){if(v&&v.acciones.indexOf(a)<0){v.acciones.push(a);enviar()}}
function parar(){clearInterval(reloj);reloj=0;v=null}
function arrancar(){
  if(no()||v)return;
  abrir();desde=document.hidden?0:Date.now();paso(seccion());
  if(!document.hidden)enviar();
  reloj=setInterval(function(){if(activo())enviar();else if(desde)suma()},CADA);
}
['pointerdown','keydown','scroll'].forEach(function(e){addEventListener(e,function(){
  var estaba=Date.now()-toque<QUIETO;toque=Date.now();
  if(v&&!estaba&&!document.hidden)retomar();
},{passive:true,capture:true})});
function retomar(){if(Date.now()-v.t>=CORTE){sacar(sessionStorage,K);v=nueva();paso(seccion())}desde=Date.now();enviar()}
document.addEventListener('visibilitychange',function(){
  if(!v)return;
  if(document.hidden)enviar(true);else{toque=Date.now();retomar()}
});
// Al pasar de Macro a la Calculadora la página se cierra, pero la visita sigue en la otra.
addEventListener('pagehide',function(){if(v)enviar(true)});
addEventListener('pageshow',function(e){if(e.persisted&&v){var g=null;try{g=JSON.parse(leer(sessionStorage,K))}catch(x){}if(g&&g.id===v.id)v=g;paso(seccion());toque=Date.now();retomar()}});
addEventListener('hashchange',function(){if(v){paso(seccion());enviar()}});
document.addEventListener('click',function(e){
  var t=e.target.closest&&e.target.closest('[data-mkt],#copy,a[href*="/aplicar"]');if(!t||!v)return;
  if(t.dataset.mkt){paso('calc-'+t.dataset.mkt);enviar()}
  else if(t.id==='copy')accion('copio-plan');
  else accion('abrio-mentoria');
},true);
window.medirAccion=accion;
arrancar();
})();
