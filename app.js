/* ===== Products: load JSON + grid + mini-CTA ===== */
(async function(){
  const results = document.getElementById('results');
  if(!results) return;

  const RAW = 'https://raw.githubusercontent.com/Tarun1203/makwell-electronics/main/products.json';
  let data=[];
  try{
    const r=await fetch(RAW,{cache:'no-store'}); data=await r.json();
  }catch(e){ console.error('Products load failed',e); }

  const RAWROOT = 'https://raw.githubusercontent.com/Tarun1203/makwell-electronics/main/';
  const LOGO = RAWROOT + 'images/Makwell-logo.png';

  // Build a list of possible URLs for each product image and try them in order
  function candidatesFor(p){
    // take original path or filename
    const input = (p.image || '').trim();
    const isHttp = /^https?:\/\//i.test(input);
    const folderHint = input.includes('/') ? input.split('/')[0].toLowerCase() : '';
    const file = input.split('/').pop() || '';        // MK24.jpg
    const base = file.replace(/\.(png|jpg|jpeg|webp)$/i,''); // MK24
    const idBase = (p.id || '').trim();

    const roots = [ RAWROOT ]; // all images live in repo
    const folders = [
      '',                      // try at repo root (in case JSON already has path)
      'images/',               // your final images directory
      'assets/'                // legacy path from old JSON
    ];

    const names = [];
    if (isHttp) names.push(input);               // honor full URL first
    if (input)  names.push(input);               // original as-is
    if (base)   names.push('images/' + base);    // guessed path without ext
    if (idBase) names.push('images/' + idBase);  // try id as filename too

    // Expand each name with common extensions and case variants
    const exts = ['.jpg','.JPG','.png','.PNG','.jpeg','.JPEG','.webp','.WEBP'];

    const pool = new Set();
    for (const n of names){
      const hasExt = /\.[a-zA-Z]+$/.test(n);
      if (isHttp && hasExt){ pool.add(n); continue; }
      if (hasExt){
        // add raw-rooted version
        pool.add(n.startsWith('http') ? n : RAWROOT + n);
      }else{
        for (const e of exts){
          const path = n + e;
          pool.add(path.startsWith('http') ? path : RAWROOT + path);
        }
      }
    }

    // If input started with a known folder, also try swapping folders
    if (folderHint && (folderHint==='assets' || folderHint==='images') && file){
      for (const f of folders){
        for (const e of exts){
          pool.add(RAWROOT + f + base + e);
        }
      }
    }

    // Always end with logo as the final fallback (set in onerror once we exhaust)
    return Array.from(pool);
  }

  // Onerror handler: rotate to the next candidate
  window.mwTryNext = function(img){
    try{
      const list = JSON.parse(img.dataset.candidates || '[]');
      let idx = +(img.dataset.idx || 0);
      if (idx+1 < list.length){
        img.dataset.idx = (idx+1);
        img.src = list[idx+1];
      } else {
        img.onerror = null;
        img.src = LOGO;
      }
    }catch(err){
      img.onerror = null;
      img.src = LOGO;
    }
  };

  function card(p){
    const cands = candidatesFor(p);
    const first = cands[0] || LOGO;
    const tags = (p.tags||[]).slice(0,3).map(t=>`<span class="badge">${t}</span>`).join('');
    const specs = (p.specs||[]).slice(0,2).map(t=>`<span class="badge">${t}</span>`).join('');

    return `
      <article class="card sku">
        <div class="imgbox">
          <img
            alt="${p.title}"
            src="${first}"
            data-candidates='${JSON.stringify(cands).replace(/'/g,"&apos;")}'
            data-idx="0"
            onerror="mwTryNext(this)">
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

  // Build category dropdown & render
  const catSel = document.getElementById('category');
  const cats=['All',...new Set(data.map(p=>p.category))];
  catSel.innerHTML = cats.map(c=>`<option value="${c}">${c}</option>`).join('');

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
