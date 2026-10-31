const textureNames={24:'gold',25:'platinum',26:'harmonic-break',27:'divergence',29:'mercurial-drift',30:'polyatomic-reforged',31:'orion-reforged',33:'chiral',34:'ripple-tide',35:'helio',44:'pyroclast',45:'pyroclast-terminus',46:'pyroclast-scatter',47:'pyroclast-cascade'};
const military=['shed','grazer','ice-storm','dapple-cast','indexed','groundcover','mosswood','mausoleum'];
const image=n=>`https://mw4camos.com/_v/1920/camos/thumb/${textureNames[n]||n}.webp`;
const groups={'AR':['Han 86','M4','Hyeon Burst','Patriot XMR','Kastov 762','Oden','Axion','Cronen Squall'],'SMG':['ISO Nightshade','VEL 46','Wz.55 Striga','PPSh-41','X-58 Nyx'],'Pompalı':['Rezi 12','Warlord'],'LMG':['FiNN LMG','Type 73','APOC-338'],'Nişancı':['MAR-9','Oris 8.6','Mosin-Nagant'],'Keskin nişancı':['KG-7 Vulcan','Astaroth .57','Signal 50'],'Tabanca':['Sang 9mm','Krait P68','.50 GS','Mojave .357'],'Roketatar':['PILA','RPG-8','JOKR','PM-40 Anvil'],'Yakın dövüş':['FSS Carbon Edge 1095']};
const weapons=Object.entries(groups).flatMap(([category,names])=>names.map(name=>({id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name,category})));
const camos=[['gold','Gold',24,'Tüm temel ve özel görevler → tek maçta 15 MP / 100 DMZ elemesi.'],['platinum','Platinum',25,'Sınıfındaki bütün silahlarda Gold → sınıfa özel görev.'],['harmonic','Harmonic Break',26,'33 silahta Platinum → sınıfa özel görev.'],['divergence','Divergence',27,'33 silahta Harmonic Break tamamlandığında açılır.'],['mp1','Mercurial Drift',29,'MP: 250 maçın her birinde en az 10 eleme.'],['mp2','Polyatomic Reforged',30,'MP: Hasar almadan 3 eleme; 300 kez.'],['mp3','Orion Reforged',31,'MP: Ölmeden 5 eleme; 500 kez.'],['dmz1','Chiral',33,'DMZ: Tier 3+ düşmanlardan 2.500 eleme.'],['dmz2','Ripple Tide',34,'DMZ: Bir görevde 2 LT künyesiyle tahliye; 50 kez.'],['dmz3','Helio',35,'DMZ: Maksimum seviye operatör ve Legendary silahlarla 25.000 eleme.'],['p1','Pyroclast',44,'Silah Prestij 1, seviye 1.'],['p2','Pyroclast Terminus',45,'Silah Prestij 1, maksimum seviye.'],['p3','Pyroclast Scatter',46,'Silah Prestij Master, seviye 150.'],['p4','Pyroclast Cascade',47,'Silah Prestij Master, seviye 250.']];
const KEY='mw4-camo-tracker-v1',boolKeys=[...Array.from({length:8},(_,i)=>'mil'+i),...Array.from({length:3},(_,i)=>'sp'+i),'gold','platinum','harmonic','p1','p2','p3','p4'];
const targets={mp1:250,mp2:300,mp3:500,dmz1:2500,dmz2:50,dmz3:25000};
let state={weapons:{}},selected=weapons[0].id,category='Tümü',detailTab='camo',mode='mp',page='weapons';
function normalize(value){if(!value||typeof value!=='object'||!value.weapons||typeof value.weapons!=='object')throw Error('Geçersiz yedek');const out={weapons:{}};for(const w of weapons){const v=value.weapons[w.id];if(!v||typeof v!=='object')continue;const d={};for(const k of boolKeys)d[k]=v[k]===true;for(const [k,max]of Object.entries(targets))d[k]=Math.max(0,Math.min(max,Number.isFinite(v[k])?Math.floor(v[k]):0));trackedTasks(w).forEach(([flag,s])=>{
  for(const mode of ['mp','dmz']){
    const key=flag+mode, max=s[mode+'Target'];
    if(max && Number.isFinite(v[key])) d[key]=Math.max(0,Math.min(max,Math.floor(v[key])));
    if(max && d[key]===max) d[flag]=true;
  }
});d.masterLevel=Math.max(0,Math.min(250,Math.floor(Number(v.masterLevel)||0)));d.level=Math.max(0,Number.isSafeInteger(v.level)?v.level:0);
for(let i=0;i<3;i++)d['open'+i]=v['open'+i]===true;
d.favorite=v.favorite===true;d.note=typeof v.note==='string'?v.note.slice(0,2000):'';out.weapons[w.id]=d}return out}
try{const saved=localStorage.getItem(KEY);if(saved)state=normalize(JSON.parse(saved))}catch{document.getElementById('saved').textContent='Kayıt okunamadı; yedeğini içe aktarabilirsin.'}
const $=s=>document.querySelector(s);const get=id=>state.weapons[id]||{};const total=k=>weapons.filter(w=>get(w.id)[k]).length;const divergence=()=>total('harmonic')===33;
const progress=id=>boolKeys.slice(0,14).filter(k=>get(id)[k]).length;
function toast(msg){$('#toast').textContent=msg;$('#toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').style.display='none',3000)}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$('#saved').textContent='Kaydedildi · '+new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}catch{toast('Tarayıcı kaydı kullanılamıyor. İlerlemeni yedekle.');$('#saved').textContent='Kayıt başarısız — yedekle'}}
function update(key,value){state.weapons[selected]={...get(selected),[key]:value};save();render()}
function card(c,index){let n=c[0]==='divergence'?(divergence()?33:0):c[0]in targets?weapons.filter(w=>(get(w.id)[c[0]]||0)>=targets[c[0]]).length:total(c[0]);return `<article class="camo"><div class="art"><img src="${image(c[2])}" alt="${c[1]} kamuflajının kamuflaj deseni" loading="lazy"><span class="number">${String(index+1).padStart(2,'0')} / ${index<4?'COMPLETIONIST':index<10?'MASTERY':'PRESTİJ'}</span></div><div class="camo-body"><div class="camo-top"><h3>${c[1]}</h3><span class="amount">${n} / 33 silah</span></div><div class="track"><i style="width:${n/33*100}%"></i></div>${page==='collection'?`<p>${c[3]}</p>`:''}</div></article>`}
function render(){const done=weapons.reduce((sum,w)=>sum+progress(w.id),0),percent=Math.round(done/(33*14)*100);$('#overview').innerHTML=`<div class="stat"><label>ANA KAMUFLAJ İLERLEMESİ</label><strong>%${percent} <small>${done} / 462 adım</small></strong><div class="track"><i style="width:${percent}%"></i></div></div><div class="stat"><label>GOLD TAMAMLANAN</label><strong>${total('gold')} <small>/ 33 silah</small></strong></div><div class="stat"><label>DEVAM EDEN SİLAH</label><strong>${weapons.filter(w=>progress(w.id)>0&&progress(w.id)<14).length} <small>/ 33 silah</small></strong></div><div class="stat"><label>PRESTİJ KOLEKSİYONU</label><strong>${['p1','p2','p3','p4'].reduce((s,k)=>s+total(k),0)} <small>/ 132 kamuflaj</small></strong></div>`;$('#milestones').innerHTML=camos.slice(0,4).map(card).join('');$('#collection').innerHTML=camos.map(card).join('');$('#categories').innerHTML=['Tümü',...Object.keys(groups)].map(c=>`<button data-category="${c}" class="${category===c?'active':''}">${c}</button>`).join('');renderWeapons();renderDetail();if(page==='groups')renderGroups();document.querySelectorAll('img').forEach(img=>img.onerror=()=>{img.style.visibility='hidden';img.parentElement.setAttribute('title','Görsel şu anda yüklenemedi')})}
function renderWeapons(){const q=$('#search').value.toLocaleLowerCase('tr-TR'),filter=$('#status').value;const list=weapons.filter(w=>{const d=get(w.id),p=progress(w.id);return(category==='Tümü'||w.category===category)&&w.name.toLocaleLowerCase('tr-TR').includes(q)&&(filter==='all'||filter==='favorite'&&d.favorite||filter==='gold'&&d.gold||filter==='started'&&p>0&&p<14||filter==='new'&&p===0)});$('#weapons').innerHTML=list.length?list.map(w=>`<button class="weapon ${selected===w.id?'selected':''}" data-weapon="${w.id}" aria-pressed="${selected===w.id}"><span class="index">${String(weapons.indexOf(w)+1).padStart(2,'0')}</span><span><b>${w.name}</b><small>${w.category} · ${get(w.id).gold?'Gold açıldı':progress(w.id)?'Devam ediyor':'Henüz başlanmadı'}</small></span><span class="row-progress">${progress(w.id)} / 14<div class="track"><i style="width:${progress(w.id)/14*100}%"></i></div></span><span class="star">${get(w.id).favorite?'★':'›'}</span></button>`).join(''):'<p class="empty">Bu filtreye uygun silah bulunamadı.</p>'}
function task(k,name,desc,img){const checked=!!get(selected)[k];return `<label class="task ${checked?'done':''}"><input type="checkbox" data-check="${k}" ${checked?'checked':''}>${img?`<img src="${image(img)}" alt="${name} kamuflaj deseni">`:''}<div><b>${name}</b><small>${desc}</small></div></label>`}
function renderDetail(){renderWeaponDetail()}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.weapon){selected=b.dataset.weapon;renderWeapons();renderDetail();return}if(b.dataset.category){category=b.dataset.category;render();return}if(b.dataset.tab){detailTab=b.dataset.tab;renderDetail();return}if(b.dataset.mode){mode=b.dataset.mode;renderDetail();return}if(b.id==='favorite'){update('favorite',!get(selected).favorite);return}if(b.dataset.page){page=b.dataset.page;document.body.classList.toggle('view-groups',page==='groups');$('#groupsPage').hidden=page!=='groups';$('#weaponPage').hidden=page!=='weapons';$('#collectionPage').hidden=page!=='collection';document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===page));render();return}});
document.addEventListener('change',e=>{const el=e.target;
if(el.hasAttribute("data-master")){const d={...get(selected)};const old=d.masterLevel||0;d.masterLevel=Math.max(0,Math.min(250,Math.floor(Number(el.value)||0)));for(const [k,n] of [["p3",150],["p4",250]])if(old>=n || d.masterLevel>=n)d[k]=d.masterLevel>=n;state.weapons[selected]=d;save();render();return;}
if(el.hasAttribute("data-level")){const level=Math.max(0,Math.floor(Number(el.value)||0));const d={...get(selected),level};militaryLevels(selected)?.forEach((target,i)=>{if(level>=target)d['mil'+i]=true});state.weapons[selected]=d;save();render();return;}

if(el.dataset.special){
  const owner=el.dataset.owner;
  const key=el.dataset.special, flag=key.replace(/(mp|dmz)$/,''), s=new Map(trackedTasks(weapons.find(w=>w.id===owner))).get(flag);
  const d={...get(owner)}, reached=()=>['mp','dmz'].some(m=>s[m+'Target'] && d[flag+m]===s[m+'Target']);
  const wasReached=reached();
  d[key]=Math.max(0,Math.min(Number(el.max),Math.floor(Number(el.value)||0)));
  if(wasReached || reached()) d[flag]=reached();
  state.weapons[owner]=d;save();render();return;
}
if(el.dataset.check){
  const flag=el.dataset.check;
  const s=new Map(trackedTasks(weapons.find(w=>w.id===selected))).get(flag);
  if(s && !el.checked){
    const d={...get(selected)};
    for(const m of ['mp','dmz']) if(d[flag+m]===s[m+'Target']) d[flag+m]=0;
    state.weapons[selected]=d;
  }
  update(flag,el.checked);
}if(e.target.dataset.count){const key=e.target.dataset.count;const owner=el.dataset.owner||selected;state.weapons[owner]={...get(owner),[key]:Math.max(0,Math.min(targets[key],Math.floor(Number(el.value)||0)))};save();render()}});
document.addEventListener('input',e=>{if(e.target.id==='note'){state.weapons[selected]={...get(selected),note:e.target.value};save()}});
$('#search').addEventListener('input',renderWeapons);$('#status').addEventListener('change',renderWeapons);
$('#backup').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),...state},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='mw4-camo-yedek-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('İlerleme yedeğin indirildi.')};
$('#restore').onclick=()=>$('#file').click();$('#file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error();const imported=normalize(JSON.parse(await file.text()));if(!confirm('Mevcut ilerlemen yedekteki ilerlemeyle değiştirilsin mi?'))return;state=imported;save();render();toast('Yedeğin yüklendi.')}catch{toast('Geçerli bir MW4 Camo JSON yedeği seç.')}finally{e.target.value=''}};
window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{state=normalize(JSON.parse(e.newValue));render()}catch{}}});render();

initCatalog();
