import { persistence } from './core/storage.js';
import * as rules from './core/rules.js';
import { random } from './core/random.js';
import { createTelemetry } from './core/telemetry.js';
import { createI18n } from './core/i18n.js';
import { pwa } from './core/pwa.js';

window.YambPersistence=persistence;
window.YambRules=rules;
window.YambRandom=random;
window.YambPWA=pwa;

function loadClassic(src){
  return new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=src;script.async=false;
    script.onload=()=>resolve(true);
    script.onerror=()=>reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

try{
  await loadClassic('./assets/js/runtime/boot.js');
  await persistence.init();
  window.YambTelemetry=createTelemetry(persistence);
  window.YambI18n=createI18n(persistence);
  await loadClassic('./assets/js/runtime/deps.js');
  await loadClassic('./assets/js/runtime/app.js');
  await loadClassic('./assets/js/runtime/platform.js');
  await loadClassic('./assets/js/runtime/features.js');
  await loadClassic('./assets/js/runtime/hardening.js');
  window.YambI18n.apply();
  await pwa.register();
}catch(error){
  console.error(error);
  const boot=document.getElementById('yambBoot');
  if(boot){
    boot.innerHTML='<div class="yamb-boot-instrument"><div class="yamb-boot-mark">YAMB · SAFE START</div><div class="yamb-boot-title">Runtime initialization failed</div><div class="yamb-boot-sub">Reload the page. If the problem persists, clear this site’s local data and retry.</div></div>';
  }
}
