let groupMode = 'mp';
let catalog = [];
let sharedOnly=false;
function hasPrestigeOne(d){return !!(d.p1 || d.p2 || d.p3 || d.p4 || d.masterLevel>0);}
function groupName(text) {
  const rule = text.split(';')[0];
  if (text.includes('kez tekrarla') || rule === 'Ölmeden 3 eleme yap.') return rule;
  if(text.includes(';')) return rule;
  return rule.replace(/^(\d+) çift eleme yap\.$/,'Çift eleme').replace(/\d+ (?:eleme yap|oyuncu ele|düşman ele)\./, 'eleme')
    .replace(/^\d+ çift eleme.*$/, 'Çift eleme')
    .replace(/^\d+ killstreak veya araç yok et\./, 'Killstreak veya araç imhası');
}
async function initCatalog() {
  const rows = weapons.flatMap(w => trackedTasks(w).flatMap(([flag,s],i) =>
    ['mp','dmz'].map(mode => ({weapon:w.id, index:i, flag, mode, group:groupName(s[mode])}))));
  catalog=rows;
  try {
    const db=await new Promise((resolve,reject)=>{
      const request=indexedDB.open('mw4-gorevler',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('gorevler',{keyPath:['weapon','index','mode']});
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
    try {
      catalog=await new Promise((resolve,reject)=>{
        const tx=db.transaction('gorevler','readwrite'), store=tx.objectStore('gorevler');
        store.clear();
        rows.forEach(row=>store.put(row));
        const query=store.getAll();
        tx.oncomplete=()=>resolve(query.result);
        tx.onabort=()=>reject(tx.error);
      });
    } finally { db.close(); }
  } catch { /* Private browsing can disable IndexedDB. Use the same catalog in memory. */ }
  if(page==='groups') renderGroups();
}
function renderGroups() {
  const groups=new Map();
  for(const row of catalog.filter(row=>row.mode===groupMode)){
    const w=weapons.find(w=>w.id===row.weapon), d=get(w.id), i=row.index;
    if(!hasPrestigeOne(d)) continue;
    const [key,s]=trackedTasks(w)[i];
    let eligible;
    if(key.startsWith('sp')) eligible=true;
    if(key==='gold') eligible=boolKeys.slice(0,11).every(k=>d[k]);
    if(key==='platinum') eligible=weapons.filter(x=>x.category===w.category).every(x=>get(x.id).gold);
    if(key==='harmonic') eligible=total('platinum')===weapons.length;
    const unlocked=eligible;
    if(!unlocked || d[key]) continue;
    if(!groups.has(row.group)) groups.set(row.group,[]);
    groups.get(row.group).push({w,d,s,i:key});
  }
  for(const w of weapons){
    const d=get(w.id), stages=camos.filter(c=>c[0].startsWith(groupMode));
    if(!hasPrestigeOne(d)) continue;
    stages.forEach((c,i)=>{
      const key=c[0],value=d[key]||0,required=targets[key];
      const ready=i===0?divergence():(d[stages[i-1][0]]||0)>=targets[stages[i-1][0]];
      if(value>=required || !ready)return;
      if(!groups.has(c[3]))groups.set(c[3],[]);
      groups.get(c[3]).push({w,s:{name:c[1]},i:key,mastery:true});
    });
  }
  const sorted=[...groups].filter(([,rows])=>!sharedOnly || new Set(rows.map(r=>r.w.id)).size>1).sort((a,b)=>b[1].length-a[1].length || a[0].localeCompare(b[0],'tr'));
  document.querySelector('#groupsPage').innerHTML=`<div class="group-summary"><small>CEPHANELİK / GÖREV TAKİBİ</small><div class="section-head"><div><h2>Açık görev grupları</h2><p>Prestij 1’e ulaşan silahların bitmemiş görevleri. Aynı koşulu isteyen silahları birlikte görebilirsin.</p></div></div><div class="group-metrics"><span><b>${weapons.filter(w=>hasPrestigeOne(get(w.id))).length}</b> Prestij 1+ silah</span><span><b>${sorted.length}</b> görev grubu</span></div></div>
  <div class="group-toolbar"><div class="mode">${['mp','dmz'].map(m=>`<button data-group-mode="${m}" class="${m===groupMode?'active':''}">${m.toUpperCase()}</button>`).join('')}</div><label><input type="checkbox" data-shared ${sharedOnly?"checked":""}> Birden fazla silahta olanlar</label></div>
  ${sorted.map(([title,items])=>`<article class="group-card"><h3>${escapeText(title)} <small>${items.length} görev</small></h3>${items.map(({w,d,s,i,mastery})=>`<div class="group-item"><div class="group-identity"><img alt="" loading="lazy" src="${image(s.slug || camos.find(c=>c[0]===i)?.[2])}"><button data-jump="${w.id}" data-jump-tab="${mastery?'mastery':'camo'}"><b>${w.name}</b><small>${escapeText(s.name)}</small></button></div>${mastery?`<label class="special-counter"><input type="number" data-owner="${w.id}" data-count="${i}" min="0" max="${targets[i]}" value="${get(w.id)[i]||0}" aria-label="${escapeText(s.name)} ilerlemesi"><b>/${targets[i]}</b></label>`:specialRequirement(w,s,i,groupMode)}</div>`).join('')}</article>`).join('') || '<p class="notice">Bu modda uygun görev yok. Silahlar bölümünde Prestij 1’e ulaşan silahlarını işaretle.</p>'}`;
}
document.addEventListener('click',e=>{
  const button=e.target.closest('button');
  if(button?.dataset.groupMode){groupMode=button.dataset.groupMode;renderGroups();}
  if(button?.dataset.jump){selected=button.dataset.jump;detailTab=button.dataset.jumpTab;mode=groupMode;document.querySelector('[data-page="weapons"]').click();document.querySelector('#detail').scrollIntoView();}
});
document.addEventListener('change',e=>{if(e.target.hasAttribute('data-shared')){sharedOnly=e.target.checked;renderGroups();}});
