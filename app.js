// app.js — products + filters + remote overlay + basic carousel dots hookup
(async function () {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  // Fetch products
  const res = await fetch('products.json', { cache: 'no-store' });
  const products = await res.json();

  // Build filter options
  const catSel = document.getElementById('filter-category');
  const osSel  = document.getElementById('filter-os');
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  const oss  = [...new Set(products.map(p => p.os).filter(Boolean))].sort();
  cats.forEach(c => { const o = document.createElement('option'); o.value = o.textContent = c; catSel.appendChild(o); });
  oss.forEach(o  => { const opt = document.createElement('option'); opt.value = opt.textContent = o; osSel.appendChild(opt); });

  function normalizeImagePath(path) {
    if (!path) return '';
    // convert assets/ -> images/ for GH Pages
    return path.replace(/^assets\//i, 'images/');
  }

  function render(list) {
    grid.innerHTML = '';
    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const imgWrap = document.createElement('div');
      imgWrap.className = 'product-image';
      const img = document.createElement('img');
      img.alt = p.title;
      img.loading = 'lazy';
      img.src = normalizeImagePath(p.image);
      imgWrap.appendChild(img);

      // remote overlay for TVs
      if ((p.category || '').toLowerCase().includes('television')) {
        const overlay = document.createElement('img');
        overlay.src = 'images/remote.png'; // ensure this exists
        overlay.alt = '';
        overlay.className = 'remote-overlay';
        imgWrap.appendChild(overlay);
      }

      const body = document.createElement('div');
      body.className = 'product-body';

      const h3 = document.createElement('h3');
      h3.textContent = p.title;

      const meta = document.createElement('div');
      meta.className = 'product-meta';
      meta.textContent = [p.series, p.os].filter(Boolean).join(' • ');

      const tags = document.createElement('div');
      (p.tags || []).forEach(t => {
        const span = document.createElement('span');
        span.className = 'product-tag';
        span.textContent = t;
        tags.appendChild(span);
      });

      const specs = document.createElement('ul');
      specs.className = 'specs';
      (p.specs || []).forEach(s => {
        const li = document.createElement('li');
        li.textContent = s;
        specs.appendChild(li);
      });

      body.append(h3, meta, tags, specs);
      card.append(imgWrap, body);
      grid.appendChild(card);
    });
  }

  function applyFilters() {
    const c = catSel.value;
    const o = osSel.value;
    const filtered = products.filter(p =>
      (c ? p.category === c : true) &&
      (o ? p.os === o : true)
    );
    render(filtered);
  }

  catSel.addEventListener('change', applyFilters);
  osSel.addEventListener('change', applyFilters);

  render(products);

  // Carousel dots (optional; pairs with script.js prev/next)
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(track?.children || []);
  const dotsWrap = document.getElementById('carousel-dots');
  if (dotsWrap && slides.length) {
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'dot' + (i === 0 ? ' active' : '');
      b.addEventListener('click', () => window.__gotoSlide?.(i));
      dotsWrap.appendChild(b);
    });
    window.__markDot = (i) => {
      dotsWrap.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('active', idx === i));
    };
  }
})();
