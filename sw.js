const CACHE='yamb-shell';
const APP_SHELL=[
  './','./index.html','./manifest.webmanifest','./assets/css/app.css',
  './assets/js/bootstrap.js','./assets/js/core/storage.js','./assets/js/core/rules.js',
  './assets/js/core/random.js','./assets/js/core/telemetry.js','./assets/js/core/i18n.js','./assets/js/core/pwa.js',
  './assets/js/runtime/boot.js','./assets/js/runtime/deps.js','./assets/js/runtime/app.js',
'./assets/js/runtime/platform.js','./assets/js/runtime/features.js','./assets/js/runtime/hardening.js',
  './assets/icons/icon.svg','./assets/icons/icon-192.png','./assets/icons/icon-512.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
async function networkFirst(request,fallback='./index.html'){
  const cache=await caches.open(CACHE);
  try{
    const response=await fetch(request);
    if(response.ok)await cache.put(request,response.clone());
    return response;
  }catch{
    return (await cache.match(request))||(fallback?await cache.match(fallback):Response.error());
  }
}
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin===location.origin){
    event.respondWith(networkFirst(event.request,event.request.mode==='navigate'?'./index.html':null));
    return;
  }
  if(['cdn.jsdelivr.net','unpkg.com','cdnjs.cloudflare.com'].includes(url.hostname)){
    event.respondWith(caches.open(CACHE).then(async cache=>{
      const hit=await cache.match(event.request);
      try{const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response}catch{return hit||Response.error()}
    }));
  }
});
