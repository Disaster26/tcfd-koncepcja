/* sklep - makieta: koszyk w localStorage, filtry, karta produktu */
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const zl=n=>n.toFixed(2).replace('.',',')+' zł';
const KAT={oznaczenia:'Naszywki i oznaczenia',oporzadzenie:'Oporządzenie',rit:'Linia RIT',szelki:'Szelki',jednostki:'Dla jednostek'};
const KAT_URL={oznaczenia:'naszywki-i-oznaczenia.html',oporzadzenie:'oporzadzenie.html',rit:'linia-rit.html',szelki:'szelki.html',jednostki:'dla-jednostek.html'};
const ikonaKosz='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M3 4h2.5l2.2 11h10.6l2-8H7"/><circle cx="9.5" cy="19.5" r="1.4" fill="currentColor"/><circle cx="17" cy="19.5" r="1.4" fill="currentColor"/></svg>';
const foto=(p,i=0)=>`img/p-${p.id}-${i}.webp`;
const P=id=>PRODUKTY.find(x=>x.id===id);

let kosz=[];
try{kosz=JSON.parse(localStorage.getItem('tcfd-koszyk')||'[]')}catch(e){kosz=[]}
const zapisz=()=>{try{localStorage.setItem('tcfd-koszyk',JSON.stringify(kosz))}catch(e){} rysujKosz()};

function toast(t){const el=$('.toast');if(!el||document.body.classList.contains('k-otw'))return;el.textContent=t;el.classList.add('widac');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('widac'),2600)}

window.dodajDoKoszyka=function(id,opcje='',ile=1){
  const p=P(id); if(!p||p.niedostepny||p.wycena) return;
  const k=id+'|'+opcje, w=kosz.find(x=>x.k===k);
  if(w) w.ile+=ile; else kosz.push({k,id,opcje,ile});
  zapisz(); toast(p.name+' - dodano do koszyka');
};

function karta(p){
  const cena=p.wycena?'<span class="cena" style="font-size:19px">wycena</span>':`<span class="cena">${p.od?'<small>od</small>':''}${zl(p.price)}</span>`;
  const btn=(p.wycena||p.cats.includes('jednostki'))?'':p.niedostepny?`<span class="dodaj szary" aria-hidden="true">${ikonaKosz}</span>`
    :p.var.length?`<span class="dodaj" aria-hidden="true" title="Wybierz wariant">${ikonaKosz}</span>`
    :`<button class="dodaj" type="button" data-dodaj="${p.id}" aria-label="Dodaj ${p.name} do koszyka">${ikonaKosz}</button>`;
  const zn=p.niedostepny?'<span class="znacz">Chwilowo niedostępny</span>':(p.cats.includes('rit')?'<span class="znacz">Linia RIT</span>':'');
  return `<a class="karta" href="produkt.html?p=${p.id}"><div class="fot"><img src="${foto(p)}" alt="${p.name}" width="783" height="587" loading="lazy" decoding="async">${zn}</div><div class="opis"><h3>${p.name}</h3><p class="krotko">${p.short}</p><div class="dol">${cena}${btn}</div></div></a>`;
}

/* sklep: siatka wg kategorii strony, sortowanie */
const siatka=$('#siatka');
const POLECANE=['tcfd-backtag','tcfd-id-tag','tcfd-anti-sway','tcfd-ritband','tcfd-d-chock','tcfd-v-shape','tcfd-qrs','haftowana-flaga-polski'];
if(siatka){
  const k=siatka.dataset.kat;
  const lista=k==='polecane'?POLECANE.map(P).filter(Boolean):PRODUKTY.filter(p=>!p.cats.includes('jednostki')&&(k==='wszystko'||p.cats.includes(k)));
  const odm=n=>n===1?'produkt':(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?'produkty':'produktów';
  const rysuj=()=>{
    const s=$('#sort')?$('#sort').value:'';
    const l=[...lista];
    if(s==='cena') l.sort((a,b)=>a.price-b.price); else if(s==='-cena') l.sort((a,b)=>b.price-a.price); else if(s==='nazwa') l.sort((a,b)=>a.name.localeCompare(b.name,'pl'));
    siatka.innerHTML=l.map(karta).join('');
    const ile=$('#ile'); if(ile) ile.textContent=l.length+' '+odm(l.length);
  };
  $('#sort')&&$('#sort').addEventListener('change',rysuj);
  rysuj();
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-dodaj]'); if(b){e.preventDefault();e.stopPropagation();dodajDoKoszyka(b.dataset.dodaj)}
});

/* karta produktu */
const zakup=$('#zakup');
if(zakup){
  const id=new URLSearchParams(location.search).get('p')||'tcfd-d-chock';
  const p=P(id)||P('tcfd-d-chock');
  document.title=p.name+' - '+p.short+' | TCFD Departament Pożarnictwa';
  $('#okr-kat').textContent=KAT[p.cats[0]]; $('#okr-kat').href=KAT_URL[p.cats[0]]; $('#okr-nazwa').textContent=p.name;
  const n=Math.max(1,p.img);
  $('#slajdy').innerHTML=Array.from({length:n},(_,i)=>`<img src="${foto(p,i)}" alt="${p.name} - zdjęcie ${i+1}" width="783" height="587" ${i?'loading="lazy"':'fetchpriority="high"'}>`).join('');
  $('#miniatury').innerHTML=n>1?Array.from({length:n},(_,i)=>`<button type="button" data-i="${i}" class="${i?'':'akt'}" aria-label="Zdjęcie ${i+1}"><img src="${foto(p,i)}" alt="" loading="lazy"></button>`).join(''):'';
  $('#kropki').innerHTML=n>1?Array.from({length:n},(_,i)=>`<i class="${i?'':'akt'}"></i>`).join(''):'';
  if(n<2) $$('.strzalka').forEach(s=>s.remove());
  const sl=$('#slajdy'), idx=()=>Math.round(sl.scrollLeft/sl.clientWidth);
  const idz=i=>sl.scrollTo({left:Math.max(0,Math.min(n-1,i))*sl.clientWidth,behavior:'smooth'});
  sl.addEventListener('scroll',()=>{const i=idx();$$('#miniatury button').forEach((b,j)=>b.classList.toggle('akt',j===i));$$('#kropki i').forEach((b,j)=>b.classList.toggle('akt',j===i))},{passive:true});
  $('#miniatury').addEventListener('click',e=>{const b=e.target.closest('button');if(b)idz(+b.dataset.i)});
  $$('.strzalka').forEach(s=>s.addEventListener('click',()=>idz(idx()+(s.classList.contains('p')?1:-1))));
  /* przeciąganie myszą */
  let x0=null,s0=0; sl.addEventListener('mousedown',e=>{x0=e.clientX;s0=sl.scrollLeft;sl.style.scrollSnapType='none'});
  window.addEventListener('mousemove',e=>{if(x0!==null)sl.scrollLeft=s0-(e.clientX-x0)});
  window.addEventListener('mouseup',e=>{if(x0===null)return;const d=e.clientX-x0;x0=null;sl.style.scrollSnapType='';idz(Math.round(s0/sl.clientWidth)+(d<-50?1:d>50?-1:0))});
  sl.addEventListener('dragstart',e=>e.preventDefault());

  $('#p-nazwa').textContent=p.name; $('#p-krotko').textContent=p.short;
  $('#p-cena').innerHTML=p.wycena?'Wycena na zapytanie':(p.od?'<small>od</small>':'')+zl(p.price);
  $('#p-opcje').innerHTML=p.var.map(([nazwa,w],i)=>w==='text'
    ?`<label>${nazwa} (wielkie litery)<input data-op="${nazwa}" maxlength="14" placeholder="np. KOWALSKI" autocomplete="off"></label>`
    :`<label>${nazwa}<select data-op="${nazwa}">${w.map(o=>`<option>${o}</option>`).join('')}</select></label>`).join('');
  let ile=1; const pokaz=()=>$('#p-ile').textContent=ile;
  $('#p-minus').onclick=()=>{ile=Math.max(1,ile-1);pokaz()}; $('#p-plus').onclick=()=>{ile++;pokaz()};
  const btn=$('#p-dodaj');
  if(p.niedostepny){btn.disabled=true;btn.textContent='Chwilowo niedostępny'}
  else if(p.wycena||p.cats.includes('jednostki')){btn.textContent='Poproś o wycenę';btn.onclick=()=>location.href='kontakt.html';$('.zakup .ilosc').style.display='none'}
  else btn.onclick=()=>{const op=$$('[data-op]').map(e=>e.dataset.op+': '+(e.value.trim()||'-')).join(', ');otworzKosz();dodajDoKoszyka(p.id,op,ile)};
  const desc=[];for(const t of p.desc){desc.push(t);if(t.endsWith(':'))break}
  const czas=p.desc.find(t=>/czas realizacji/i.test(t));
  $('#p-opis').innerHTML=desc.filter(t=>t!==czas&&!t.endsWith(':')).map(t=>`<p>${t}</p>`).join('');
  if(czas) $('#p-uwaga').textContent=czas; else $('#p-uwaga').remove();
  const pod=PRODUKTY.filter(x=>x.id!==p.id&&x.cats.some(c=>p.cats.includes(c))&&!x.wycena);
  const reszta=PRODUKTY.filter(x=>x.id!==p.id&&!pod.includes(x)&&!x.wycena);
  $('#podobne').innerHTML=pod.concat(reszta).slice(0,8).map(karta).join('');
}

/* koszyk */
const kEl=$('.koszyk');
const KODY={RIT10:{kat:'rit',proc:10,opis:'-10% na produkty z linii RIT'}};
let kodAkt='';try{kodAkt=localStorage.getItem('tcfd-kod')||''}catch(e){}
if(!KODY[kodAkt]) kodAkt='';
function rysujKosz(){
  const n=kosz.reduce((a,x)=>a+x.ile,0); $$('.licznik').forEach(e=>e.textContent=n);
  if(!kEl) return;
  const lista=$('.k-lista',kEl);
  lista.innerHTML=kosz.length?kosz.map((x,i)=>{const p=P(x.id);return `<div class="poz"><img src="${foto(p)}" alt=""><div><h4>${p.name}</h4>${x.opcje?`<small>${x.opcje}</small>`:''}<div class="ilosc"><button type="button" data-m="${i}" aria-label="Mniej">-</button><span>${x.ile}</span><button type="button" data-p="${i}" aria-label="Więcej">+</button></div></div><div><div class="p">${zl(p.price*x.ile)}</div><button type="button" class="usun" data-u="${i}">usuń</button></div></div>`}).join(''):'<p class="k-pusty">Koszyk jest pusty. Wybierz coś ze sklepu.</p>';
  const suma=kosz.reduce((a,x)=>a+P(x.id).price*x.ile,0);
  let rabat=0;
  if(kodAkt){rabat=kosz.reduce((a,x)=>{const p=P(x.id);return a+(p.cats.includes(KODY[kodAkt].kat)?p.price*x.ile*KODY[kodAkt].proc/100:0)},0)}
  $('.rabat',kEl).hidden=!rabat; $('.k-rabat',kEl).textContent='-'+zl(rabat);
  $('.k-suma',kEl).textContent=zl(suma-rabat);
  $('.k-dalej',kEl).disabled=!kosz.length;
}
window.otworzKosz=()=>{document.body.classList.add('k-otw');kEl.classList.remove('zam')};
const zamknijKosz=()=>document.body.classList.remove('k-otw');
$$('.koszyk-btn').forEach(b=>b.addEventListener('click',otworzKosz));
$('.zaslona')&&$('.zaslona').addEventListener('click',zamknijKosz);
$('.zamknij')&&$('.zamknij').addEventListener('click',zamknijKosz);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){zamknijKosz();document.body.classList.remove('m-otw')}});
kEl&&kEl.addEventListener('click',e=>{
  const t=e.target;
  if(t.dataset.m){const x=kosz[+t.dataset.m];x.ile--;if(!x.ile)kosz.splice(+t.dataset.m,1);zapisz()}
  else if(t.dataset.p){kosz[+t.dataset.p].ile++;zapisz()}
  else if(t.dataset.u){kosz.splice(+t.dataset.u,1);zapisz()}
  else if(t.closest('.k-dalej')&&kosz.length){kEl.classList.add('zam');t.closest('.k-dalej').style.display='none'}
  else if(t.closest('.wroc')){kEl.classList.remove('zam');$('.k-dalej',kEl).style.display=''}
});
const fk=$('form.kod');
if(fk){
  const info=$('.kod-info',fk);
  if(kodAkt){fk.kod.value=kodAkt;info.textContent='Kod '+kodAkt+': '+KODY[kodAkt].opis}
  fk.addEventListener('submit',e=>{e.preventDefault();const v=fk.kod.value.trim().toUpperCase();
    if(KODY[v]){kodAkt=v;info.textContent='Kod '+v+': '+KODY[v].opis;info.classList.remove('zly')}
    else{kodAkt='';info.textContent=v?'Nieznany kod.':'';info.classList.add('zly')}
    try{localStorage.setItem('tcfd-kod',kodAkt)}catch(e){} rysujKosz()});
}
rysujKosz();

/* wyskakujące okienko z promocją (raz na wizytę) */
const pr=$('.promo');
if(pr){
  let byl=false;try{byl=sessionStorage.getItem('tcfd-promo')==='1'}catch(e){}
  const zam=()=>{pr.hidden=true;try{sessionStorage.setItem('tcfd-promo','1')}catch(e){}};
  if(!byl&&!/linia-rit/.test(location.pathname)) setTimeout(()=>{if(!document.body.classList.contains('k-otw')){pr.hidden=false;try{sessionStorage.setItem('tcfd-promo','1')}catch(e){}}},7000);
  $('.promo-x',pr).addEventListener('click',zam); $('a',pr).addEventListener('click',zam);
}

/* menu mobilne */
const h=$('.hamb'); h&&h.addEventListener('click',()=>{const o=document.body.classList.toggle('m-otw');h.setAttribute('aria-expanded',o)});
$$('.panel a').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('m-otw')));

/* formularz pokazowy */
$$('form[data-pokaz]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();toast('To podgląd strony - formularz nie wysyła wiadomości.')}));

})();
