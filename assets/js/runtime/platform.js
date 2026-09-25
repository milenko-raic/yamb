
(()=>{
  const DRAWER_PREF_KEY='preferences.commandCabinetAnchored';
  let sideMenuOpen=false,utilityOpen=false;
  const originalRender=render;
  function escHtml(s){return String(s??'').replace(/[&<>\"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]));}
  function getDrawerPinned(){return window.YambPersistence?.getSync(DRAWER_PREF_KEY,false)===true}
  function setDrawerPinned(value){window.YambPersistence?.set(DRAWER_PREF_KEY,!!value);applyDrawerPinned(value);}
  function icon(name){
    const icons={
      playground:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M4 12h16"/><rect x="5" y="5" width="14" height="14" rx="2"/></svg>',
      board:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 4v16"/></svg>',
      player:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M5.5 19c.8-3.9 2.9-5.8 6.5-5.8s5.7 1.9 6.5 5.8"/></svg>',
      trophy:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 12v5M8 20h8M10 17h4"/></svg>',
      star:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.3 1.1 6.1L12 17l-5.6 3 1.1-6.1L3 9.6l6.2-.9Z"/></svg>',
      settings:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.4A3.6 3.6 0 1 0 12 15.6 3.6 3.6 0 0 0 12 8.4Z"/><path d="M3 13.2v-2.4l2.4-.7a6.8 6.8 0 0 1 .7-1.7L5 6.1l1.7-1.7 2.3 1.1c.5-.3 1.1-.5 1.7-.7L11.4 2h2.4l.7 2.4c.6.2 1.2.4 1.7.7l2.3-1.1L20.2 6l-1.1 2.3c.3.5.5 1.1.7 1.7l2.4.7v2.4l-2.4.7a6.8 6.8 0 0 1-.7 1.7l1.1 2.3-1.7 1.7-2.3-1.1c-.5.3-1.1.5-1.7.7l-.7 2.4h-2.4l-.7-2.4a6.8 6.8 0 0 1-1.7-.7l-2.3 1.1L5 18l1.1-2.3a6.8 6.8 0 0 1-.7-1.7L3 13.2Z"/></svg>',
      rules:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v18H7.5A3.5 3.5 0 0 0 4 23V5.5ZM20 5.5A3.5 3.5 0 0 0 16.5 2H13v18h3.5A3.5 3.5 0 0 1 20 23V5.5Z"/></svg>',
      about:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 10.2v6.3M12 7.5h.01"/></svg>',
      arrowLeft:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.8 5.5 8.3 12l6.5 6.5M9 12h10"/></svg>',
      close:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"/></svg>',
      anchorExpand:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.9" r="2.1"/><path d="M12 7.2v11.4M7 10.8h10M5.1 15c1 2.8 3.3 4.5 6.9 4.8M18.9 15c-1 2.8-3.3 4.5-6.9 4.8M5.1 15l-2 2.5M18.9 15l2 2.5"/></svg>'
    };
    return icons[name]||icons.about;
  }
  function syncDrawerControls(){
    const pinned=getDrawerPinned();
    document.body.classList.toggle('side-menu-expanded',pinned);
    const dismiss=document.querySelector('[data-dismiss-drawer]');
    if(dismiss){dismiss.innerHTML=icon(pinned?'close':'arrowLeft');dismiss.setAttribute('aria-label',pinned?'Close command cabinet':'Close command cabinet');dismiss.setAttribute('title','Close command cabinet');}
    const anchor=document.querySelector('[data-expand-drawer]');
    if(anchor){anchor.setAttribute('aria-pressed',String(pinned));anchor.setAttribute('aria-label',pinned?'Unanchor full-screen command cabinet':'Anchor command cabinet full screen');anchor.setAttribute('title',pinned?'Unanchor full-screen cabinet':'Anchor full-screen cabinet');}
  }
  function applyDrawerPinned(value){document.body.classList.toggle('side-menu-expanded',!!value);syncDrawerControls();}
  function ensureDrawer(){
    if(document.getElementById('platformSideMenu')){syncDrawerControls();return;}
    const overlay=document.createElement('div');overlay.className='platform-side-overlay';overlay.id='platformSideOverlay';
    const menu=document.createElement('aside');menu.className='platform-side-menu';menu.id='platformSideMenu';
    menu.innerHTML='<div class="platform-side-head"><div class="platform-side-title">YAMB · Command Cabinet</div><div class="platform-side-sub">Royal Navy Engineering runtime · boards, logs, control and instrument settings.</div><button class="platform-side-dismiss" type="button" data-dismiss-drawer aria-label="Close command cabinet" title="Close command cabinet">'+icon('arrowLeft')+'</button></div><div class="platform-side-list">'
      +'<button class="platform-side-item" data-action="playground">'+icon('playground')+'<span><strong>Playground</strong><small>Open game control and start a new game</small></span></button>'
      +'<button class="platform-side-item" data-action="activeBoard">'+icon('board')+'<span><strong>Runtime Board</strong><small>Return to the active score surface</small></span></button>'
      +'<button class="platform-side-item" data-action="match">'+icon('trophy')+'<span><strong>Match Centre</strong><small>Semaphore, series state and archived papers</small></span></button>'
      +'<button class="platform-side-item" data-action="p1Board">'+icon('player')+'<span><strong>Player 1 Sheet</strong><small>Read-only ship paper with export / print</small></span></button>'
      +'<button class="platform-side-item" data-action="p2Board">'+icon('player')+'<span><strong>Player 2 Sheet</strong><small>Opponent paper and AI write trace</small></span></button>'
      +'<button class="platform-side-item" data-action="rules">'+icon('rules')+'<span><strong>Rules</strong><small>Scoring, columns, match and online rules</small></span></button>'
      +'<button class="platform-side-item" data-util="leaderboards">'+icon('trophy')+'<span><strong>Leaderboards</strong><small>Local career ranking from archived game papers</small></span></button>'
      +'<button class="platform-side-item" data-util="achievements">'+icon('star')+'<span><strong>Achievements</strong><small>Computed milestones from verified local history</small></span></button>'
      +'<button class="platform-side-item" data-util="settings">'+icon('settings')+'<span><strong>Settings</strong><small>Audio and cabinet preferences</small></span></button>'
      +'<button class="platform-side-item" data-util="about">'+icon('about')+'<span><strong>About</strong><small>Product identity, runtime and developer</small></span></button>'
      +'</div><div class="platform-side-foot"><span class="modechip" id="platformSideModeChip">MODE</span><div class="roomline" id="platformSideRoomLine">LOCAL MATCH</div><button class="platform-side-expand" type="button" data-expand-drawer aria-label="Anchor command cabinet full screen" title="Anchor full-screen cabinet" aria-pressed="false">'+icon('anchorExpand')+'</button></div>';
    document.body.append(overlay,menu);
    overlay.addEventListener('click',()=>toggleDrawer(false));
    menu.querySelector('[data-dismiss-drawer]')?.addEventListener('click',()=>toggleDrawer(false));
    menu.querySelector('[data-expand-drawer]')?.addEventListener('click',()=>setDrawerPinned(!getDrawerPinned()));
    menu.addEventListener('click',ev=>{const btn=ev.target.closest('[data-action],[data-util]');if(!btn)return;const action=btn.dataset.action,util=btn.dataset.util;window.YambSfx?.select?.();if(action){toggleDrawer(false,true);if(action==='playground'){modalMode=(typeof modalSectionForMode==='function'?modalSectionForMode(state?.mode||'hotseat'):'hotseat');menuOpen=true;if(typeof render==='function')render();return;}if(typeof showTab==='function')showTab(action);if(action==='p2Board'&&document.documentElement.dataset.gameMode==='solo'&&typeof showTab==='function')showTab('p1Board');return;}if(util){toggleDrawer(false,true);openUtility(util);}});
    syncDrawerControls();
  }
  function toggleExpanded(force){const next=typeof force==='boolean'?force:!getDrawerPinned();setDrawerPinned(next);window.YambSfx?.uiTap?.();}
  function toggleDrawer(force,silent=false){
    const next=typeof force==='boolean'?force:!sideMenuOpen;
    if(next===sideMenuOpen)return;
    sideMenuOpen=next;document.body.classList.toggle('side-menu-open',sideMenuOpen);
    if(sideMenuOpen)syncDrawerControls();
    if(!silent)(sideMenuOpen?window.YambSfx?.uiOpen?.():window.YambSfx?.uiClose?.());
  }
  function ensureUtility(){if(document.getElementById('platformUtilityModal'))return;const wrap=document.createElement('div');wrap.className='utility-modal';wrap.id='platformUtilityModal';wrap.innerHTML='<div class="utility-card"><div class="utility-head"><h3 id="utilityTitle">Platform Panel</h3><button type="button" id="utilityCloseBtn" aria-label="Close platform panel" title="Close">×</button></div><div class="utility-body" id="utilityBody"></div></div>';document.body.appendChild(wrap);wrap.addEventListener('click',e=>{if(e.target===wrap)openUtility('');});wrap.querySelector('#utilityCloseBtn').addEventListener('click',()=>openUtility(''));}
  function settingsHTML(soundOn,master,mode,room){const pinned=getDrawerPinned();return '<p>Runtime and sensory preferences stay local to this browser.</p><div class="utility-grid"><div class="utility-tile audio-settings"><div class="audio-setting-row"><label for="platformSoundToggle">Sound effects</label><button id="platformSoundToggle" class="audio-toggle" type="button" data-audio-toggle aria-pressed="'+String(soundOn)+'">'+(soundOn?'SOUND · ON':'SOUND · OFF')+'</button></div><div><div class="audio-setting-row"><label for="platformMasterVolume">Master level</label><span id="platformMasterValue" class="audio-master-value">'+master+'%</span></div><input id="platformMasterVolume" class="audio-range" data-audio-master type="range" min="0" max="100" step="1" value="'+master+'" aria-label="Master sound level"></div></div><div class="utility-tile"><div class="drawer-pref-row"><div class="drawer-pref-copy"><b>Full-screen Command Cabinet</b><span>Keep the sidebar anchored to the full viewport every time MENU opens.</span></div><button class="drawer-pref-toggle" type="button" data-drawer-pref aria-pressed="'+String(pinned)+'">'+(pinned?'ANCHORED':'COMPACT')+'</button></div></div><div class="utility-tile"><b>Mode</b><span>'+escHtml(mode)+'</span></div><div class="utility-tile"><b>Online room</b><span>'+escHtml(room)+'</span></div><div class="utility-tile"><b>Game control</b><span>Use <b>Playground</b> in the Command Cabinet to reopen the game-control surface.</span></div></div>';}
  function aboutHTML(){return '<div class="about-hero"><div class="about-kicker">N.O.I.S.E. HARBOUR · DIGITAL INSTRUMENT</div><h4>YAMB · Royal Navy Engineering</h4><p>A tactile browser-native Yamb table built as one coherent instrument: ivory dice, ship-paper scoring, synthesized mechanical audio, AI, local multiplayer, team play, persistence and live peer-to-peer play.</p><div class="about-badges"><span class="about-badge">1.0.0 · RELEASE</span><span class="about-badge">Modular static runtime</span><span class="about-badge">GitHub Pages ready</span><span class="about-badge">Local-first</span><span class="about-badge">PeerJS P2P</span></div></div><div class="about-grid"><div class="about-card"><span class="about-label">Developer</span><div class="about-signature"><div class="about-monogram">MR</div><div><strong>Milenko Raic</strong><p>Application developer and product architect.</p></div></div></div><div class="about-card"><span class="about-label">Brand / operator</span><strong>N.O.I.S.E. Harbour</strong><p>Operated through Milenko Raic · Enskild näringsidkare · Sweden.</p></div><div class="about-card wide"><span class="about-label">Runtime capability</span><strong>One game surface · multiple operational modes</strong><div class="about-tech"><span>SOLO</span><span>HARBOUR AI</span><span>HOTSEAT DUEL</span><span>HOTSEAT TEAM</span><span>ONLINE DUEL</span><span>ONLINE TEAM</span><span>ONLINE CREW</span><span>MOUNT YAMB</span><span>MATCH HISTORY</span><span>PRINT / EXPORT</span><span>WEB AUDIO</span></div></div><div class="about-card"><span class="about-label">Design language</span><strong>Royal Navy engineered Yamb table</strong><p>Dark naval instrumentation, wood and ivory materiality, brass accents and restrained physical feedback.</p></div><div class="about-card"><span class="about-label">Data model</span><strong>Local-first by design</strong><p>Game state, history, preferences and Mount Yamb records remain in the browser unless a live P2P session explicitly synchronizes game state.</p></div></div><div class="about-foot">YAMB · ROYAL NAVY ENGINEERING · PROVISIONED BY N.O.I.S.E. HARBOUR</div>';}
  function openUtility(type){ensureUtility();const modal=document.getElementById('platformUtilityModal'),card=modal.querySelector('.utility-card'),title=document.getElementById('utilityTitle'),body=document.getElementById('utilityBody');if(!type){if(utilityOpen)window.YambSfx?.uiClose?.();utilityOpen=false;modal.classList.remove('show');card?.classList.remove('about-mode');return;}utilityOpen=true;modal.classList.add('show');card?.classList.toggle('about-mode',type==='about');window.YambSfx?.uiOpen?.();const mode=(state?.mode||'hotseat').toUpperCase(),room=state?.onlineRoomId||'—',audio=window.YambAudio;const soundOn=audio?.isEnabled?.()!==false,master=Math.round((audio?.getMaster?.()??.86)*100);const content={leaderboards:{title:'Leaderboards',html:'<p>Local career rankings are derived from completed archived game papers on this device.</p>'},achievements:{title:'Achievements',html:'<p>Milestones are computed from completed local game history and scoring evidence.</p>'},settings:{title:'Settings',html:settingsHTML(soundOn,master,mode,room)},about:{title:'About YAMB',html:aboutHTML()}}[type]||{title:'Platform Panel',html:'<p>Panel unavailable.</p>'};title.textContent=content.title;body.innerHTML=content.html;}
  document.addEventListener('click',event=>{const audioBtn=event.target.closest('[data-audio-toggle]');if(audioBtn){event.preventDefault();const audio=window.YambAudio;if(!audio)return;audio.setEnabled(!audio.isEnabled());openUtility('settings');return;}const pref=event.target.closest('[data-drawer-pref]');if(pref){event.preventDefault();setDrawerPinned(!getDrawerPinned());window.YambSfx?.uiTap?.();openUtility('settings');}});
  document.addEventListener('input',event=>{const range=event.target.closest('[data-audio-master]');if(!range)return;const audio=window.YambAudio;if(!audio)return;audio.setMaster(Number(range.value)/100);const readout=document.getElementById('platformMasterValue');if(readout)readout.textContent=range.value+'%';});
  function enhanceAfterRender(){document.querySelectorAll('.sumrow .computed-cell.pending').forEach(el=>{el.textContent='';el.classList.add('is-empty');});document.querySelectorAll('.paper-computed').forEach(el=>{if(el.textContent.trim()==='—'){el.textContent='';el.classList.add('is-empty');}});document.querySelectorAll('#p1Board .paper-sheet').forEach(el=>el.classList.add('paper-player-blue'));document.querySelectorAll('#p2Board .paper-sheet').forEach(el=>el.classList.add('paper-player-red'));document.querySelectorAll('.history-paper-grid').forEach(grid=>{const cards=grid.querySelectorAll('.paper-sheet');if(cards[0])cards[0].classList.add('paper-player-blue');if(cards[1])cards[1].classList.add('paper-player-red');});document.querySelectorAll('#p1Board .paper-table thead th:first-child,#p2Board .paper-table thead th:first-child,.history-paper .paper-table thead th:first-child').forEach(th=>{th.textContent='';th.setAttribute('aria-label','');});const chip=document.getElementById('platformSideModeChip');if(chip)chip.textContent=(modeLabel?modeLabel(state?.mode||'hotseat'):String(state?.mode||'hotseat')).toUpperCase();const roomline=document.getElementById('platformSideRoomLine');if(roomline)roomline.textContent=(state?.mode==='online'&&state?.onlineRoomId)?('ROOM '+state.onlineRoomId):('MATCH '+(state?.seriesWins?.[0]??0)+' : '+(state?.seriesWins?.[1]??0));const p2Button=document.querySelector('.platform-side-item[data-action="p2Board"]');if(p2Button)p2Button.style.display=(document.documentElement.dataset.gameMode==='solo')?'none':'grid';syncDrawerControls();}
  window.YambPlatform={toggleDrawer,toggleExpanded,openUtility,setDrawerPinned,getDrawerPinned};
  render=function(){originalRender();ensureDrawer();ensureUtility();enhanceAfterRender();};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(sideMenuOpen)toggleDrawer(false);else if(utilityOpen)openUtility('');}});
  window.addEventListener('load',()=>{ensureDrawer();ensureUtility();applyDrawerPinned(getDrawerPinned());if(typeof render==='function')render();});
})();


(()=>{
  document.addEventListener("click",event=>{
    const button=event.target.closest("[data-history-dispose]");
    if(!button)return;
    event.preventDefault();
    event.stopPropagation();
    const id=button.dataset.historyDispose;
    const entry=(state.history||[]).find(item=>String(item.id)===String(id));
    if(!entry)return;
    const label=`M${entry.matchSerial||1} · G${entry.game||1}`;
    const ok=window.confirm(`Dispose ${label} from Match History?\n\nThis removes only the archived completed-game snapshot. The current live match is not reset. This action cannot be undone.`);
    if(!ok)return;
    state.history=(state.history||[]).filter(item=>String(item.id)!==String(id));
    saveState();
    renderMatchHistory();
  },true);
})();
