import assert from 'node:assert/strict';
import {scoreDice,validateDice} from '../assets/js/core/rules.js';
const CATS=[
  {id:'ones',type:'num',face:1},{id:'sixes',type:'num',face:6},{id:'max',type:'max'},{id:'min',type:'min'},
  {id:'kenta',type:'kenta'},{id:'full',type:'full'},{id:'poker',type:'poker'},{id:'yamb',type:'yamb'}
];
const score=(id,dice,roll=3)=>scoreDice(id,dice,roll,CATS);
assert.equal(score('ones',[1,1,1,4,5]),3);
assert.equal(score('sixes',[6,6,6,6,1]),24);
assert.equal(score('max',[6,6,5,4,3]),24);
assert.equal(score('min',[1,2,3,4,5]),15);
assert.equal(score('kenta',[1,2,3,4,5],1),66);
assert.equal(score('kenta',[2,3,4,5,6],2),56);
assert.equal(score('kenta',[2,3,4,5,6],3),46);
assert.equal(score('kenta',[1,2,3,4,6],1),0);
assert.equal(score('full',[6,6,6,5,5]),58);
assert.equal(score('poker',[4,4,4,4,2]),56);
assert.equal(score('yamb',[5,5,5,5,5]),75);
assert.equal(score('yamb',[5,5,5,5,4]),0);
assert.equal(score('missing',[1,1,1,1,1]),0);
assert.equal(score('ones',[0,1,1,1,1]),0);
assert.equal(validateDice([1,2,3,4,6]),true);
assert.equal(validateDice([1,2,3,4,7]),false);
console.log('rules.test.mjs: OK');
