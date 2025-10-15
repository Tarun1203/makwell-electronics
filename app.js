document.addEventListener('DOMContentLoaded', function() {
  fetch('./products.json')
    .then(function(response) { return response.json(); })
    .then(function(products) {
      const grid = document.getElementById('product-grid');
      if (!grid) return;
      grid.innerHTML = '';
      products.forEach(function(prod) {
        const card = document.createElement('div');
        card.className = 'product-card';

        const imageContainer = document.createElement('div');
        imageContainer.className = 'product-image';

        const img = document.createElement('img');
        img.className = 'product-photo';
        let fileName = prod.image.split('/').pop();
        if (prod.category === 'Televisions') {
          const sizeMap = {24:'MK24.png',32:'MK32.png',40:'MK43.png',43:'MK43.png',50:'MK50.png',55:'MK55.png',65:'MK65.png'};
          const mapped = sizeMap[prod.size] || 'MK43.png';
          img.src = 'images/' + mapped;
        } else {
          img.src = 'images/' + fileName;
        }
        imageContainer.appendChild(img);

        if (prod.category === 'Televisions') {
          const overlay = document.createElement('img');
          overlay.className = 'remote-overlay';
          overlay.src = 'images/Remote.png';
          imageContainer.appendChild(overlay);
        }

        const info = document.createElement('div');
        info.className = 'product-info';
        const nameEl = document.createElement('p');
        nameEl.className = 'product-name';
        nameEl.textContent = prod.title;
        info.appendChild(nameEl);
        const detailsEl = document.createElement('p');
        detailsEl.className = 'product-series';
        detailsEl.textContent = prod.category + ' \u2022 ' + prod.series;
        info.appendChild(detailsEl);

        card.appendChild(imageContainer);
        card.appendChild(info);
        grid.appendChild(card);
      });
    })
    .catch(function(err) {
      console.error('Failed to load products', err);
    });
});
