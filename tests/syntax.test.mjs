import assert from 'node:assert/strict';
import {readdir,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
async function walk(dir){const out=[];for(const name of await readdir(dir)){if(name==='node_modules'||name==='.git')continue;const p=path.join(dir,name),s=await stat(p);if(s.isDirectory())out.push(...await walk(p));else out.push(p)}return out}
const files=(await walk(root)).filter(f=>/\.js$|\.mjs$/i.test(f));
for(const file of files){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});assert.equal(result.status,0,`${path.relative(root,file)} failed syntax check:\n${result.stderr}`)}
console.log(`syntax.test.mjs: OK (${files.length} scripts checked)`);
