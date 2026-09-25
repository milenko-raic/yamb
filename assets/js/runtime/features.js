(()=>{
  'use strict';
  const $=sel=>document.querySelector(sel);
  const $$=sel=>[...document.querySelectorAll(sel)];
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[ch]));
  const store=window.YambPersistence;
  const telemetry=window.YambTelemetry;
  const i18n=window.YambI18n;
  const runtime=window.YambRuntime;
  const PERSIST_PREFIX='save.';

  function state(){return window.state||runtime?.getState?.()||{};}
  function histories(){return Array.isArray(state().history)?state().history:[];}
  function scoreValues(player){
    const values=[];
    const scores=player?.scores||{};
    Object.values(scores).forEach(column=>Object.values(column||{}).forEach(v=>{if(Number.isFinite(Number(v)))values.push(Number(v));}));
    return values;
  }
  function yambCount(player){
    const scores=player?.scores||{};let count=0;
    Object.values(scores).forEach(column=>{if(Number(column?.yamb)>0)count++;});
    return count;
  }
  function zeroCount(player){return scoreValues(player).filter(v=>v===0).length;}
  function upperBest(player){
    const ids=['ones','twos','threes','fours','fives','sixes'];let best=0;
    for(const column of Object.values(player?.scores||{})) best=Math.max(best,ids.reduce((sum,id)=>sum+(Number(column?.[id])||0),0));
    return best;
  }
  function hasFirstRollStraight(player){
    return Object.values(player?.scores||{}).some(column=>Number(column?.kenta)>=66);
  }

  function aggregateProfiles(){
    const map=new Map();
    for(const entry of histories()){
      (entry.players||[]).forEach((player,index)=>{
        if(!player?.name)return;
        const key=player.name.trim()||`Player ${index+1}`;
        if(!map.has(key))map.set(key,{name:key,games:0,wins:0,draws:0,total:0,best:0,yambs:0,zeros:0,modes:new Set(),last:null});
        const p=map.get(key);const score=Number(entry.totals?.[index])||0;
        p.games++;p.total+=score;p.best=Math.max(p.best,score);p.yambs+=yambCount(player);p.zeros+=zeroCount(player);p.modes.add(entry.mode||'local');p.last=entry.completedAt||p.last;
        if(entry.winner===index)p.wins++;else if(entry.winner<0)p.draws++;
      });
    }
    return [...map.values()].map(p=>({...p,avg:p.games?Math.round((p.total/p.games)*10)/10:0,modes:[...p.modes]})).sort((a,b)=>b.wins-a.wins||b.avg-a.avg||b.best-a.best);
  }

  function leaderboardHTML(){
    const profiles=aggregateProfiles();
    if(!profiles.length)return emptyPanel('No completed games yet. Finish a sheet and the local career board will populate automatically.');
    const rows=profiles.map((p,i)=>`<tr><td>${i+1}</td><td><b>${esc(p.name)}</b><small>${esc(p.modes.join(' · ').toUpperCase())}</small></td><td>${p.games}</td><td>${p.wins}</td><td>${p.avg}</td><td>${p.best}</td><td>${p.yambs}</td></tr>`).join('');
    return `<div class="feature-kicker">LOCAL-FIRST · VERIFIED FROM ARCHIVED PAPERS</div><p class="feature-copy">This ranking is derived from completed game snapshots stored on this device. It never claims to be a global trusted leaderboard.</p><div class="feature-table-wrap"><table class="feature-table"><thead><tr><th>#</th><th>Player</th><th>Games</th><th>Wins</th><th>Avg</th><th>Best</th><th>Yamb</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function achievementDefinitions(){
    const hs=histories();
    const players=hs.flatMap(h=>h.players||[]);
    const target=runtime?.getMatchTarget?.()||5;
    return [
      {id:'first-paper',name:'Ship Log Opened',desc:'Complete and archive the first Yamb paper.',ok:hs.length>=1},
      {id:'yamb',name:'Five on Deck',desc:'Record at least one scoring Yamb.',ok:players.some(p=>yambCount(p)>0)},
      {id:'straight',name:'Signal Straight',desc:'Record a first-roll straight worth 66.',ok:players.some(hasFirstRollStraight)},
      {id:'upper',name:'Upper Battery',desc:'Reach 60+ raw points in one upper-section column.',ok:players.some(p=>upperBest(p)>=60)},
      {id:'ai',name:'Harbour Breaker',desc:'Win a completed game against Harbour AI.',ok:hs.some(h=>h.mode==='single'&&h.winner===0)},
      {id:'online',name:'Open Water',desc:'Complete an online P2P game.',ok:hs.some(h=>h.mode==='online')},
      {id:'team',name:'Two Watches',desc:'Complete a TEAM-format game.',ok:hs.some(h=>h.format==='TEAM')},
      {id:'sweep',name:'Clean Semaphore',desc:`Complete a match with ${target} wins and no opposing light.`,ok:hs.some(h=>Math.max(...(h.seriesWins||[0,0]))>=target&&Math.min(...(h.seriesWins||[0,0]))===0)},
      {id:'summit',name:'Mount Yamb 1000',desc:'Complete a paper with at least 1000 points.',ok:hs.some(h=>(h.totals||[]).some(v=>Number(v)>=1000))}
    ];
  }

  function achievementsHTML(){
    const defs=achievementDefinitions();const unlocked=defs.filter(a=>a.ok).length;
    return `<div class="feature-statline"><strong>${unlocked}/${defs.length}</strong><span>milestones unlocked</span></div><div class="achievement-grid">${defs.map(a=>`<article class="achievement-card ${a.ok?'unlocked':'locked'}"><div class="achievement-mark">${a.ok?'★':'◇'}</div><div><b>${esc(a.name)}</b><span>${esc(a.desc)}</span></div><small>${a.ok?'UNLOCKED':'LOCKED'}</small></article>`).join('')}</div>`;
  }

  function profilesHTML(){
    const profiles=aggregateProfiles();
    if(!profiles.length)return emptyPanel('No player career data yet. Profiles are generated from immutable completed-game snapshots.');
    return `<div class="profile-grid">${profiles.map(p=>`<article class="profile-card"><div class="profile-monogram">${esc(p.name.split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'P')}</div><div class="profile-name"><b>${esc(p.name)}</b><span>${p.games} GAMES · ${p.wins} WINS · ${p.draws} DRAWS</span></div><div class="profile-metrics"><span><b>${p.avg}</b>AVG</span><span><b>${p.best}</b>BEST</span><span><b>${p.yambs}</b>YAMB</span><span><b>${p.zeros}</b>ZERO</span></div></article>`).join('')}</div>`;
  }

  function savedGames(){
    return store.entries(PERSIST_PREFIX).map(([key,value])=>({key,...value})).sort((a,b)=>String(b.savedAt||'').localeCompare(String(a.savedAt||'')));
  }
  function savesHTML(){
    const saves=savedGames();
    return `<div class="save-create"><label for="saveSlotName">SAVE CURRENT RUNTIME</label><div><input id="saveSlotName" maxlength="40" placeholder="e.g. Friday match"><button class="feature-btn primary" data-save-current>CREATE SNAPSHOT</button></div></div>${saves.length?`<div class="save-list">${saves.map(item=>`<article class="save-card"><div><b>${esc(item.name||'Saved game')}</b><span>${new Date(item.savedAt).toLocaleString()} · ${esc(item.mode||'GAME').toUpperCase()}</span></div><div><button class="feature-btn" data-load-save="${esc(item.key)}">LOAD</button><button class="feature-btn danger" data-delete-save="${esc(item.key)}">DELETE</button></div></article>`).join('')}</div>`:emptyPanel('No manual snapshots yet. Active runtime persistence still happens automatically in IndexedDB.')}`;
  }

  function timelineHTML(){
    const items=(telemetry?.list?.()||[]).slice(-120).reverse();
    return `<div class="feature-toolbar"><span>${items.length} most recent runtime events</span><button class="feature-btn" data-clear-timeline>CLEAR LOCAL TIMELINE</button></div>${items.length?`<div class="timeline-list">${items.map(e=>`<article><time>${new Date(e.at).toLocaleString()}</time><b>${esc(e.type)}</b><code>${esc(JSON.stringify(e.data||{}))}</code></article>`).join('')}</div>`:emptyPanel('No runtime events have been recorded yet.')}`;
  }

  function rangeRow(label,key,value){return `<div class="advanced-row"><label for="setting-${key}">${esc(label)}</label><div class="advanced-control"><input id="setting-${key}" type="range" min="0" max="100" step="1" value="${Math.round(value*100)}" data-audio-channel="${key}"><output>${Math.round(value*100)}%</output></div></div>`;}
  function settingsHTML(){
    const audio=window.YambAudio;const language=i18n?.language||'en';const match=runtime?.getMatchTarget?.()||5;const ai=runtime?.getAIDifficulty?.()||'standard';
    return `<div class="settings-stack">
      <section class="settings-section"><h4>AUDIO MIXER</h4>
        <div class="advanced-row"><label>Sound engine</label><button class="feature-toggle" data-setting-sound aria-pressed="${audio?.isEnabled?.()!==false}">${audio?.isEnabled?.()!==false?'ON':'OFF'}</button></div>
        ${rangeRow('Master','master',audio?.getMaster?.()??.86)}${rangeRow('Interface','ui',audio?.getChannel?.('ui')??1)}${rangeRow('Dice / mechanics','dice',audio?.getChannel?.('dice')??1)}${rangeRow('Ceremony','ceremony',audio?.getChannel?.('ceremony')??1)}
        <div class="advanced-row"><label>Haptic feedback</label><button class="feature-toggle" data-setting-haptics aria-pressed="${audio?.getHaptics?.()!==false}">${audio?.getHaptics?.()!==false?'ON':'OFF'}</button></div>
      </section>
      <section class="settings-section"><h4>GAME RUNTIME</h4>
        <div class="advanced-row"><label for="setting-match">Match target</label><select id="setting-match" data-setting-match>${[1,3,5,7,9].map(v=>`<option value="${v}" ${v===match?'selected':''}>First to ${v}</option>`).join('')}</select></div>
        <div class="advanced-row"><label for="setting-ai">Harbour AI</label><select id="setting-ai" data-setting-ai><option value="casual" ${ai==='casual'?'selected':''}>Cadet · casual</option><option value="standard" ${ai==='standard'?'selected':''}>Officer · standard</option><option value="expert" ${ai==='expert'?'selected':''}>Admiral · expert</option></select></div>
        <div class="advanced-row"><label for="setting-language">Interface language</label><select id="setting-language" data-setting-language><option value="en" ${language==='en'?'selected':''}>English</option><option value="bs" ${language==='bs'?'selected':''}>Bosanski</option><option value="sv" ${language==='sv'?'selected':''}>Svenska</option></select></div>
      </section>
      <section class="settings-section"><h4>DEVICE & DATA</h4>
        <div class="advanced-row"><label>Installable app</label><button class="feature-btn" data-install-app ${window.YambPWA?.installed?'disabled':''}>${window.YambPWA?.installed?'INSTALLED':'INSTALL APP'}</button></div>
        <div class="advanced-row"><label>Complete local backup</label><div class="settings-actions"><button class="feature-btn" data-export-backup>EXPORT SNAPSHOT</button><button class="feature-btn" data-import-backup>IMPORT SNAPSHOT</button><input type="file" accept="application/json,.json" data-backup-file hidden></div></div>
        <p class="settings-note">Active game state, preferences, local ranking, manual saves and runtime timeline are stored in IndexedDB on this device. Online gameplay only synchronizes the live session through WebRTC.</p>
      </section>
    </div>`;
  }

  function emptyPanel(text){return `<div class="feature-empty"><b>NO DATA YET</b><span>${esc(text)}</span></div>`;}
  function download(filename,text,type='application/json'){
    const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function openFeature(type){
    window.YambPlatform?.openUtility?.('settings');
    const modal=$('#platformUtilityModal'),card=modal?.querySelector('.utility-card'),title=$('#utilityTitle'),body=$('#utilityBody');if(!modal||!title||!body)return;
    card?.classList.remove('about-mode');modal.classList.add('show');
    const panels={leaderboards:['Leaderboards',leaderboardHTML],achievements:['Achievements',achievementsHTML],profiles:['Player Profiles',profilesHTML],saves:['Saved Games',savesHTML],timeline:['Runtime Timeline',timelineHTML],settings:['Settings',settingsHTML]};
    const selected=panels[type];if(!selected)return;title.textContent=selected[0];body.innerHTML=selected[1]();body.dataset.featurePanel=type;
  }

  function ensureDrawerItems(){
    const list=$('#platformSideMenu .platform-side-list');if(!list)return;
    const anchor=list.querySelector('[data-util="settings"]');
    const specs=[
      ['profiles','Profiles','Career statistics generated from archived games'],
      ['saves','Saved Games','Manual IndexedDB snapshots and restore points'],
      ['timeline','Timeline','Local event trace for replay and diagnostics']
    ];
    for(const [id,label,sub] of specs){
      if(list.querySelector(`[data-util="${id}"]`))continue;
      const btn=document.createElement('button');btn.className='platform-side-item';btn.dataset.util=id;btn.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v14H5zM8 9h8M8 13h8M8 17h5"/></svg><span><strong>${esc(label)}</strong><small>${esc(sub)}</small></span>`;
      list.insertBefore(btn,anchor);
    }
  }

  document.addEventListener('click',event=>{
    const util=event.target.closest('[data-util]');
    if(util&&['leaderboards','achievements','profiles','saves','timeline','settings'].includes(util.dataset.util)){
      event.preventDefault();event.stopImmediatePropagation();
      window.YambPlatform?.toggleDrawer?.(false,true);window.YambSfx?.select?.();openFeature(util.dataset.util);return;
    }
    if(event.target.closest('[data-save-current]')){
      const input=$('#saveSlotName');const name=input?.value.trim()||`Saved game ${savedGames().length+1}`;const current=structuredClone(state());const key=PERSIST_PREFIX+(crypto.randomUUID?.()||Date.now());
      store.set(key,{name,savedAt:new Date().toISOString(),mode:current.mode,format:current.format,state:current});telemetry?.record?.('snapshot.created',{name,mode:current.mode});openFeature('saves');return;
    }
    const load=event.target.closest('[data-load-save]');if(load){const item=store.getSync(load.dataset.loadSave,null);if(item?.state){runtime?.replaceState?.(item.state);telemetry?.record?.('snapshot.loaded',{name:item.name||''});window.YambPlatform?.openUtility?.('');}return;}
    const del=event.target.closest('[data-delete-save]');if(del){store.remove(del.dataset.deleteSave);telemetry?.record?.('snapshot.deleted',{});openFeature('saves');return;}
    if(event.target.closest('[data-clear-timeline]')){telemetry?.clear?.();openFeature('timeline');return;}
    if(event.target.closest('[data-setting-sound]')){const a=window.YambAudio;a?.setEnabled?.(!(a?.isEnabled?.()!==false));openFeature('settings');return;}
    if(event.target.closest('[data-setting-haptics]')){const a=window.YambAudio;a?.setHaptics?.(!(a?.getHaptics?.()!==false));openFeature('settings');return;}
    if(event.target.closest('[data-install-app]')){void window.YambPWA?.install?.().then(()=>openFeature('settings'));return;}
    if(event.target.closest('[data-export-backup]')){void store.exportSnapshot().then(snapshot=>download(`YAMB-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(snapshot,null,2)));return;}
    if(event.target.closest('[data-import-backup]')){document.querySelector('[data-backup-file]')?.click();return;}

    if(window.YambAudio?.getHaptics?.()!==false&&navigator.vibrate){
      if(event.target.closest('#rollCup'))navigator.vibrate([18,14,18]);
      else if(event.target.closest('.die-tile'))navigator.vibrate(12);
      else if(event.target.closest('.cellbtn.eligible,.cellbtn.announce-candidate'))navigator.vibrate(16);
    }
    const action=event.target.closest('button');
    if(action?.id==='rollCup'||action?.classList.contains('die-tile')||action?.classList.contains('cellbtn')) telemetry?.record?.('interaction',{id:action.id||'',class:action.className,mode:state().mode,roll:state().rollCount,current:state().current});
  },true);

  document.addEventListener('input',event=>{
    const range=event.target.closest('[data-audio-channel]');if(!range)return;
    const channel=range.dataset.audioChannel;const value=Number(range.value)/100;
    if(channel==='master')window.YambAudio?.setMaster?.(value);else window.YambAudio?.setChannel?.(channel,value);
    const output=range.parentElement?.querySelector('output');if(output)output.textContent=`${range.value}%`;
  });
  document.addEventListener('change',event=>{
    const backup=event.target.closest('[data-backup-file]');if(backup){const file=backup.files?.[0];if(!file)return;void file.text().then(JSON.parse).then(snapshot=>store.importSnapshot(snapshot,{replace:true})).then(()=>{telemetry?.record?.('backup.imported',{});location.reload()}).catch(error=>alert(error?.message||'Backup import failed'));return;}
    const match=event.target.closest('[data-setting-match]');if(match){runtime?.setMatchTarget?.(Number(match.value));telemetry?.record?.('settings.matchTarget',{value:Number(match.value)});openFeature('settings');return;}
    const ai=event.target.closest('[data-setting-ai]');if(ai){runtime?.setAIDifficulty?.(ai.value);telemetry?.record?.('settings.aiDifficulty',{value:ai.value});return;}
    const lang=event.target.closest('[data-setting-language]');if(lang){i18n?.setLanguage?.(lang.value);telemetry?.record?.('settings.language',{value:lang.value});openFeature('settings');return;}
  });

  const originalRender=window.render;
  if(typeof originalRender==='function')window.render=function(){originalRender();ensureDrawerItems();i18n?.apply?.();};
  addEventListener('yamb:installable',()=>{if($('#utilityBody')?.dataset.featurePanel==='settings')openFeature('settings');});
  addEventListener('load',()=>{ensureDrawerItems();i18n?.apply?.();telemetry?.record?.('runtime.ready',{version:runtime?.version||'1.0.0'});});
})();
