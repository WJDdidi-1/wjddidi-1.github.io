import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import worker from '../worker/index.js';
const origin='https://wjddidi-1.github.io';
function db(){
 const s=new DatabaseSync(':memory:');
 for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())s.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8').replaceAll('--> statement-breakpoint',''));
 const wrap=(sql,args=[])=>({bind(...a){return wrap(sql,a)},async run(){return s.prepare(sql).run(...args)},async all(){return {results:s.prepare(sql).all(...args)}}});
 return {s,prepare:sql=>wrap(sql),async batch(q){s.exec('BEGIN');try{const out=[];for(const x of q)out.push(await x.run());s.exec('COMMIT');return out}catch(e){s.exec('ROLLBACK');throw e}}};
}
function event(id='12345678-1234-4234-8234-123456789abc',country='US',extra={}){
 const r=new Request('https://analytics.test/api/collect',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...extra},body:JSON.stringify({eventId:id,path:'/'})});Object.defineProperty(r,'cf',{value:{country}});return r;
}
async function stats(DB,days='30'){const r=await worker.fetch(new Request('https://analytics.test/api/analytics?days='+days),{DB});assert.equal(r.status,200);return r.json()}
test('counts once per event and exposes aggregates without raw event identifiers',async()=>{const DB=db();assert.equal((await worker.fetch(event(),{DB})).status,204);assert.equal((await worker.fetch(event(),{DB})).status,204);const x=await stats(DB);assert.equal(x.total,1);assert.equal(x.today,1);assert.equal(x.countries[0].country,'US');assert.equal(x.countries[0].views,1);assert(!JSON.stringify(x).includes('12345678'));assert.equal(x.daily.at(-1).cumulative,1)});
test('rejects foreign origins and malformed ids without modifying data',async()=>{const DB=db();assert.equal((await worker.fetch(event(undefined,'US',{Origin:'https://bad.example'}),{DB})).status,403);assert.equal((await worker.fetch(event('bad'),{DB})).status,400);assert.equal((await stats(DB)).total,0)});
test('records missing geolocation as unknown instead of inventing a country',async()=>{const DB=db();assert.equal((await worker.fetch(event(undefined,null),{DB})).status,204);const x=await stats(DB);assert.equal(x.unknown,1);assert.equal(x.countries.length,0)});
test('honours DNT and GPC and ignores obvious bots',async()=>{const DB=db();for(const h of [{DNT:'1'},{'Sec-GPC':'1'},{'User-Agent':'Googlebot/2.1'}])assert.equal((await worker.fetch(event(undefined,'US',h),{DB})).status,204);assert.equal((await stats(DB)).total,0)});
test('fills calendar gaps and preserves all-time cumulative baseline in a window',async()=>{const DB=db();const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());DB.s.prepare('INSERT INTO analytics_daily(day,country,views) VALUES(?,?,?)').run('2020-01-01','GB',7);DB.s.prepare('INSERT INTO analytics_daily(day,country,views) VALUES(?,?,?)').run(today,'US',2);const x=await stats(DB);assert.equal(x.total,9);assert.equal(x.daily.length,30);assert.equal(x.daily[0].cumulative,7);assert.equal(x.daily.at(-1).cumulative,9);assert.equal(x.daily.at(-2).views,0);assert.equal(x.windowTotal,2)});
test('empty data is explicit and invalid date ranges are rejected',async()=>{const DB=db();const x=await stats(DB);assert.equal(x.startedOn,null);assert.equal(x.total,0);assert.deepEqual(x.daily,[]);const r=await worker.fetch(new Request('https://analytics.test/api/analytics?days=bogus'),{DB});assert.equal(r.status,400)});
test('database failures return an honest unavailable state',async()=>{const r=await worker.fetch(new Request('https://analytics.test/api/analytics'),{});assert.equal(r.status,503);assert.equal((await r.json()).error,'analytics_unavailable')});
