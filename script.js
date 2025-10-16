/* script.js — MakWell storefront
   Uses RAW image base: https://raw.githubusercontent.com/Tarun1203/makwell-electronics/main/images/
*/
(() => {
  // ---------- Config ----------
  const RAW_BASE = 'https://raw.githubusercontent.com/Tarun1203/makwell-electronics/main/images/';

  // Inline SVG placeholder (never 404s)
  const PLACEHOLDER =
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#e6efff"/><stop offset="1" stop-color="#f3f6ff"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
        <g fill="#2563eb" font-family="system-ui, Segoe UI, Roboto, Arial" text-anchor="middle">
          <text x="240" y="165" font-size="22" font-weight="700">Image not available</text>
          <text x="240" y="195" font-size="14" opacity=".8">MakWell — Make it Happen</text>
        </g>
      </svg>`
    );

  // Convert any given path to a safe absolute URL for images:
  // - If already absolute (http/https), return as-is
  // - Else, extract filename and prefix with RAW_BASE
  const toImageUrl = (path) => {
    if (!path) return PLACEHOLDER;
    const p = String(path).trim();
    if (/^https?:\/\//i.test(p)) return p; // already absolute
    // strip folders and get base filename
    const file = p.split('/').pop();
    if (!file) return PLACEHOLDER;
    return RAW_BASE + file;
  };

  // ---------- Small helpers ----------
  const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const el = (s) => document.querySelector(s);
  const els = (s) => Array.from(document.querySelectorAll(s));

  const state = {
    products: [],
    filtered: [],
    cart: JSON.parse(localStorage.getItem('mw_cart') || '{}'), // {id: qty}
    page: 1,
    pageSize: 12,
    query: '',
    category: 'all',
    sort: 'popular'
  };

  // ---------- Toast ----------
  const toast = (msg) => {
    const t = el('#toast'); if (!t) return;
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(t._t); t._t = setTimeout(() => t.style.opacity = '0', 1500);
  };

  // ---------- Cart ----------
  const saveCart = () => localStorage.setItem('mw_cart', JSON.stringify(state.cart));
  const getQty = (id) => state.cart[id] || 0;
  const addToCart = (id) => { state.cart[id] = (state.cart[id] || 0) + 1; saveCart(); renderCart(); toast('Added to cart'); };
  const setQty = (id, qty) => { if (qty <= 0) delete state.cart[id]; else state.cart[id] = qty; saveCart(); renderCart(); };
  const clearCart = () => { state.cart = {}; saveCart(); renderCart(); };

  const productIndex = () => Object.fromEntries(state.products.map(p => [String(p.id), p]));

  // ---------- Filters / Sort ----------
  const applyFilters = () => {
    const q = state.query.trim().toLowerCase();
    let list = [...state.products];

    if (q) {
      list = list.filter(p =>
        `${p.name} ${p.title || ''} ${p.description || ''} ${(p.tags || []).join(' ')} ${(p.specs || []).join(' ')}`.toLowerCase().includes(q)
      );
    }
    if (state.category !== 'all') {
      list = list.filter(p => String(p.category).toLowerCase() === state.category.toLowerCase());
    }

    switch (state.sort) {
      case 'priceAsc': list.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'priceDesc': list.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case 'rating': list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'name': list.sort((a, b) => String(a.name || a.title).localeCompare(String(b.name || b.title))); break;
      default: list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    state.filtered = list;
    state.page = 1;
    render();
  };

  // ---------- Pagination ----------
  const paginate = (items) => {
    const start = (state.page - 1) * state.pageSize;
    return items.slice(start, start + state.pageSize);
  };

  const setPager = () => {
    const total = Math.ceil(state.filtered.length / state.pageSize) || 1;
    const pager = el('#pager'); if (!pager) return;
    pager.innerHTML = '';
    if (total <= 1) return;

    const mk = (n, label = n) => {
      const b = document.createElement('button');
      b.textContent = label;
      if (n === state.page) b.classList.add('active');
      b.onclick = () => { state.page = n; render(); };
      return b;
    };

    pager.append(mk(Math.max(1, state.page - 1), '‹ Prev'));
    for (let i = 1; i <= total; i++) pager.append(mk(i));
    pager.append(mk(Math.min(total, state.page + 1), 'Next ›'));
  };

  // ---------- Render list ----------
  const render = () => {
    const sku = el('#skuCount');
    if (sku) sku.textContent = `${state.filtered.length} items`;

    const pageItems = paginate(state.filtered);
    const grid = el('#results'); if (!grid) return;
    grid.innerHTML = '';

    for (const p of pageItems) {
      const card = document.createElement('article'); card.className = 'card';

      const src = toImageUrl(p.image);
      const priceHtml = (p.price && p.price > 0) ? INR.format(p.price) : 'Contact for price';
      const badgesHtml = (p.badges || []).map(b => `<span class="pill" title="${b}">${b}</span>`).join('');
      const osHtml = p.os ? `<span class="pill" title="OS">${p.os}</span>` : '';
      const specPills = (p.specs || []).slice(0, 4).map(s => `<span class="pill" title="Spec">${s}</span>`).join('');

      card.innerHTML = `
        <div class="media">
          <img alt="${(p.name || p.title || 'Product').replace(/"/g, '&quot;')}" loading="lazy" src="${src}">
        </div>
        <div class="body">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline">
            <h3 style="margin:0;font-size:16px">${p.name || p.title || 'Untitled'}</h3>
            <div class="price">${priceHtml}</div>
          </div>
          <div class="muted" style="display:flex;gap:8px;align-items:center;margin:6px 0;flex-wrap:wrap">
            <span class="pill">${(p.category || 'misc').toString()}</span>
            ${osHtml}${badgesHtml}
            <span>★ ${(p.rating || 0).toFixed(1)}</span>
            <span class="muted">${p.stock > 0 ? `In stock` : `Out of stock`}</span>
          </div>
          <p class="muted" style="margin:8px 0 12px;max-height:3.5em;overflow:hidden">${p.description || ''}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">${specPills}</div>
          <div style="display:flex;gap:8px">
            <button class="btn" ${p.stock > 0 ? '' : 'disabled'} data-add="${p.id}">Add to Cart</button>
            <button class="btn secondary" data-view="${p.id}">Details</button>
          </div>
        </div>`;

      // attach error fallback after element is in DOM
      grid.append(card);
      const img = card.querySelector('img');
      img.onerror = () => { img.src = PLACEHOLDER; };

    }

    els('[data-add]').forEach(b => b.onclick = () => addToCart(String(b.dataset.add)));
    els('[data-view]').forEach(b => b.onclick = () => openDetails(String(b.dataset.view)));
    setPager();
  };

  // ---------- Render cart ----------
  const renderCart = () => {
    const map = productIndex();
    const list = el('#cartList'); if (!list) return;
    list.innerHTML = '';
    let subtotal = 0;

    for (const [id, qty] of Object.entries(state.cart)) {
      const p = map[id]; if (!p) continue;
      subtotal += (p.price || 0) * qty;

      const row = document.createElement('div'); row.className = 'cart-item';
      row.innerHTML = `
        <img src="${toImageUrl(p.image)}" alt="${p.name || p.title || ''}" style="width:48px;height:48px;object-fit:cover;border-radius:8px">
        <div>
          <div style="display:flex;justify-content:space-between;gap:6px">
            <div>${p.name || p.title || 'Item'}</div>
            <b>${(p.price && p.price > 0) ? INR.format((p.price || 0) * qty) : '—'}</b>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="iconbtn" data-dec="${id}" type="button">−</button>
            <span>${qty}</span>
            <button class="iconbtn" data-inc="${id}" type="button">+</button>
            <button class="iconbtn" data-del="${id}" title="Remove" type="button">🗑</button>
          </div>
        </div>
        <span class="muted">${(p.price && p.price > 0) ? INR.format(p.price || 0) + ' ea' : 'Contact'}</span>`;

      const img = row.querySelector('img');
      img.onerror = () => { img.src = PLACEHOLDER; };

      list.append(row);
    }

    if (!Object.keys(state.cart).length) {
      list.innerHTML = `<div class="empty">Your cart is empty. Add some goodies!</div>`;
    }

    const sub = el('#subtotal'); if (sub) sub.textContent = INR.format(subtotal);
    els('[data-inc]').forEach(b => b.onclick = () => setQty(b.dataset.inc, getQty(b.dataset.inc) + 1));
    els('[data-dec]').forEach(b => b.onclick = () => setQty(b.dataset.dec, getQty(b.dataset.dec) - 1));
    els('[data-del]').forEach(b => b.onclick = () => setQty(b.dataset.del, 0));
  };

  // ---------- Details modal ----------
  const openDetails = (id) => {
    const p = state.products.find(x => String(x.id) === String(id)); if (!p) return;
    const priceHtml = (p.price && p.price > 0) ? INR.format(p.price) : 'Contact for price';
    const badgesHtml = (p.badges || []).map(t => `<span class='pill'>${t}</span>`).join('');
    const specs = (p.specs || []).map(s => `<span class='pill'>${s}</span>`).join('');
    const os = p.os ? `<span class='pill'>OS: ${p.os}</span>` : '';
    const series = p.series ? `<span class='pill'>Series: ${p.series}</span>` : '';

    const html = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,.4);display:grid;place-items:center;padding:20px;z-index:50">
        <article class="card" style="max-width:720px;width:100%;overflow:hidden">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;max-height:80vh">
            <div class="media" style="height:100%"><img src="${toImageUrl(p.image)}" alt="${p.name || p.title}"></div>
            <div class="body" style="overflow:auto">
              <h2 style="margin:0 0 6px">${p.name || p.title}</h2>
              <div class="price">${priceHtml}</div>
              <p class="muted">${p.description || ''}</p>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0">${os}${series}${badgesHtml}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0">${specs}</div>
              <div style="display:flex;gap:8px;margin-top:8px">
                <button class="btn" data-add="${p.id}" type="button">Add to Cart</button>
                <button class="btn secondary" data-close type="button">Close</button>
              </div>
            </div>
          </div>
        </article>
      </div>`;

    const wrap = document.createElement('div'); wrap.innerHTML = html;
    document.body.append(wrap);

    // modal handlers
    const img = wrap.querySelector('img');
    img.onerror = () => { img.src = PLACEHOLDER; };

    wrap.querySelector('[data-close]').onclick = () => wrap.remove();
    wrap.addEventListener('click', (e) => { if (e.target === wrap) wrap.remove(); });
    wrap.querySelector('[data-add]').onclick = () => addToCart(String(p.id));
  };

  // ---------- Data loading ----------
  async function loadProducts() {
    // products.json must be in your /perp repo root
    const tryPaths = ['products.json'];
    let json = null;

    for (const path of tryPaths) {
      try {
        const res = await fetch(path, { cache: 'no-store' });
        if (res.ok) { json = await res.json(); break; }
      } catch {}
    }
    if (!json) { alert('Could not find products.json'); json = []; }

    state.products = (json || []).map((p, i) => ({
      id: p.id ?? i + 1,
      name: p.name ?? p.title ?? `Product #${i + 1}`,
      title: p.title ?? p.name ?? '',
      price: (p.price ?? null),
      // Keep p.image but always resolve via toImageUrl() when rendering
      image: p.image ?? '',
      category: String(p.category ?? 'misc'),
      description: p.description ?? '',
      rating: Number(p.rating ?? 4.4 + Math.random() * 0.4),
      stock: Number(p.stock ?? 10),
      tags: Array.from(new Set([...(p.tags || []), p.os ? p.os : null].filter(Boolean))),
      specs: p.specs ?? [],
      os: p.os ?? '',
      series: p.series ?? '',
      brand: p.brand ?? 'MakWell',
      badges: p.badges ?? [],
      popularity: Number(p.popularity ?? (100 - i))
    }));

    // categories
    const cats = Array.from(new Set(state.products.map(p => String(p.category)))).sort();
    const catSel = el('#category');
    if (catSel) catSel.innerHTML = `<option value="all">All categories</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join('');

    applyFilters();
    renderCart();
  }

  // ---------- Events ----------
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  const q = el('#q');   if (q)   q.addEventListener('input', e => { state.query = e.target.value; debounce(applyFilters, 150)(); });
  const cat = el('#category'); if (cat) cat.addEventListener('change', e => { state.category = e.target.value; applyFilters(); });
  const sort = el('#sort'); if (sort) sort.addEventListener('change', e => { state.sort = e.target.value; applyFilters(); });

  const clear = el('#clearFilters');
  if (clear) clear.onclick = () => {
    state.query = ''; state.category = 'all'; state.sort = 'popular';
    if (q) q.value = ''; if (cat) cat.value = 'all'; if (sort) sort.value = 'popular';
    applyFilters();
  };

  const cc = el('#clearCart'); if (cc) cc.onclick = clearCart;

  const co = el('#checkout'); if (co) co.onclick = () => {
    const items = Object.entries(state.cart).map(([id, qty]) => ({ id, qty }));
    if (!items.length) return toast('Cart is empty');
    const payload = { brand: 'MakWell', currency: 'INR', items, ts: Date.now() };
    alert('Checkout payload:\n' + JSON.stringify(payload, null, 2));
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); q && q.focus(); }
  });

  // ---------- Init ----------
  loadProducts();
})();
