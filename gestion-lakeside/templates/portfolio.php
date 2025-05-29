<?php
// Portfolio page template
$categories = ['Toitures', 'Balcons', 'Rénovations', 'Cabanons'];
$portfolio_items = [
    [
        'title' => 'Toiture architecturale – Laval',
        'category' => 'Toitures',
        'before' => 'before1.jpg',
        'after' => 'after1.jpg'
    ],
    [
        'title' => 'Balcon en cèdre sur mesure – Blainville',
        'category' => 'Balcons',
        'before' => 'before2.jpg',
        'after' => 'after2.jpg'
    ],
    [
        'title' => 'Rénovation complète de cuisine – Rosemère',
        'category' => 'Rénovations',
        'before' => 'before3.jpg',
        'after' => 'after3.jpg'
    ],
    [
        'title' => 'Cabanon design & fonctionnel – Ste-Thérèse',
        'category' => 'Cabanons',
        'before' => 'cabanon1.jpg',
        'after' => 'cabanon2.jpg'
    ],
    [
        'title' => 'Toiture écoénergétique – Montréal',
        'category' => 'Toitures',
        'before' => 'toiture1.jpg',
        'after' => 'toiture2.jpg'
    ],
    [
        'title' => 'Balcon panoramique – Laval',
        'category' => 'Balcons',
        'before' => 'balcon1.jpg',
        'after' => 'balcon2.jpg'
    ],
];
?>
<section class="portfolio-page container" style="padding: 4rem 1rem; color: var(--color-arctic-white); background: linear-gradient(120deg, #1a2233 60%, #48BFF9 100%); border-radius: 18px; box-shadow: 0 8px 32px rgba(72,191,249,0.10);">
  <h2>Notre Portfolio</h2>
  <div class="filter-buttons" style="margin-bottom: 2rem; display: flex; gap: 1.5rem; flex-wrap: wrap;">
    <?php foreach ($categories as $cat): ?>
      <button class="filter-btn" data-filter="<?php echo esc_attr($cat); ?>"><?php echo esc_html($cat); ?></button>
    <?php endforeach; ?>
  </div>
  <div class="portfolio-gallery" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
    <?php foreach ($portfolio_items as $item): ?>
      <div class="portfolio-item" data-category="<?php echo esc_attr($item['category']); ?>" style="background: rgba(30,40,60,0.85); border: 1.5px solid var(--color-glacier-blue); border-radius: 18px; overflow: hidden; box-shadow: 0 8px 32px rgba(72,191,249,0.12); padding: 2rem 1.5rem; transition: transform 0.3s cubic-bezier(.25,.8,.25,1); will-change: transform;">
        <h3><?php echo esc_html($item['title']); ?></h3>
        <div class="before-after-slider" style="position: relative; width: 100%; height: 200px; overflow: hidden; border-radius: 8px;">
          <img src="<?php echo GL_PLUGIN_URL . 'assets/images/' . esc_attr($item['before']); ?>" alt="Before" style="position: absolute; width: 100%; height: 100%; object-fit: cover; top: 0; left: 0;" />
          <img src="<?php echo GL_PLUGIN_URL . 'assets/images/' . esc_attr($item['after']); ?>" alt="After" style="position: absolute; width: 100%; height: 100%; object-fit: cover; top: 0; left: 0; clip-path: inset(0 50% 0 0); transition: clip-path 0.5s ease;" class="after-image" />
          <input type="range" min="0" max="100" value="50" class="slider" style="position: absolute; bottom: 10px; left: 10px; width: calc(100% - 20px);" />
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</section>

<!-- GSAP & Microinteractions: Portfolio -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  gsap.from('.portfolio-item', {
    y: 60,
    opacity: 0,
    stagger: 0.12,
    duration: 1.1,
    ease: 'power3.out',
    delay: 0.2
  });
  document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, {scale: 1.03, boxShadow: '0 12px 36px #48BFF9', duration: 0.18});
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(item, {scale: 1, boxShadow: '0 8px 32px rgba(72,191,249,0.12)', duration: 0.18});
    });
  });
});
</script>


<script>
  document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.before-after-slider');
    sliders.forEach(slider => {
      const range = slider.querySelector('.slider');
      const afterImage = slider.querySelector('.after-image');
      range.addEventListener('input', () => {
        afterImage.style.clipPath = `inset(0 ${100 - range.value}% 0 0)`;
      });
    });

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        portfolioItems.forEach(item => {
          if (filter === item.getAttribute('data-category') || filter === '') {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  });
</script>
