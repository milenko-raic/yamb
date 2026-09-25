
(() => {
"use strict";


const CATS=[
  {id:"ones",label:"1",type:"num",face:1},
  {id:"twos",label:"2",type:"num",face:2},
  {id:"threes",label:"3",type:"num",face:3},
  {id:"fours",label:"4",type:"num",face:4},
  {id:"fives",label:"5",type:"num",face:5},
  {id:"sixes",label:"6",type:"num",face:6},
  {id:"max",label:"+",type:"max"},
  {id:"min",label:"−",type:"min"},
  {id:"kenta",label:"S",type:"kenta"},
  {id:"full",label:"F",type:"full"},
  {id:"poker",label:"P",type:"poker"},
  {id:"yamb",label:"Y",type:"yamb"}
];
const COLS=[
  {id:"down",label:"▼",title:"down"},
  {id:"free",label:"▼▲",title:"free"},
  {id:"up",label:"▲",title:"up"},
  {id:"announce",label:"A",title:"Announcement"},
  {id:"hand",label:"H",title:"Hand"}
];
function columnIconHTML(id){
  if(id==="announce")return `<span class="lock-column-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><rect x="6" y="10" width="12" height="9" rx="1.5"/><path d="M9 10V7a3 3 0 0 1 6 0v3M12 13v3"/></svg></span>`;
  if(id==="hand")return `<span class="hand-column-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M7.8 12V7.2a1.45 1.45 0 0 1 2.9 0V11M10.7 6a1.45 1.45 0 0 1 2.9 0v5M13.6 6.8a1.45 1.45 0 0 1 2.9 0v4.9M16.5 9a1.45 1.45 0 0 1 2.9 0v4.2c0 4.3-2.8 7.3-6.9 7.3h-1.2c-2.3 0-4.2-1-5.6-2.8l-2.3-3a1.45 1.45 0 0 1 2.2-1.9L7.8 15V12Z"/></svg></span>`;
  return "";
}
function columnHeaderHTML(col){return col.id==="announce"||col.id==="hand"?columnIconHTML(col.id):esc(col.label)}
function hydrateColumnSemanticIcons(){
  document.querySelectorAll("[data-yamb-column-icon]").forEach(node=>{const id=node.dataset.yambColumnIcon;if(node.dataset.iconHydrated===id)return;node.innerHTML=columnIconHTML(id);node.dataset.iconHydrated=id;});
}
const STORAGE_KEY="runtime.state";
const BACKUP_STORAGE_KEY="runtime.state.backup";
const PRODUCT_VERSION="1.0.0";
const STATE_SCHEMA=1;
const PROTOCOL_VERSION=1;
const APP_VERSION=STATE_SCHEMA;
let MATCH_TARGET=Math.max(1,Math.min(9,Number(window.YambPersistence?.getSync("preferences.matchTarget",5))||5));
const $=id=>document.getElementById(id);
const ids=[
  "p1Head","p2Head","p1AvatarTop","p2AvatarTop","p1NameTop","p2NameTop","p1ScoreTop","p2ScoreTop","ratio1","ratio2","miniLights1","miniLights2",
  "activeBoard","p1Board","p2Board","match","rules","tomb","tombLedger","diceBank","rollCup","cupRollNo","dockInfo",
  "matchName1","matchName2","matchScore1","matchScore2","semaphoreTitle","semaphoreRace","sem1","sem2","matchHistory",
  "setupModal","setupP1","setupP2","setupSoloName","startBtn","startSoloBtn","startSingleBtn","resumeBtn","menuResetBtn","menuCloseBtn","gameMenuBtn","tombTopBtn",
  "controlModeLabel","controlGameLabel","controlStateLabel",
  "onlineP1","onlineP2","onlineCodeInput","onlineCreateBtn","onlineJoinBtn","onlineCopyBtn","onlineShareBtn","onlineRefreshBtn","onlineStatus","onlineLobbyModal","onlineLobbyTitle","onlineLobbySubtitle","onlineLobbyRoom","onlineLobbyInviteGroup","onlineLobbyInvite","onlineLobbyCopyBtn","onlineLobbyShareBtn","onlineLobbyP1","onlineLobbyP2","onlineLobbyStatus","onlineLobbyCancelBtn","onlineLobbyCloseBtn",
  "exportBtn","importBtn","printBtn","importFileInput","printArea",
  "switchModal","switchEyebrow","switchTitle","switchText","switchCountdown","switchProgress","switchHint",
  "roundModal","roundTitle","roundDesc","roundScore","roundLights","nextGameBtn","resetSeriesBtn","roundCloseBtn",
  "scoreConfirmModal","scoreConfirmCloseBtn","scoreConfirmTitle","confirmPlayer","confirmColumn","confirmCategory","confirmRoll","confirmPoints","scoreConfirmWarning","cancelScoreBtn","confirmScoreBtn",
  "teamDecisionModal","teamDecisionCloseBtn","teamDecisionTitle","teamDecisionSubtitle","teamDecisionChoices"
];
const els={};ids.forEach(id=>els[id]=$(id));

function emptyScores(){
  const s={};
  COLS.forEach(c=>{
    s[c.id]={};
    CATS.forEach(cat=>s[c.id][cat.id]=null);
  });
  return s;
}
function freshState(mode="hotseat"){
  return {
    version:APP_VERSION,
    matchTarget:MATCH_TARGET,
    started:false,
    mode,
    format:mode==="solo"?"SOLO":"DUEL",
    opponent:mode==="solo"?"NONE":mode==="single"?"AI":"HUMAN",
    playersCount:mode==="solo"?1:2,
    teamsCount:0,
    transport:mode==="online"?"ONLINE":"LOCAL",
    variantCode:mode==="solo"?"SO":mode==="single"?"AI":"DU",
    teamMember:0,
    teamHands:[null,null],
    teamFirstHands:[null,null],
    teamCandidates:[null,null],
    teamAwaitingScore:false,
    teamSelected:null,
    teamReady:false,
    current:0,
    localPlayer:0,
    remoteLock:false,
    onlineGameId:"",
    onlineRoomId:"",
    onlineRoomUrl:"",
    onlineProvider:"peerjs",
    onlineTopology:"PAIR",
    crewNames:{A1:"Player A1",A2:"Player A2",B1:"Player B1",B2:"Player B2"},
    crewLocalSeat:"",
    onlineLastSync:0,
    onlineReady:false,
    onlinePeerJoined:false,
    revision:0,
    rollCount:0,
    dice:[1,1,1,1,1],
    held:[false,false,false,false,false],
    announced:null,
    waiting:false,
    roundOver:false,
    seriesOver:false,
    round:1,
    matchSerial:1,
    history:[],
    seriesWins:[0,0],
    soundOn:true,
    players:[
      {name:"Player 1",scores:emptyScores()},
      {name:mode==="single"?"Harbour AI":mode==="solo"?"Solo Log":"Player 2",scores:emptyScores()}
    ]
  };
}
function normalizeScores(raw){
  const s=emptyScores();
  if(!raw||typeof raw!=="object")return s;
  COLS.forEach(c=>CATS.forEach(cat=>{
    const v=raw?.[c.id]?.[cat.id];
    s[c.id][cat.id]=(v===null||Number.isFinite(v))?v:null;
  }));
  return s;
}
function normalizeHistory(raw){
  if(!Array.isArray(raw))return [];
  return raw.slice(-60).map((h,index)=>{
    const mode=["solo","single","hotseat","online"].includes(h?.mode)?h.mode:"hotseat";
    const players=Array.isArray(h?.players)?h.players.slice(0,2).map((p,i)=>({name:String(p?.name||`Player ${i+1}`).slice(0,24),scores:normalizeScores(p?.scores)})):[];
    return {
      id:String(h?.id||`history-${index}-${Date.now()}`),
      matchSerial:Math.max(1,Number(h?.matchSerial)||1),
      game:Math.max(1,Number(h?.game)||1),
      mode,
      format:["SOLO","DUEL","TEAM"].includes(h?.format)?h.format:(mode==="solo"?"SOLO":"DUEL"),
      opponent:["NONE","HUMAN","AI"].includes(h?.opponent)?h.opponent:(mode==="solo"?"NONE":mode==="single"?"AI":"HUMAN"),
      playersCount:[1,2,4].includes(Number(h?.playersCount))?Number(h.playersCount):(mode==="solo"?1:2),
      teamsCount:Number(h?.teamsCount)===2?2:0,
      transport:h?.transport==="ONLINE"||mode==="online"?"ONLINE":"LOCAL",
      variantCode:typeof h?.variantCode==="string"?h.variantCode.slice(0,2):(mode==="solo"?"SO":mode==="single"?"AI":"DU"),
      completedAt:typeof h?.completedAt==="string"?h.completedAt:new Date().toISOString(),
      winner:Number.isInteger(h?.winner)?h.winner:-1,
      totals:Array.isArray(h?.totals)?h.totals.slice(0,2).map(v=>Math.max(0,Number(v)||0)):[0,0],
      seriesWins:Array.isArray(h?.seriesWins)?h.seriesWins.slice(0,2).map(v=>Math.max(0,Math.min(MATCH_TARGET,Number(v)||0))):[0,0],
      players
    };
  });
}
function normalizeState(raw){
  const mode=["solo","single","hotseat","online"].includes(raw?.mode)?raw.mode:"hotseat";
  const base=freshState(mode);
  if(!raw||typeof raw!=="object")return base;
  base.started=!!raw.started;
  base.current=raw.current===1?1:0;
  base.localPlayer=raw.localPlayer===1?1:0;
  base.remoteLock=!!raw.remoteLock;
  base.onlineGameId=typeof raw.onlineGameId==="string"?raw.onlineGameId.slice(0,64):"";
  base.onlineRoomId=typeof raw.onlineRoomId==="string"?raw.onlineRoomId.slice(0,160):"";
  base.onlineRoomUrl=typeof raw.onlineRoomUrl==="string"?raw.onlineRoomUrl.slice(0,500):"";
  base.onlineProvider=typeof raw.onlineProvider==="string"?raw.onlineProvider.slice(0,40):"peerjs";
  base.onlineLastSync=Math.max(0,Number(raw.onlineLastSync)||0);
  base.onlineReady=raw.onlineReady===true;
  base.onlinePeerJoined=raw.onlinePeerJoined===true;
  base.onlineTopology=raw.onlineTopology==="CREW"?"CREW":"PAIR";
  base.crewNames={A1:String(raw?.crewNames?.A1||"Player A1").slice(0,24),A2:String(raw?.crewNames?.A2||"Player A2").slice(0,24),B1:String(raw?.crewNames?.B1||"Player B1").slice(0,24),B2:String(raw?.crewNames?.B2||"Player B2").slice(0,24)};
  base.crewLocalSeat=["A1","A2","B1","B2"].includes(raw.crewLocalSeat)?raw.crewLocalSeat:"";
  base.revision=Number.isInteger(raw.revision)&&raw.revision>=0?raw.revision:0;
  base.rollCount=Math.max(0,Math.min(3,Number(raw.rollCount)||0));
  base.dice=Array.isArray(raw.dice)&&raw.dice.length===5?raw.dice.map(v=>Math.max(1,Math.min(6,Number(v)||1))):[1,1,1,1,1];
  base.held=Array.isArray(raw.held)&&raw.held.length===5?raw.held.map(Boolean):[false,false,false,false,false];
  base.announced=CATS.some(c=>c.id===raw.announced)?raw.announced:null;
  base.waiting=!!raw.waiting;
  base.roundOver=!!raw.roundOver;
  base.seriesOver=!!raw.seriesOver;
  base.round=Math.max(1,Number(raw.round)||1);
  base.matchSerial=Math.max(1,Number(raw.matchSerial)||1);
  base.history=normalizeHistory(raw.history);
  base.seriesWins=Array.isArray(raw.seriesWins)&&raw.seriesWins.length===2?raw.seriesWins.map(v=>Math.max(0,Math.min(MATCH_TARGET,Number(v)||0))):[0,0];
  base.soundOn=raw.soundOn!==false;
  const fallbackFormat=mode==="solo"?"SOLO":"DUEL";
  base.format=["SOLO","DUEL","TEAM"].includes(raw.format)?raw.format:fallbackFormat;
  base.opponent=["NONE","HUMAN","AI"].includes(raw.opponent)?raw.opponent:(mode==="solo"?"NONE":mode==="single"?"AI":"HUMAN");
  base.playersCount=[1,2,4].includes(Number(raw.playersCount))?Number(raw.playersCount):(base.format==="TEAM"?4:mode==="solo"?1:2);
  base.teamsCount=base.format==="TEAM"?2:0;
  base.transport=raw.transport==="ONLINE"||mode==="online"?"ONLINE":"LOCAL";
  base.variantCode=typeof raw.variantCode==="string"?raw.variantCode.slice(0,2):(base.format==="SOLO"?"SO":base.format==="TEAM"?"TM":base.opponent==="AI"?"AI":"DU");
  base.teamMember=raw.teamMember===1?1:0;
  const validTeamHand=h=>Array.isArray(h)&&h.length===5?h.map(v=>Math.max(1,Math.min(6,Number(v)||1))):null;
  const validTeamCandidate=c=>{
    if(!c||typeof c!=="object")return null;
    if(!COLS.some(x=>x.id===c.colId)||!CATS.some(x=>x.id===c.catId))return null;
    const points=Number(c.points);if(!Number.isFinite(points))return null;
    return {member:c.member===1?1:0,colId:c.colId,catId:c.catId,points:Math.max(0,points),dice:validTeamHand(c.dice),rollNo:Math.max(1,Math.min(3,Number(c.rollNo)||3)),announced:c.announced===true,createdAt:Math.max(0,Number(c.createdAt)||0)};
  };
  base.teamHands=Array.isArray(raw.teamHands)&&raw.teamHands.length===2?raw.teamHands.map(validTeamHand):[null,null];
  base.teamFirstHands=Array.isArray(raw.teamFirstHands)&&raw.teamFirstHands.length===2?raw.teamFirstHands.map(validTeamHand):[null,null];
  base.teamCandidates=Array.isArray(raw.teamCandidates)&&raw.teamCandidates.length===2?raw.teamCandidates.map(validTeamCandidate):[null,null];
  base.teamReady=raw.teamReady===true&&base.format==="TEAM"&&!!base.teamCandidates[0]&&!!base.teamCandidates[1];
  base.teamSelected=(raw.teamSelected===0||raw.teamSelected===1)?raw.teamSelected:null;
  base.teamAwaitingScore=!base.teamReady&&raw.teamAwaitingScore===true&&base.format==="TEAM"&&base.rollCount===3&&!!base.teamHands[base.teamMember];
  const needsTeamTurnReset=base.format==="TEAM"&&!Array.isArray(raw.teamCandidates)&&(raw.teamReady===true||base.teamMember===1||base.teamHands.some(Boolean)||base.teamFirstHands.some(Boolean));
  if(needsTeamTurnReset){base.teamMember=0;base.teamHands=[null,null];base.teamFirstHands=[null,null];base.teamCandidates=[null,null];base.teamAwaitingScore=false;base.rollCount=0;base.dice=[1,1,1,1,1];base.held=[false,false,false,false,false];base.announced=null;}
  if(Array.isArray(raw.players)&&raw.players.length>=2){
    base.players=[0,1].map(i=>({
      name:String(raw.players[i]?.name||((mode==="single"&&i===1)?"Harbour AI":`Player ${i+1}`)).slice(0,24),
      scores:normalizeScores(raw.players[i]?.scores)
    }));
  }
  if(base.players[0].name==="Igra\u010d 1")base.players[0].name="Player 1";
  if(base.players[1].name==="Igra\u010d 2")base.players[1].name="Player 2";
  if(mode==="single")base.players[1].name="Harbour AI";if(mode==="solo"){if(/^Team Alpha$/i.test(base.players[0].name))base.players[0].name="Player 1";base.players[1].name="Solo Log";}
  if(base.format==="TEAM"){
    if(!base.players[0].name||/^Player 1$/i.test(base.players[0].name))base.players[0].name="Team Alpha";
    if(!base.players[1].name||/^Player 2$/i.test(base.players[1].name))base.players[1].name="Team Omega";
    base.opponent="HUMAN";base.playersCount=4;base.teamsCount=2;base.transport=mode==="online"||raw.transport==="ONLINE"?"ONLINE":"LOCAL";base.variantCode="TM";
  }
  base.version=APP_VERSION;
  base.matchTarget=Math.max(1,Math.min(9,Number(raw.matchTarget||MATCH_TARGET)||MATCH_TARGET));MATCH_TARGET=base.matchTarget;
  return base;
}
function readStoredState(key){return window.YambPersistence?.getSync(key,null)??null}
function loadState(){
  const saved=readStoredState(STORAGE_KEY);
  return saved?normalizeState(saved):freshState();
}
let state=loadState();
let animationLocked=false;
let menuOpen=!state.started;
let modalMode=state.mode||"hotseat";
let setupSingleVariant=state.mode==="single"?"ai":"solo";
let setupHotseatVariant=state.mode==="hotseat"&&state.format==="TEAM"?"team":"duel";
let setupOnlineVariant=state.mode==="online"&&state.onlineTopology==="CREW"?"crew":state.mode==="online"&&state.format==="TEAM"?"team":"duel";
let aiRunning=false;
let aiRecentWrite=null;
let aiStatus="";
let pendingScoreConfirmation=null;
let teamDecisionDismissed=false;
const HANDOFF_SECONDS=3;
const TEAMMATE_HANDOFF_SECONDS=2;
let handoffTimer=null;
let handoffTicker=null;
let handoffKey="";
let handoffNote="";
let roundSummaryDismissed=false;
function scoreStateSignature(){return JSON.stringify({current:state.current,rollCount:state.rollCount,dice:state.dice,held:state.held,announced:state.announced,round:state.round,revision:state.revision,remoteLock:state.remoteLock,teamMember:state.teamMember,teamAwaitingScore:state.teamAwaitingScore,teamReady:state.teamReady,teamSelected:state.teamSelected,teamCandidates:state.teamCandidates});}
function closeScoreConfirmation(){pendingScoreConfirmation=null;els.scoreConfirmModal.classList.remove("show");els.scoreConfirmModal.setAttribute("aria-hidden","true");}
function setConfirmActionButton(kind){
  const isAnnouncement=kind==="announce";
  const isTeamDecision=kind==="team-decision";
  els.confirmScoreBtn.dataset.iconName=isAnnouncement?"lock-keyhole":"badge-check";
  els.confirmScoreBtn.innerHTML=isAnnouncement
    ? `<svg class="btn-icon icon-fallback" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="10" width="12" height="9" rx="1.5"/><path d="M9 10V7a3 3 0 0 1 6 0v3M12 13v3"/></svg><span>CONFIRM ANNOUNCEMENT</span>`
    : isTeamDecision
      ? `<svg class="btn-icon icon-fallback" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4 10-10"/></svg><span>ACCEPT FINAL CHOICE</span>`
      : `<svg class="btn-icon icon-fallback" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4 10-10"/></svg><span>CONFIRM SCORE</span>`;
  window.YambIconSystem?.upgradeButton?.(els.confirmScoreBtn);
}
function openScoreConfirmation(playerIndex,colId,catId,kind="score"){
  const eyebrow=els.scoreConfirmModal.querySelector(".modal-eyebrow");if(eyebrow)eyebrow.textContent="SAFETY CHECK · SCORE ENTRY";
  const points=scoreForCell(colId,catId),player=state.players[playerIndex];
  pendingScoreConfirmation={playerIndex,colId,catId,kind,points,signature:scoreStateSignature()};
  els.confirmPlayer.textContent=player?.name||`Player ${playerIndex+1}`;
  els.confirmColumn.textContent=colLabel(colId).toUpperCase();
  els.confirmCategory.textContent=catLabel(catId);
  els.confirmRoll.textContent=state.rollCount?`${state.rollCount}${state.rollCount===1?"st":state.rollCount===2?"nd":"rd"} roll`:"before rolling";
  els.confirmPoints.textContent=kind==="announce"?"ANNOUNCEMENT":String(points);
  els.scoreConfirmTitle.textContent=kind==="announce"?"Confirm Announcement":"Confirm Score";
  els.scoreConfirmWarning.textContent=kind==="announce"?"An announcement locks the selected category for this teammate session. Review the selection before confirming.":isTeamMode()?`This stores ${teamMemberCode(state.current,state.teamMember)} as a runtime proposal only. Nothing is written to the paper yet. After both teammate sessions, the team chooses one proposal to commit; if both proposed the same cell, the higher value is committed automatically.`:"After confirmation, the score is permanently recorded and the turn passes to the next player.";
  setConfirmActionButton(kind);
  els.scoreConfirmModal.classList.add("show");els.scoreConfirmModal.setAttribute("aria-hidden","false");
  sfx.scorePreview();
}
function confirmPendingScore(){
  const p=pendingScoreConfirmation;if(!p)return;
  if(p.signature!==scoreStateSignature()){closeScoreConfirmation();render();return;}
  if(p.kind==="team-decision"){
    if(!isTeamMode()||!state.teamReady||state.current!==p.playerIndex){closeScoreConfirmation();render();return;}
    const candidate=state.teamCandidates?.[p.teamMember];
    if(!candidate||candidate.colId!==p.colId||candidate.catId!==p.catId||candidate.points!==p.points){closeScoreConfirmation();render();return;}
    closeScoreConfirmation();resolveTeamCandidates(p.playerIndex,p.teamMember);return;
  }
  if(animationLocked||!localControlAllowed(p.playerIndex)){closeScoreConfirmation();return;}
  const e=eligibility(p.playerIndex,p.colId,p.catId);
  if(!e.ok){closeScoreConfirmation();render();return;}
  if(p.kind==="announce"){
    if(p.colId!=="announce"||state.announced){closeScoreConfirmation();return;}
    state.announced=p.catId;trace("announcement.locked",{player:p.playerIndex,category:p.catId,roll:state.rollCount,dice:[...state.dice]});sfx.announce();saveState();closeScoreConfirmation();render();return;
  }
  if(scoreForCell(p.colId,p.catId)!==p.points){closeScoreConfirmation();render();return;}
  closeScoreConfirmation();commitScore(p.playerIndex,p.colId,p.catId,false);
}


function saveState(){
  try{
    const previous=window.YambPersistence?.getSync(STORAGE_KEY,null);
    if(previous)window.YambPersistence?.set(BACKUP_STORAGE_KEY,previous);
    window.YambPersistence?.set(STORAGE_KEY,state);
  }catch{}
}
function trace(type,data={}){
  window.YambTelemetry?.record?.(type,{
    match:state.matchSerial,game:state.round,mode:state.mode,format:state.format,
    current:state.current,teamMember:state.teamMember,revision:state.revision,...data
  });
}
function esc(s){
  return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}
function modeLabel(mode,meta=null){
  const m=meta||((typeof state!=="undefined"&&state.mode===mode)?state:null);
  const format=m?.format;
  const transport=m?.transport||(mode==="online"?"ONLINE":"LOCAL");
  if(transport==="ONLINE"||mode==="online")return m?.onlineTopology==="CREW"?"online · crew":format==="TEAM"?"online · team":"online · duel";
  if(mode==="solo"||format==="SOLO")return "local · single · solo";
  if(mode==="single")return "local · single · duel";
  if(mode==="hotseat"&&format==="TEAM")return "local · hotseat · team";
  return "local · hotseat · duel";
}
function modalSectionForMode(mode){return mode==="solo"||mode==="single"?"single":mode}
function stateLabel(){return state.roundOver?"GAME COMPLETE":state.remoteLock?"HANDOFF":state.waiting?"PLAYER HANDOFF":state.started?"IN PROGRESS":"READY"}
function catLabel(id){const c=CATS.find(x=>x.id===id);return c?c.label:id}
function colLabel(id){const c=COLS.find(x=>x.id===id);return c?c.title:id}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function localControlAllowed(playerIndex=state.current){
  if(state.mode==="single"&&playerIndex===1)return false;
  if(state.mode==="online"&&isCrewOnline())return state.onlineReady&&!state.remoteLock&&playerIndex===state.current&&onlineSeat===activeCrewSeat();
  if(state.mode==="online")return state.onlineReady&&!state.remoteLock&&playerIndex===state.localPlayer&&playerIndex===state.current;
  return true;
}


const AUDIO_PREFS_KEY="preferences.audio";
let audioCtx=null,masterGain=null,audioLimiter=null,noiseBuffer=null,uiGain=null,diceGain=null,ceremonyGain=null;
let audioPrefs=(()=>{const raw=window.YambPersistence?.getSync(AUDIO_PREFS_KEY,{})||{};return {master:Number.isFinite(Number(raw.master))?Math.max(0,Math.min(1,Number(raw.master))):.86,ui:Number.isFinite(Number(raw.ui))?Math.max(0,Math.min(1,Number(raw.ui))):1,dice:Number.isFinite(Number(raw.dice))?Math.max(0,Math.min(1,Number(raw.dice))):1,ceremony:Number.isFinite(Number(raw.ceremony))?Math.max(0,Math.min(1,Number(raw.ceremony))):1,haptics:raw.haptics!==false}})();
const sfxLast=new Map();
function saveAudioPrefs(){window.YambPersistence?.set(AUDIO_PREFS_KEY,audioPrefs)}
function sfxPermit(key,ms=45){const now=performance.now();const last=sfxLast.get(key)||0;if(now-last<ms)return false;sfxLast.set(key,now);return true}
function ensureAudio(){
  if(!state.soundOn)return null;
  try{
    if(!audioCtx){
      const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
      audioCtx=new AC({latencyHint:"interactive"});
      masterGain=audioCtx.createGain();masterGain.gain.value=.82*audioPrefs.master;
      uiGain=audioCtx.createGain();diceGain=audioCtx.createGain();ceremonyGain=audioCtx.createGain();
      uiGain.gain.value=audioPrefs.ui;diceGain.gain.value=audioPrefs.dice;ceremonyGain.gain.value=audioPrefs.ceremony;
      uiGain.connect(masterGain);diceGain.connect(masterGain);ceremonyGain.connect(masterGain);
      audioLimiter=audioCtx.createDynamicsCompressor();audioLimiter.threshold.value=-14;audioLimiter.knee.value=10;audioLimiter.ratio.value=4;audioLimiter.attack.value=.003;audioLimiter.release.value=.14;
      masterGain.connect(audioLimiter);audioLimiter.connect(audioCtx.destination);
    }
    if(audioCtx.state==="suspended")audioCtx.resume().catch(()=>{});
    if(masterGain)masterGain.gain.setTargetAtTime(.82*audioPrefs.master,audioCtx.currentTime,.018);
    if(uiGain)uiGain.gain.setTargetAtTime(audioPrefs.ui,audioCtx.currentTime,.018);if(diceGain)diceGain.gain.setTargetAtTime(audioPrefs.dice,audioCtx.currentTime,.018);if(ceremonyGain)ceremonyGain.gain.setTargetAtTime(audioPrefs.ceremony,audioCtx.currentTime,.018);
    if(!noiseBuffer){
      const len=Math.floor(audioCtx.sampleRate*.42);noiseBuffer=audioCtx.createBuffer(1,len,audioCtx.sampleRate);
      const d=noiseBuffer.getChannelData(0);let brown=0;for(let i=0;i<len;i++){const white=window.YambRandom.unit()*2-1;brown=.91*brown+.09*white;d[i]=(white*.42+brown*.58)*(1-i/len)}
    }
    return audioCtx;
  }catch{return null}
}
function sfxOutput(bus="ui"){return ({ui:uiGain,dice:diceGain,ceremony:ceremonyGain}[bus])||masterGain||audioCtx?.destination||null}
function sfxPanNode(ctx,pan=0){if(typeof ctx.createStereoPanner!=="function")return null;const node=ctx.createStereoPanner();node.pan.value=Math.max(-.75,Math.min(.75,pan));return node}
function tone(freq,delay=.0,dur=.055,gain=.018,type="triangle",pan=0,endRatio=.72,bus="ui"){
  const ctx=ensureAudio(),out=sfxOutput(bus);if(!ctx||!out)return;const t=ctx.currentTime+Math.max(0,delay);
  const osc=ctx.createOscillator(),g=ctx.createGain(),p=sfxPanNode(ctx,pan);osc.type=type;osc.frequency.setValueAtTime(Math.max(45,freq),t);osc.frequency.exponentialRampToValueAtTime(Math.max(45,freq*endRatio),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  osc.connect(g);if(p){g.connect(p);p.connect(out)}else g.connect(out);osc.start(t);osc.stop(t+dur+.025);
}
function noise(delay=.0,dur=.045,gain=.025,low=420,high=3200,pan=0,bus="dice"){
  const ctx=ensureAudio(),out=sfxOutput(bus);if(!ctx||!out||!noiseBuffer)return;const t=ctx.currentTime+Math.max(0,delay);
  const src=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),hp=ctx.createBiquadFilter(),lp=ctx.createBiquadFilter(),g=ctx.createGain(),p=sfxPanNode(ctx,pan);
  src.buffer=noiseBuffer;bp.type="bandpass";bp.frequency.value=(low+high)/2;bp.Q.value=.68;hp.type="highpass";hp.frequency.value=low;lp.type="lowpass";lp.frequency.value=high;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(bp).connect(hp).connect(lp).connect(g);if(p){g.connect(p);p.connect(out)}else g.connect(out);src.start(t,window.YambRandom.unit()*.055,dur+.025);
}
function woodImpact(delay=0,strength=.07,pitch=128,pan=0){noise(delay,.05,strength*.72,360,2900,pan,"dice");tone(pitch,delay,.078,strength*.34,"triangle",pan,.58,"dice");tone(pitch*2.25,delay+.003,.024,strength*.10,"square",pan,.82,"dice")}
function relay(delay=0,strength=.022,pitch=280,pan=0){noise(delay,.018,strength*.42,1150,4200,pan,"ui");tone(pitch,delay,.034,strength,"triangle",pan,.76,"ui")}
function brass(freq,delay=0,dur=.11,gain=.02,pan=0){tone(freq,delay,dur,gain,"triangle",pan,.92,"ceremony");tone(freq*1.5,delay+.006,dur*.72,gain*.33,"sine",pan,.94,"ceremony")}
function activePlayerHarmonic(playerIndex=state.current){return playerIndex===0?1.055:.94}

const sfx={
  uiTap(){if(!sfxPermit("uiTap",38))return;relay(0,.014,306);},
  uiOpen(){if(!sfxPermit("uiOpen",70))return;relay(0,.018,250);brass(330,.026,.055,.009);},
  uiClose(){if(!sfxPermit("uiClose",70))return;relay(0,.015,236);tone(220,.018,.045,.009,"triangle",0,.62);},
  select(){if(!sfxPermit("select",48))return;relay(0,.017,338);tone(474,.016,.035,.008,"sine");},
  cancel(){if(!sfxPermit("cancel",75))return;relay(0,.014,230);tone(176,.015,.045,.008,"triangle",0,.66);},
  rollLaunch(moving=5){const m=Math.max(0,Math.min(5,moving));noise(0,.105,.052+.007*m,500,3300,-.12);woodImpact(.018,.070+.007*m,108,-.08);tone(154,.03,.07,.015,"triangle",.1,.78);},
  diceImpact(strength=.07,pan=0,pitch=142,delay=0){woodImpact(delay,strength,pitch,pan);},
  diceSettle(moving=5,delay=.86){const weight=.086+.009*Math.max(1,moving);woodImpact(delay,weight,102,.05);noise(delay+.018,.038,.023,410,1900,-.05);tone(82,delay+.028,.10,.012,"triangle",0,.58);},
  roll(moving=5){
    if(!state.soundOn||!sfxPermit("roll",180))return;ensureAudio();const count=Math.max(0,Math.min(5,moving));this.rollLaunch(count);
    const impacts=Math.max(3,4+count);let t=.12;for(let i=0;i<impacts;i++){t+=.055+window.YambRandom.unit()*.055;const decay=1-i/(impacts+2);const strength=(.042+.026*window.YambRandom.unit())*(.72+.28*decay);const pitch=118+window.YambRandom.unit()*112;const pan=-.58+window.YambRandom.unit()*1.16;this.diceImpact(strength,pan,pitch,t)}
    this.diceSettle(count,.83+window.YambRandom.unit()*.055);
  },
  hold(){if(!sfxPermit("hold",55))return;relay(0,.024,210);tone(154,.006,.055,.015,"triangle",-.05,.72);tone(420,.018,.035,.008,"sine",.05,.86);},
  release(){if(!sfxPermit("release",55))return;relay(0,.016,316);tone(452,.006,.032,.008,"sine",.06,.74);tone(196,.018,.04,.006,"triangle",-.04,.66);},
  announce(){if(!sfxPermit("announce",95))return;relay(0,.024,202);brass(294,.025,.09,.014);brass(392,.082,.105,.012);},
  scorePreview(){if(!sfxPermit("preview",75))return;relay(0,.013,356);tone(512,.014,.035,.006,"sine");},
  scoreCommit(){if(!sfxPermit("scoreCommit",95))return;woodImpact(0,.082,116,-.08);relay(.022,.017,260,.12);brass(330,.065,.09,.012);},
  zeroScore(){if(!sfxPermit("zeroScore",95))return;woodImpact(0,.05,104,0);tone(196,.035,.07,.012,"triangle",0,.62);},
  invalid(){if(!sfxPermit("invalid",125))return;relay(0,.016,172);tone(146,.012,.04,.008,"triangle",0,.72);},
  turnHandoff(playerIndex=state.current){if(!sfxPermit("handoff",160))return;const h=activePlayerHarmonic(playerIndex);relay(0,.018,236*h);brass(262*h,.035,.075,.011);brass(349*h,.092,.085,.010);},
  teamProposal(){if(!sfxPermit("teamProposal",100))return;relay(0,.019,244);woodImpact(.025,.042,132);tone(392,.07,.055,.009,"triangle");},
  teamDecision(){if(!sfxPermit("teamDecision",160))return;relay(0,.026,196);woodImpact(.035,.078,108);brass(294,.092,.10,.014);brass(440,.17,.12,.012);},
  onlineConnect(){if(!sfxPermit("onlineConnect",400))return;relay(0,.017,284);brass(330,.03,.07,.009);brass(440,.09,.09,.010);},
  onlineDisconnect(){if(!sfxPermit("onlineDisconnect",400))return;relay(0,.016,206);tone(294,.025,.065,.009,"triangle",0,.70);tone(174,.075,.08,.010,"triangle",0,.60);},
  gameStart(){if(!sfxPermit("gameStart",250))return;relay(0,.019,270);woodImpact(.025,.05,120);brass(330,.07,.10,.010);},
  gameComplete(){if(!sfxPermit("gameComplete",600))return;woodImpact(0,.075,104);[262,330,392].forEach((f,i)=>brass(f,.07+i*.075,.12,.015-i*.002));woodImpact(.34,.05,92);},
  matchWin(){if(!sfxPermit("matchWin",900))return;woodImpact(0,.09,92);[196,262,330,392,523].forEach((f,i)=>brass(f,.055+i*.09,.15,.017-i*.001));noise(.29,.055,.018,900,3100);woodImpact(.56,.10,82);brass(392,.62,.20,.014);}
};
function setSoundEnabled(value){state.soundOn=!!value;saveState();if(state.soundOn){ensureAudio();setTimeout(()=>sfx.uiOpen(),20)}else if(audioCtx&&masterGain)masterGain.gain.setTargetAtTime(.0001,audioCtx.currentTime,.02)}
function setMasterVolume(value){audioPrefs.master=Math.max(0,Math.min(1,Number(value)||0));saveAudioPrefs();if(audioCtx&&masterGain)masterGain.gain.setTargetAtTime(.82*audioPrefs.master,audioCtx.currentTime,.02)}
function setAudioChannel(channel,value){if(!["ui","dice","ceremony"].includes(channel))return;audioPrefs[channel]=Math.max(0,Math.min(1,Number(value)||0));saveAudioPrefs();ensureAudio();const node={ui:uiGain,dice:diceGain,ceremony:ceremonyGain}[channel];if(audioCtx&&node)node.gain.setTargetAtTime(audioPrefs[channel],audioCtx.currentTime,.02)}
function setHaptics(value){audioPrefs.haptics=!!value;saveAudioPrefs()}
window.YambSfx=sfx;
window.YambAudio={isEnabled:()=>state.soundOn!==false,setEnabled:setSoundEnabled,getMaster:()=>audioPrefs.master,setMaster:setMasterVolume,getChannel:(channel)=>audioPrefs[channel]??1,setChannel:setAudioChannel,getHaptics:()=>audioPrefs.haptics!==false,setHaptics};
function unlockYambAudio(){if(state.soundOn!==false)ensureAudio()}
document.addEventListener("pointerdown",unlockYambAudio,{once:true,capture:true,passive:true});
document.addEventListener("keydown",unlockYambAudio,{once:true,capture:true});



function sfxRoll(moving=5){sfx.roll(moving)}
function sfxHold(){sfx.hold()}
function sfxScore(points=1){points===0?sfx.zeroScore():sfx.scoreCommit()}
function sfxSwitch(){sfx.turnHandoff(state.current)}
function sfxWin(){state.seriesOver?sfx.matchWin():sfx.gameComplete()}


function applyTheme(playerIndex){
  const root=document.documentElement;
  const meta=document.getElementById("themeColor");
  if(playerIndex===0){
    root.style.setProperty("--accent","var(--p1)");
    root.style.setProperty("--accent-dark","var(--p1-dark)");
    root.style.setProperty("--accent-lite","var(--p1-lite)");
    root.style.setProperty("--die-shell-1","#0f2c42");
    root.style.setProperty("--die-shell-2","#173a55");
    root.style.setProperty("--die-shell-3","#091a29");
    root.style.setProperty("--die-pip","#183952");
    root.style.setProperty("--idle-mark","#0a2943");
    root.style.setProperty("--roll-shell-1","#6f1f2c");root.style.setProperty("--roll-shell-2","#8d2a3a");root.style.setProperty("--roll-shell-3","#3f1118");root.style.setProperty("--roll-mark","#7a1a2a");
    meta.setAttribute("content","#253f53");
  }else{
    root.style.setProperty("--accent","var(--p2)");
    root.style.setProperty("--accent-dark","var(--p2-dark)");
    root.style.setProperty("--accent-lite","var(--p2-lite)");
    root.style.setProperty("--die-shell-1","#6f1f2c");
    root.style.setProperty("--die-shell-2","#8d2a3a");
    root.style.setProperty("--die-shell-3","#3f1118");
    root.style.setProperty("--die-pip","#7a1a2a");
    root.style.setProperty("--idle-mark","#7b2030");
    root.style.setProperty("--roll-shell-1","#0f2c42");root.style.setProperty("--roll-shell-2","#173a55");root.style.setProperty("--roll-shell-3","#091a29");root.style.setProperty("--roll-mark","#183952");
    meta.setAttribute("content","#5a2830");
  }
  root.style.setProperty("--royal-gold-1","#f6df92");
  root.style.setProperty("--royal-gold-2","#cfa645");
  root.style.setProperty("--royal-gold-3","#7c5a19");
  root.style.setProperty("--royal-silver-1","#f3f5f8");
  root.style.setProperty("--royal-silver-2","#c0c7d0");
  root.style.setProperty("--royal-silver-3","#6b7480");
}


function randDie(){return window.YambRandom.die()}
function counts(){
  const a=[0,0,0,0,0,0,0];
  state.dice.forEach(v=>a[v]++);
  return a;
}
function scoreDiceArray(catId,dice,rollNo=3){return window.YambRules.scoreDice(catId,dice,rollNo,CATS)}
function scoreFor(catId){return scoreDiceArray(catId,state.dice,state.rollCount)}
function isTeamMode(){return state.format==="TEAM"&&(state.mode==="hotseat"||state.mode==="online")}
function teamMemberCode(teamIndex=state.current,member=state.teamMember){return `${teamIndex===0?"A":"B"}${member+1}`}
function teamCandidateForCell(colId,catId){return (state.teamCandidates||[]).find(c=>c&&c.colId===colId&&c.catId===catId)||null}
function teamVirtualPlayer(playerIndex){
  // Team proposals are runtime-only until the team resolves them.
  // Teammate 2 therefore validates against the unchanged authoritative paper,
  // exactly as a fresh single-player turn would.
  const source=state.players[playerIndex];
  return {name:source.name,scores:normalizeScores(source.scores)};
}
function scoreForCell(colId,catId){
  // TEAM proposals use the exact same scoring moment as SOLO / 1v1.
  // In particular, HAND is only legal on roll 1 and scores the dice visible on roll 1.
  return scoreFor(catId);
}

function isFilled(player,col,cat){return player.scores[col][cat]!==null}
function nextDown(player){return CATS.find(cat=>!isFilled(player,"down",cat.id))?.id||null}
function nextUp(player){
  for(let i=CATS.length-1;i>=0;i--) if(!isFilled(player,"up",CATS[i].id)) return CATS[i].id;
  return null;
}
function eligibility(playerIndex,colId,catId,system=false){
  if(!state.started||state.waiting||state.roundOver||state.seriesOver||animationLocked||playerIndex!==state.current||state.rollCount===0)return {ok:false};
  if(!system&&!localControlAllowed(playerIndex))return {ok:false};

  const actual=state.players[playerIndex];
  if(isTeamMode()){
    // A TEAM member is a normal Yamb turn whose write is staged as a proposal.
    // The authoritative paper remains unchanged until the two proposals are resolved.
    if(state.teamReady)return {ok:false};
    if(isFilled(actual,colId,catId))return {ok:false};
    if(state.announced&&!(colId==="announce"&&catId===state.announced))return {ok:false};
    const first=state.teamMember===1?state.teamCandidates?.[0]:null;
    const collision=!!first&&first.colId===colId&&first.catId===catId;
    if(colId==="down")return {ok:catId===nextDown(actual),teamCollision:collision};
    if(colId==="free")return {ok:true,teamCollision:collision};
    if(colId==="up")return {ok:catId===nextUp(actual),teamCollision:collision};
    if(colId==="hand")return {ok:state.rollCount===1,teamCollision:collision};
    if(colId==="announce"){
      if(state.announced)return {ok:state.announced===catId,announced:true,teamCollision:collision};
      if(state.rollCount===1)return {ok:true,announceCandidate:true,teamCollision:collision};
    }
    return {ok:false};
  }

  if(isFilled(actual,colId,catId))return {ok:false};
  if(state.announced&&!(colId==="announce"&&catId===state.announced))return {ok:false};
  if(colId==="down")return {ok:catId===nextDown(actual)};
  if(colId==="free")return {ok:true};
  if(colId==="up")return {ok:catId===nextUp(actual)};
  if(colId==="hand")return {ok:state.rollCount===1};
  if(colId==="announce"){
    if(state.announced)return {ok:state.announced===catId,announced:true};
    if(state.rollCount===1)return {ok:true,announceCandidate:true};
  }
  return {ok:false};
}
function derivedDiff(player,colId){
  const mx=player.scores[colId].max;
  const mn=player.scores[colId].min;
  const ones=player.scores[colId].ones;
  if(mx===null||mn===null||ones===null)return null;
  return Math.max(0,(mx-mn)*ones);
}
const UPPER_IDS=["ones","twos","threes","fours","fives","sixes"];
function upperRawTotal(player,colId){
  return UPPER_IDS.reduce((sum,id)=>sum+(player.scores[colId][id]??0),0);
}
function upperSectionTotal(player,colId){
  const raw=upperRawTotal(player,colId);
  return raw+(raw>=60?30:0);
}
function totals(player){
  let nums=0,diff=0,combos=0;
  COLS.forEach(c=>{
    nums+=upperSectionTotal(player,c.id);
    diff+=derivedDiff(player,c.id)??0;
    ["kenta","full","poker","yamb"].forEach(id=>combos+=player.scores[c.id][id]??0);
  });
  return {nums,diff,combos,total:nums+diff+combos};
}
function countFilled(player){
  let n=0;
  COLS.forEach(c=>CATS.forEach(cat=>{if(player.scores[c.id][cat.id]!==null)n++}));
  return n;
}
function teamRuntimeProgress(playerIndex){
  const player=state.players[playerIndex];
  if(!player)return 0;
  // A team sheet still contains 60 paper cells, but every committed cell is earned
  // through two independent normal Yamb sessions. Runtime therefore spans 120 sessions.
  let sessions=countFilled(player)*2;
  if(isTeamMode()&&playerIndex===state.current&&!state.roundOver&&!state.seriesOver){
    sessions+=(state.teamCandidates||[]).filter(Boolean).length;
  }
  return Math.max(0,Math.min(120,sessions));
}
function colSum(player,colId,ids){
  return ids.reduce((a,id)=>a+(player.scores[colId][id]??0),0);
}
function fieldsReady(player,colId,ids){
  return ids.every(id=>player.scores[colId][id]!==null);
}
function upperReady(player,colId){
  return fieldsReady(player,colId,UPPER_IDS);
}
function diffReady(player,colId){
  return fieldsReady(player,colId,["max","min","ones"]);
}
const COMBO_IDS=["kenta","full","poker","yamb"];
function combosReady(player,colId){
  return fieldsReady(player,colId,COMBO_IDS);
}
function allColumnsReady(player,predicate){
  return COLS.every(c=>predicate(player,c.id));
}
function playerSheetReady(player){
  return COLS.every(c=>CATS.every(cat=>player.scores[c.id][cat.id]!==null));
}
function computedCell(ready,value,extraClass=""){
  return `<td class="derived computed-cell ${ready?"ready":"pending"} ${extraClass}">${ready?value:"—"}</td>`;
}



function scoreValueForPaper(player,colId,catId){
  const v=player.scores[colId][catId];
  return v===null?"":String(v);
}
function paperComputed(ready,value){return ready?String(value):"—"}
function paperSheetHTML(pi,{print=false}={}){
  const player=state.players[pi],t=totals(player);
  const upperAll=allColumnsReady(player,upperReady),diffAll=allColumnsReady(player,diffReady),comboAll=allColumnsReady(player,combosReady),sheetReady=playerSheetReady(player);
  const rows=[];
  const paperValueCell=(colId,catId)=>{
    const v=scoreValueForPaper(player,colId,catId);
    const recent=!print&&pi===1&&aiRecentWrite&&aiRecentWrite.colId===colId&&aiRecentWrite.catId===catId;
    return `<td class="paper-value ${v==="0"?"zero":""} ${recent?"ai-recent-write":""}" data-paper-col="${colId}" data-paper-cat="${catId}">${v}</td>`;
  };
  UPPER_IDS.forEach((id,idx)=>rows.push(`<tr><th class="paper-row">${idx+1}</th>${COLS.map(c=>paperValueCell(c.id,id)).join("")}${idx===0?`<td rowspan="6" class="paper-computed">${paperComputed(upperAll,t.nums)}</td>`:""}</tr>`));
  rows.push(`<tr><th class="paper-row">Σ</th>${COLS.map(c=>`<td class="paper-computed">${paperComputed(upperReady(player,c.id),upperSectionTotal(player,c.id))}</td>`).join("")}<td class="paper-computed">${paperComputed(upperAll,t.nums)}</td></tr>`);
  ["max","min"].forEach((id,idx)=>rows.push(`<tr><th class="paper-row">${id==="max"?"+":"−"}</th>${COLS.map(c=>paperValueCell(c.id,id)).join("")}${idx===0?`<td rowspan="3" class="paper-computed">${paperComputed(diffAll,t.diff)}</td>`:""}</tr>`));
  rows.push(`<tr><th class="paper-row">Σ</th>${COLS.map(c=>`<td class="paper-computed">${paperComputed(diffReady(player,c.id),derivedDiff(player,c.id)??0)}</td>`).join("")}</tr>`);
  [["kenta","S"],["full","F"],["poker","P"],["yamb","Y"]].forEach(([id,label],idx)=>rows.push(`<tr><th class="paper-row">${label}</th>${COLS.map(c=>paperValueCell(c.id,id)).join("")}${idx===0?`<td rowspan="4" class="paper-computed">${paperComputed(comboAll,t.combos)}</td>`:""}</tr>`));
  rows.push(`<tr><th class="paper-row">Σ</th>${COLS.map(c=>`<td class="paper-computed">${paperComputed(combosReady(player,c.id),colSum(player,c.id,COMBO_IDS))}</td>`).join("")}<td class="paper-computed">${paperComputed(comboAll,t.combos)}</td></tr>`);
  const toolbar=print?"":`<div class="paper-toolbar"><span>SHIP COPY · READ ONLY · DIGITAL ENTRY DISABLED</span><div class="paper-actions"><button data-paper-export="${pi}">EXPORT CSV</button><button data-paper-print="${pi}">PRINT SCORECARD</button></div></div>`;
  const aiNote=!print&&pi===1&&aiRecentWrite?`<div class="ai-paper-note">AI ENTRY RECORDED · ${esc(COLS.find(c=>c.id===aiRecentWrite.colId)?.title||aiRecentWrite.colId)} · ${esc(CATS.find(c=>c.id===aiRecentWrite.catId)?.label||aiRecentWrite.catId)} · ${aiRecentWrite.points}</div>`:"";
  return `<div class="paper-shell">${toolbar}<article class="paper-sheet">${aiNote}<header class="paper-head"><div><div class="paper-kicker">N.O.I.S.E. HARBOUR · YAMB SHIP LOG · G${state.round}</div><div class="paper-name">${esc(player.name)}</div></div><div class="paper-meta">MODE ${modeLabel(state.mode).toUpperCase()}<br>FILLED ${countFilled(player)}/60<br>MATCH ${state.seriesWins[0]} : ${state.seriesWins[1]}</div></header><table class="paper-table"><thead><tr><th>P${pi+1}<br>ROLL</th>${COLS.map(c=>`<th title="${c.title}" aria-label="${c.title}">${columnHeaderHTML(c)}</th>`).join("")}<th>G${state.round}</th></tr></thead><tbody>${rows.join("")}</tbody></table><div class="paper-note"><span>Unfilled cells remain blank so the game can continue manually if the digital system becomes unavailable.</span><span class="paper-sign">TOTAL ${sheetReady?t.total:"—"}</span></div></article></div>`;
}

function historyPaperHTML(entry,pi){
  const player=entry.players?.[pi];if(!player)return "";
  const t=totals(player),upperAll=allColumnsReady(player,upperReady),diffAll=allColumnsReady(player,diffReady),comboAll=allColumnsReady(player,combosReady),sheetReady=playerSheetReady(player);
  const rows=[];
  const valueCell=(colId,catId)=>{const v=player.scores[colId][catId];return `<td class="paper-value ${v===0?"zero":""}">${v===null?"":v}</td>`};
  UPPER_IDS.forEach((id,idx)=>rows.push(`<tr><th class="paper-row">${idx+1}</th>${COLS.map(c=>valueCell(c.id,id)).join("")}${idx===0?`<td rowspan="6" class="paper-computed">${paperComputed(upperAll,t.nums)}</td>`:""}</tr>`));
  rows.push(`<tr><th class="paper-row">Σ</th>${COLS.map(c=>`<td class="paper-computed">${paperComputed(upperReady(player,c.id),upperSectionTotal(player,c.id))}</td>`).join("")}<td class="paper-computed">${paperComputed(upperAll,t.nums)}</td></tr>`);
  ["max","min"].forEach((id,idx)=>rows.push(`<tr><th class="paper-row">${id==="max"?"+":"−"}</th>${COLS.map(c=>valueCell(c.id,id)).join("")}${idx===0?`<td rowspan="3" class="paper-computed">${paperComputed(diffAll,t.diff)}</td>`:""}</tr>`));
  rows.push(`<tr><th class="paper-row">Σ</th>${COLS.map(c=>`<td class="paper-computed">${paperComputed(diffReady(player,c.id),derivedDiff(player,c.id)??0)}</td>`).join("")}</tr>`);
  [["kenta","S"],["full","F"],["poker","P"],["yamb","Y"]].forEach(([id,label],idx)=>rows.push(`<tr><th class="paper-row">${label}</th>${COLS.map(c=>valueCell(c.id,id)).join("")}${idx===0?`<td rowspan="4" class="paper-computed">${paperComputed(comboAll,t.combos)}</td>`:""}</tr>`));
  rows.push(`<tr><th class="paper-row">Σ</th>${COLS.map(c=>`<td class="paper-computed">${paperComputed(combosReady(player,c.id),colSum(player,c.id,COMBO_IDS))}</td>`).join("")}<td class="paper-computed">${paperComputed(comboAll,t.combos)}</td></tr>`);
  return `<article class="paper-sheet history-paper"><header class="paper-head"><div><div class="paper-kicker">ARCHIVED SHIP LOG · MATCH ${entry.matchSerial} · G${entry.game}</div><div class="paper-name">${esc(player.name)}</div></div><div class="paper-meta">${modeLabel(entry.mode,entry).toUpperCase()}<br>${new Date(entry.completedAt).toLocaleString()}<br>MATCH ${entry.seriesWins?.[0]??0} : ${entry.seriesWins?.[1]??0}</div></header><table class="paper-table"><thead><tr><th>P${pi+1}<br>ROLL</th>${COLS.map(c=>`<th title="${c.title}" aria-label="${c.title}">${columnHeaderHTML(c)}</th>`).join("")}<th>G${entry.game}</th></tr></thead><tbody>${rows.join("")}</tbody></table><div class="paper-note"><span>Immutable game-end snapshot.</span><span class="paper-sign">TOTAL ${sheetReady?t.total:"—"}</span></div></article>`;
}
function archiveCurrentGame(winner,a,b){
  const entry={
    id:`m${state.matchSerial}-g${state.round}-${Date.now()}`,
    matchSerial:state.matchSerial,
    game:state.round,
    mode:state.mode,
    format:state.format,
    opponent:state.opponent,
    playersCount:state.playersCount,
    teamsCount:state.teamsCount,
    transport:state.transport,
    variantCode:state.variantCode,
    onlineTopology:state.onlineTopology,
    crewNames:structuredClone(state.crewNames||{}),
    matchTarget:MATCH_TARGET,
    completedAt:new Date().toISOString(),
    winner,
    totals:state.mode==="solo"?[a]:[a,b],
    seriesWins:[...state.seriesWins],
    players:state.players.map(p=>({name:p.name,scores:JSON.parse(JSON.stringify(p.scores))}))
  };
  state.history=[...(state.history||[]),entry].slice(-60);
}
function renderMatchHistory(){
  const history=[...(state.history||[])].reverse();
  if(!history.length){els.matchHistory.innerHTML=`<div class="history-empty"><b>MATCH HISTORY</b><span>Completed games will be archived here with their final result and paper score sheets.</span></div>`;return;}
  els.matchHistory.innerHTML=`<div class="history-heading"><div><b>MATCH HISTORY</b><span>${history.length} archived ${history.length===1?"game":"games"}</span></div><small>OPEN ANY GAME TO INSPECT THE FINAL PAPERS</small></div>`+history.map((h,index)=>{
    const solo=h.mode==="solo",p1=h.players?.[0]?.name||"Player 1",p2=h.players?.[1]?.name||"Player 2";
    const result=solo?`${p1} · ${h.totals?.[0]??0} pts`:h.winner<0?`DRAW · ${h.totals?.[0]??0} : ${h.totals?.[1]??0}`:`${h.players?.[h.winner]?.name||"Winner"} WON · ${h.totals?.[0]??0} : ${h.totals?.[1]??0}`;
    return `<details class="history-game" ${index===0?"open":""}><summary><span class="history-game-id">M${h.matchSerial} · G${h.game}</span><b>${esc(result)}</b><span class="history-series">${solo?modeLabel(h.mode,h).toUpperCase():`SERIES ${h.seriesWins?.[0]??0} : ${h.seriesWins?.[1]??0}`}</span></summary><button type="button" class="history-dispose" data-history-dispose="${esc(h.id)}" aria-label="Dispose archived game ${h.game}" title="Dispose archived game"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3M8 10v7M12 10v7M16 10v7M6.5 7l1 13h9l1-13"/></svg><span>DISPOSE</span></button><div class="history-paper-grid ${solo?"solo":""}">${historyPaperHTML(h,0)}${solo?"":historyPaperHTML(h,1)}</div></details>`;
  }).join("");
}

function downloadBlob(filename,content,type="application/octet-stream"){
  const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportState(){
  const payload={product:"YAMB Royal Navy Engineering",schema:APP_VERSION,exportedAt:new Date().toISOString(),state:normalizeState(state)};
  downloadBlob(`YAMB_${state.mode}_G${state.round}_${Date.now()}.yamb.json`,JSON.stringify(payload,null,2),"application/json");
}
function exportPlayerCSV(pi){
  const p=state.players[pi],lines=[["Row",...COLS.map(c=>c.title),"Calculated"]];
  UPPER_IDS.forEach((id,idx)=>lines.push([String(idx+1),...COLS.map(c=>p.scores[c.id][id]??""),idx===0&&allColumnsReady(p,upperReady)?totals(p).nums:""]));
  lines.push(["Upper Σ",...COLS.map(c=>upperReady(p,c.id)?upperSectionTotal(p,c.id):""),allColumnsReady(p,upperReady)?totals(p).nums:""]);
  ["max","min"].forEach(id=>lines.push([id==="max"?"+":"−",...COLS.map(c=>p.scores[c.id][id]??""),""]));
  lines.push(["Difference Σ",...COLS.map(c=>diffReady(p,c.id)?derivedDiff(p,c.id):""),allColumnsReady(p,diffReady)?totals(p).diff:""]);
  COMBO_IDS.forEach(id=>lines.push([CATS.find(c=>c.id===id)?.label||id,...COLS.map(c=>p.scores[c.id][id]??""),""]));
  lines.push(["Combinations Σ",...COLS.map(c=>combosReady(p,c.id)?colSum(p,c.id,COMBO_IDS):""),allColumnsReady(p,combosReady)?totals(p).combos:""]);
  lines.push(["TOTAL",...COLS.map(()=>""),playerSheetReady(p)?totals(p).total:""]);
  const csv=lines.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  downloadBlob(`YAMB_${p.name.replace(/[^a-z0-9]+/gi,"_")}_G${state.round}.csv`,csv,"text/csv;charset=utf-8");
}
function printPlayerSheet(pi){
  els.printArea.innerHTML=paperSheetHTML(pi,{print:true});
  document.body.classList.add("printing");
  const cleanup=()=>{document.body.classList.remove("printing");els.printArea.innerHTML="";window.removeEventListener("afterprint",cleanup)};
  window.addEventListener("afterprint",cleanup);window.print();setTimeout(()=>{if(document.body.classList.contains("printing"))cleanup()},30000);
}
function validateImportedPayload(raw){
  const candidate=raw?.state??raw;
  if(!candidate||typeof candidate!=="object"||!Array.isArray(candidate.players)||candidate.players.length<2)throw new Error("Invalid YAMB game-state file.");
  return normalizeState(candidate);
}
async function importStateFile(file){
  const text=await file.text(),raw=JSON.parse(text),next=validateImportedPayload(raw);state=next;menuOpen=false;modalMode=modalSectionForMode(state.mode);saveState();showTab("activeBoard");render();scheduleAIIfNeeded();
}
const ONLINE_P2P={
  provider:"peerjs",
  heartbeatMs:5000,
  staleMs:18000,
  peerOptions:{debug:1}
};
let onlinePeer=null;
let onlineConn=null;
const crewConnections=new Map();
let onlineSeat=state.crewLocalSeat||"";
let onlineRole="";
let crewPresence={A1:false,A2:false,B1:false,B2:false};
let onlineHeartbeatTimer=null;
let onlineReconnectTimer=null;
let onlineConnecting=false;
let onlineLastSeen=0;


function isCrewOnline(snapshot=state){return snapshot?.mode==="online"&&snapshot?.format==="TEAM"&&snapshot?.onlineTopology==="CREW"}
function activeCrewSeatFor(snapshot=state){return `${snapshot.current===0?"A":"B"}${(snapshot.teamMember===1?2:1)}`}
function activeCrewSeat(){return activeCrewSeatFor(state)}
function crewSeatTeam(seat){return String(seat||"").startsWith("B")?1:0}
function crewSeatName(seat){return state.crewNames?.[seat]||seat||"Crew"}
function crewAllConnected(){return ["A2","B1","B2"].every(seat=>crewConnections.get(seat)?.open)}
function crewPresenceSnapshot(){return {A1:onlineRole==="host"?true:!!crewPresence.A1,A2:!!crewPresence.A2,B1:!!crewPresence.B1,B2:!!crewPresence.B2}}
function setCrewPresence(next={}){crewPresence={A1:!!next.A1,A2:!!next.A2,B1:!!next.B1,B2:!!next.B2}}
function updateOnlineControlLock(){
  if(state.mode!=="online")return;
  if(isCrewOnline())state.remoteLock=!state.onlineReady||onlineSeat!==activeCrewSeat();
  else state.remoteLock=!state.onlineReady||state.current!==state.localPlayer;
}
function sendCrew(conn,msg){if(!conn?.open)throw new Error("Crew P2P connection is not open.");conn.send({app:"YAMB-P2P",schema:PROTOCOL_VERSION,sentAt:Date.now(),topology:"CREW",...msg})}
function broadcastCrew(msg,{except=""}={}){for(const [seat,conn] of crewConnections){if(seat===except||!conn?.open)continue;try{sendCrew(conn,msg)}catch{}}}
function availableCrewSeat(requested=""){const seats=["A2","B1","B2"];if(seats.includes(requested)&&!crewConnections.get(requested)?.open)return requested;return seats.find(seat=>!crewConnections.get(seat)?.open)||""}
function crewReadyState(){return onlineRole==="host"?crewAllConnected():state.onlineReady}

async function ensurePeerJS(){
  if(typeof window.Peer==="function")return true;
  try{await window.YambDeps?.peer}catch{}
  if(typeof window.Peer!=="function")throw new Error("PeerJS is unavailable. Local modes remain fully usable; check the internet connection or content blocker before using Online mode.");
  return true;
}
function clearOnlineTimers(){
  if(onlineHeartbeatTimer){clearInterval(onlineHeartbeatTimer);onlineHeartbeatTimer=null;}
  if(onlineReconnectTimer){clearTimeout(onlineReconnectTimer);onlineReconnectTimer=null;}
}
function closeOnlineTransport({destroyPeer=true}={}){
  clearOnlineTimers();
  try{if(onlineConn)onlineConn.close()}catch{}
  onlineConn=null;
  for(const conn of crewConnections.values()){try{conn.close()}catch{}}
  crewConnections.clear();
  crewPresence={A1:false,A2:false,B1:false,B2:false};
  if(destroyPeer){try{if(onlinePeer&&!onlinePeer.destroyed)onlinePeer.destroy()}catch{};onlinePeer=null;}
}
function shortRoomId(id=state.onlineRoomId){const s=String(id||"");return s.length>22?`${s.slice(0,10)}…${s.slice(-8)}`:s}
function cleanRoomId(value){
  const raw=String(value||"").trim().replace(/^room\s*[:#-]\s*/i,"");
  if(!raw)throw new Error("Enter Player 1's Room ID.");
  if(!/^[A-Za-z0-9_-]{1,160}$/.test(raw))throw new Error("Room ID contains unsupported characters.");
  return raw;
}
function setOnlineStatus(text,kind=""){if(!els.onlineStatus)return;els.onlineStatus.textContent=text;els.onlineStatus.className=`online-status ${kind}`.trim()}
function onlineRoomStatus(){
  if(state.mode!=="online"||!state.onlineRoomId)return "No P2P room connected.";
  if(isCrewOnline()){
    const seat=onlineSeat||state.crewLocalSeat||"—";
    if(!state.onlineReady)return `${onlineRole==="host"?"HOST A1 ONLINE · WAITING FOR CREW":"CONNECTING CREW SEAT"} · ${seat} · ROOM ${shortRoomId()}`;
    const turn=activeCrewSeat();
    const control=state.remoteLock?`WAITING FOR ${crewSeatName(turn)} · ${turn}`:`YOUR TURN · ${crewSeatName(seat)} · ${seat}`;
    return `${control} · 4-SEAT P2P · ROOM ${shortRoomId()} · REV ${state.revision}`;
  }
  if(!state.onlineReady)return `${state.localPlayer===0?"HOST ONLINE · WAITING FOR PLAYER 2":"CONNECTING TO HOST"} · ROOM ${shortRoomId()}`;
  const control=state.remoteLock?`WAITING FOR ${state.players[state.current]?.name||"OPPONENT"}`:`YOUR TURN · ${state.players[state.localPlayer]?.name||`PLAYER ${state.localPlayer+1}`}`;
  return `${control} · ${state.onlinePeerJoined?"P2P ONLINE · ":""}ROOM ${shortRoomId()} · REV ${state.revision}`;
}
function p2pTransferableState(){
  const copy=JSON.parse(JSON.stringify(state));
  copy.localPlayer=0;
  copy.crewLocalSeat="";
  copy.remoteLock=false;
  copy.onlineRoomUrl="";
  copy.onlineProvider=ONLINE_P2P.provider;
  copy.onlineLastSync=Date.now();
  return copy;
}
function validP2PPacket(msg){return !!msg&&typeof msg==="object"&&msg.app==="YAMB-P2P"&&msg.schema===PROTOCOL_VERSION&&typeof msg.type==="string"}
function sendP2P(msg){
  if(!onlineConn||!onlineConn.open)throw new Error("The live P2P connection is not open.");
  onlineConn.send({app:"YAMB-P2P",schema:PROTOCOL_VERSION,sentAt:Date.now(),...msg});
}
function applyP2PState(packet,{welcome=false}={}){
  if(!packet?.state||typeof packet.revision!=="number")throw new Error("Invalid P2P game-state packet.");
  if(!welcome&&packet.revision<=state.revision)return false;
  const roomId=state.onlineRoomId;
  const preservedSeat=onlineSeat||state.crewLocalSeat||"";
  const pairSeat=state.localPlayer===1?1:0;
  const next=normalizeState(packet.state);
  next.mode="online";next.started=true;next.onlineRoomId=roomId;next.onlineGameId=roomId;next.onlineRoomUrl="";next.onlineProvider=ONLINE_P2P.provider;
  next.onlinePeerJoined=true;next.onlineLastSync=Date.now();next.revision=Math.max(0,Number(packet.revision)||0);next.waiting=false;
  if(next.onlineTopology==="CREW"){
    if(packet.seat)onlineSeat=packet.seat;
    const seat=onlineSeat||preservedSeat;
    next.crewLocalSeat=seat;next.localPlayer=crewSeatTeam(seat);
    next.onlineReady=packet.ready!==false;
    if(packet.presence)setCrewPresence(packet.presence);
  }else{next.localPlayer=pairSeat;next.onlineReady=true;}
  state=next;updateOnlineControlLock();modalMode="online";menuOpen=false;saveState();render();
  return true;
}
function startP2PHeartbeat(){
  clearOnlineTimers();onlineLastSeen=Date.now();
  onlineHeartbeatTimer=setInterval(()=>{
    const now=Date.now();
    if(isCrewOnline()&&onlineRole==="host"){
      broadcastCrew({type:"ping",revision:state.revision});
      return;
    }
    if(!onlineConn?.open)return;
    try{sendP2P({type:"ping",revision:state.revision})}catch{}
    if(now-onlineLastSeen>ONLINE_P2P.staleMs){
      state.onlinePeerJoined=false;state.onlineReady=false;state.remoteLock=true;saveState();render();setOnlineStatus("P2P connection timed out · reconnect to continue.","bad");sfx.onlineDisconnect();
    }
  },ONLINE_P2P.heartbeatMs);
}
function peerErrorMessage(err){
  const type=err?.type||"";
  if(type==="peer-unavailable")return "Room not found. Check the Room ID and make sure Player 1 still has the game open.";
  if(type==="unavailable-id")return "That Room ID is already in use. Wait a moment and try reconnecting.";
  if(type==="network"||type==="server-error"||type==="socket-error"||type==="socket-closed")return "PeerJS signaling service is unreachable. Check the network and try again.";
  if(type==="webrtc")return "WebRTC could not establish the direct connection. A restrictive NAT/firewall may require TURN.";
  return err?.message||"PeerJS connection error.";
}
function bindPeerLifecycle(role){
  onlinePeer.on("disconnected",()=>{
    setOnlineStatus(onlineConn?.open?"P2P game link is still live · reconnecting signaling…":"Signaling disconnected · reconnecting…","");
    if(onlinePeer&&!onlinePeer.destroyed&&onlinePeer.disconnected){
      onlineReconnectTimer=setTimeout(()=>{try{onlinePeer.reconnect()}catch{}},900);
    }
  });
  onlinePeer.on("error",err=>{
    const msg=peerErrorMessage(err);setOnlineStatus(msg,"bad");
    if(!onlineConn?.open){state.onlinePeerJoined=false;state.onlineReady=false;state.remoteLock=true;saveState();render();}
  });
  onlinePeer.on("close",()=>{
    if(state.mode==="online"){state.onlinePeerJoined=false;state.onlineReady=false;state.remoteLock=true;saveState();render();setOnlineStatus("Peer session closed. Reconnect to continue.","bad");sfx.onlineDisconnect();}
  });
  if(role==="host"){
    onlinePeer.on("connection",conn=>{
      if(conn.metadata?.app&&conn.metadata.app!=="YAMB-P2P"){conn.close();return;}
      if(isCrewOnline()||conn.metadata?.topology==="CREW"){bindCrewDataConnection(conn,"host");return;}
      if(onlineConn?.open&&onlineConn!==conn){onlineConn.close();}
      bindDataConnection(conn,"host");
    });
  }
}
function bindDataConnection(conn,role){
  onlineConn=conn;
  conn.on("open",()=>{
    onlineLastSeen=Date.now();startP2PHeartbeat();
    if(role==="guest"){
      state.onlinePeerJoined=true;state.remoteLock=true;saveState();render();
      sendP2P({type:"hello",name:state.players[1]?.name||"Player 2",revision:state.revision});
      setOnlineStatus(`CONNECTED TO ${shortRoomId()} · waiting for host state…`,"good");
    }else{
      setOnlineStatus(`PLAYER 2 CONNECTED · ROOM ${shortRoomId()} · establishing live game…`,"good");
    }
  });
  conn.on("data",msg=>{
    onlineLastSeen=Date.now();
    if(!validP2PPacket(msg))return;
    try{
      if(msg.type==="ping"){sendP2P({type:"pong",revision:state.revision});return;}
      if(msg.type==="pong")return;
      if(msg.type==="hello"&&state.localPlayer===0){
        const firstJoin=!state.onlineReady;
        const guestName=String(msg.name||"Player 2").trim().slice(0,24)||"Player 2";
        state.players[1].name=guestName;state.onlinePeerJoined=true;state.onlineReady=true;state.waiting=false;
        if(firstJoin){state.current=0;state.rollCount=0;state.dice=[1,1,1,1,1];state.held=[false,false,false,false,false];state.announced=null;state.revision=Math.max(1,state.revision+1);}
        state.remoteLock=state.current!==0;state.onlineLastSync=Date.now();saveState();render();
        sendP2P({type:"welcome",revision:state.revision,state:p2pTransferableState()});
        setOnlineStatus(`PLAYER 2 ONLINE · LIVE P2P · ${guestName}`,"good");setTimeout(()=>sfx.onlineConnect(),80);return;
      }
      if(msg.type==="welcome"&&state.localPlayer===1){
        applyP2PState(msg,{welcome:true});clearOnlineInviteParams();setOnlineStatus(`LIVE P2P CONNECTED · ${state.remoteLock?`waiting for ${state.players[state.current].name}`:"your turn"}.`,"good");setTimeout(()=>sfx.onlineConnect(),80);return;
      }
      if(msg.type==="state"){
        if(applyP2PState(msg)){setOnlineStatus(`LIVE SYNC · revision ${state.revision} · ${state.remoteLock?`waiting for ${state.players[state.current].name}`:"your turn"}.`,"good");setTimeout(()=>sfx.turnHandoff(state.current),90);}return;
      }
      if(msg.type==="request-state"&&state.localPlayer===0){sendP2P({type:"welcome",revision:state.revision,state:p2pTransferableState()});return;}
    }catch(err){setOnlineStatus(err.message||"Invalid P2P message.","bad")}
  });
  conn.on("close",()=>{
    if(onlineConn===conn)onlineConn=null;
    clearOnlineTimers();state.onlinePeerJoined=false;state.onlineReady=false;state.remoteLock=true;saveState();render();setOnlineStatus("Player disconnected · reconnect to continue.","bad");sfx.onlineDisconnect();
  });
  conn.on("error",err=>setOnlineStatus(peerErrorMessage(err),"bad"));
}
function bindCrewDataConnection(conn,role){
  if(role==="guest")onlineConn=conn;
  let assignedSeat="";
  conn.on("open",()=>{
    onlineLastSeen=Date.now();startP2PHeartbeat();
    if(role==="guest"){
      state.onlinePeerJoined=true;state.remoteLock=true;saveState();render();
      sendCrew(conn,{type:"crew-hello",name:(els.onlineP2?.value||state.crewNames?.[state.crewLocalSeat]||"Crew Player").trim().slice(0,24)||"Crew Player",requestedSeat:state.crewLocalSeat||"",revision:state.revision});
      setOnlineStatus(`CONNECTED · requesting crew seat in ${shortRoomId()}…`,"good");
    }
  });
  conn.on("data",msg=>{
    onlineLastSeen=Date.now();if(!validP2PPacket(msg))return;
    try{
      if(msg.type==="ping"){sendCrew(conn,{type:"pong",revision:state.revision});return}
      if(msg.type==="pong")return;
      if(role==="host"&&msg.type==="crew-hello"){
        const seat=availableCrewSeat(String(msg.requestedSeat||""));
        if(!seat){sendCrew(conn,{type:"crew-full"});setTimeout(()=>conn.close(),80);return}
        assignedSeat=seat;crewConnections.set(seat,conn);crewPresence[seat]=true;crewPresence.A1=true;
        const name=String(msg.name||seat).trim().slice(0,24)||seat;state.crewNames[seat]=name;
        state.onlinePeerJoined=true;state.onlineReady=crewAllConnected();state.onlineLastSync=Date.now();
        if(state.onlineReady&&state.revision===0){state.current=0;state.teamMember=0;state.rollCount=0;state.dice=[1,1,1,1,1];state.held=[false,false,false,false,false];state.announced=null;state.revision=1;}
        else state.revision=Math.max(1,state.revision+1);
        updateOnlineControlLock();saveState();render();
        const presence=crewPresenceSnapshot(),payload={type:"crew-state",reason:"crew-presence",revision:state.revision,state:p2pTransferableState(),presence,ready:state.onlineReady};
        sendCrew(conn,{type:"crew-welcome",seat,revision:state.revision,state:p2pTransferableState(),presence,ready:state.onlineReady});
        broadcastCrew(payload,{except:seat});
        setOnlineStatus(`${seat} ONLINE · ${name} · ${state.onlineReady?"CREW READY":"waiting for remaining seats"}.`,"good");
        if(state.onlineReady)setTimeout(()=>sfx.onlineConnect(),80);return;
      }
      if(role==="guest"&&msg.type==="crew-welcome"){
        onlineSeat=String(msg.seat||"");state.crewLocalSeat=onlineSeat;applyP2PState(msg,{welcome:true});clearOnlineInviteParams();
        setOnlineStatus(`${onlineSeat} CONNECTED · ${state.onlineReady?(state.remoteLock?`waiting for ${activeCrewSeat()}`:"your turn"):"waiting for full crew"}.`,"good");setTimeout(()=>sfx.onlineConnect(),80);return;
      }
      if(role==="guest"&&msg.type==="crew-full"){setOnlineStatus("Crew room is already full.","bad");return}
      if(role==="guest"&&msg.type==="crew-state"){
        if(applyP2PState(msg)){setOnlineStatus(`CREW SYNC · revision ${state.revision} · ${state.onlineReady?(state.remoteLock?`waiting for ${activeCrewSeat()}`:"your turn"):"waiting for crew"}.`,"good");setTimeout(()=>sfx.turnHandoff(state.current),90)}return;
      }
      if(role==="host"&&msg.type==="crew-proposal"){
        const seat=assignedSeat||String(msg.seat||"");
        if(!seat||seat!==activeCrewSeat()||Number(msg.baseRevision)!==state.revision||!msg.state){
          sendCrew(conn,{type:"crew-state",reason:"proposal-rejected",revision:state.revision,state:p2pTransferableState(),presence:crewPresenceSnapshot(),ready:state.onlineReady});return;
        }
        const proposed=normalizeState(msg.state),roomId=state.onlineRoomId,hostSeat=state.crewLocalSeat||"A1",names={...state.crewNames};
        state=proposed;state.mode="online";state.onlineTopology="CREW";state.format="TEAM";state.playersCount=4;state.teamsCount=2;state.transport="ONLINE";state.onlineRoomId=roomId;state.onlineGameId=roomId;state.onlineProvider=ONLINE_P2P.provider;state.crewLocalSeat=hostSeat;state.crewNames={...names,...proposed.crewNames};state.localPlayer=0;state.onlineReady=crewAllConnected();state.onlinePeerJoined=true;state.revision=Number(msg.baseRevision)+1;state.onlineLastSync=Date.now();
        updateOnlineControlLock();saveState();render();
        broadcastCrew({type:"crew-state",reason:String(msg.reason||"crew-action").slice(0,48),revision:state.revision,state:p2pTransferableState(),presence:crewPresenceSnapshot(),ready:state.onlineReady});
        setOnlineStatus(`CREW SYNC · revision ${state.revision} · ${state.remoteLock?`waiting for ${activeCrewSeat()}`:"your turn"}.`,"good");return;
      }
      if(role==="host"&&msg.type==="request-state"){sendCrew(conn,{type:"crew-state",reason:"requested",revision:state.revision,state:p2pTransferableState(),presence:crewPresenceSnapshot(),ready:state.onlineReady});return}
    }catch(err){setOnlineStatus(err.message||"Invalid crew P2P message.","bad")}
  });
  conn.on("close",()=>{
    if(role==="host"){
      if(assignedSeat&&crewConnections.get(assignedSeat)===conn){crewConnections.delete(assignedSeat);crewPresence[assignedSeat]=false;state.onlineReady=false;state.onlinePeerJoined=crewConnections.size>0;state.revision=Math.max(1,state.revision+1);updateOnlineControlLock();saveState();render();broadcastCrew({type:"crew-state",reason:"seat-disconnected",revision:state.revision,state:p2pTransferableState(),presence:crewPresenceSnapshot(),ready:false});setOnlineStatus(`${assignedSeat} DISCONNECTED · game frozen until the seat reconnects.`,"bad");sfx.onlineDisconnect()}
    }else if(onlineConn===conn){onlineConn=null;clearOnlineTimers();state.onlinePeerJoined=false;state.onlineReady=false;state.remoteLock=true;saveState();render();setOnlineStatus("Crew host disconnected · reconnect to continue.","bad");sfx.onlineDisconnect()}
  });
  conn.on("error",err=>setOnlineStatus(peerErrorMessage(err),"bad"));
}

async function createOnlineRoom({restoreId=""}={}){
  if(onlineConnecting)return;onlineConnecting=true;
  try{
    await ensurePeerJS();
    const restoring=!!restoreId&&state.mode==="online"&&state.started;
    const preserved=restoring?normalizeState(JSON.parse(JSON.stringify(state))):null;
    const crew=restoring?preserved?.onlineTopology==="CREW":setupOnlineVariant==="crew";
    closeOnlineTransport();onlineRole="host";onlineSeat=crew?"A1":"";
    if(restoring){
      state=preserved;state.localPlayer=0;state.crewLocalSeat=crew?"A1":"";state.remoteLock=true;state.onlineReady=false;state.onlinePeerJoined=false;state.onlineProvider=ONLINE_P2P.provider;state.onlineRoomId=restoreId;state.onlineGameId=restoreId;state.onlineRoomUrl="";
    }else{
      const team=setupOnlineVariant==="team"||crew;
      const hostName=els.onlineP1.value.trim()||(crew?"Player A1":team?"Team Alpha":"Player 1");
      startMode("online",team?"Team Alpha":hostName,team?"Team Omega":"Player 2",{format:team?"TEAM":"DUEL",opponent:"HUMAN",players:team?4:2,teams:team?2:0,transport:"ONLINE",code:crew?"CR":team?"TM":"DU",topology:crew?"CREW":"PAIR"});
      state.localPlayer=0;state.crewLocalSeat=crew?"A1":"";if(crew)state.crewNames.A1=hostName.slice(0,24);state.remoteLock=true;state.onlineReady=false;state.onlinePeerJoined=false;state.revision=0;state.onlineProvider=ONLINE_P2P.provider;state.onlineRoomUrl="";
    }
    if(crew){crewPresence={A1:true,A2:false,B1:false,B2:false};state.players[0].name="Team Alpha";state.players[1].name="Team Omega"}
    setOnlineStatus(restoring?"Restoring PeerJS room…":"Registering with PeerJS Cloud…","");render();
    onlinePeer=new Peer(restoreId||undefined,ONLINE_P2P.peerOptions);bindPeerLifecycle("host");
    onlinePeer.on("open",id=>{
      state.onlineRoomId=id;state.onlineGameId=id;state.onlineProvider=ONLINE_P2P.provider;state.onlineLastSync=Date.now();saveState();menuOpen=false;render();
      setOnlineStatus(`ROOM READY · ${shortRoomId(id)} · waiting for ${crew?"A2, B1 and B2":"Player 2"}.`,"good");
    });
  }catch(err){closeOnlineTransport();onlineRole="";onlineSeat="";state=freshState("online");state.started=false;modalMode="online";menuOpen=true;render();setOnlineStatus(peerErrorMessage(err),"bad")}
  finally{onlineConnecting=false}
}
async function joinOnlineRoom({roomId="",restore=false}={}){
  if(onlineConnecting)return;onlineConnecting=true;
  try{
    await ensurePeerJS();
    const id=cleanRoomId(roomId||els.onlineCodeInput.value);
    const crew=restore?(state.onlineTopology==="CREW"):setupOnlineVariant==="crew";
    const guestName=(els.onlineP2.value.trim()||(crew?state.crewNames?.[state.crewLocalSeat]||"Crew Player":state.players?.[1]?.name||(setupOnlineVariant==="team"?"Team Omega":"Player 2"))).slice(0,24);
    const preserved=restore&&state.mode==="online"&&state.started?normalizeState(JSON.parse(JSON.stringify(state))):null;
    const requestedSeat=preserved?.crewLocalSeat||"";
    closeOnlineTransport();onlineRole="guest";onlineSeat=crew?requestedSeat:"";
    if(preserved){state=preserved;state.localPlayer=crew?crewSeatTeam(requestedSeat):1;state.remoteLock=true;state.onlineReady=false;state.onlinePeerJoined=false;state.onlineRoomId=id;state.onlineGameId=id;state.onlineProvider=ONLINE_P2P.provider;state.onlineRoomUrl="";}
    else{
      const team=setupOnlineVariant==="team"||crew;
      startMode("online",team?"Team Alpha":"Player 1",team?"Team Omega":guestName,{format:team?"TEAM":"DUEL",opponent:"HUMAN",players:team?4:2,teams:team?2:0,transport:"ONLINE",code:crew?"CR":team?"TM":"DU",topology:crew?"CREW":"PAIR"});
      state.localPlayer=crew?0:1;state.crewLocalSeat="";state.remoteLock=true;state.onlineReady=false;state.onlinePeerJoined=false;state.onlineRoomId=id;state.onlineGameId=id;state.onlineProvider=ONLINE_P2P.provider;state.onlineRoomUrl="";
    }
    if(!crew)state.players[1].name=guestName;saveState();menuOpen=false;render();
    setOnlineStatus(`${restore?"RECONNECTING":"CONNECTING"} · ${shortRoomId(id)}…`,"");
    onlinePeer=new Peer(undefined,ONLINE_P2P.peerOptions);bindPeerLifecycle("guest");
    onlinePeer.on("open",()=>{
      const metadata={app:"YAMB-P2P",schema:PROTOCOL_VERSION,role:"guest",topology:crew?"CREW":"PAIR"};
      const conn=onlinePeer.connect(id,{serialization:"json",reliable:true,label:crew?"yamb-crew":"yamb-live",metadata});
      if(crew)bindCrewDataConnection(conn,"guest");else bindDataConnection(conn,"guest");
    });
  }catch(err){setOnlineStatus(peerErrorMessage(err),"bad");modalMode="online";menuOpen=true;render()}
  finally{onlineConnecting=false}
}
function publishOnlineState(reason="turn-complete"){
  if(state.mode!=="online"||!state.started||!state.onlineReady)return;
  if(isCrewOnline()){
    if(onlineRole==="host"){
      state.revision=Math.max(0,Number(state.revision)||0)+1;state.onlineLastSync=Date.now();updateOnlineControlLock();saveState();render();
      broadcastCrew({type:"crew-state",reason:String(reason||"sync").slice(0,48),revision:state.revision,state:p2pTransferableState(),presence:crewPresenceSnapshot(),ready:state.onlineReady});
      setOnlineStatus(`CREW SYNC · revision ${state.revision} · ${state.remoteLock?`waiting for ${activeCrewSeat()}`:"your turn"}.`,"good");return;
    }
    if(!onlineConn?.open){state.onlinePeerJoined=false;state.onlineReady=false;state.remoteLock=true;saveState();render();setOnlineStatus("Crew host link is not open · reconnect before continuing.","bad");return}
    const baseRevision=state.revision;state.remoteLock=true;saveState();render();
    try{sendCrew(onlineConn,{type:"crew-proposal",seat:onlineSeat,baseRevision,reason:String(reason||"crew-action").slice(0,48),state:p2pTransferableState()});setOnlineStatus(`ACTION SENT · ${onlineSeat} · awaiting host revision…`,"good")}
    catch(err){state.onlineReady=false;state.onlinePeerJoined=false;state.remoteLock=true;saveState();render();setOnlineStatus(peerErrorMessage(err),"bad")}
    return;
  }
  if(!onlineConn?.open){state.onlinePeerJoined=false;state.onlineReady=false;state.remoteLock=true;saveState();render();setOnlineStatus("P2P link is not open · reconnect before continuing.","bad");return;}
  state.revision=Math.max(0,Number(state.revision)||0)+1;state.onlineLastSync=Date.now();state.remoteLock=state.current!==state.localPlayer;saveState();render();
  try{sendP2P({type:"state",reason:String(reason||"sync").slice(0,48),revision:state.revision,state:p2pTransferableState()});setOnlineStatus(`LIVE SYNC · revision ${state.revision} · ${state.remoteLock?`waiting for ${state.players[state.current].name}`:"your turn"}.`,"good")}
  catch(err){state.onlineReady=false;state.onlinePeerJoined=false;state.remoteLock=true;saveState();render();setOnlineStatus(peerErrorMessage(err),"bad")}
}
function queueOnlinePush(reason){publishOnlineState(reason)}
async function copyText(text){
  if(navigator.clipboard?.writeText&&window.isSecureContext){try{await navigator.clipboard.writeText(text);return}catch{}}
  const ta=document.createElement("textarea");ta.value=text;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();const ok=document.execCommand("copy");ta.remove();if(!ok)throw new Error("Clipboard writing is unavailable.");
}
function onlineInviteUrl(){
  if(!state.onlineRoomId)return "";
  const url=new URL(window.location.href);url.search="";url.hash="";
  url.searchParams.set("yambRoom",state.onlineRoomId);url.searchParams.set("format",state.format==="TEAM"?"TEAM":"DUEL");if(isCrewOnline())url.searchParams.set("topology","CREW");url.searchParams.set("join","1");
  return url.toString();
}
function readOnlineInvite(){
  try{const q=new URLSearchParams(window.location.search);const room=q.get("yambRoom")||q.get("room");if(!room)return null;return{room:cleanRoomId(room),format:q.get("format")==="TEAM"?"TEAM":"DUEL",topology:q.get("topology")==="CREW"?"CREW":"PAIR"}}catch{return null}
}
function clearOnlineInviteParams(){
  try{const url=new URL(window.location.href);if(!url.searchParams.has("yambRoom")&&!url.searchParams.has("room"))return;url.searchParams.delete("yambRoom");url.searchParams.delete("room");url.searchParams.delete("format");url.searchParams.delete("topology");url.searchParams.delete("join");history.replaceState(null,"",url.pathname+(url.search?url.search:"")+url.hash)}catch{}
}
function renderLobbyQr(invite){
  const node=document.getElementById("onlineLobbyQr"),hint=document.getElementById("onlineLobbyQrHint");if(!node)return;node.innerHTML="";
  if(!invite){if(hint)hint.textContent="Create a room to generate QR";return}
  if(typeof window.QRCode!=="function"){
    node.innerHTML='<span class="qr-fallback">QR loading…<br>invite link is ready</span>';
    if(hint)hint.textContent="QR library loading in background · invite link and Room ID already work";
    window.YambDeps?.qr?.then(()=>{if(typeof window.QRCode==="function"&&node.isConnected)renderLobbyQr(invite);});
    return
  }
  try{new window.QRCode(node,{text:invite,width:132,height:132,colorDark:"#071722",colorLight:"#ffffff",correctLevel:window.QRCode.CorrectLevel.M});if(hint)hint.textContent=location.protocol==="http:"||location.protocol==="https:"?"Scan once · room + format auto-load":"Deploy on HTTPS for cross-device QR join"}catch{node.innerHTML='<span class="qr-fallback">QR ERROR<br>use invite link</span>'}
}
async function copyOnlineRoomId(){if(!state.onlineRoomId)throw new Error("Create a room first.");await copyText(state.onlineRoomId);setOnlineStatus("Room ID copied · manual join remains available.","good")}
async function copyOnlineInvite(){const invite=onlineInviteUrl();if(!invite)throw new Error("Create a room first.");await copyText(invite);setOnlineStatus("Invite link copied · scan QR or open the link.","good")}
async function shareOnlineInvite(){
  const invite=onlineInviteUrl();if(!invite)throw new Error("Create a room first.");const text=`YAMB · ${isCrewOnline()?"Online Crew":state.format==="TEAM"?"Online Team":"Online Duel"} · ${state.onlineRoomId}`;
  if(navigator.share){await navigator.share({title:"YAMB · Live P2P",text,url:invite});setOnlineStatus("Invite link shared.","good")}
  else{await copyText(invite);setOnlineStatus("Native sharing unavailable · invite link copied instead.","good")}
}
async function autoJoinOnlineInvite(invite){
  if(!invite)return;setupOnlineVariant=invite.topology==="CREW"?"crew":invite.format==="TEAM"?"team":"duel";modalMode="online";menuOpen=true;render();
  els.onlineCodeInput.value=invite.room;
  if(!els.onlineP2.value.trim()||/^(Player 2|Team Omega)$/i.test(els.onlineP2.value.trim()))els.onlineP2.value=setupOnlineVariant==="crew"?"Crew Player":setupOnlineVariant==="team"?"Team Omega":"Player 2";
  setOnlineStatus(`QR INVITE · joining ${shortRoomId(invite.room)}…`,"");
  await joinOnlineRoom({roomId:invite.room});
}
function reconnectOnline(){
  if(state.mode!=="online"||!state.onlineRoomId){setOnlineStatus("Create or join a room first.","bad");return;}
  const isHost=isCrewOnline()?state.crewLocalSeat==="A1":state.localPlayer===0;
  if(isHost){
    if(onlinePeer&&!onlinePeer.destroyed){if(onlinePeer.disconnected){try{onlinePeer.reconnect();setOnlineStatus("Reconnecting PeerJS signaling…","")}catch{}}else setOnlineStatus(onlineConn?.open?"P2P connection is already live.":"Host is online · Player 2 can join again with the same Room ID.",onlineConn?.open?"good":"");}
    else void createOnlineRoom({restoreId:state.onlineRoomId});
  }else void joinOnlineRoom({roomId:state.onlineRoomId,restore:true});
}
function leaveOnlineRoom(){
  closeOnlineTransport();state=freshState("online");state.started=false;modalMode="online";menuOpen=true;saveState();showTab("activeBoard");render();setOnlineStatus("Left the live P2P room.","");
}
function renderOnlineLobby(){
  if(!els.onlineLobbyModal)return;
  const crew=isCrewOnline(),waiting=state.mode==="online"&&state.started&&!!state.onlineRoomId&&!state.onlineReady;
  els.onlineLobbyModal.classList.toggle("show",waiting);els.onlineLobbyModal.setAttribute("aria-hidden",waiting?"false":"true");
  if(!waiting){const q=document.getElementById("onlineLobbyQr");if(q)q.innerHTML="";return;}
  const host=crew?state.crewLocalSeat==="A1":state.localPlayer===0,isTeam=state.format==="TEAM",invite=host?onlineInviteUrl():"";
  els.onlineLobbyRoom.textContent=state.onlineRoomId;
  els.onlineLobbyTitle.textContent=host?(crew?"Crew Room Ready":state.onlinePeerJoined?"Opponent Connected":isTeam?"Team Room Ready":"Duel Room Ready"):(crew?(onlineSeat?`Seat ${onlineSeat} Connected`:"Joining Crew Room"):"Connecting to Host");
  els.onlineLobbySubtitle.textContent=host?(crew?"Share one invite with three players. Seats A2, B1 and B2 are assigned and restored automatically.":"Share the QR, invite link, or Room ID. The live game starts automatically when the opponent connects."):(crew?"Your seat becomes active only when the runtime reaches that exact teammate turn.":"Room detected. Establishing the live P2P channel automatically.");
  els.onlineLobbyInviteGroup.style.display=host?"grid":"none";
  const qrZone=document.getElementById("onlineLobbyQrZone");if(qrZone)qrZone.style.display=host?"grid":"none";
  if(host){els.onlineLobbyInvite.value=invite;renderLobbyQr(invite)}
  const presenceHost=els.onlineLobbyP1.parentElement;
  const ensureCrewCard=(id,label)=>{let node=document.getElementById(id);if(!node){node=document.createElement("div");node.id=id;node.className="lobby-presence waiting";node.innerHTML=`<b>${label}</b><small>WAITING</small>`;presenceHost.appendChild(node)}return node};
  if(crew){
    const nodes={A1:els.onlineLobbyP1,A2:els.onlineLobbyP2,B1:ensureCrewCard("onlineLobbyB1","B1"),B2:ensureCrewCard("onlineLobbyB2","B2")};
    const presence=onlineRole==="host"?crewPresenceSnapshot():crewPresence;
    for(const seat of ["A1","A2","B1","B2"]){const node=nodes[seat],b=node.querySelector("b"),small=node.querySelector("small");if(b)b.textContent=`${seat} · ${state.crewNames?.[seat]||seat}`;const on=seat==="A1"?true:!!presence[seat];node.className=`lobby-presence ${on?"online":"waiting"}`;if(small)small.textContent=on?"ONLINE":"WAITING"}
    els.onlineLobbyStatus.textContent=host?(state.onlineReady?"ALL FOUR SEATS ONLINE · STARTING CREW GAME…":"WAITING FOR A2 · B1 · B2…"):(onlineSeat?`YOU ARE ${onlineSeat} · ${state.onlineReady?"CREW READY":"WAITING FOR REMAINING SEATS"}`:"REQUESTING AVAILABLE SEAT…");
  }else{
    document.getElementById("onlineLobbyB1")?.remove();document.getElementById("onlineLobbyB2")?.remove();
    const p1b=els.onlineLobbyP1.querySelector("b"),p2b=els.onlineLobbyP2.querySelector("b");if(p1b)p1b.textContent=isTeam?"TEAM ALPHA":"PLAYER 1";if(p2b)p2b.textContent=isTeam?"TEAM OMEGA":"PLAYER 2";
    els.onlineLobbyP1.className="lobby-presence online";els.onlineLobbyP1.querySelector("small").textContent="ONLINE";
    els.onlineLobbyP2.className=`lobby-presence ${state.onlinePeerJoined?"online":"waiting"}`;els.onlineLobbyP2.querySelector("small").textContent=state.onlinePeerJoined?"ONLINE":"WAITING";
    els.onlineLobbyStatus.textContent=host?(state.onlinePeerJoined?"OPPONENT ONLINE · STARTING LIVE GAME…":"SCAN QR OR SHARE LINK / ROOM ID…"):"CONNECTING TO HOST…";
  }
  els.onlineLobbyCancelBtn.textContent=host?"CANCEL ROOM":"LEAVE ROOM";
}
function restoreP2PSession(){
  if(state.mode!=="online"||!state.started||!state.onlineRoomId)return;
  setTimeout(()=>{const isHost=isCrewOnline()?state.crewLocalSeat==="A1":state.localPlayer===0;if(isHost)void createOnlineRoom({restoreId:state.onlineRoomId});else void joinOnlineRoom({roomId:state.onlineRoomId,restore:true})},700);
}

const AI_NEG=-1e9;
const AI_LEVELS={casual:{eps:1.35,samples:.38},standard:{eps:.35,samples:1},expert:{eps:.12,samples:1.8}};
let AI_DIFFICULTY=window.YambPersistence?.getSync("preferences.aiDifficulty","standard")||"standard";
if(!AI_LEVELS[AI_DIFFICULTY])AI_DIFFICULTY="standard";
let AI_EPS=AI_LEVELS[AI_DIFFICULTY].eps;

function aiFaceCounts(dice){
  const c=[0,0,0,0,0,0,0];
  dice.forEach(v=>c[v]++);
  return c;
}
function aiScoreDice(catId,dice,rollNo){return window.YambRules.scoreDice(catId,dice,rollNo,CATS)}
function aiBenchmark(catId){
  const cat=CATS.find(c=>c.id===catId);if(!cat)return 10;
  if(cat.type==="num")return cat.face===1?45:cat.face*3;
  if(cat.type==="max"||cat.type==="min")return 45;
  if(cat.type==="kenta")return 46;
  if(cat.type==="full")return 44;
  if(cat.type==="poker")return 58;
  if(cat.type==="yamb")return 70;
  return 10;
}
function aiSlotUtility(colId,catId,points,player=state.players[1]){
  const cat=CATS.find(c=>c.id===catId);if(!cat)return AI_NEG;
  const col=player.scores[colId];
  let value=0;

  if(cat.type==="num"){
    const expected=cat.face*3;
    value=points+(points-expected)*.70;
    // Ones are the multiplier for (+ −) and are therefore strategically much more valuable.
    if(cat.face===1){
      const mx=col.max===null?25:col.max;
      const mn=col.min===null?10:col.min;
      value+=Math.max(0,(mx-mn)*points);
    }
    const others=UPPER_IDS.filter(id=>id!==catId);
    const othersReady=others.every(id=>col[id]!==null);
    const raw=others.reduce((sum,id)=>sum+(col[id]??0),0)+points;
    if(othersReady&&raw>=60)value+=30;
    else if(!othersReady)value+=(points-expected)*.35;
  }else if(cat.type==="max"||cat.type==="min"){
    const ones=col.ones===null?3:col.ones;
    const mx=cat.type==="max"?points:(col.max===null?25:col.max);
    const mn=cat.type==="min"?points:(col.min===null?10:col.min);
    value=Math.max(0,(mx-mn)*ones);
    // Slight tie-break toward objectively strong max/min rolls even before all dependencies exist.
    value+=cat.type==="max"?(points-20)*.45:(15-points)*.45;
  }else{
    value=points;
  }

  if(points===0){
    const loss=aiBenchmark(catId);
    value=-(loss*(cat.type==="yamb"?1.0:cat.type==="poker"?.90:cat.type==="kenta"?.78:cat.type==="full"?.78:.58));
  }

  // Free is the universal escape hatch: spend it only on a genuinely useful result.
  if(colId==="free")value-=Math.max(4,aiBenchmark(catId)*.08);
  else if(colId==="down"||colId==="up")value-=.6;
  else if(colId==="hand")value+=1.5;
  else if(colId==="announce")value+=1.0;
  return value;
}
function aiCurrentWriteCandidates(){
  const list=[];
  for(const col of COLS){
    if(col.id==="announce"&&!state.announced)continue;
    for(const cat of CATS){
      const e=eligibility(1,col.id,cat.id,true);if(!e.ok)continue;
      const points=scoreFor(cat.id);
      list.push({colId:col.id,catId:cat.id,points,utility:aiSlotUtility(col.id,cat.id,points),e});
    }
  }
  return list;
}
function aiBestWrite(list=aiCurrentWriteCandidates()){
  return [...list].sort((a,b)=>b.utility-a.utility||b.points-a.points||CATS.findIndex(c=>c.id===a.catId)-CATS.findIndex(c=>c.id===b.catId))[0]||null;
}
function aiFutureNormalSlots(){
  const p=state.players[1];
  if(state.announced)return [{colId:"announce",catId:state.announced}];
  const slots=[];
  const d=nextDown(p),u=nextUp(p);
  if(d)slots.push({colId:"down",catId:d});
  if(u)slots.push({colId:"up",catId:u});
  for(const cat of CATS)if(p.scores.free[cat.id]===null)slots.push({colId:"free",catId:cat.id});
  return slots;
}
function aiAnnouncementSlots(){
  if(state.rollCount!==1||state.announced)return [];
  const p=state.players[1];
  return CATS.filter(cat=>p.scores.announce[cat.id]===null).map(cat=>({colId:"announce",catId:cat.id}));
}
function aiBestWriteOnDice(slots,dice,rollNo){
  let best=null;
  for(const slot of slots){
    const points=aiScoreDice(slot.catId,dice,rollNo);
    const utility=aiSlotUtility(slot.colId,slot.catId,points);
    if(!best||utility>best.utility||(Math.abs(utility-best.utility)<1e-9&&points>best.points))best={...slot,points,utility};
  }
  return best||{utility:AI_NEG,points:0};
}
function aiMaskForFace(dice,face,limit=5){
  let mask=0,n=0;for(let i=0;i<dice.length;i++)if(dice[i]===face&&n<limit){mask|=1<<i;n++}return mask;
}
function aiTargetHoldMask(catId,dice,rollNo){
  const cat=CATS.find(c=>c.id===catId),cnt=aiFaceCounts(dice);if(!cat)return 0;
  if(cat.type==="num")return aiMaskForFace(dice,cat.face);
  if(cat.type==="max"){
    const threshold=rollNo>=2?4:5;let m=0;dice.forEach((v,i)=>{if(v>=threshold)m|=1<<i});return m;
  }
  if(cat.type==="min"){
    const threshold=rollNo>=2?3:2;let m=0;dice.forEach((v,i)=>{if(v<=threshold)m|=1<<i});return m;
  }
  if(cat.type==="kenta"){
    const targets=[[1,2,3,4,5],[2,3,4,5,6]];
    let bestMask=0,bestCount=-1,bestSum=-1;
    for(const target of targets){
      const used=new Set();let m=0,count=0,sum=0;
      dice.forEach((v,i)=>{if(target.includes(v)&&!used.has(v)){used.add(v);m|=1<<i;count++;sum+=v}});
      if(count>bestCount||(count===bestCount&&sum>bestSum)){bestCount=count;bestSum=sum;bestMask=m}
    }
    return bestMask;
  }
  const groups=[];for(let v=1;v<=6;v++)if(cnt[v])groups.push({v,n:cnt[v]});groups.sort((a,b)=>b.n-a.n||b.v-a.v);
  if(cat.type==="full"){
    if(groups[0]?.n>=3){
      let m=aiMaskForFace(dice,groups[0].v,3);
      const pair=groups.find((g,idx)=>idx>0&&g.n>=2);
      if(pair)m|=aiMaskForFace(dice,pair.v,2);
      else {const single=groups.find((g,idx)=>idx>0&&g.n>=1);if(single)m|=aiMaskForFace(dice,single.v,1)}
      return m;
    }
    const pairs=groups.filter(g=>g.n>=2);
    if(pairs.length>=2)return aiMaskForFace(dice,pairs[0].v,2)|aiMaskForFace(dice,pairs[1].v,2);
    if(pairs.length===1){
      let m=aiMaskForFace(dice,pairs[0].v,2);const single=groups.find(g=>g.v!==pairs[0].v);if(single)m|=aiMaskForFace(dice,single.v,1);return m;
    }
    return 0;
  }
  if(cat.type==="poker"||cat.type==="yamb")return groups[0]?aiMaskForFace(dice,groups[0].v):0;
  return 0;
}
function aiPopCount(mask){let n=0;for(let i=0;i<5;i++)if(mask&(1<<i))n++;return n}
function aiPotential(catId,dice,rollNo){
  const cat=CATS.find(c=>c.id===catId),cnt=aiFaceCounts(dice);if(!cat)return AI_NEG;
  const current=aiScoreDice(catId,dice,rollNo);if(current>0)return current+28;
  if(cat.type==="num")return cnt[cat.face]*cat.face*3+(5-cnt[cat.face])*cat.face*.45;
  if(cat.type==="max")return dice.reduce((s,v)=>s+(v>=5?v:4.45),0);
  if(cat.type==="min")return 42-dice.reduce((s,v)=>s+(v<=2?v:2.55),0);
  if(cat.type==="kenta")return aiPopCount(aiTargetHoldMask(catId,dice,rollNo))*13;
  const groups=[];for(let v=1;v<=6;v++)if(cnt[v])groups.push({v,n:cnt[v]});groups.sort((a,b)=>b.n-a.n||b.v-a.v);
  const top=groups[0]||{n:0,v:0},second=groups[1]||{n:0,v:0};
  if(cat.type==="full")return top.n*11+second.n*7+top.v*.6+second.v*.25;
  if(cat.type==="poker")return top.n*15+top.v*.8;
  if(cat.type==="yamb")return top.n*19+top.v;
  return 0;
}
function aiQuickHoldMask(dice,slots,rollNo){
  let bestMask=0,best=AI_NEG;
  const seen=new Set();
  for(const slot of slots){
    const key=slot.colId+":"+slot.catId;if(seen.has(key))continue;seen.add(key);
    const mask=aiTargetHoldMask(slot.catId,dice,rollNo);
    const score=aiPotential(slot.catId,dice,rollNo)+(slot.colId==="free"?-3:slot.colId==="announce"?2:0);
    if(score>best){best=score;bestMask=mask}
  }
  return bestMask===31?0:bestMask;
}
function aiCandidateMasks(dice,slots,rollNo){
  const set=new Set([0]);
  if(slots.length===1){set.add(aiTargetHoldMask(slots[0].catId,dice,rollNo));return [...set].filter(m=>m!==31)}
  for(const slot of slots)set.add(aiTargetHoldMask(slot.catId,dice,rollNo));
  for(let face=1;face<=6;face++){const m=aiMaskForFace(dice,face);if(m)set.add(m)}
  return [...set].filter(m=>m!==31);
}
function aiSeed(salt=0){
  let h=(state.round*2654435761)^(state.rollCount*2246822519)^salt;
  state.dice.forEach((v,i)=>h^=(v+17*i)*((i+3)*374761393));
  h^=countFilled(state.players[1])*668265263;return h>>>0;
}
function aiRng(seed){let x=(seed||0x9e3779b9)>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
function aiRollSim(dice,mask,rng){
  const out=dice.slice();for(let i=0;i<5;i++)if(!(mask&(1<<i)))out[i]=1+Math.floor(rng()*6);return out;
}
function aiRerollPlan(slots,dice,rollNo,salt=0){
  if(!slots.length||rollNo>=3)return null;
  const masks=aiCandidateMasks(dice,slots,rollNo);if(!masks.length)return null;
  const samples=Math.max(36,Math.round((rollNo===1?132:220)*AI_LEVELS[AI_DIFFICULTY].samples));
  let best=null;
  for(const mask of masks){
    const rng=aiRng(aiSeed((salt+1)*1009+mask*9176));let total=0;
    for(let n=0;n<samples;n++){
      const d1=aiRollSim(dice,mask,rng),r1=rollNo+1;
      let value=aiBestWriteOnDice(slots,d1,r1).utility;
      if(r1<3){
        const m2=aiQuickHoldMask(d1,slots,r1);
        const d2=aiRollSim(d1,m2,rng);
        value=Math.max(value,aiBestWriteOnDice(slots,d2,r1+1).utility);
      }
      total+=value;
    }
    const expected=total/samples;
    if(!best||expected>best.expected)best={mask,expected};
  }
  return best;
}
function aiBestAnnouncementPlan(){
  let best=null,idx=0;
  for(const slot of aiAnnouncementSlots()){
    const currentPoints=aiScoreDice(slot.catId,state.dice,state.rollCount);
    const currentValue=aiSlotUtility("announce",slot.catId,currentPoints);
    const plan=aiRerollPlan([slot],state.dice,state.rollCount,500+idx++);
    const expected=Math.max(currentValue,plan?.expected??AI_NEG);
    const mask=plan?.mask??aiTargetHoldMask(slot.catId,state.dice,state.rollCount);
    if(!best||expected>best.expected)best={...slot,expected,mask,currentValue};
  }
  return best;
}
function aiSetHeldMask(mask){state.held=state.held.map((_,i)=>!!(mask&(1<<i)))}
function aiFallbackWrite(){
  const list=aiCurrentWriteCandidates();return aiBestWrite(list);
}
async function aiCommitAndReveal(pick){
  if(!pick)return false;
  const points=scoreFor(pick.catId);
  aiStatus=`AI · writing ${CATS.find(c=>c.id===pick.catId)?.label||pick.catId} · ${points} pts`;
  aiRecentWrite={colId:pick.colId,catId:pick.catId,points};
  const ok=commitScore(1,pick.colId,pick.catId,true);
  if(!ok){aiRecentWrite=null;aiStatus="";return false}
  if(!state.roundOver&&!state.seriesOver){
    renderBoards();
    showTab("p2Board");
    await sleep(2600);
    aiRecentWrite=null;
    aiStatus="";
    renderBoards();
    showTab("activeBoard");
    renderDice();
  }
  return true;
}
async function aiRollOnce(){
  if(state.mode!=="single"||state.current!==1||state.roundOver||state.seriesOver)return false;
  aiStatus=state.rollCount===0?"AI · first throw":"AI · rerolling free dice";
  animationLocked=true;const rolling=[];
  for(let i=0;i<5;i++)if(state.rollCount===0||!state.held[i]){state.dice[i]=randDie();rolling.push(i)}
  state.rollCount++;saveState();render();animateRollCup();sfx.roll(rolling.length);requestAnimationFrame(()=>vibrateDice(rolling));
  await sleep(1250);animationLocked=false;renderBoards();renderDice();return true;
}
async function runAITurn(){
  if(aiRunning||state.mode!=="single"||state.current!==1||state.waiting||state.roundOver||state.seriesOver)return;
  aiRunning=true;
  try{
    aiStatus="AI · reading the score sheet";
    renderDice();
    state.held=[false,false,false,false,false];
    await sleep(900);
    await aiRollOnce();
    while(state.mode==="single"&&state.current===1&&!state.roundOver&&!state.seriesOver){
      const direct=aiBestWrite();
      if(state.rollCount>=3){
        const pick=direct||aiFallbackWrite();
        if(pick){await sleep(700);await aiCommitAndReveal(pick);return}
        break;
      }

      if(state.announced){
        const slots=aiFutureNormalSlots();
        const plan=aiRerollPlan(slots,state.dice,state.rollCount,811);
        if(direct&&(!plan||direct.utility>=plan.expected-AI_EPS)){await sleep(700);await aiCommitAndReveal(direct);return}
        if(plan){
          aiSetHeldMask(plan.mask);aiStatus=`AI · holding ${aiPopCount(plan.mask)} dice`;saveState();renderDice();
          await sleep(850);await aiRollOnce();continue;
        }
        if(direct){await sleep(700);await aiCommitAndReveal(direct);return}
        break;
      }

      const slots=aiFutureNormalSlots();
      const reroll=aiRerollPlan(slots,state.dice,state.rollCount,211);
      const announce=state.rollCount===1?aiBestAnnouncementPlan():null;
      const directValue=direct?.utility??AI_NEG;
      const rerollValue=reroll?.expected??AI_NEG;
      const announceValue=announce?.expected??AI_NEG;

      if(direct&&directValue>=Math.max(rerollValue,announceValue)-AI_EPS){await sleep(750);await aiCommitAndReveal(direct);return}

      if(announce&&announceValue>=rerollValue-.15){
        state.announced=announce.catId;aiSetHeldMask(announce.mask);
        aiStatus=`AI · locks ${CATS.find(c=>c.id===announce.catId)?.label||announce.catId}`;
        saveState();render();await sleep(950);continue;
      }
      if(reroll){
        aiSetHeldMask(reroll.mask);aiStatus=`AI · holding ${aiPopCount(reroll.mask)} dice`;saveState();renderDice();
        await sleep(850);await aiRollOnce();continue;
      }
      if(direct){await sleep(700);await aiCommitAndReveal(direct);return}
      break;
    }
  }finally{aiRunning=false;if(state.current!==1){aiStatus="";renderDice()}}
}
function scheduleAIIfNeeded(){if(state.mode==="single"&&state.started&&state.current===1&&!state.waiting&&!state.roundOver&&!state.seriesOver&&!aiRunning)setTimeout(runAITurn,700)}


function pipsFor(n){
  return [[],[5],[1,9],[1,5,9],[1,3,7,9],[1,3,5,7,9],[1,3,4,6,7,9]][n];
}
function pipGrid(n){
  const set=new Set(pipsFor(n));
  let html="";
  for(let i=1;i<=9;i++){
    html+=`<span class="pip pip-pos-${i} ${set.has(i)?"show":""}"></span>`;
  }
  return html;
}
function idleFaceHTML(index){
  const letters=["Y","A",null,"M","B"];
  if(index===2){
    return `<span class="royal-anchor royal-anchor-premium" aria-hidden="true">
      <svg class="royal-anchor-svg" viewBox="0 0 64 64" focusable="false" aria-hidden="true">
        <circle class="anchor-halo" cx="32" cy="32" r="24"/>
        <path class="anchor-gold anchor-crown" d="M22 10 L26 5 L31 10 L36 5 L42 10 L39.5 15 H24.5 Z"/>
        <circle class="anchor-gold anchor-ring" cx="32" cy="19" r="5.5"/>
        <path class="anchor-body" d="M32 24 V48"/>
        <path class="anchor-gold anchor-stock" d="M20 30 H44"/>
        <path class="anchor-body" d="M14 40 C15 51 22 57 32 57 C42 57 49 51 50 40"/>
        <path class="anchor-body" d="M10 40 L18 41 L14 48"/>
        <path class="anchor-body" d="M54 40 L46 41 L50 48"/>
        <circle class="anchor-rivet" cx="20" cy="30" r="1.5"/>
        <circle class="anchor-rivet" cx="44" cy="30" r="1.5"/>
        <path class="anchor-gold anchor-keel" d="M29 49 H35"/>
      </svg>
    </span>`;
  }
  return `<span class="royal-letter" aria-hidden="true">${letters[index]}</span>`;
}
function dieFaceHTML(index){
  if(state.rollCount===0){
    return idleFaceHTML(index);
  }
  return pipGrid(state.dice[index]);
}
function dieTileHTML(index){
  const held=state.held[index];
  const disabled=state.rollCount===0||state.waiting||state.roundOver||state.seriesOver||animationLocked||(isTeamMode()&&(state.teamAwaitingScore||state.teamReady));
  return `<button
    class="die-tile ${held?"held":""} ${disabled?"disabled":""}"
    data-die="${index}"
    ${disabled?"disabled":""}
    aria-label="Die ${index+1}, value ${state.rollCount===0?"ready":state.dice[index]}, ${held?"held":"free"}">
      <span class="die-index">${String(index+1).padStart(2,"0")}</span>
      <span class="die-face-flat">${dieFaceHTML(index)}</span>
      <span class="die-status">HELD</span>
  </button>`;
}
function vibrateDice(indices){
  indices.forEach((index,order)=>{
    const tile=document.querySelector(`[data-die="${index}"]`);
    if(!tile)return;
    const face=tile.querySelector(".die-face-flat");
    tile.classList.remove("vibrate","a","b","settle","impact");
    tile.style.setProperty("--throw-delay",`${order*18}ms`);
    tile.style.setProperty("--throw-x",`${((index+order)%2?1:-1)*(5+order)}px`);
    tile.style.setProperty("--throw-r",`${((index+order)%2?1:-1)*(9+index*2)}deg`);
    void tile.offsetWidth;
    tile.classList.add("vibrate",(index+order)%2===0?"a":"b");

    // Purely visual face scramble. The authoritative state value is never mutated.
    let tick=0;
    const cadence=26+(order%3)*4;
    const tumbler=setInterval(()=>{
      if(!face || !tile.isConnected){ clearInterval(tumbler); return; }
      let ghost=randDie();
      if(tick>7 && ghost===state.dice[index]) ghost=(ghost%6)+1;
      face.innerHTML=pipGrid(ghost);
      tick++;
    },cadence);

    setTimeout(()=>{
      clearInterval(tumbler);
      if(face && tile.isConnected) face.innerHTML=pipGrid(state.dice[index]);
      tile.classList.remove("vibrate","a","b");
      tile.classList.add("impact");
      setTimeout(()=>{
        tile.classList.remove("impact");
        tile.classList.add("settle");
        setTimeout(()=>tile.classList.remove("settle"),180);
      },95);
    },820+order*18);
  });
}
function animateRollCup(){
  els.rollCup.classList.remove("rolling","impact");
  void els.rollCup.offsetWidth;
  els.rollCup.classList.add("rolling");
  setTimeout(()=>{
    els.rollCup.classList.remove("rolling");
    els.rollCup.classList.add("impact");
    setTimeout(()=>els.rollCup.classList.remove("impact"),140);
  },850);
}

function teamCandidatesForCell(colId,catId){
  return (state.teamCandidates||[]).map((c,i)=>c?{...c,index:i}:null).filter(c=>c&&c.colId===colId&&c.catId===catId);
}
function cellHTML(pi,colId,catId){
  const v=state.players[pi].scores[colId][catId];
  const e=eligibility(pi,colId,catId);
  const canPreview=v===null&&e.ok&&state.rollCount>0&&pi===state.current;
  const pendingCandidates=isTeamMode()&&pi===state.current?teamCandidatesForCell(colId,catId):[];
  const pending=pendingCandidates[0]||null;
  const finalChoice=isTeamMode()&&state.teamReady&&pi===state.current&&v===null&&pendingCandidates.length>0;
  let cls="cellbtn",label=v===null?"·":String(v);
  if(v===null)cls+=" blank";
  if(v===0)cls+=" zero";
  if(e.ok)cls+=" eligible";
  if(canPreview)cls+=" preview";
  if(e.announceCandidate)cls+=" announce-candidate";
  if(e.announced)cls+=" announced";
  if(pending&&v===null)cls+=" team-candidate-pending";
  if(finalChoice)cls+=" team-final-choice";
  if(v===null&&finalChoice)label=String(pending.points);
  else if(v===null&&canPreview)label=String(scoreForCell(colId,catId));
  else if(v===null&&e.announced)label=String(scoreForCell(colId,catId));
  else if(v===null&&pending&&!canPreview)label=String(pending.points);
  const marker=pending&&v===null?`<span class="team-cell-marker">${teamMemberCode(pi,pending.member)}</span><span class="team-cell-points">${pending.points}</span>`:"";
  const title=finalChoice?`Choose ${teamMemberCode(pi,pending.member)} · ${pending.points} points · final team proposal`:e.ok?`${CATS.find(c=>c.id===catId).label}: ${scoreForCell(colId,catId)} points${e.teamCollision?" · same-cell team collision: higher value will be kept":""}`:pending?`${teamMemberCode(pi,pending.member)} runtime proposal · ${pending.points} points`:"";
  const finalIndex=finalChoice?` data-team-final-candidate="${pending.index}"`:"";
  return `<button class="${cls}" data-player="${pi}" data-col="${colId}" data-cat="${catId}"${finalIndex} title="${title}">${marker}<span class="cell-main-value">${label}</span></button>`;
}
function boardHTML(pi){
  const player=state.players[pi];
  const t=totals(player);
  const rows=[];
  const upperAllReady=allColumnsReady(player,upperReady);
  const diffAllReady=allColumnsReady(player,diffReady);
  const comboAllReady=allColumnsReady(player,combosReady);
  const sheetReady=playerSheetReady(player);
  const upperRail=["Y","E","S","H","U","A"];
  const comboRail=["K","I","N","G"];
  const railCell=(text,kind="letter")=>`<td class="g-rail-cell g-rail-${kind}" aria-hidden="true">${text}</td>`;

  for(let i=0;i<6;i++){
    const cat=CATS[i];
    rows.push(`<tr>
      <th class="rowlabel num">${cat.label}</th>
      ${COLS.map(c=>`<td>${cellHTML(pi,c.id,cat.id)}</td>`).join("")}
      ${railCell(upperRail[i])}
    </tr>`);
  }

  rows.push(`<tr class="sumrow">
    <th class="rowlabel">Σ</th>
    ${COLS.map(c=>computedCell(upperReady(player,c.id),upperSectionTotal(player,c.id),"upper-sum")).join("")}
    ${railCell("Σ","sum")}
  </tr>`);

  rows.push(`<tr>
    <th class="rowlabel">+</th>
    ${COLS.map(c=>`<td>${cellHTML(pi,c.id,"max")}</td>`).join("")}
    ${railCell("I")}
  </tr>`);

  rows.push(`<tr>
    <th class="rowlabel">−</th>
    ${COLS.map(c=>`<td>${cellHTML(pi,c.id,"min")}</td>`).join("")}
    ${railCell("S")}
  </tr>`);

  rows.push(`<tr class="sumrow">
    <th class="rowlabel">Σ</th>
    ${COLS.map(c=>computedCell(diffReady(player,c.id),derivedDiff(player,c.id)??0)).join("")}
    ${railCell("Σ","sum")}
  </tr>`);

  [
    ["kenta","S"],
    ["full","F"],
    ["poker","P"],
    ["yamb","Y"]
  ].forEach((m,i)=>{
    rows.push(`<tr>
      <th class="rowlabel">${m[1]}</th>
      ${COLS.map(c=>`<td>${cellHTML(pi,c.id,m[0])}</td>`).join("")}
      ${railCell(comboRail[i])}
    </tr>`);
  });

  rows.push(`<tr class="sumrow">
    <th class="rowlabel">Σ</th>
    ${COLS.map(c=>computedCell(combosReady(player,c.id),colSum(player,c.id,COMBO_IDS))).join("")}
    ${railCell("Σ","sum")}
  </tr>`);

  const activeTurn=pi===state.current&&!state.waiting&&!state.roundOver&&!state.seriesOver;
  const p1Lights=Array.from({length:MATCH_TARGET},(_,i)=>`<span class="mini-light p1 ${i<state.seriesWins[0]?"on":""}"></span>`).join("");
  const p2Lights=Array.from({length:MATCH_TARGET},(_,i)=>`<span class="mini-light p2 ${i<state.seriesWins[1]?"on":""}"></span>`).join("");
  return `<div class="board-inner player-frame player-frame-${pi===0?"blue":"red"} ${activeTurn?"active-turn":""}">
    <div class="board-topline compact-status-strip">
      <div class="board-strip-lights">${p1Lights}</div>
      <div class="board-progress" title="${isTeamMode()?"Team runtime: two normal Yamb sessions per paper entry":"Filled paper cells"}">${isTeamMode()?`${teamRuntimeProgress(pi)}/120`:`${countFilled(player)}/60`}</div>
      <div class="board-strip-lights right">${p2Lights}</div>
    </div>
    <div class="table-shell">
      <table class="yamb">
        <thead>
          <tr>
            <th class="turn-indicator ${activeTurn?"active":""}"><span class="roll-player">${isTeamMode()?teamMemberCode(pi,state.teamMember):`P${pi+1}`}</span></th>
            ${COLS.map(c=>`<th title="${c.title}" aria-label="${c.title}">${columnHeaderHTML(c)}</th>`).join("")}
            <th class="game-indicator">G${state.round}</th>
          </tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
        <tfoot class="board-grid-footer" aria-label="Column guide and turn indicators">
          <tr>
            <th class="grid-foot-cell grid-foot-qr">
              <button type="button" class="grid-qr-btn" data-grid-qr aria-label="Open game controls" title="Open game controls">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-6v-2h4zM14 18h2v2h-2z"/></svg>
              </button>
            </th>
            <td class="grid-foot-cell grid-foot-guide"><b>DOWN</b><i>▼</i></td>
            <td class="grid-foot-cell grid-foot-guide"><b>FREE</b><i>▼▲</i></td>
            <td class="grid-foot-cell grid-foot-guide"><b>UP</b><i>▲</i></td>
            <td class="grid-foot-cell grid-foot-total-label">TOTAL</td>
            <td class="grid-foot-cell grid-foot-total-value">${sheetReady?t.total:"—"}</td>
            <td class="grid-foot-cell grid-foot-throw" aria-label="Throw ${Math.min(3,state.rollCount)}">T${Math.min(3,state.rollCount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>`;
}
function colComboTotal(player){
  let s=0;
  COLS.forEach(c=>{
    ["kenta","full","poker","yamb"].forEach(id=>s+=player.scores[c.id][id]??0);
  });
  return s;
}


function renderMiniLights(container,count,cls){
  container.innerHTML=Array.from({length:MATCH_TARGET},(_,i)=>`<span class="mini-light ${cls} ${i<count?"on":""}"></span>`).join("");
}
function renderSem(container,count,cls){
  container.innerHTML=Array.from({length:MATCH_TARGET},(_,i)=>`<span class="slight ${cls} ${i<count?"on":""}"></span>`).join("");
}
function playerInitials(name,fallback="P"){
  const raw=String(name||"").trim();
  if(/^(harbour\s+ai|ai)$/i.test(raw)) return "AI";
  const parts=raw.split(/\s+/).filter(Boolean);
  if(!parts.length)return fallback;
  const text=parts.length===1?parts[0].slice(0,2):parts[0][0]+parts[parts.length-1][0];
  return text.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,2)||fallback;
}
function renderHeader(){
  const a=totals(state.players[0]).total;
  const b=totals(state.players[1]).total;

  els.p1NameTop.textContent=state.players[0].name;
  els.p2NameTop.textContent=state.players[1].name;
  if(els.p1AvatarTop){
    if(els.p1AvatarTop.tagName!=="IMG")els.p1AvatarTop.textContent=playerInitials(state.players[0].name,"P1");
    els.p1AvatarTop.setAttribute("aria-label",`${state.players[0].name} profile`);
    if(els.p1AvatarTop.tagName==="IMG")els.p1AvatarTop.alt=`${state.players[0].name} profile`;
  }
  if(els.p2AvatarTop){
    if(els.p2AvatarTop.tagName!=="IMG")els.p2AvatarTop.textContent=playerInitials(state.players[1].name,"P2");
    els.p2AvatarTop.setAttribute("aria-label",`${state.players[1].name} profile`);
    if(els.p2AvatarTop.tagName==="IMG")els.p2AvatarTop.alt=`${state.players[1].name} profile`;
  }
  els.p1ScoreTop.textContent=a;
  els.p2ScoreTop.textContent=b;
  els.ratio1.textContent=a;
  els.ratio2.textContent=b;

  els.p1Head.classList.toggle("active",state.current===0&&!state.waiting&&!state.roundOver);
  els.p2Head.classList.toggle("active",state.current===1&&!state.waiting&&!state.roundOver);

  renderMiniLights(els.miniLights1,state.seriesWins[0],"p1");
  renderMiniLights(els.miniLights2,state.seriesWins[1],"p2");
}
function renderBoards(){
  const roundStrip=state.roundOver&&roundSummaryDismissed?`<button type="button" class="round-reopen-strip" data-reopen-round>GAME COMPLETE · OPEN RESULT</button>`:"";
  els.activeBoard.innerHTML=roundStrip+(state.mode==="online"?`<div class="remote-strip ${state.remoteLock?"locked":"ready"}"><span><b>${state.remoteLock?"LIVE P2P · WAITING":"LIVE P2P · LOCAL CONTROL"}</b> · ${esc(state.players[state.current].name)} · ROOM ${esc(shortRoomId())}</span><span>REV ${state.revision||0}</span></div>`:"")+boardHTML(state.current);
  els.p1Board.innerHTML=paperSheetHTML(0);
  els.p2Board.innerHTML=paperSheetHTML(1);
}
function resetTeamTurnState(){
  state.teamMember=0;state.teamHands=[null,null];state.teamFirstHands=[null,null];state.teamCandidates=[null,null];state.teamAwaitingScore=false;state.teamSelected=null;state.teamReady=false;
  teamDecisionDismissed=false;
  if(els.teamDecisionModal){els.teamDecisionModal.classList.remove("show");els.teamDecisionModal.setAttribute("aria-hidden","true");}
}
function sameTeamCandidateCell(a,b){return !!a&&!!b&&a.colId===b.colId&&a.catId===b.catId}
function openTeamDecisionConfirmation(index){
  if(!isTeamMode()||!state.teamReady||![0,1].includes(index))return false;
  closeTeamDecisionChooser(true);
  const c=state.teamCandidates?.[index];if(!c)return false;
  const team=state.players[state.current];
  const eyebrow=els.scoreConfirmModal.querySelector(".modal-eyebrow");if(eyebrow)eyebrow.textContent="TEAM DECISION · FINAL PAPER WRITE";
  pendingScoreConfirmation={playerIndex:state.current,teamMember:index,colId:c.colId,catId:c.catId,kind:"team-decision",points:c.points,signature:scoreStateSignature()};
  els.confirmPlayer.textContent=`${team?.name||`Team ${state.current+1}`} · ${teamMemberCode(state.current,index)}`;
  els.confirmColumn.textContent=colLabel(c.colId).toUpperCase();
  els.confirmCategory.textContent=catLabel(c.catId);
  els.confirmRoll.textContent=`${c.rollNo}${c.rollNo===1?"st":c.rollNo===2?"nd":"rd"} roll`;
  els.confirmPoints.textContent=String(c.points);
  els.scoreConfirmTitle.textContent=`Accept ${teamMemberCode(state.current,index)} as Final`;
  els.scoreConfirmWarning.textContent=`This is the final team decision. ${teamMemberCode(state.current,index)} will be written to the paper for ${c.points} points and control will pass to ${state.players[1-state.current]?.name||"the other team"}. The other proposal will be discarded.`;
  setConfirmActionButton("team-decision");
  els.scoreConfirmModal.classList.add("show");els.scoreConfirmModal.setAttribute("aria-hidden","false");
  sfx.uiOpen();return true;
}
function closeTeamDecisionChooser(dismiss=true){
  if(!els.teamDecisionModal)return;
  els.teamDecisionModal.classList.remove("show");els.teamDecisionModal.setAttribute("aria-hidden","true");
  if(dismiss)teamDecisionDismissed=true;
}
function openTeamDecisionChooser(force=false){
  if(!isTeamMode()||!state.teamReady||!els.teamDecisionModal||pendingScoreConfirmation)return false;
  const a=state.teamCandidates?.[0],b=state.teamCandidates?.[1];if(!a||!b)return false;
  if(sameTeamCandidateCell(a,b))return false;
  if(teamDecisionDismissed&&!force)return false;
  const team=state.players[state.current]?.name||`Team ${state.current+1}`;
  els.teamDecisionTitle.textContent=`${team} · Choose Final Proposal`;
  els.teamDecisionSubtitle.textContent=`${teamMemberCode(state.current,0)} and ${teamMemberCode(state.current,1)} are complete. Nothing is on paper yet.`;
  const choice=(c,i)=>`<button type="button" class="team-choice-modal-btn" data-team-decision-choice="${i}" aria-label="Select ${teamMemberCode(state.current,i)}, ${c.points} points"><span class="team-choice-modal-code">${teamMemberCode(state.current,i)}</span><span class="team-choice-modal-cell">${esc(colLabel(c.colId).toUpperCase())} · ${esc(catLabel(c.catId))}</span><span class="team-choice-modal-meta">THROW ${c.rollNo}/3 · RUNTIME PROPOSAL</span><strong class="team-choice-modal-points">${c.points}<small>PTS</small></strong></button>`;
  els.teamDecisionChoices.innerHTML=choice(a,0)+choice(b,1);
  els.teamDecisionModal.classList.add("show");els.teamDecisionModal.setAttribute("aria-hidden","false");
  return true;
}
function selectTeamCandidate(index){
  closeTeamDecisionChooser(true);
  return openTeamDecisionConfirmation(index);
}
function commitSelectedTeamCandidate(){
  
  if(!isTeamMode()||!state.teamReady)return false;
  const a=state.teamCandidates?.[0],b=state.teamCandidates?.[1];if(!a||!b)return false;
  if(sameTeamCandidateCell(a,b))return resolveTeamCandidates(state.current);
  if(state.teamSelected!==0&&state.teamSelected!==1)return false;
  return openTeamDecisionConfirmation(state.teamSelected);
}
function renderTeamTurnPanel(){
  const panel=document.getElementById("teamTurnPanel");if(!panel)return;
  if(!isTeamMode()){panel.hidden=true;panel.innerHTML="";return}
  panel.hidden=false;
  const team=state.players[state.current]?.name||`Team ${state.current===0?"Alpha":"Omega"}`;
  const code=teamMemberCode(state.current,state.teamMember);
  const first=state.teamCandidates?.[0];
  const pending=first&&state.teamMember===1?`<span class="team-saved">${teamMemberCode(state.current,0)} PROPOSAL · ${esc(colLabel(first.colId).toUpperCase())} / ${esc(catLabel(first.catId))} · ${first.points}</span>`:"";
  if(state.teamReady){
    const a=state.teamCandidates?.[0],b=state.teamCandidates?.[1];
    const choice=(c,i)=>`<button type="button" class="team-hand-choice" data-team-candidate="${i}" aria-label="Choose ${teamMemberCode(state.current,i)}: ${c.points} points in ${esc(colLabel(c.colId))} ${esc(catLabel(c.catId))}"><span class="team-proposal-code">${teamMemberCode(state.current,i)}</span><b>${esc(colLabel(c.colId).toUpperCase())} · ${esc(catLabel(c.catId))}</b><strong class="team-proposal-score">${c.points}</strong><small>PTS</small></button>`;
    panel.innerHTML=`<div class="team-ready-title"><b>${esc(team)} · TEAM DECISION</b><span>2 NORMAL YAMB SESSIONS COMPLETE · nothing is on paper yet</span></div><div class="team-hand-grid">${choice(a,0)}${choice(b,1)}</div><div class="team-decision-actions"><span>TAP ${teamMemberCode(state.current,0)} OR ${teamMemberCode(state.current,1)} · CONFIRM IN DIALOG · THEN CONTROL PASSES TO THE OTHER TEAM</span></div>`;
    return;
  }
  if(state.teamAwaitingScore){
    panel.innerHTML=`<div class="team-ready-title"><b>${esc(team)} · ${code} · SELECT PROPOSAL</b><span>THROW 3 / 3 COMPLETE · choose exactly as in a normal 1v1 turn${state.announced?` · announcement ${esc(catLabel(state.announced))}`:""}</span></div>${pending?`<div class="team-turn-status"><b>${code} READY</b><span>SESSION COMPLETE</span><span>SELECT CELL</span>${pending}</div>`:""}`;
    return;
  }
  panel.innerHTML=`<div class="team-turn-status"><b>${esc(team)} · ${code}</b><span>CHANCE ${state.teamMember+1} / 2</span><span>THROW ${state.rollCount} / 3</span>${pending}</div>`;
}
function renderDice(){
  els.diceBank.innerHTML=state.dice.map((_,i)=>dieTileHTML(i)).join("");
  els.rollCup.disabled=!state.started||state.waiting||state.roundOver||state.seriesOver||animationLocked||state.rollCount>=3||!localControlAllowed(state.current)||(isTeamMode()&&state.teamAwaitingScore);
  els.cupRollNo.textContent=state.rollCount>=3?"×":String(state.rollCount+1);
  const rollLabel=els.rollCup.querySelector(".roll-label");
  const rollIcon=els.rollCup.querySelector(".rotate-icon");
  if(rollLabel) rollLabel.textContent="";
  if(rollIcon && !rollIcon.querySelector(".dice-cup-mark")) rollIcon.innerHTML=`<svg class="dice-cup-mark" viewBox="0 0 64 64" focusable="false" aria-hidden="true"><path class="cup-rim" d="M16 18h32M20 14h24"></path><path class="cup-body" d="M19 20h26l-4 28H23l-4-28Z"></path><path class="cup-band" d="M22 29h20M24 42h16"></path></svg>`;
  renderTeamTurnPanel();
  els.dockInfo.textContent=aiStatus || (isTeamMode()
    ? state.teamReady?`${state.players[state.current].name} · FINAL TEAM CHOICE · TAP ${teamMemberCode(state.current,0)} OR ${teamMemberCode(state.current,1)}`:state.teamAwaitingScore?`${teamMemberCode()} · 3/3 · SELECT A LEGAL SCORE`: `${state.players[state.current].name} · ${teamMemberCode()} · CHANCE ${state.teamMember+1}/2 · ${3-state.rollCount} THROWS LEFT`
    : state.announced
    ? `ANNOUNCEMENT: ${CATS.find(c=>c.id===state.announced).label}`
    : state.rollCount===0?"GAME READY · CUP DIE ROLLS ALL FIVE":"TAP DIE = HOLD · SCORE OR ROLL AGAIN");
}
function renderMatch(){
  const a=totals(state.players[0]).total;
  const b=totals(state.players[1]).total;
  const solo=state.mode==="solo";
  els.matchName1.textContent=state.players[0].name;
  els.matchName2.textContent=solo?"SOLO":state.players[1].name;
  const ma1=document.querySelector(".match-card.p1 .match-avatar"),ma2=document.querySelector(".match-card.p2 .match-avatar");
  if(ma1){ma1.textContent=playerInitials(state.players[0].name,"P1");ma1.setAttribute("aria-label",`${state.players[0].name} profile`)}
  if(ma2){ma2.textContent=solo?"S":playerInitials(state.players[1].name,"P2");ma2.setAttribute("aria-label",solo?"Solo profile":`${state.players[1].name} profile`)}
  els.matchScore1.textContent=a;
  els.matchScore2.textContent=solo?"—":b;
  els.semaphoreTitle.textContent=solo?"BEST SOLO TOTAL":`${isTeamMode()?"TEAM ":""}SEMAPHORE · FIRST TO ${MATCH_TARGET}`;if(els.matchTargetLabel)els.matchTargetLabel.textContent=`FIRST TO ${MATCH_TARGET}`;
  els.semaphoreRace.textContent=solo?`${a} PTS`:`${state.seriesWins[0]} : ${state.seriesWins[1]}`;
  renderSem(els.sem1,solo?0:state.seriesWins[0],"p1");
  renderSem(els.sem2,solo?0:state.seriesWins[1],"p2");
  renderMatchHistory();
}
function renderVariantSelection(){
  if(setupSingleVariant==="solo"&&!els.setupSoloName.matches(":focus")&&(!els.setupSoloName.value.trim()||/^(Team Alpha|Team Omega|Solo Log)$/i.test(els.setupSoloName.value.trim())))els.setupSoloName.value="Player 1";
  const soloCard=document.getElementById("startSoloBtn"),aiCard=document.getElementById("startSingleBtn");
  const duelCard=document.getElementById("hotseatDuelCard"),teamCard=document.getElementById("hotseatTeamCard");
  const onlineDuel=document.getElementById("onlineDuelCard"),onlineTeam=document.getElementById("onlineTeamCard"),onlineCrew=document.getElementById("onlineCrewCard");
  const singleStart=document.getElementById("singleVariantStartBtn");
  const hotStart=document.getElementById("startBtn");
  [[soloCard,"solo"],[aiCard,"ai"]].forEach(([card,key])=>{if(card){const on=setupSingleVariant===key;card.classList.toggle("selected",on);card.setAttribute("aria-checked",String(on))}});
  [[duelCard,"duel"],[teamCard,"team"]].forEach(([card,key])=>{if(card){const on=setupHotseatVariant===key;card.classList.toggle("selected",on);card.setAttribute("aria-checked",String(on))}});
  [[onlineDuel,"duel"],[onlineTeam,"team"],[onlineCrew,"crew"]].forEach(([card,key])=>{if(card){const on=setupOnlineVariant===key;card.classList.toggle("selected",on);card.setAttribute("aria-checked",String(on))}});
  if(singleStart){singleStart.querySelector("span").textContent=setupSingleVariant==="ai"?"START DUEL":"START SOLO";singleStart.querySelector("small").textContent=setupSingleVariant==="ai"?"LAI":"LSO";}
  if(hotStart){hotStart.querySelector("span").textContent=setupHotseatVariant==="team"?"START TEAM":"START DUEL";let sm=hotStart.querySelector("small");if(!sm){sm=document.createElement("small");hotStart.appendChild(sm)}sm.textContent=setupHotseatVariant==="team"?"LTM":"LDU";}
  const l1=document.getElementById("setupP1Label"),l2=document.getElementById("setupP2Label");
  if(l1)l1.textContent=setupHotseatVariant==="team"?"TEAM ALPHA":"PLAYER 1";
  if(l2)l2.textContent=setupHotseatVariant==="team"?"TEAM OMEGA":"PLAYER 2";
  if(setupHotseatVariant==="team"){
    if(!els.setupP1.matches(":focus")&&(!els.setupP1.value.trim()||/^Player 1$/i.test(els.setupP1.value.trim())))els.setupP1.value="Team Alpha";
    if(!els.setupP2.matches(":focus")&&(!els.setupP2.value.trim()||/^Player 2$/i.test(els.setupP2.value.trim())))els.setupP2.value="Team Omega";
  }else{
    if(!els.setupP1.matches(":focus")&&/^Team Alpha$/i.test(els.setupP1.value.trim()))els.setupP1.value="Player 1";
    if(!els.setupP2.matches(":focus")&&/^Team Omega$/i.test(els.setupP2.value.trim()))els.setupP2.value="Player 2";
  }
  const ol1=document.getElementById("onlineP1Label"),ol2=document.getElementById("onlineP2Label");
  if(ol1)ol1.textContent=setupOnlineVariant==="crew"?"HOST · A1":setupOnlineVariant==="team"?"TEAM ALPHA":"PLAYER 1";
  if(ol2)ol2.textContent=setupOnlineVariant==="crew"?"YOUR CREW NAME":setupOnlineVariant==="team"?"TEAM OMEGA":"PLAYER 2";
  if(setupOnlineVariant==="team"){
    if(!els.onlineP1.matches(":focus")&&(!els.onlineP1.value.trim()||/^Player 1$/i.test(els.onlineP1.value.trim())))els.onlineP1.value="Team Alpha";
    if(!els.onlineP2.matches(":focus")&&(!els.onlineP2.value.trim()||/^Player 2$/i.test(els.onlineP2.value.trim())))els.onlineP2.value="Team Omega";
  }else if(setupOnlineVariant==="crew"){
    if(!els.onlineP1.matches(":focus")&&(!els.onlineP1.value.trim()||/^(Player 1|Team Alpha)$/i.test(els.onlineP1.value.trim())))els.onlineP1.value="Player A1";
    if(!els.onlineP2.matches(":focus")&&(!els.onlineP2.value.trim()||/^(Player 2|Team Omega)$/i.test(els.onlineP2.value.trim())))els.onlineP2.value="Crew Player";
  }else{
    if(!els.onlineP1.matches(":focus")&&/^Team Alpha$/i.test(els.onlineP1.value.trim()))els.onlineP1.value="Player 1";
    if(!els.onlineP2.matches(":focus")&&/^Team Omega$/i.test(els.onlineP2.value.trim()))els.onlineP2.value="Player 2";
  }
}
function renderControlModal(){
  const controlSection=modalSectionForMode(modalMode);
  if(controlSection==="hotseat"&&(!els.setupP2.value.trim()||/^(Harbour AI|Solo Log)$/i.test(els.setupP2.value.trim())))els.setupP2.value="Player 2";
  document.querySelectorAll("[data-mode-tab]").forEach(b=>b.classList.toggle("active",b.dataset.modeTab===controlSection));
  document.querySelectorAll("[data-mode-panel]").forEach(p=>p.classList.toggle("active",p.dataset.modePanel===controlSection));
  const setupModeLabel=controlSection==="single"?(setupSingleVariant==="ai"?"LOCAL · SINGLE · DUEL":"LOCAL · SINGLE · SOLO"):controlSection==="hotseat"?(setupHotseatVariant==="team"?"LOCAL · HOTSEAT · TEAM":"LOCAL · HOTSEAT · DUEL"):(setupOnlineVariant==="crew"?"ONLINE · CREW":setupOnlineVariant==="team"?"ONLINE · TEAM":"ONLINE · DUEL");
  const setupModeCode=controlSection==="single"?(setupSingleVariant==="ai"?"LAI":"LSO"):controlSection==="hotseat"?(setupHotseatVariant==="team"?"LTM":"LDU"):(setupOnlineVariant==="crew"?"OCR":setupOnlineVariant==="team"?"OTM":"ODU");
  els.controlModeLabel.textContent=`${setupModeCode} · ${setupModeLabel}`;
  els.controlGameLabel.textContent=`G${state.round}`;
  els.controlStateLabel.textContent=stateLabel();
  if(state.started){
    if(!els.setupP1.value)els.setupP1.value=state.players[0].name;if(!els.setupP2.value)els.setupP2.value=state.players[1].name;
    if(!els.setupSoloName.value)els.setupSoloName.value=state.players[0].name;
    if(!els.onlineP1.value)els.onlineP1.value=state.players[0].name;if(!els.onlineP2.value)els.onlineP2.value=state.players[1].name;
  }
  renderVariantSelection();
  if(state.mode==="online"){
    if(state.localPlayer===1&&state.onlineRoomId&&!els.onlineCodeInput.matches(":focus"))els.onlineCodeInput.value=state.onlineRoomId;
    const roomReadout=document.getElementById("onlineRoomReadout");if(roomReadout)roomReadout.textContent=state.localPlayer===0&&state.onlineRoomId?state.onlineRoomId:"—";
    if(state.onlineRoomId)setOnlineStatus(onlineRoomStatus(),state.onlinePeerJoined?"good":"");
  }
}

function render(){
  document.documentElement.dataset.gameMode=state.mode||"hotseat";document.documentElement.dataset.gameFormat=state.format||"DUEL";
  applyTheme(state.current);
  renderHeader();
  renderBoards();
  renderDice();
  renderMatch();
  renderTomb();
  hydrateColumnSemanticIcons();
  renderControlModal();
  renderOnlineLobby();
  if(els.teamDecisionModal){
    if(!isTeamMode()||!state.teamReady){closeTeamDecisionChooser(false);teamDecisionDismissed=false;}
    else if(!teamDecisionDismissed&&!pendingScoreConfirmation)openTeamDecisionChooser(false);
  }

  els.setupModal.classList.toggle("show",!state.started||menuOpen);
  els.resumeBtn.style.display=state.started?"inline-flex":"none";
  els.menuResetBtn.style.display=state.started?"inline-flex":"none";
  els.menuCloseBtn.style.display=state.started?"grid":"none";
  const handoffVisible=state.mode==="hotseat"&&state.waiting;
  els.switchModal.classList.toggle("show",handoffVisible);
  els.switchModal.setAttribute("aria-hidden",handoffVisible?"false":"true");
  if(handoffVisible)ensureAutoHandoff();else clearAutoHandoff(false);
  els.roundModal.classList.toggle("show",state.roundOver&&!roundSummaryDismissed);
}


function autoResolveAnnouncement(){
  if(isTeamMode())return false;
  if(!state.announced||state.rollCount<3||animationLocked||state.roundOver||state.seriesOver)return false;
  const playerIndex=state.current;
  const catId=state.announced;
  const e=eligibility(playerIndex,"announce",catId);
  if(!e.ok)return false;
  commitScore(playerIndex,"announce",catId,true);
  return true;
}
function rollDice(){
  if(!state.started||state.waiting||state.roundOver||state.seriesOver||animationLocked||state.rollCount>=3||!localControlAllowed(state.current))return;
  if(isTeamMode()&&(state.teamAwaitingScore||state.teamReady))return;
  ensureAudio();animationLocked=true;
  const rollingIndices=[];
  for(let i=0;i<5;i++){
    if(state.rollCount===0||!state.held[i]){state.dice[i]=randDie();rollingIndices.push(i)}
  }
  state.rollCount++;
  trace("dice.rolled",{player:state.current,seat:isTeamMode()?teamMemberCode():null,roll:state.rollCount,dice:[...state.dice],held:[...state.held],rolled:[...rollingIndices]});
  if(isTeamMode()&&state.rollCount===1)state.teamFirstHands[state.teamMember]=[...state.dice];
  saveState();render();animateRollCup();sfx.roll(rollingIndices.length);requestAnimationFrame(()=>vibrateDice(rollingIndices));
  setTimeout(()=>{
    animationLocked=false;
    if(isTeamMode()&&state.rollCount>=3){
      // A normal Yamb turn has reached its maximum. No fourth roll: the member must
      // now choose one currently legal cell. HAND is intentionally no longer legal here.
      state.teamHands[state.teamMember]=[...state.dice];
      state.teamAwaitingScore=true;
      state.held=[false,false,false,false,false];
      saveState();renderBoards();renderDice();return;
    }
    if(autoResolveAnnouncement())return;
    saveState();renderBoards();renderDice();
  },980);
}

function toggleHold(index){
  if(animationLocked||state.rollCount===0||state.waiting||state.roundOver||!localControlAllowed(state.current)||(isTeamMode()&&(state.teamAwaitingScore||state.teamReady)))return;
  state.held[index]=!state.held[index];
  trace(state.held[index]?"die.held":"die.released",{player:state.current,seat:isTeamMode()?teamMemberCode():null,index,value:state.dice[index],roll:state.rollCount});
  state.held[index]?sfx.hold():sfx.release();
  saveState();
  renderDice();
}

function completeTurnAfterWrite(teamResolution=""){
  if(gameComplete()){finishRound();return true}
  state.current=state.mode==="solo"?0:1-state.current;state.rollCount=0;state.dice=[1,1,1,1,1];state.held=[false,false,false,false,false];state.announced=null;
  if(isTeamMode())resetTeamTurnState();
  if(state.mode==="solo"){
    state.waiting=false;
  }else if(state.mode==="hotseat"){
    state.waiting=true;applyTheme(state.current);
    handoffNote=teamResolution||"";
    setTimeout(()=>sfx.turnHandoff(state.current),210);
  }else if(state.mode==="single"){
    state.waiting=false;setTimeout(()=>sfx.turnHandoff(state.current),180);
  }else if(state.mode==="online"){
    state.waiting=false;state.remoteLock=true;modalMode="online";setTimeout(()=>sfx.turnHandoff(state.current),210);
  }
  saveState();render();if(state.mode==="online")queueOnlinePush("turn-complete");if(state.mode==="single")scheduleAIIfNeeded();return true;
}
function resolveTeamCandidates(playerIndex,selectedMember=null){
  const a=state.teamCandidates?.[0],b=state.teamCandidates?.[1];if(!a||!b)return false;
  const sheet=state.players[playerIndex].scores;
  let chosen=null,note="";
  if(sameTeamCandidateCell(a,b)){
    chosen=b.points>a.points?b:a;
    const kept=Math.max(a.points,b.points);
    sheet[chosen.colId][chosen.catId]=kept;
    note=`Same-cell proposal resolved automatically: ${teamMemberCode(playerIndex,chosen.member)} wrote ${kept} points to ${colLabel(chosen.colId)} / ${catLabel(chosen.catId)} (${a.points} vs ${b.points}).`;
  }else{
    if(selectedMember!==0&&selectedMember!==1)return false;
    chosen=state.teamCandidates[selectedMember];
    if(!chosen)return false;
    sheet[chosen.colId][chosen.catId]=chosen.points;
    note=`Team decision: ${teamMemberCode(playerIndex,chosen.member)} proposal committed to ${colLabel(chosen.colId)} / ${catLabel(chosen.catId)} for ${chosen.points} points. The other runtime proposal was discarded.`;
  }
  trace("team.decision",{team:playerIndex,selectedSeat:teamMemberCode(playerIndex,chosen.member),column:chosen.colId,category:chosen.catId,points:chosen.points,automatic:sameTeamCandidateCell(a,b),proposals:[structuredClone(a),structuredClone(b)]});
  sfx.teamDecision();resetTeamTurnState();return completeTurnAfterWrite(note);
}
function stageTeamCandidate(playerIndex,colId,catId){
  // Exactly one ordinary Yamb write decision completes each team-member chance.
  // It may happen after roll 1, 2 or 3, subject to the same column rules as 1v1.
  if(!isTeamMode()||state.teamReady||state.rollCount<1||state.rollCount>3)return false;
  const member=state.teamMember,points=scoreForCell(colId,catId);
  state.teamCandidates[member]={member,colId,catId,points,dice:[...state.dice],rollNo:state.rollCount,announced:colId==="announce",createdAt:Date.now()};
  trace("team.proposal",{team:playerIndex,seat:teamMemberCode(playerIndex,member),column:colId,category:catId,points,roll:state.rollCount,dice:[...state.dice]});
  state.teamHands[member]=[...state.dice];
  if(member===0){
    teamDecisionDismissed=false;
    sfx.teamProposal();state.teamMember=1;state.teamAwaitingScore=false;state.teamReady=false;state.teamSelected=null;
    state.rollCount=0;state.dice=[1,1,1,1,1];state.held=[false,false,false,false,false];state.announced=null;
    if(state.mode==="hotseat"){
      state.waiting=true;
      handoffNote=`${teamMemberCode(playerIndex,0)} proposal is stored safely in runtime. ${teamMemberCode(playerIndex,1)} now gets a fresh three-roll chance.`;
    }
    saveState();render();if(state.mode==="online"&&isCrewOnline())queueOnlinePush("team-member-handoff");setTimeout(()=>sfx.turnHandoff(playerIndex),190);return true;
  }
  state.teamAwaitingScore=false;state.teamReady=true;state.teamSelected=null;state.held=[false,false,false,false,false];state.announced=null;
  teamDecisionDismissed=false;
  saveState();
  const a=state.teamCandidates[0],b=state.teamCandidates[1];
  if(sameTeamCandidateCell(a,b))return resolveTeamCandidates(playerIndex);
  render();sfx.teamProposal();setTimeout(()=>openTeamDecisionChooser(false),0);return true;
}
function commitScore(playerIndex,colId,catId,auto=false){
  if(isTeamMode())return stageTeamCandidate(playerIndex,colId,catId);
  const points=scoreForCell(colId,catId);state.players[playerIndex].scores[colId][catId]=points;
  trace("score.committed",{player:playerIndex,column:colId,category:catId,points,roll:state.rollCount,dice:[...state.dice],automatic:!!auto});
  points===0?sfx.zeroScore():sfx.scoreCommit();
  return completeTurnAfterWrite();
}
function scoreCell(playerIndex,colId,catId){
  if(animationLocked||!localControlAllowed(playerIndex)||pendingScoreConfirmation)return;
  const e=eligibility(playerIndex,colId,catId);if(!e.ok){if(state.started&&state.rollCount>0)sfx.invalid();return;}
  if(colId==="announce"&&!state.announced){openScoreConfirmation(playerIndex,colId,catId,"announce");return}
  openScoreConfirmation(playerIndex,colId,catId,"score");
}


const TOMB_STORAGE_KEY="leaderboard.solo";
function loadTombLedger(){
  const raw=window.YambPersistence?.getSync(TOMB_STORAGE_KEY,[]);
  return Array.isArray(raw)?raw:[];
}
function saveTombLedger(entries){window.YambPersistence?.set(TOMB_STORAGE_KEY,Array.isArray(entries)?entries.slice(-500):[])}
function recordTombResult(id,name,score,completedAt=new Date().toISOString()){
  const entries=loadTombLedger();
  const key=String(id||`solo-${completedAt}-${name}-${score}`);
  if(entries.some(r=>r.id===key))return;
  entries.push({id:key,name:String(name||"Player 1").slice(0,24),score:Math.max(0,Math.round(Number(score)||0)),completedAt});
  saveTombLedger(entries);
}
function syncTombFromHistory(){
  const entries=loadTombLedger(),seen=new Set(entries.map(r=>r.id));
  let changed=false;
  for(const h of state.history||[]){
    if(h?.mode!=="solo")continue;
    const id=String(h.id||`history-${h.completedAt}-${h.players?.[0]?.name||"Player 1"}`);
    if(seen.has(id))continue;
    entries.push({id,name:String(h.players?.[0]?.name||"Player 1").slice(0,24),score:Math.max(0,Math.round(Number(h.totals?.[0])||0)),completedAt:h.completedAt||new Date().toISOString()});
    seen.add(id);changed=true;
  }
  if(changed)saveTombLedger(entries);
  return entries;
}
function tombProfiles(){
  const entries=syncTombFromHistory();
  const byName=new Map();
  for(const r of entries){
    const key=(r.name||"Player 1").trim().toLocaleLowerCase()||"player 1";
    if(!byName.has(key))byName.set(key,{name:r.name||"Player 1",results:[]});
    byName.get(key).results.push(r);
  }
  return [...byName.values()].map(p=>{
    const best=[...p.results].sort((a,b)=>b.score-a.score||new Date(b.completedAt)-new Date(a.completedAt));
    const recent=[...p.results].sort((a,b)=>new Date(b.completedAt)-new Date(a.completedAt));
    return {...p,best:best[0]?.score||0,bestFive:best.slice(0,5),latest:recent[0]?.completedAt||"",runs:p.results.length};
  }).sort((a,b)=>b.best-a.best||new Date(b.latest)-new Date(a.latest)||a.name.localeCompare(b.name));
}
function tombDateTime(value){
  try{return new Intl.DateTimeFormat(undefined,{year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(value))}catch{return String(value||"")}
}
function renderTomb(){
  if(!els.tombLedger)return;
  const openNames=new Set([...els.tombLedger.querySelectorAll("details[open][data-tomb-name]")].map(d=>d.dataset.tombName));
  const profiles=tombProfiles();
  if(!profiles.length){
    els.tombLedger.innerHTML=`<div class="tomb-empty"><span class="tomb-empty-mark">☠</span><b>NO CASUALTIES RECORDED</b><p>Complete a LOCAL · SOLO score sheet. The first mathematically documented disaster will be filed here.</p></div>`;
    return;
  }
  const leaderboard=`<section class="tomb-table-wrap"><div class="tomb-section-label">REGISTER · HIGHEST VERIFIED SOLO TOTALS</div><table class="tomb-table"><thead><tr><th>NO.</th><th>PLAYER</th><th>FILES</th><th>HIGHEST SCORE</th></tr></thead><tbody>${profiles.map((p,i)=>`<tr><td>${String(i+1).padStart(2,"0")}</td><td>${esc(p.name)}</td><td>${p.runs}</td><td class="tomb-score">${p.best}</td></tr>`).join("")}</tbody></table></section>`;
  const dossiers=`<section class="tomb-dossiers"><div class="tomb-section-label">PERSONNEL DOSSIERS · BEST FIVE RECORDED OUTCOMES</div>${profiles.map((p,i)=>{
    const key=p.name.toLocaleLowerCase();
    const open=i===0||openNames.has(key)?" open":"";
    return `<details class="tomb-player" data-tomb-name="${esc(key)}"${open}><summary><span class="tomb-rank">${String(i+1).padStart(2,"0")}</span><span class="tomb-player-name">${esc(p.name)}<small>${p.runs} SOLO ${p.runs===1?"FILE":"FILES"} · LAST ENTRY ${esc(tombDateTime(p.latest))}</small></span><span class="tomb-best-label">PERSONAL BEST</span><strong>${p.best}</strong></summary><div class="tomb-player-body"><table><thead><tr><th>RANK</th><th>RECORDED</th><th>SCORE</th></tr></thead><tbody>${p.bestFive.map((r,j)=>`<tr><td>${j+1}</td><td>${esc(tombDateTime(r.completedAt))}</td><td>${r.score}</td></tr>`).join("")}</tbody></table></div></details>`;
  }).join("")}</section>`;
  els.tombLedger.innerHTML=leaderboard+dossiers;
}

function gameComplete(){
  const complete=p=>COLS.every(c=>CATS.every(cat=>p.scores[c.id][cat.id]!==null));
  return state.mode==="solo"?complete(state.players[0]):state.players.every(complete);
}

function finishRound(){
  roundSummaryDismissed=false;
  const a=totals(state.players[0]).total;
  const b=totals(state.players[1]).total;
  state.roundOver=true;state.waiting=false;

  if(state.mode==="solo"){
    archiveCurrentGame(0,a,0);
    const tombArchive=state.history[state.history.length-1];
    recordTombResult(tombArchive?.id,state.players[0].name,a,tombArchive?.completedAt||new Date().toISOString());
    els.roundTitle.textContent="SOLO SHEET COMPLETE";
    els.roundDesc.textContent="The completed paper has been archived in Match History.";
    els.roundScore.innerHTML=`<div class="rs">${esc(state.players[0].name)} <b>${a}</b></div>`;
    els.roundLights.innerHTML="";
    els.nextGameBtn.textContent="NEW SOLO SHEET";
    trace("game.completed",{winner:0,totals:[a],seriesWins:[...state.seriesWins],seriesOver:false});
    saveState();setTimeout(()=>sfx.gameComplete(),90);render();return;
  }

  let winner=-1;if(a>b)winner=0;else if(b>a)winner=1;
  if(winner>=0)state.seriesWins[winner]++;
  state.seriesOver=state.seriesWins[0]>=MATCH_TARGET||state.seriesWins[1]>=MATCH_TARGET;
  archiveCurrentGame(winner,a,b);
  if(winner>=0)applyTheme(winner);
  els.roundTitle.textContent=winner<0?"DRAW":state.seriesOver?`${state.players[winner].name} WINS THE MATCH`:`${state.players[winner].name} WINS THE GAME`;
  els.roundDesc.textContent=state.seriesOver?"Five wins have been reached. The match is complete.":winner<0?"No semaphore light is awarded.":"One semaphore light has been awarded to the winner.";
  els.roundScore.innerHTML=`<div class="rs">${esc(state.players[0].name)} <b>${a}</b></div><div class="rs">${esc(state.players[1].name)} <b>${b}</b></div>`;
  const lightCount=winner>=0?state.seriesWins[winner]:0;
  els.roundLights.innerHTML=Array.from({length:MATCH_TARGET},(_,i)=>`<span class="winlight ${i<lightCount?"on":""}"></span>`).join("");
  els.nextGameBtn.textContent=state.seriesOver?"NEW MATCH":"NEXT GAME";
  trace("game.completed",{winner,totals:[a,b],seriesWins:[...state.seriesWins],seriesOver:state.seriesOver});
  saveState();setTimeout(()=>state.seriesOver?sfx.matchWin():sfx.gameComplete(),90);render();if(state.mode==="online")queueOnlinePush("game-complete");
}

function clearAutoHandoff(resetKey=true){
  if(handoffTimer){clearTimeout(handoffTimer);handoffTimer=null;}
  if(handoffTicker){clearInterval(handoffTicker);handoffTicker=null;}
  if(resetKey)handoffKey="";
}
function handoffDescriptor(){
  const teamMode=isTeamMode();
  const teammateSwap=teamMode&&state.teamMember===1&&!!state.teamCandidates?.[0]&&!state.teamCandidates?.[1];
  const code=teamMode?teamMemberCode(state.current,state.teamMember):"";
  if(teammateSwap){
    return {
      seconds:TEAMMATE_HANDOFF_SECONDS,
      eyebrow:"TEAM RUNTIME · SECOND CHANCE",
      title:`${state.players[state.current].name} · ${code} ready`,
      text:handoffNote||`${teamMemberCode(state.current,0)} proposal is stored in runtime. ${code} gets a fresh three-roll chance.`,
      hint:"PROPOSAL PRESERVED · DICE UNLOCK AUTOMATICALLY"
    };
  }
  return {
    seconds:HANDOFF_SECONDS,
    eyebrow:teamMode?"TEAM HANDOFF · NEXT TEAM":"TURN HANDOFF · NEXT PLAYER",
    title:`${state.players[state.current].name}${code?` · ${code}`:""} ready`,
    text:handoffNote||`Pass the device to ${state.players[state.current].name}. The board, dice and theme switch automatically.`,
    hint:"NO ACTION NEEDED · NEXT TURN STARTS AUTOMATICALLY"
  };
}
function paintHandoff(desc,remaining,progress){
  if(els.switchEyebrow)els.switchEyebrow.textContent=desc.eyebrow;
  if(els.switchTitle)els.switchTitle.textContent=desc.title;
  if(els.switchText)els.switchText.textContent=desc.text;
  if(els.switchHint)els.switchHint.textContent=desc.hint;
  if(els.switchCountdown)els.switchCountdown.textContent=String(Math.max(1,remaining));
  if(els.switchProgress)els.switchProgress.style.transform=`scaleX(${Math.max(0,Math.min(1,progress))})`;
}
function ensureAutoHandoff(){
  if(state.mode!=="hotseat"||!state.waiting)return;
  const desc=handoffDescriptor();
  const c0=state.teamCandidates?.[0]?.createdAt||0;
  const c1=state.teamCandidates?.[1]?.createdAt||0;
  const key=[state.round,state.current,state.teamMember,c0,c1,desc.eyebrow].join("|");
  if(handoffKey===key&&(handoffTimer||handoffTicker))return;
  clearAutoHandoff(false);
  handoffKey=key;
  const duration=desc.seconds*1000;
  const started=performance.now();
  const tick=()=>{
    const elapsed=Math.max(0,performance.now()-started);
    const left=Math.max(0,duration-elapsed);
    const remaining=Math.max(1,Math.ceil(left/1000));
    paintHandoff(desc,remaining,left/duration);
  };
  tick();
  handoffTicker=setInterval(tick,80);
  handoffTimer=setTimeout(()=>continueTurn(true),duration);
}
function continueTurn(auto=false){
  if(state.mode!=="hotseat"||!state.waiting)return;
  clearAutoHandoff(true);
  state.waiting=false;
  handoffNote="";
  saveState();showTab("activeBoard");render();
}
function nextGame(){
  roundSummaryDismissed=false;
  trace("game.advance",{seriesOver:state.seriesOver,seriesWins:[...state.seriesWins]});
  if(state.mode==="online"&&!localControlAllowed(state.current)){setOnlineStatus("Only the active online seat can advance this game state.","bad");return}
  if(state.mode==="solo"){state.round++;}
  else if(state.seriesOver){state.seriesWins=[0,0];state.round=1;state.seriesOver=false;state.matchSerial++;}
  else state.round++;
  state.players.forEach(p=>p.scores=emptyScores());state.current=state.mode==="solo"||state.mode==="single"?0:(state.round-1)%2;state.rollCount=0;state.dice=[1,1,1,1,1];state.held=[false,false,false,false,false];state.announced=null;state.waiting=false;state.roundOver=false;if(isTeamMode())resetTeamTurnState();
  if(state.mode==="online")updateOnlineControlLock();else state.remoteLock=false;
  saveState();showTab("activeBoard");render();if(state.mode==="online")queueOnlinePush("next-game");scheduleAIIfNeeded();
}

function resetSeries(){
  if(state.mode==="online"&&state.remoteLock){setOnlineStatus("This device does not currently own the online turn.","bad");return}
  trace("match.reset",{seriesWins:[...state.seriesWins]});
  const mode=state.mode,n1=state.players[0].name,n2=state.players[1].name,sound=state.soundOn,localPlayer=state.localPlayer,gameId=state.onlineGameId,roomId=state.onlineRoomId,provider=state.onlineProvider,revision=state.revision,onlineReady=state.onlineReady,onlinePeerJoined=state.onlinePeerJoined,crewLocalSeat=state.crewLocalSeat||"",history=[...(state.history||[])],matchSerial=(state.matchSerial||1)+1,architecture={format:state.format,opponent:state.opponent,playersCount:state.playersCount,teamsCount:state.teamsCount,transport:state.transport,variantCode:state.variantCode,onlineTopology:state.onlineTopology,crewNames:structuredClone(state.crewNames||{})};
  state=freshState(mode);state.started=true;state.history=history;state.matchSerial=matchSerial;state.format=architecture.format;state.opponent=architecture.opponent;state.playersCount=architecture.playersCount;state.teamsCount=architecture.teamsCount;state.transport=architecture.transport;state.variantCode=architecture.variantCode;state.onlineTopology=architecture.onlineTopology||"PAIR";state.crewNames=architecture.crewNames||state.crewNames;state.crewLocalSeat=crewLocalSeat;state.players[0].name=n1;state.players[1].name=mode==="single"?"Harbour AI":mode==="solo"?"Solo Log":n2;if(state.format==="TEAM")resetTeamTurnState();state.soundOn=sound;state.localPlayer=localPlayer;state.onlineGameId=gameId;state.onlineRoomId=roomId;state.onlineRoomUrl="";state.onlineProvider=provider||ONLINE_P2P.provider;state.revision=revision;state.onlineReady=mode==="online"?onlineReady:false;state.onlinePeerJoined=mode==="online"?onlinePeerJoined:false;if(state.mode==="online")updateOnlineControlLock();else state.remoteLock=false;saveState();showTab("activeBoard");render();if(state.mode==="online")queueOnlinePush("reset-match");scheduleAIIfNeeded();
}

function startMode(mode,n1,n2,architecture={}){
  if(mode!=="online")closeOnlineTransport();
  ensureAudio();const previousHistory=[...(state.history||[])],nextMatchSerial=state.started?(state.matchSerial||1)+1:(state.matchSerial||1);menuOpen=false;modalMode=modalSectionForMode(mode);state=freshState(mode);state.started=true;state.history=previousHistory;state.matchSerial=nextMatchSerial;state.players[0].name=(n1||"Player 1").slice(0,24);state.players[1].name=mode==="single"?"Harbour AI":mode==="solo"?"Solo Log":((n2||"Player 2").slice(0,24));
  state.format=architecture.format||state.format;state.opponent=architecture.opponent||state.opponent;state.playersCount=architecture.players||state.playersCount;state.teamsCount=architecture.teams??state.teamsCount;state.transport=architecture.transport||state.transport;state.variantCode=architecture.code||state.variantCode;state.onlineTopology=architecture.topology||state.onlineTopology;
  if(state.format==="TEAM"){state.players[0].name=(n1||"Team Alpha").slice(0,24);state.players[1].name=(n2||"Team Omega").slice(0,24);resetTeamTurnState()}
  state.localPlayer=0;state.remoteLock=false;if(mode==="online"){state.onlineGameId="";state.onlineRoomId="";state.onlineRoomUrl="";state.onlineProvider=ONLINE_P2P.provider;state.onlineReady=false;state.onlinePeerJoined=false;state.revision=0}
  trace("game.started",{players:state.players.map(p=>p.name),opponent:state.opponent,transport:state.transport,variantCode:state.variantCode,topology:state.onlineTopology,matchTarget:MATCH_TARGET});
  saveState();showTab("activeBoard");sfx.gameStart();render();scheduleAIIfNeeded();
}
function startMatch(){
  if(setupHotseatVariant==="team"){
    startMode("hotseat",els.setupP1.value.trim()||"Team Alpha",els.setupP2.value.trim()||"Team Omega",{format:"TEAM",opponent:"HUMAN",players:4,teams:2,transport:"LOCAL",code:"TM"});
    return;
  }
  const p2=els.setupP2.value.trim();startMode("hotseat",els.setupP1.value.trim(),(!p2||/^(Harbour AI|Solo Log)$/i.test(p2))?"Player 2":p2,{format:"DUEL",opponent:"HUMAN",players:2,teams:0,transport:"LOCAL",code:"DU"});
}
function startSolo(){
  const raw=els.setupSoloName.value.trim();
  const soloName=(!raw||/^(Team Alpha|Team Omega|Solo Log)$/i.test(raw))?"Player 1":raw;
  startMode("solo",soloName,"",{format:"SOLO",opponent:"NONE",players:1,teams:0,transport:"LOCAL",code:"SO"})
}
function startSingle(){startMode("single",els.setupSoloName.value.trim(),"Harbour AI",{format:"DUEL",opponent:"AI",players:2,teams:0,transport:"LOCAL",code:"AI"})}
function launchSingleVariant(){setupSingleVariant==="ai"?startSingle():startSolo()}

function startOnlineHost(){void createOnlineRoom()}
function showTab(id){
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));
  document.querySelectorAll(".tabbtn").forEach(b=>b.classList.toggle("active",b.dataset.tab===id));
  if(els.tombTopBtn)els.tombTopBtn.classList.toggle("active",id==="tomb");
  if(id==="tomb")renderTomb();
}


document.addEventListener("click",e=>{
  const paperExport=e.target.closest("[data-paper-export]");if(paperExport){exportPlayerCSV(Number(paperExport.dataset.paperExport));return}
  const paperPrint=e.target.closest("[data-paper-print]");if(paperPrint){printPlayerSheet(Number(paperPrint.dataset.paperPrint));return}
  const teamModalChoice=e.target.closest("[data-team-decision-choice]");if(teamModalChoice){selectTeamCandidate(Number(teamModalChoice.dataset.teamDecisionChoice));return}
  const teamFinalCell=e.target.closest("[data-team-final-candidate]");if(teamFinalCell){selectTeamCandidate(Number(teamFinalCell.dataset.teamFinalCandidate));return}
  const die=e.target.closest("[data-die]");if(die){toggleHold(Number(die.dataset.die));return}
  const cell=e.target.closest(".cellbtn");if(cell){scoreCell(Number(cell.dataset.player),cell.dataset.col,cell.dataset.cat);return}
  const teamCandidate=e.target.closest("[data-team-candidate]");if(teamCandidate){selectTeamCandidate(Number(teamCandidate.dataset.teamCandidate));return}
  const teamCommit=e.target.closest("[data-team-commit]");if(teamCommit){commitSelectedTeamCandidate();return}
  const reopenRound=e.target.closest("[data-reopen-round]");if(reopenRound){roundSummaryDismissed=false;render();return}
  const gridQr=e.target.closest("[data-grid-qr]");if(gridQr){modalMode=modalSectionForMode(state.mode||"hotseat");menuOpen=true;render();return}
  const modeTab=e.target.closest("[data-mode-tab]");if(modeTab){modalMode=modeTab.dataset.modeTab;if(modalMode==="single"&&state.started&&(state.mode==="solo"||state.mode==="single"))setupSingleVariant=state.mode==="single"?"ai":"solo";if(modalMode==="hotseat"&&state.started&&state.mode==="hotseat")setupHotseatVariant=state.format==="TEAM"?"team":"duel";if(modalMode==="online"&&state.started&&state.mode==="online")setupOnlineVariant=state.onlineTopology==="CREW"?"crew":state.format==="TEAM"?"team":"duel";if(modalMode==="hotseat"&&(!els.setupP2.value.trim()||/^(Harbour AI|Solo Log)$/i.test(els.setupP2.value.trim())))els.setupP2.value="Player 2";renderControlModal();return}
  const tab=e.target.closest(".tabbtn");if(tab)showTab(tab.dataset.tab);
});
document.addEventListener("keydown",e=>{if(e.key!=="Enter"&&e.key!==" ")return;const die=e.target.closest("[data-die]");if(die){e.preventDefault();toggleHold(Number(die.dataset.die))}});

els.scoreConfirmCloseBtn.addEventListener("click",closeScoreConfirmation);
els.cancelScoreBtn.addEventListener("click",closeScoreConfirmation);
els.confirmScoreBtn.addEventListener("click",confirmPendingScore);
els.scoreConfirmModal.addEventListener("click",e=>{if(e.target===els.scoreConfirmModal)closeScoreConfirmation()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&els.scoreConfirmModal.classList.contains("show"))closeScoreConfirmation()});
if(els.teamDecisionCloseBtn)els.teamDecisionCloseBtn.addEventListener("click",()=>closeTeamDecisionChooser(true));
if(els.teamDecisionModal)els.teamDecisionModal.addEventListener("click",e=>{if(e.target===els.teamDecisionModal)closeTeamDecisionChooser(true)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&els.teamDecisionModal?.classList.contains("show")&&!els.scoreConfirmModal.classList.contains("show"))closeTeamDecisionChooser(true)});
document.addEventListener("click",event=>{
  const button=event.target.closest("button");if(!button||button.disabled)return;
  if(button.matches("#rollCup,[data-die],.cellbtn,[data-team-candidate],[data-team-final-candidate],[data-team-decision-choice],#confirmScoreBtn"))return;
  if(button.matches("#gameMenuBtn,.platform-side-item,#utilityCloseBtn,[data-audio-toggle]"))return;
  if(button.matches("#cancelScoreBtn,#scoreConfirmCloseBtn,#menuCloseBtn,#onlineLobbyCloseBtn,#onlineLobbyCancelBtn,#roundCloseBtn")){sfx.cancel();return;}
  if(button.matches(".tabbtn,[data-mode-tab],.variant-card,#startSoloBtn,#startSingleBtn,#hotseatDuelCard,#hotseatTeamCard,#onlineDuelCard,#onlineTeamCard,#onlineCrewCard")){sfx.select();return;}
  if(button.matches("#startBtn,#singleVariantStartBtn"))return;
  sfx.uiTap();
});

els.gameMenuBtn.addEventListener("click",event=>{event.preventDefault();window.YambPlatform?.toggleDrawer?.();});
if(els.tombTopBtn)els.tombTopBtn.addEventListener("click",()=>{if(state.mode==="solo")showTab("tomb")});
els.menuCloseBtn.addEventListener("click",()=>{if(state.started){menuOpen=false;render()}});
els.setupModal.addEventListener("click",e=>{if(e.target===els.setupModal&&state.started){menuOpen=false;render()}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&els.setupModal.classList.contains("show")&&state.started&&!els.scoreConfirmModal.classList.contains("show")){menuOpen=false;render()}});
els.resumeBtn.addEventListener("click",()=>{menuOpen=false;render();scheduleAIIfNeeded()});
els.menuResetBtn.addEventListener("click",()=>{menuOpen=false;resetSeries()});
els.rollCup.addEventListener("click",rollDice);
els.startBtn.addEventListener("click",startMatch);
els.startSoloBtn.addEventListener("click",()=>{setupSingleVariant="solo";renderControlModal()});
els.startSingleBtn.addEventListener("click",()=>{setupSingleVariant="ai";renderControlModal()});
document.getElementById("singleVariantStartBtn")?.addEventListener("click",launchSingleVariant);
document.getElementById("hotseatDuelCard")?.addEventListener("click",()=>{setupHotseatVariant="duel";renderControlModal()});
document.getElementById("hotseatTeamCard")?.addEventListener("click",()=>{setupHotseatVariant="team";renderControlModal()});
document.getElementById("onlineDuelCard")?.addEventListener("click",()=>{setupOnlineVariant="duel";renderControlModal()});
document.getElementById("onlineTeamCard")?.addEventListener("click",()=>{setupOnlineVariant="team";renderControlModal()});
document.getElementById("onlineCrewCard")?.addEventListener("click",()=>{setupOnlineVariant="crew";renderControlModal()});
els.nextGameBtn.addEventListener("click",nextGame);
els.resetSeriesBtn.addEventListener("click",resetSeries);
els.exportBtn.addEventListener("click",exportState);
els.importBtn.addEventListener("click",()=>els.importFileInput.click());
els.importFileInput.addEventListener("change",async()=>{const file=els.importFileInput.files?.[0];if(!file)return;try{await importStateFile(file)}catch(err){alert(err.message||"Import failed")}finally{els.importFileInput.value=""}});
els.printBtn.addEventListener("click",()=>printPlayerSheet(state.current));
els.onlineCreateBtn.addEventListener("click",startOnlineHost);
els.onlineJoinBtn.addEventListener("click",()=>void joinOnlineRoom());
els.onlineCopyBtn.addEventListener("click",async()=>{try{await copyOnlineRoomId()}catch(err){setOnlineStatus(err.message||"Room ID copy failed","bad")}});
els.onlineShareBtn.addEventListener("click",async()=>{try{await shareOnlineInvite()}catch(err){if(err?.name!=="AbortError")setOnlineStatus(err.message||"Share failed","bad")}});
els.onlineRefreshBtn.addEventListener("click",reconnectOnline);
els.onlineLobbyCopyBtn.addEventListener("click",async()=>{try{await copyOnlineInvite();if(els.onlineLobbyStatus)els.onlineLobbyStatus.textContent="INVITE LINK COPIED · QR / LINK / ROOM ID ALL READY"}catch(err){if(els.onlineLobbyStatus)els.onlineLobbyStatus.textContent=err.message||"Copy failed"}});
els.onlineLobbyShareBtn.addEventListener("click",async()=>{try{await shareOnlineInvite()}catch(err){if(err?.name!=="AbortError"&&els.onlineLobbyStatus)els.onlineLobbyStatus.textContent=err.message||"Share failed"}});
els.onlineLobbyCancelBtn.addEventListener("click",leaveOnlineRoom);
els.onlineLobbyCloseBtn?.addEventListener("click",leaveOnlineRoom);
els.onlineLobbyModal.addEventListener("click",e=>{if(e.target===els.onlineLobbyModal)leaveOnlineRoom()});
els.switchModal.addEventListener("click",e=>{if(e.target===els.switchModal&&state.mode==="hotseat"&&state.waiting)continueTurn()});
els.roundCloseBtn?.addEventListener("click",()=>{roundSummaryDismissed=true;els.roundModal.classList.remove("show");renderBoards()});
els.roundModal.addEventListener("click",e=>{if(e.target===els.roundModal){roundSummaryDismissed=true;els.roundModal.classList.remove("show");renderBoards()}});
document.addEventListener("keydown",e=>{
  if(e.key!=="Escape")return;
  if(els.onlineLobbyModal.classList.contains("show")){leaveOnlineRoom();return;}
  if(els.switchModal.classList.contains("show")&&state.mode==="hotseat"&&state.waiting){continueTurn();return;}
  if(els.roundModal.classList.contains("show")){roundSummaryDismissed=true;els.roundModal.classList.remove("show");renderBoards();}
});

if(state.started){
  setupSingleVariant=state.mode==="single"?"ai":state.mode==="solo"?"solo":setupSingleVariant;
  setupHotseatVariant=state.mode==="hotseat"&&state.format==="TEAM"?"team":state.mode==="hotseat"?"duel":setupHotseatVariant;
  setupOnlineVariant=state.mode==="online"&&state.onlineTopology==="CREW"?"crew":state.mode==="online"&&state.format==="TEAM"?"team":state.mode==="online"?"duel":setupOnlineVariant;
  els.setupP1.value=state.players[0].name;els.setupP2.value=state.players[1].name;els.setupSoloName.value=state.players[0].name;els.onlineP1.value=state.players[0].name;els.onlineP2.value=state.players[1].name;
}

window.YambRuntime={
  getState:()=>state,
  saveState:()=>saveState(),
  render:()=>render(),
  resetSeries:()=>resetSeries(),
  setMatchTarget:(value)=>{MATCH_TARGET=Math.max(1,Math.min(9,Number(value)||5));state.matchTarget=MATCH_TARGET;window.YambPersistence?.set("preferences.matchTarget",MATCH_TARGET);saveState();render();return MATCH_TARGET;},
  getMatchTarget:()=>MATCH_TARGET,
  setAIDifficulty:(level)=>{if(!AI_LEVELS[level])return AI_DIFFICULTY;AI_DIFFICULTY=level;AI_EPS=AI_LEVELS[level].eps;window.YambPersistence?.set("preferences.aiDifficulty",level);return level;},
  getAIDifficulty:()=>AI_DIFFICULTY,
  replaceState:(value)=>{state=normalizeState(value);MATCH_TARGET=Math.max(1,Math.min(9,Number(value?.matchTarget||MATCH_TARGET)||MATCH_TARGET));saveState();render();return state;},
  exportState:()=>exportState(),
  version:PRODUCT_VERSION,
  schema:STATE_SCHEMA,
  protocol:PROTOCOL_VERSION
};

const pendingInvite=readOnlineInvite();
render();scheduleAIIfNeeded();
if(pendingInvite)setTimeout(()=>void autoJoinOnlineInvite(pendingInvite),350);
else if(state.mode==="online"&&state.started&&state.onlineRoomId)restoreP2PSession();


try{
  Object.defineProperties(window,{
    state:{configurable:true,get:()=>state,set:value=>{state=value}},
    render:{configurable:true,get:()=>render,set:value=>{if(typeof value==="function")render=value}},
    showTab:{configurable:true,get:()=>showTab},
    modeLabel:{configurable:true,get:()=>modeLabel},
    modalSectionForMode:{configurable:true,get:()=>modalSectionForMode},
    modalMode:{configurable:true,get:()=>modalMode,set:value=>{modalMode=value}},
    menuOpen:{configurable:true,get:()=>menuOpen,set:value=>{menuOpen=!!value}},
    saveState:{configurable:true,get:()=>saveState},
    renderMatchHistory:{configurable:true,get:()=>renderMatchHistory}
  });
}catch{}
})();
