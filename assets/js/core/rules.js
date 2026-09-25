export function scoreDice(catId,dice,rollNo=3,categories=[]){
  if (!Array.isArray(dice) || dice.length!==5 || dice.some(v=>!Number.isInteger(v)||v<1||v>6)) return 0;
  const cat=categories.find(c=>c.id===catId);
  if(!cat)return 0;
  const cnt=[0,0,0,0,0,0,0];
  dice.forEach(v=>cnt[v]++);
  if(cat.type==='num') return cnt[cat.face]*cat.face;
  if(cat.type==='max'||cat.type==='min') return dice.reduce((a,b)=>a+b,0);
  if(cat.type==='kenta'){
    const u=[...new Set(dice)].sort((a,b)=>a-b).join('');
    return (u==='12345'||u==='23456') ? ({1:66,2:56,3:46}[rollNo]||46) : 0;
  }
  const vals=[];
  for(let v=1;v<=6;v++)if(cnt[v])vals.push({v,n:cnt[v]});
  if(cat.type==='full'){
    const triples=vals.filter(x=>x.n>=3).sort((a,b)=>b.v-a.v);
    for(const t of triples){
      const pair=vals.filter(x=>x.v!==t.v&&x.n>=2).sort((a,b)=>b.v-a.v)[0];
      if(pair)return t.v*3+pair.v*2+30;
    }
    return 0;
  }
  if(cat.type==='poker'){
    const p=vals.filter(x=>x.n>=4).sort((a,b)=>b.v-a.v)[0];
    return p?p.v*4+40:0;
  }
  if(cat.type==='yamb'){
    const y=vals.find(x=>x.n===5);
    return y?y.v*5+50:0;
  }
  return 0;
}

export function validateDice(dice){
  return Array.isArray(dice)&&dice.length===5&&dice.every(v=>Number.isInteger(v)&&v>=1&&v<=6);
}
