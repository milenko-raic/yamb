import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
async function walk(dir){const out=[];for(const name of await readdir(dir)){if(name==='.git'||name==='node_modules')continue;const p=path.join(dir,name),s=await stat(p);if(s.isDirectory())out.push(...await walk(p));else out.push(p)}return out}
const files=await walk(root);
const productFiles=files.filter(file=>{const rel=path.relative(root,file).replaceAll('\\','/');return rel==='index.html'||rel==='sw.js'||rel==='manifest.webmanifest'||rel.startsWith('assets/');});
const texts=[];
for(const file of productFiles){if(/\.(html|css|js|json)$/i.test(file))texts.push([file,await readFile(file,'utf8')])}
const combined=texts.map(([f,t])=>`\nFILE:${f}\n${t}`).join('\n');
assert.ok(!combined.includes('!important'),'release must not contain priority override declarations');
assert.ok(!/\bv[2-9]\.[0-9]/i.test(combined),'release must not expose historical product versions');
assert.ok(!/\blocalStorage\b/.test(combined),'runtime must use the IndexedDB persistence layer');
assert.ok(!/Math\.random/.test(combined),'product runtime must not use Math.random');
const html=await readFile(path.join(root,'index.html'),'utf8');
assert.match(html,/<title>YAMB · ROYAL NAVY ENGINEERING<\/title>/);
assert.match(html,/id="onlineCrewCard"/);
assert.match(html,/id="themeColor"/);
assert.ok(!/style="/i.test(html),'index should not contain inline style attributes');

const app=await readFile(path.join(root,'assets/js/runtime/app.js'),'utf8');
const idBlock=app.match(/const ids=\[(.*?)\];/s)?.[1]||'';
const runtimeIds=[...idBlock.matchAll(/"([^"]+)"/g)].map(m=>m[1]);
for(const id of runtimeIds)assert.match(html,new RegExp(`id=["']${id}["']`),`missing runtime element #${id}`);
const sw=await readFile(path.join(root,'sw.js'),'utf8');
for(const match of sw.matchAll(/'\.\/([^']+)'/g)){const rel=match[1];if(rel==='')continue;assert.ok(files.includes(path.join(root,rel)),`service-worker shell references missing ${rel}`);}
assert.ok(!/<script[^>]+https?:\/\//i.test(html),'index must not hard-wire external runtime scripts');

const manifest=JSON.parse(await readFile(path.join(root,'manifest.webmanifest'),'utf8'));
assert.equal(manifest.display,'standalone');assert.ok(Array.isArray(manifest.icons)&&manifest.icons.length>=2);
for(const required of ['index.html','manifest.webmanifest','sw.js','assets/css/app.css','assets/js/bootstrap.js','assets/js/runtime/app.js','assets/js/core/storage.js'])assert.ok(files.includes(path.join(root,required)),`missing ${required}`);
console.log(`package.test.mjs: OK (${files.length} files checked)`);
