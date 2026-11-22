const CACHE='tournament-manager-v34';
const CORE=['./index.html'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    for(const url of CORE){try{const response=await fetch(url,{cache:'no-store'});if(response.ok)await cache.put(url,response);}catch(_){}}
    // Do not activate immediately: let the page show its update prompt.
  })());
});
self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('tournament-manager-')&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
  const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of clients)client.postMessage({type:'UPDATE_ACTIVATED'});
})()));
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  const shell=req.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/');
  if(shell){event.respondWith((async()=>{
    try{const response=await fetch(req,{cache:'no-store'});if(response&&response.ok){const c=await caches.open(CACHE);await c.put('./index.html',response.clone());}return response;}
    catch(_){return (await caches.match(req))||(await caches.match('./index.html'))||new Response('برنامه در دسترس نیست؛ اتصال اینترنت را بررسی کنید.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}})}
  })());return;}
  event.respondWith((async()=>{const cached=await caches.match(req);if(cached)return cached;const response=await fetch(req);if(response&&response.ok){const c=await caches.open(CACHE);c.put(req,response.clone()).catch(()=>{});}return response;})());
});
