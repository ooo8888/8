<?php
// Témoignages page template
$testimonials = [
    [
        'text' => "Gestion Lakeside a transformé notre maison au-delà de nos attentes. Leur souci du détail et leur écoute sont exceptionnels.",
        'author' => 'Marie Tremblay, Laval'
    ],
    [
        'text' => "Travail rapide, propre, et une équipe qui inspire confiance. Nous recommandons sans hésiter!",
        'author' => 'Famille Gagnon, Blainville'
    ],
    [
        'text' => "Des experts passionnés qui ont su moderniser notre toiture tout en respectant notre budget.",
        'author' => 'Luc et Sophie, Rosemère'
    ],
    [
        'text' => "Leur approche humaine et innovante fait toute la différence. Merci pour notre superbe balcon!",
        'author' => 'Émilie D., Ste-Thérèse'
    ],
    [
        'text' => "Service impeccable du début à la fin. On sent la fierté dans chaque projet.",
        'author' => 'Jean-Pierre L., Montréal'
    ],
];
?>
<section class="testimonials-page container" style="padding: 4rem 1rem; color: var(--color-arctic-white); background: linear-gradient(120deg, #1a2233 60%, #48BFF9 100%); border-radius: 18px; box-shadow: 0 8px 32px rgba(72,191,249,0.10);">
  <h2>Témoignages</h2>
  <div class="testimonial-carousel" style="display: flex; overflow-x: auto; gap: 2rem; scroll-snap-type: x mandatory; padding: 2rem 0;">
    <?php foreach ($testimonials as $testimonial): ?>
      <div class="testimonial-item" style="min-width: 320px; background: rgba(30,40,60,0.85); border: 1.5px solid var(--color-glacier-blue); border-radius: 14px; padding: 2rem 1.5rem; scroll-snap-align: start; box-shadow: 0 4px 24px rgba(72,191,249,0.08); transition: transform 0.3s cubic-bezier(.25,.8,.25,1); will-change: transform;">
        <p><strong><?php echo str_replace(['confiance', 'à l\'écoute', 'jamais déçu'], ['<span style="color: var(--color-glacier-blue);">confiance</span>', '<span style="color: var(--color-glacier-blue);">à l\'écoute</span>', '<span style="color: var(--color-glacier-blue);">jamais déçu</span>'], esc_html($testimonial['text'])); ?></strong></p>
        <p style="text-align: right; font-style: italic;">- <?php echo esc_html($testimonial['author']); ?></p>
      </div>
    <?php endforeach; ?>
  </div>

<!-- GSAP & Microinteractions: Testimonials -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  gsap.from('.testimonial-item', {
    y: 40,
    opacity: 0,
    stagger: 0.10,
    duration: 0.9,
    ease: 'power3.out',
    delay: 0.2
  });
  document.querySelectorAll('.testimonial-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, {scale: 1.04, boxShadow: '0 8px 32px #48BFF9', duration: 0.18});
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(item, {scale: 1, boxShadow: '0 4px 24px rgba(72,191,249,0.08)', duration: 0.18});
    });
  });
});
</script>

</section>
