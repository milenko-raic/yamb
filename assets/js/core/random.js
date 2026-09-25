function secureUint32(){
  if(!globalThis.crypto?.getRandomValues)throw new Error('Secure random source unavailable. YAMB requires Web Crypto.');
  const value=new Uint32Array(1);globalThis.crypto.getRandomValues(value);return value[0];
}
function uniform(max){
  if(!Number.isSafeInteger(max)||max<1||max>0x100000000)throw new RangeError('Invalid secure random range.');
  const span=0x100000000;
  const limit=span-(span%max);
  let value;
  do value=secureUint32(); while(value>=limit);
  return value%max;
}
export const random=Object.freeze({
  die:()=>uniform(6)+1,
  int:(min,max)=>{
    const lo=Math.ceil(Number(min)),hi=Math.floor(Number(max));
    if(!Number.isSafeInteger(lo)||!Number.isSafeInteger(hi)||hi<lo)throw new RangeError('Invalid integer range.');
    const width=hi-lo+1;if(width>0x100000000)throw new RangeError('Secure random range is too wide.');
    return lo+uniform(width);
  },
  unit:()=>secureUint32()/0x100000000,
  token:(bytes=16)=>{
    const size=Math.max(1,Math.min(4096,Math.floor(Number(bytes)||16)));
    const buf=new Uint8Array(size);globalThis.crypto.getRandomValues(buf);
    return [...buf].map(v=>v.toString(16).padStart(2,'0')).join('');
  }
});
