'use strict';
(() => {
 const local = ['localhost','127.0.0.1'].includes(location.hostname);
 const service = local ? '' : 'https://felix-wang-portfolio.wjddidi7831.chatgpt.site';
 const allowedHost = location.origin === 'https://wjddidi-1.github.io';
 const optedOut = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;
 const number = n => Number(n || 0).toLocaleString('en');
 const ns = 'http://www.w3.org/2000/svg';
 const el = (name,attrs={},content) => {const node=document.createElementNS(ns,name);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,String(v)));if(content!==undefined)node.textContent=content;return node};
 let data=null,measure='cumulative',points={},loading=false;
 const countryName = code => {try{return new Intl.DisplayNames(['en'],{type:'region'}).of(code)||code}catch{return code}};
 async function record(){
  if(!allowedHost || optedOut || !['/','/index.html','/profile.html'].includes(location.pathname))return;
  // Ephemeral per-page event ID supports retry deduplication, never visitor identification.
  let country;
  try{const lookup=await fetch('https://www.cloudflare.com/cdn-cgi/trace',{credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(3000)});if(lookup.ok){const match=(await lookup.text()).match(/^loc=([A-Z]{2})$/m);country=match?.[1]}}catch{/* Missing locations stay unknown. */}
  try{await fetch(service+'/api/collect',{method:'POST',mode:'cors',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({eventId:crypto.randomUUID(),path:location.pathname,country}),keepalive:true,signal:AbortSignal.timeout(6000)})}catch{/* Analytics must never block browsing. */}
 }
 const dashboard = document.querySelector('#visitors');
 if(!dashboard){void record();return}
 const status=document.querySelector('#analytics-status');
 const chart=document.querySelector('#visits-chart');
 const range=document.querySelector('#analytics-range');
 function renderChart(){
  chart.replaceChildren(el('desc',{id:'chart-description'},data?.daily.length?'Real page views by day. The accessible daily table provides every value.':'No visits have been recorded yet.'));
  document.querySelector('#trend-title').textContent=measure==='cumulative'?'Cumulative page views':'Daily page views';
  if(!data?.daily.length){chart.append(el('text',{x:310,y:125,'text-anchor':'middle'},'Waiting for the first recorded visit'),el('text',{x:310,y:151,'text-anchor':'middle'},'No estimated or backfilled traffic.'));return}
  const rows=data.daily,w=620,h=290,left=52,right=18,top=22,bottom=47,innerW=w-left-right,innerH=h-top-bottom;
  const max=Math.max(...rows.map(r=>r[measure]),1);const ceiling=max<5?Math.ceil(max):Math.ceil(max/5)*5;
  const x=i=>rows.length===1?left+innerW/2:left+i/(rows.length-1)*innerW;
  const y=v=>top+innerH-v/ceiling*innerH;
  const ticks=[...new Set([0,Math.ceil(ceiling/2),ceiling])];
  ticks.forEach(v=>{chart.append(el('line',{x1:left,x2:w-right,y1:y(v),y2:y(v),stroke:'#d8dece','stroke-width':1}),el('text',{x:left-9,y:y(v)+4,'text-anchor':'end'},number(v)))});
  const shape=rows.map((r,i)=>`${i?'L':'M'}${x(i)},${y(r[measure])}`).join(' ');
  if(rows.length>1){chart.append(el('path',{d:shape+` L${x(rows.length-1)},${y(0)} L${x(0)},${y(0)} Z`,fill:'#d9ed8e','fill-opacity':'.35'}),el('path',{d:shape,fill:'none',stroke:'#294b39','stroke-width':2.5,'stroke-linejoin':'round','stroke-linecap':'round'}))}
  const drawn=rows.length<=60?rows.map((r,i)=>i):[0,rows.length-1];
  drawn.forEach(i=>{const circle=el('circle',{cx:x(i),cy:y(rows[i][measure]),r:rows.length===1?4:2.7,fill:'#294b39'});circle.append(el('title',{},`${rows[i].day}: ${number(rows[i][measure])} ${measure==='cumulative'?'cumulative':'daily'} views`));chart.append(circle)});
  const indices=rows.length===1?[0]:[0,Math.floor((rows.length-1)/2),rows.length-1];
  [...new Set(indices)].forEach(i=>chart.append(el('text',{x:x(i),y:h-17,'text-anchor':'middle'},rows[i].day.slice(5))));
  document.querySelector('#chart-note').textContent=`${rows.length} day${rows.length===1?'':'s'} of recorded history · ${data.from} – ${data.to} · Asia/Shanghai. ${rows.length===1?'A trend will form as more days are recorded.':measure==='cumulative'?'Running total includes views before this display period.':'Daily counts may rise or fall.'}`;
 }
 function renderMap(){
  const svg=document.querySelector('#visitor-markers');svg.replaceChildren();
  const list=document.querySelector('#analytics-country-list');list.replaceChildren();
  const max=Math.max(...data.countries.map(c=>c.views),1);let unmapped=0;
  for(const country of data.countries){
   const li=document.createElement('li'),name=document.createElement('span'),value=document.createElement('span');name.textContent=countryName(country.country);value.textContent=`${number(country.views)} views`;li.append(name,value);list.append(li);
   const p=points[country.country];if(!p){unmapped+=country.views;continue}
   // Symbol area, rather than radius, is proportional to page-view count.
   const radius=4+16*Math.sqrt(country.views/max),x=(p.lon+180)*2.5,y=(85-p.lat)*400/145;
   const mark=el('g',{tabindex:0,role:'img','aria-label':`${name.textContent}: ${country.views} page views`});mark.append(el('title',{},`${name.textContent} · ${number(country.views)} page views`),el('circle',{cx:x,cy:y,r:radius}));svg.append(mark);
  }
  if(!data.countries.length){const li=document.createElement('li');li.textContent='No country-level data yet.';list.append(li)}
  document.querySelector('#map-note').textContent=`${number(data.windowTotal)} views in the selected period · ${number(data.unknown)} with unknown origin${unmapped?` · ${number(unmapped)} listed without a map point`:''}. Markers represent countries / regions, not exact visitor locations.`;
 }
 function render(){
  document.querySelector('#analytics-total').textContent=number(data.total);document.querySelector('#analytics-today').textContent=number(data.today);document.querySelector('#analytics-countries').textContent=number(data.countries.length);
  document.querySelector('#analytics-export').disabled=!data.daily.length;
  status.dataset.stale='false';status.textContent=(data.testFixture?'Local test preview · sample data. ':`Tracking since ${data.startedOn||'the first visit'}. `)+`Updated ${new Date(data.updatedAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Shanghai'})} (UTC+8).${optedOut?' Your privacy signal is enabled; this visit is not counted.':''}`;
  const tbody=document.querySelector('#analytics-daily-table');tbody.replaceChildren();
  for(const row of [...data.daily].reverse()){const tr=document.createElement('tr');[row.day,number(row.views),number(row.cumulative)].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td)});tbody.append(tr)}
  renderChart();renderMap();
 }
 async function load(){
  if(loading)return;loading=true;const button=document.querySelector('#analytics-refresh');button.disabled=true;
  try{
   const response=await fetch(`${service}/api/analytics?days=${range.value}`,{mode:'cors',credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw new Error('Unavailable');const next=await response.json();
   if(!Array.isArray(next.daily)||!Array.isArray(next.countries)||typeof next.total!=='number')throw new Error('Invalid statistics');
   data=next;render();
  }catch{
   status.dataset.stale='true';status.textContent=data?'Update unavailable; showing the last successfully loaded data.':'Statistics temporarily unavailable. Your portfolio is still fully usable.';
   if(!data){chart.replaceChildren(el('text',{x:310,y:140,'text-anchor':'middle'},'Visit data is currently unavailable.'));document.querySelector('#chart-note').textContent='No totals are estimated when the service is unavailable.'}
  }finally{loading=false;button.disabled=false}
 }
 range.addEventListener('change',load);document.querySelector('#analytics-refresh').addEventListener('click',load);
 document.querySelectorAll('[data-measure]').forEach(button=>button.addEventListener('click',()=>{measure=button.dataset.measure;document.querySelectorAll('[data-measure]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderChart()}));
 document.querySelector('#analytics-export').addEventListener('click',()=>{
  if(!data)return;
  const rows=[['type','date','country_code','page_views','cumulative'],...data.daily.map(r=>['daily',r.day,'',r.views,r.cumulative]),...data.countries.map(r=>['country','',r.country,r.views,'']),['unknown','','XX',data.unknown,'']];
  const csv='\uFEFF'+rows.map(row=>row.join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`felix-site-visits-${data.from}-${data.to}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 void (async()=>{try{const r=await fetch('assets/country-points.json');if(r.ok)points=await r.json()}catch{}await record();await load()})();
})();
