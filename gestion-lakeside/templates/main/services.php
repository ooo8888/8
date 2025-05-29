<?php
// Services page template
$services = [
    [
        'title' => 'Balcons sur mesure',
        'hook' => "Élevez votre espace de vie avec des balcons luxueux, durables et conçus pour l'été québécois.",
        'gallery' => ['balcon1.jpg', 'balcon2.jpg'],
        'quote_link' => '#quote-balcons'
    ],
    [
        'title' => 'Toitures haut de gamme',
        'hook' => "Protégez votre investissement avec des toitures innovantes, garanties et esthétiques.",
        'gallery' => ['toiture1.jpg', 'toiture2.jpg'],
        'quote_link' => '#quote-toitures'
    ],
    [
        'title' => 'Cabanons design',
        'hook' => "Des cabanons qui allient fonctionnalité, sécurité et élégance pour tous vos besoins.",
        'gallery' => ['cabanon1.jpg', 'cabanon2.jpg'],
        'quote_link' => '#quote-cabanons'
    ],
    [
        'title' => 'Rénovations complètes',
        'hook' => "Transformez chaque pièce avec notre expertise en rénovation résidentielle de prestige.",
        'gallery' => ['renov1.jpg', 'renov2.jpg'],
        'quote_link' => '#quote-renovations'
    ],
    [
        'title' => 'Gestion de projet clé en main',
        'hook' => "De la conception à la livraison, nous orchestrons chaque étape pour une tranquillité d’esprit totale.",
        'gallery' => ['before1.jpg', 'after1.jpg'],
        'quote_link' => '#quote-gestion'
    ]
];
?>
<section class="services-page container" style="padding: 4rem 1rem; color: var(--color-arctic-white); background: linear-gradient(120deg, #1a2233 60%, #48BFF9 100%); border-radius: 18px; box-shadow: 0 8px 32px rgba(72,191,249,0.10);">
  <h2>Nos Services</h2>
  <div class="service-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2.5rem; margin-top: 2.5rem;">
    <?php foreach ($services as $service): ?>
      <div class="service-tile hover-reveal" style="background: rgba(30,40,60,0.85); border: 1.5px solid var(--color-glacier-blue); border-radius: 14px; padding: 2rem 1.5rem; cursor: pointer; perspective: 1000px; box-shadow: 0 4px 24px rgba(72,191,249,0.08); transition: transform 0.3s cubic-bezier(.25,.8,.25,1); will-change: transform;">
        <h3 style="font-family: var(--font-header); color: var(--color-glacier-blue);"><?php echo esc_html($service['title']); ?></h3>
        <p><?php echo esc_html($service['hook']); ?></p>
        <div class="mini-gallery" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
          <?php foreach ($service['gallery'] as $img): ?>
            <img src="<?php echo GL_PLUGIN_URL . 'assets/images/' . esc_attr($img); ?>" alt="<?php echo esc_attr($service['title']); ?>" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />
          <?php endforeach; ?>
        </div>

<!-- GSAP & Microinteractions: Services -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  gsap.from('.service-tile', {
    y: 40,
    opacity: 0,
    stagger: 0.10,
    duration: 0.9,
    ease: 'power3.out',
    delay: 0.2
  });
  document.querySelectorAll('.service-tile').forEach(tile => {
    tile.addEventListener('mouseenter', () => {
      gsap.to(tile, {scale: 1.04, boxShadow: '0 8px 32px #48BFF9', duration: 0.18});
    });
    tile.addEventListener('mouseleave', () => {
      gsap.to(tile, {scale: 1, boxShadow: '0 4px 24px rgba(72,191,249,0.08)', duration: 0.18});
    });
  });
});
</script>

        <a href="<?php echo esc_url($service['quote_link']); ?>" class="button" style="margin-top: 1rem; display: inline-block;">Demander une soumission</a>
      </div>
    <?php endforeach; ?>
  </div>
</section>
