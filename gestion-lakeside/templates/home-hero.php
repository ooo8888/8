<?php
// Home Page Hero Section
?>
<section class="home-hero" style="position: relative; overflow: hidden; height: 100vh; background: linear-gradient(120deg, #1a2233 60%, #48BFF9 100%); box-shadow: 0 8px 32px rgba(72,191,249,0.10);">
  <div class="parallax-container" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; overflow: hidden;">
    <svg class="parallax-mountain" style="position: absolute; bottom: 0; left: 10%; width: 300px; height: auto;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" fill="none">
      <path d="M10 90 L50 10 L90 90 Z" fill="#48BFF9" />
    </svg>
    <svg class="parallax-mountain" style="position: absolute; bottom: 0; left: 30%; width: 400px; height: auto;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" fill="none">
      <path d="M20 140 L100 20 L180 140 Z" fill="#0D1C2E" />
    </svg>
  </div>
  <div class="container" style="position: relative; z-index: 10; padding-top: 20vh; text-align: center;">
    <h1 style="font-size: 3rem; color: #48BFF9;">Gestion Lakeside Inc.<br><span style='font-size:2rem; color:var(--color-arctic-white); font-weight:400;'>L’excellence en construction, la confiance en héritage.</span></h1>
    <div class="cta-buttons" style="margin-top: 2rem;">
      <a href="#quote-request" class="button">Obtenez votre soumission personnalisée</a>
      <a href="#portfolio" class="button" style="margin-left: 1rem;">Découvrez nos réalisations</a>
      <a href="#about" class="button" style="margin-left: 1rem;">Notre différence</a>
    </div>
    <div class="live-counter" style="margin-top: 3rem; font-size: 1.5rem;">
      <span style='font-weight:bold; color:var(--color-glacier-blue);'>+500</span> projets livrés partout au Québec
    </div>
    <div class="testimonial-preview" style="margin-top: 3rem;">
      <?php // Placeholder for testimonial carousel shortcode or function ?>
      <?php echo do_shortcode('[gl_testimonial_carousel]'); ?>
    </div>
  </div>
</section>

<?php
// Scroll-triggered quote form modal will be handled by JS
?>

<!-- GSAP & Microinteractions: Home Hero -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Parallax SVGs
  const mountains = document.querySelectorAll('.parallax-mountain');
  window.addEventListener('mousemove', e => {
    mountains.forEach((el, i) => {
      const move = (e.clientX / window.innerWidth - 0.5) * (i === 0 ? 30 : 60);
      el.style.transform = `translateX(${move}px)`;
    });
  });
  // GSAP headline animation
  gsap.from('.home-hero h1', {y: 80, opacity: 0, duration: 1.2, ease: 'power3.out'});
  gsap.from('.cta-buttons a', {y: 40, opacity: 0, stagger: 0.15, delay: 0.5, duration: 0.8});
  gsap.from('.live-counter', {scale: 0.8, opacity: 0, delay: 1.2, duration: 0.7});
  // Button microinteraction
  document.querySelectorAll('.cta-buttons a').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, {scale: 1.08, boxShadow: '0 4px 24px #48BFF9', duration: 0.2});
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {scale: 1, boxShadow: 'none', duration: 0.2});
    });
  });
});
</script>

