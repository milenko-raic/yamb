(()=>{
  'use strict';
  const pending=new Map();
  function loadScript(url,globalName,timeout=7000){
    if(globalName&&window[globalName])return Promise.resolve(true);
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');let settled=false;
      const finish=(ok,error)=>{if(settled)return;settled=true;clearTimeout(timer);script.onload=script.onerror=null;ok?resolve(true):reject(error||new Error('Dependency load failed'));};
      const timer=setTimeout(()=>{try{script.remove()}catch{};finish(false,new Error('Dependency timeout'));},timeout);
      script.async=true;script.src=url;script.crossOrigin='anonymous';script.referrerPolicy='no-referrer';
      script.onload=()=>finish(!globalName||!!window[globalName],new Error(`Dependency ${globalName||url} did not initialize`));
      script.onerror=()=>finish(false,new Error('Dependency network error'));
      document.head.appendChild(script);
    });
  }
  async function firstAvailable(name,globalName,urls){
    if(globalName&&window[globalName])return true;
    for(const url of urls){try{await loadScript(url,globalName);return true}catch{}}
    throw new Error(`${name} is unavailable. Check the network connection and retry.`);
  }
  function lazy(name,globalName,urls){
    if(!pending.has(name))pending.set(name,firstAvailable(name,globalName,urls));
    return pending.get(name);
  }
  const deps={};
  Object.defineProperties(deps,{
    peer:{enumerable:true,get:()=>lazy('PeerJS','Peer',['https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js','https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js'])},
    qr:{enumerable:true,get:()=>lazy('QRCode.js','QRCode',['https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js','https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'])}
  });
  window.YambDeps=Object.freeze(deps);
})();
