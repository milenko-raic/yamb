import assert from 'node:assert/strict';
import {persistence,storageSchema} from '../assets/js/core/storage.js';
await persistence.init();
await persistence.set('runtime.test',{a:1,nested:{b:2}});
const first=persistence.getSync('runtime.test');first.nested.b=99;
assert.equal(persistence.getSync('runtime.test').nested.b,2,'getSync must return a clone');
const snapshot=await persistence.exportSnapshot();
assert.equal(snapshot.schema,storageSchema.snapshot);assert.equal(snapshot.records['runtime.test'].a,1);
await persistence.remove('runtime.test');assert.equal(persistence.has('runtime.test'),false);
await persistence.importSnapshot(snapshot,{replace:true});assert.equal(persistence.getSync('runtime.test').a,1);
const corrupt=structuredClone(snapshot);if(corrupt.integrity?.digest){corrupt.records['runtime.test'].a=7;await assert.rejects(()=>persistence.importSnapshot(corrupt,{replace:true}),/integrity/i)}
console.log('storage.test.mjs: OK');
