export function createTelemetry(persistence){
  const KEY='runtime.timeline';
  const MAX=1500;
  const clone=value=>structuredClone(value??{});
  return Object.freeze({
    record(type,data={}){
      const list=persistence.getSync(KEY,[]);
      const id=globalThis.crypto?.randomUUID?.()||globalThis.YambRandom?.token?.(16)||`${Date.now()}`;
      const event={id,at:new Date().toISOString(),type:String(type||'runtime.event').slice(0,80),data:clone(data)};
      list.push(event);void persistence.set(KEY,list.slice(-MAX));
      return event;
    },
    list(){return persistence.getSync(KEY,[]);},
    clear(){return persistence.set(KEY,[]);}
  });
}
