import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifestPath=path.join(root,'RELEASE-MANIFEST.json');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
assert.equal(manifest.product,'YAMB · Royal Navy Engineering');
assert.equal(manifest.release,'1.0.0');
assert.equal(manifest.stateSchema,1);
assert.equal(manifest.p2pProtocol,1);

async function walk(dir){
  const out=[];
  for(const name of await readdir(dir)){
    if(name==='.git'||name==='node_modules')continue;
    const absolute=path.join(dir,name);
    const info=await stat(absolute);
    if(info.isDirectory())out.push(...await walk(absolute));
    else out.push(absolute);
  }
  return out;
}
const files=(await walk(root))
  .filter(file=>path.resolve(file)!==path.resolve(manifestPath))
  .map(file=>path.relative(root,file).replaceAll('\\','/'))
  .sort();
const declared=[...manifest.files].map(entry=>entry.path).sort();
assert.deepEqual(declared,files,'release manifest must enumerate every package file except itself');
for(const entry of manifest.files){
  const bytes=await readFile(path.join(root,entry.path));
  const digest=createHash('sha256').update(bytes).digest('hex');
  assert.equal(bytes.length,entry.bytes,`${entry.path}: byte length mismatch`);
  assert.equal(digest,entry.sha256,`${entry.path}: SHA-256 mismatch`);
}
console.log(`integrity.test.mjs: OK (${manifest.files.length} artifacts verified)`);
