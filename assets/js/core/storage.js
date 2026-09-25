const DB_NAME='yamb-runtime';
const DB_VERSION=1;
const STORE='kv';
const SNAPSHOT_SCHEMA=1;

function clone(value){return value===undefined?undefined:structuredClone(value)}
function stable(value){
  if(Array.isArray(value))return `[${value.map(stable).join(',')}]`;
  if(value&&typeof value==='object')return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
async function sha256(value){
  if(!globalThis.crypto?.subtle)return '';
  const data=new TextEncoder().encode(typeof value==='string'?value:stable(value));
  const digest=await crypto.subtle.digest('SHA-256',data);
  return [...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('');
}

const MIGRATIONS={
  1({db}){if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);}
};

class Persistence{
  #db=null;
  #cache=new Map();
  #ready=false;
  #pending=Promise.resolve();
  #memoryOnly=false;

  get ready(){return this.#ready}
  get durable(){return !!this.#db&&!this.#memoryOnly}

  async init(){
    if(!('indexedDB' in globalThis)){this.#memoryOnly=true;this.#ready=true;return this}
    try{
      this.#db=await new Promise((resolve,reject)=>{
        const request=indexedDB.open(DB_NAME,DB_VERSION);
        request.onupgradeneeded=event=>{
          const from=event.oldVersion||0;
          for(let version=from+1;version<=DB_VERSION;version++)MIGRATIONS[version]?.({db:request.result,transaction:request.transaction,from,to:version});
        };
        request.onsuccess=()=>resolve(request.result);
        request.onerror=()=>reject(request.error||new Error('IndexedDB open failed'));
        request.onblocked=()=>reject(new Error('IndexedDB upgrade is blocked by another YAMB tab'));
      });
      this.#db.onversionchange=()=>{try{this.#db?.close()}catch{};this.#db=null;this.#memoryOnly=true;};
      await this.#hydrate();
    }catch(error){
      console.warn('YAMB persistence degraded to memory for this session.',error);
      this.#db=null;this.#memoryOnly=true;
    }
    this.#ready=true;return this;
  }

  async #hydrate(){
    if(!this.#db)return;
    await new Promise((resolve,reject)=>{
      const tx=this.#db.transaction(STORE,'readonly'),store=tx.objectStore(STORE),keys=store.getAllKeys(),values=store.getAll();
      tx.oncomplete=()=>{this.#cache.clear();(keys.result||[]).forEach((key,index)=>this.#cache.set(String(key),clone((values.result||[])[index])));resolve()};
      tx.onerror=()=>reject(tx.error||new Error('IndexedDB read failed'));
      tx.onabort=()=>reject(tx.error||new Error('IndexedDB read aborted'));
    });
  }

  getSync(key,fallback=null){return this.#cache.has(key)?clone(this.#cache.get(key)):clone(fallback)}
  has(key){return this.#cache.has(key)}
  entries(prefix=''){return [...this.#cache.entries()].filter(([key])=>String(key).startsWith(prefix)).map(([key,value])=>[key,clone(value)])}

  #enqueue(operation){this.#pending=this.#pending.catch(()=>{}).then(operation);return this.#pending}
  #writeBatch(records,{clear=false,deleteKeys=[]}={}){
    const prepared=records.map(([key,value])=>[String(key),clone(value)]),deleted=deleteKeys.map(String);
    if(!this.#db){
      if(clear)this.#cache.clear();
      deleted.forEach(key=>this.#cache.delete(key));prepared.forEach(([key,value])=>this.#cache.set(key,clone(value)));return Promise.resolve(true);
    }
    return this.#enqueue(()=>new Promise((resolve,reject)=>{
      const tx=this.#db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE);
      if(clear)store.clear();deleted.forEach(key=>store.delete(key));prepared.forEach(([key,value])=>store.put(value,key));
      tx.oncomplete=()=>{if(clear)this.#cache.clear();deleted.forEach(key=>this.#cache.delete(key));prepared.forEach(([key,value])=>this.#cache.set(key,clone(value)));resolve(true)};
      tx.onerror=()=>reject(tx.error||new Error('IndexedDB write failed'));
      tx.onabort=()=>reject(tx.error||new Error('IndexedDB write aborted'));
    }));
  }

  set(key,value){return this.#writeBatch([[key,value]])}
  remove(key){return this.#writeBatch([],{deleteKeys:[key]})}
  async flush(){await this.#pending}

  async exportSnapshot(){
    await this.flush();
    const records=Object.fromEntries(this.entries());
    return {product:'YAMB · Royal Navy Engineering',schema:SNAPSHOT_SCHEMA,exportedAt:new Date().toISOString(),integrity:{algorithm:'SHA-256',digest:await sha256(records)},records};
  }

  async importSnapshot(snapshot,{replace=false}={}){
    if(!snapshot||snapshot.schema!==SNAPSHOT_SCHEMA||!snapshot.records||typeof snapshot.records!=='object'||Array.isArray(snapshot.records))throw new Error('Unsupported YAMB data snapshot.');
    const entries=Object.entries(snapshot.records);
    if(entries.length>5000)throw new Error('Snapshot contains too many records.');
    if(entries.some(([key])=>typeof key!=='string'||key.length>160))throw new Error('Snapshot contains an invalid record key.');
    if(snapshot.integrity?.digest){const actual=await sha256(snapshot.records);if(actual&&actual!==snapshot.integrity.digest)throw new Error('Snapshot integrity check failed.');}
    await this.#writeBatch(entries,{clear:!!replace});
    return true;
  }
}

export const persistence=new Persistence();
export const storageSchema=Object.freeze({database:DB_VERSION,snapshot:SNAPSHOT_SCHEMA});
