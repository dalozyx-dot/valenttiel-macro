/* Siempre pide la versión nueva; si no hay conexión, muestra la última guardada. */
const CAJA='valenttiel-1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CAJA).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  const clave=u.origin+u.pathname;
  e.respondWith(fetch(e.request).then(r=>{
    if(r.ok){const c=r.clone();e.waitUntil(caches.open(CAJA).then(x=>x.put(clave,c)).catch(()=>{}));}
    return r;
  }).catch(()=>caches.match(clave).then(r=>r||Response.error())));
});
