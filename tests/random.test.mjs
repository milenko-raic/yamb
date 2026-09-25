import assert from 'node:assert/strict';
import {random} from '../assets/js/core/random.js';
for(let i=0;i<5000;i++){const n=random.die();assert.ok(Number.isInteger(n)&&n>=1&&n<=6)}
for(let i=0;i<1000;i++){const n=random.int(-4,9);assert.ok(Number.isInteger(n)&&n>=-4&&n<=9)}
assert.match(random.token(16),/^[0-9a-f]{32}$/);
console.log('random.test.mjs: OK');
