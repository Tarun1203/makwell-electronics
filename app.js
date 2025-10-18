/* ===== Theme ===== */
(function(){
  const KEY='mw_theme', html=document.documentElement;
  const set = t => t==='dark' ? html.setAttribute('data-theme','dark') : html.removeAttribute('data-theme');
  const stored=localStorage.getItem(KEY), prefers=matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  set(stored || (prefers ? 'dark' : 'light'));
  window.toggleTheme = function(){
    const n = html.getAttribute('data-theme')==='dark' ? 'light' : 'dark';
    set(n); localStorage.setItem(KEY,n);
    const b=document.getElementById('themeToggle'); if(b) b.textContent = n==='dark' ? '🌙 Dark' : '☀️ Light';
  };
  addEventListener('DOMContentLoaded',()=>{ const b=document.getElementById('themeToggle'); if(b) b.textContent = html.getAttribute('data-theme')==='dark' ? '🌙 Dark' : '☀️ Light'; });
})();

/* ===== Home: simple carousel + Diwali (if present) ===== */
(function(){
  const slider = document.getElementById('slider');
  if(!slider) return;
  const track = slider.querySelector('.slides');
  const slides = Array.from(track.querySelectorAll('.slide'));
  const dotsEl = document.getElementById('dots');
  const prev = slider.querySelector('.arrow.prev');
  const next = slider.querySelector('.arrow.next');
  let i=0, hover=false, timer=null, startX=null, dx=0, D=5000;

  function setIndex(n){
    i=(n+slides.length)%slides.length;
    track.style.transform=`translateX(${-i*100}%)`;
    if(dotsEl){
      Array.from(dotsEl.children).forEach((d,idx)=>d.classList.toggle('active', idx===i));
    }
    fitHeight();
  }
  function auto(){ clearInterval(timer); timer=setInterval(()=>{ if(!hover) setIndex(i+1); },D) }
  if(dotsEl){
    dotsEl.innerHTML = slides.map((_,k)=>`<button class="dot${k===0?' active':''}" aria-label="Go to slide ${k+1}"></button>`).join('');
    Array.from(dotsEl.children).forEach((d,idx)=>d.addEventListener('click',()=>{ setIndex(idx); auto(); }));
  }
  prev?.addEventListener('click',()=>{setIndex(i-1);auto()});
  next?.addEventListener('click',()=>{setIndex(i+1);auto()});
  slider.addEventListener('mouseenter',()=>hover=true);
  slider.addEventListener('mouseleave',()=>hover=false);
  slider.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;dx=0;clearInterval(timer)},{passive:true});
  slider.addEventListener('touchmove',e=>{if(startX==null)return;dx=e.touches[0].clientX-startX},{passive:true});
  slider.addEventListener('touchend',()=>{ if(Math.abs(dx)>40) setIndex(i+(dx<0?1:-1)); startX=null;dx=0;auto(); });

  function fitHeight(){
    const img=slides[i].querySelector('img'); if(!img) return;
    const vw=slider.clientWidth;
    const set=()=>{ const r=(img.naturalWidth&&img.naturalHeight)?(img.naturalHeight/img.naturalWidth):(9/21);
      const h=Math.min(700,Math.max(240,vw*r)); slider.style.height=h+'px';};
    img.complete?set():img.addEventListener('load',set,{once:true});
  }
  addEventListener('resize',fitHeight);
  setIndex(0); auto(); fitHeight();

  /* Diwali banner only on Home (if element exists) */
  const el = document.getElementById('diwaliBanner');
  if(el){
    const KEY='mw_diwali_dismissed';
    const now=new Date();
    const start=new Date(Date.UTC(2025,9,10)), end=new Date(Date.UTC(2025,10,16)); // Oct10–Nov16, 2025
    if(now>=start && now<=end && !localStorage.getItem(KEY)){
      el.hidden=false;
      const s=el.querySelector('.sparkles');
      for(let k=0;k<26;k++){
        const i=document.createElement('i'); i.style.left=(Math.random()*100)+'%'; i.style.top=(Math.random()*100)+'%'; i.style.animationDelay=(Math.random()*2)+'s'; s.appendChild(i);
      }
      el.querySelector('.close').addEventListener('click',()=>{ el.hidden=true; localStorage.setItem(KEY,'1'); });
    }
  }
})();

/* ===== Products: load JSON + grid + mini-CTA ===== */
(async function(){
  const results = document.getElementById('results');
  if(!results) return;

  const RAW = 'https://raw.githubusercontent.com/Tarun1203/makwell-electronics/main/products.json';
  let data=[];
  try{
    const r=await fetch(RAW,{cache:'no-store'}); data=await r.json();
  }catch(e){ console.error('Products load failed',e); }

  /* build category options */
  const catSel=document.getElementById('category');
  const cats=['All',...new Set(data.map(p=>p.category))];
  catSel.innerHTML = cats.map(c=>`<option value="${c}">${c}</option>`).join('');

  /* render */
  function card(p){
    const tags = (p.tags||[]).slice(0,3).map(t=>`<span class="badge">${t}</span>`).join('');
    const specs = (p.specs||[]).slice(0,2).map(t=>`<span class="badge">${t}</span>`).join('');
    const img = p.image?.startsWith('http') ? p.image : `https://raw.githubusercontent.com/Tarun1203/makwell-electronics/main/${p.image}`; // supports png & jpg
    return `
      <article class="card sku">
        <div class="imgbox">
          <img src="${img}" alt="${p.title}" onerror="this.onerror=null;this.src='https://raw.githubusercontent.com/Tarun1203/makwell-electronics/main/images/Makwell-logo.png'">
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <h3 style="margin:0;font-size:18px">${p.title}</h3>
          <div class="badge">Contact for price</div>
        </div>
        <div class="badges">${tags}</div>
        <div class="badges">${specs}</div>
        <div class="muted">${p.category}${p.size?` • ${p.size}${p.category==='Televisions'?'″':' kg'}`:''}</div>
        <div style="display:flex;gap:8px">
          <button class="btn">Add to Cart</button>
          <a class="btn secondary" href="contact.html">Details</a>
        </div>
      </article>`;
  }
  function render(){
    const q=document.getElementById('q').value.trim().toLowerCase();
    const cat=catSel.value;
    const list=data.filter(p=>{
      const okCat = (cat==='All'||p.category===cat);
      const okQ = !q || [p.title,p.category,(p.tags||[]).join(' '),(p.specs||[]).join(' ')].join(' ').toLowerCase().includes(q);
      return okCat && okQ;
    });
    document.getElementById('skuCount').textContent = `${list.length} item${list.length!==1?'s':''}`;
    results.innerHTML = list.map(card).join('');
  }
  document.getElementById('q').addEventListener('input',render);
  catSel.addEventListener('change',render);
  render();

  /* Sticky mini-CTA */
  const KEY='mw_hide_cta'; const cta=document.getElementById('miniCta');
  if(cta && !localStorage.getItem(KEY)){ cta.hidden=false; document.body.classList.add('has-cta'); }
  cta?.querySelector('.close')?.addEventListener('click',()=>{ cta.hidden=true; document.body.classList.remove('has-cta'); localStorage.setItem(KEY,'1'); });
})();

/* image fallback utility for any <img data-fallback> (optional) */
window.mwImgFallback = function(img, altSrc){
  img.onerror=null; img.src = altSrc || 'https://raw.githubusercontent.com/Tarun1203/makwell-electronics/main/images/Makwell-logo.png';
};
