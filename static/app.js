const form=document.getElementById('auditForm'), loading=document.getElementById('loading'), results=document.getElementById('results');
let currentReport=null;
const esc=s=>String(s??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function row(k,v){return `<div class="data-row"><span>${esc(k)}</span><span>${esc(v)}</span></div>`}
function score(x){return x?.available?`${x.scores?.performance??'—'}/100`:'Not available'}
function fmt(n){return Number.isFinite(Number(n))?Math.round(Number(n)).toLocaleString('en-CA'):'—'}
function money(n){return Number.isFinite(Number(n))?Number(n).toLocaleString('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0}):'—'}
function render(d){
 currentReport=d;
 document.getElementById('resultTitle').textContent=d.business.title||d.business.domain;
 document.getElementById('resultDomain').textContent=d.business.website+' · '+d.business.location;
 document.getElementById('score').textContent=d.digital_health.score===null?'—':d.digital_health.score+'/100';
 document.getElementById('scoreLabel').textContent=d.digital_health.label;
 document.getElementById('mobileScore').textContent=score(d.pagespeed.mobile);
 document.getElementById('desktopScore').textContent=score(d.pagespeed.desktop);
 const s=d.website_audit;
 document.getElementById('auditList').innerHTML=[row('HTTP status',s.status_code),row('Page title',s.title||'Missing'),row('Meta description',s.meta_description?'Present':'Missing'),row('Mobile viewport',s.has_viewport?'Present':'Missing'),row('H1 headings',s.h1_count),row('Images missing alt',s.images_missing_alt),row('robots.txt',s.robots_txt_found?'Found':'Not found'),row('sitemap.xml',s.sitemap_found?'Found':'Not found'),row('Internal links',s.internal_link_count)].join('');
 const k=d.search_intelligence,c=d.competitor_intelligence;
 const kws=(k.keywords||[]).slice(0,8);
 const keywordHtml=k.available&&kws.length?`<div class="keyword-list">${kws.map(x=>`<div class="keyword-row"><b>${esc(x.keyword)}</b><span>${fmt(x.monthly_search_volume)} searches/mo</span><span>${x.cpc_usd==null?'CPC —':'US$'+Number(x.cpc_usd).toFixed(2)}</span></div>`).join('')}</div><p class="small-note">${esc(k.note||'Provider keyword data; values are market estimates.')}</p>`:`<div class="empty-state">${esc(k.reason||'Keyword provider data is not available for this report.')}</div>`;
 document.getElementById('marketList').innerHTML=keywordHtml;
 renderCompetitors(c);
 setupCalculator(k,d.opportunity_analysis);
 document.getElementById('adConcepts').innerHTML='<div class="empty-state">Select a tone and generate campaign concepts. The connected AI provider is required for generation.</div>';
 document.getElementById('generateAds').disabled=false;
 document.getElementById('recommendations').innerHTML=(d.recommendations||[]).map(x=>`<div class="recommendation"><b>${esc(x.priority.toUpperCase())} · ${esc(x.area.toUpperCase())}</b><br>${esc(x.action)}</div>`).join('');
 document.getElementById('notes').textContent=(d.data_notes||[]).join(' ');
}
function renderCompetitors(c){
 const chart=document.getElementById('competitorChart'),table=document.getElementById('competitorTable');
 if(!c?.available||!Array.isArray(c.comparison)||!c.comparison.length){chart.innerHTML=`<div class="empty-state">${esc(c?.reason||'Competitor intelligence is not connected yet. Connect DataForSEO to retrieve competitor estimates.')}</div>`;table.innerHTML='';return;}
 const rows=c.comparison.filter(x=>x.domain),max=Math.max(1,...rows.map(x=>Number(x.estimated_organic_traffic_monthly)||0));
 chart.innerHTML=rows.map(x=>{const value=Number(x.estimated_organic_traffic_monthly);const width=value>=0?Math.max(1,100*value/max):0;return `<div class="bar-row ${x.is_target?'is-target':''}"><div class="bar-label"><b>${esc(x.domain)}</b>${x.is_target?'<em>Your domain</em>':''}</div><div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div><span class="bar-value">${x.estimated_organic_traffic_monthly==null?'—':fmt(value)}</span></div>`}).join('');
 table.innerHTML=`<div class="table-head"><span>Domain</span><span>Est. monthly organic visits</span><span>Organic keywords</span><span>Shared keywords</span></div>`+rows.map(x=>`<div class="table-row"><span>${esc(x.domain)} ${x.is_target?'<em>Your domain</em>':''}</span><span>${x.estimated_organic_traffic_monthly==null?'—':fmt(x.estimated_organic_traffic_monthly)}</span><span>${x.organic_keyword_count==null?'—':fmt(x.organic_keyword_count)}</span><span>${x.shared_keywords==null?'—':fmt(x.shared_keywords)}</span></div>`).join('')+`<p class="small-note">${esc(c.note||'Traffic and ranking metrics are third-party estimates.')}</p>`;
}
function setupCalculator(k,analysis){
 const demand=document.getElementById('searchDemand');
 const keywordRows=k?.keywords||[];
 const providerSum=keywordRows.reduce((sum,x)=>sum+(Number(x.monthly_search_volume)||0),0);
 demand.value=providerSum>0?Math.round(providerSum):'';
 const ids=['searchDemand','clickShare','leadRate','closeRate','customerValue'];
 ids.forEach(id=>document.getElementById(id).addEventListener('input',calculateOpportunity));
 calculateOpportunity();
 const note=document.getElementById('calcFootnote');
 if(providerSum>0){note.textContent='Starting search-demand input: sum of returned keyword-row volumes ('+fmt(providerSum)+'). Similar keywords may overlap, so review or replace this planning input.';}
 else {note.textContent='No provider search-demand figure is available. Enter a planning search-volume assumption; this will not be presented as measured traffic.';}
}
function calculateOpportunity(){
 const demand=Number(document.getElementById('searchDemand').value),share=Number(document.getElementById('clickShare').value),leadRate=Number(document.getElementById('leadRate').value),closeRate=Number(document.getElementById('closeRate').value),value=Number(document.getElementById('customerValue').value);
 const valid=[demand,share,leadRate,closeRate,value].every(Number.isFinite)&&demand>0&&[share,leadRate,closeRate].every(x=>x>=0&&x<=100)&&value>=0;
 if(!valid){['calcVisits','calcLeads','calcCustomers','calcRevenue'].forEach(id=>document.getElementById(id).textContent='—');return;}
 const visits=demand*share/100,leads=visits*leadRate/100,customers=leads*closeRate/100,revenue=customers*value;
 document.getElementById('calcVisits').textContent=fmt(visits);
 document.getElementById('calcLeads').textContent=fmt(leads);
 document.getElementById('calcCustomers').textContent=customers.toFixed(1);
 document.getElementById('calcRevenue').textContent=money(revenue);
 document.getElementById('calcFootnote').textContent='Illustrative monthly gross sales scenario. Calculated as demand × click share × lead rate × close rate × average first-sale value. Excludes costs, repeat sales, taxes and seasonality; not a forecast or guarantee.';
}
form.addEventListener('submit',async e=>{e.preventDefault();loading.classList.remove('hidden');const btn=document.getElementById('submit');btn.disabled=true;try{const r=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({website:document.getElementById('website').value,industry:document.getElementById('industry').value,location:document.getElementById('location').value})});const d=await r.json();if(!r.ok)throw new Error(d.detail||'Analysis failed');render(d);loading.classList.add('hidden');results.classList.remove('hidden')}catch(err){loading.classList.add('hidden');alert(err.message)}finally{btn.disabled=false}});
document.getElementById('generateAds').addEventListener('click',async()=>{
 if(!currentReport?.report_id)return;
 const btn=document.getElementById('generateAds'),out=document.getElementById('adConcepts');
 btn.disabled=true;btn.textContent='Generating…';out.innerHTML='<div class="empty-state">Preparing platform-specific draft concepts…</div>';
 try{
  const tone=document.getElementById('creativeTone').value;
  const r=await fetch(`/api/reports/${currentReport.report_id}/ad-concepts`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tone})});
  const d=await r.json();if(!r.ok)throw new Error(d.detail||'AI creative generation failed');
  out.innerHTML=(d.ads||[]).map((ad,i)=>`<article class="ad-card"><div class="ad-top"><span>${esc(ad.platform)}</span><small>${esc(ad.objective)}</small></div><div class="ad-preview-label">SPONSORED · ${esc(currentReport.business.domain)}</div><h4>${esc(ad.headline)}</h4><p>${esc(ad.primary_text)}</p><div class="ad-description">${esc(ad.description)}</div><div class="ad-cta">${esc(ad.cta)}</div><div class="ad-meta"><b>Audience</b><p>${esc(ad.audience)}</p><b>Visual direction</b><p>${esc(ad.visual_direction)}</p></div></article>`).join('')+`<p class="small-note">${esc(d.disclaimer||'Draft creative concepts. Review before use.')}</p>`;
 }catch(err){out.innerHTML=`<div class="empty-state error-state">${esc(err.message)}</div>`}
 finally{btn.disabled=false;btn.textContent='Generate ad concepts ↗'}
});
document.getElementById('close').addEventListener('click',()=>results.classList.add('hidden'));