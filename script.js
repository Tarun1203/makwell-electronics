document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle
  const root = document.documentElement;
  const themeKey = 'mw-theme';
  const toggleBtn = document.getElementById('theme-toggle');
  const toggleIcon = toggleBtn.querySelector('.toggle-icon');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    toggleIcon.textContent = theme === 'dark' ? '☀\uFE56' : '☾';
  }

  const savedTheme = localStorage.getItem(themeKey);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  toggleBtn.addEventListener('click', function() {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(themeKey, next);
    applyTheme(next);
  });

  // Carousel
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const nextBtn = document.getElementById('next-slide');
  const prevBtn = document.getElementById('prev-slide');
  const dotsNav = document.getElementById('carousel-dots');
  let currentIndex = 0;
  let autoTimer;

  // Create dots
  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index, true));
    dotsNav.appendChild(dot);
  });

  function updateDots(index) {
    const dots = Array.from(dotsNav.children);
    dots.forEach((dot, i) => {
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }

  function updateSlides(index) {
    track.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    updateDots(index);
  }

  function goToSlide(index, user) {
    currentIndex = (index + slides.length) % slides.length;
    updateSlides(currentIndex);
    if (user) resetAuto();
  }

  function nextSlide() { goToSlide(currentIndex + 1, true); }
  function prevSlide() { goToSlide(currentIndex - 1, true); }

  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goToSlide(currentIndex + 1, false), 6000);
  }

  resetAuto();
  updateSlides(0);

  // Product grid
  const products = [
    { id: 'p1', name: 'Air Purifier X1', price: 7999 },
    { id: 'p2', name: 'Smart Kettle', price: 2499 },
    { id: 'p3', name: 'Mixer Pro', price: 4999 },
    { id: 'p4', name: 'Vacuum Light', price: 2999 },
    { id: 'p5', name: 'Fan Breeze+', price: 3499 },
    { id: 'p6', name: 'Iron Glide', price: 1299 },
    { id: 'p7', name: 'LED Lamp', price: 899 },
    { id: 'p8', name: 'Smart Plug', price: 999 },
  ];

  const grid = document.getElementById('product-grid');
  products.forEach((prod) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    const img = document.createElement('div');
    img.className = 'product-image';
    const info = document.createElement('div');
    info.className = 'product-info';
    const name = document.createElement('p');
    name.className = 'product-name';
    name.textContent = prod.name;
    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = `₹${prod.price.toLocaleString('en-IN')}`;
    info.appendChild(name);
    info.appendChild(price);
    card.appendChild(img);
    card.appendChild(info);
    grid.appendChild(card);
  });
});
