<?php
// À propos page template
?>
<section class="about-page container" style="padding: 4rem 1rem; color: var(--color-arctic-white);">
  <h2>Notre histoire, votre avenir</h2>
  <div class="team-bios" style="display: flex; gap: 2rem; margin-top: 2rem; flex-wrap: wrap; align-items: flex-start;">
    <div class="team-member" style="flex: 1 1 300px; background: rgba(30,40,60,0.7); border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.15); padding: 2rem; transition: transform 0.3s cubic-bezier(.25,.8,.25,1); will-change: transform;">
      <img src="<?php echo GL_PLUGIN_URL . 'assets/images/jonathan.jpg'; ?>" alt="Jonathan" style="width: 100%; border-radius: 50%; box-shadow: 0 2px 12px rgba(72,191,249,0.25); margin-bottom: 1rem;" />
      <h3>Jonathan Lavoie</h3>
      <p>Co-fondateur, directeur de projets. 20 ans d’expérience, reconnu pour sa rigueur, son leadership et sa passion pour la qualité.</p>
    </div>
    <div class="team-member" style="flex: 1 1 300px; background: rgba(30,40,60,0.7); border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.15); padding: 2rem; transition: transform 0.3s cubic-bezier(.25,.8,.25,1); will-change: transform;">
      <img src="<?php echo GL_PLUGIN_URL . 'assets/images/bruno.jpg'; ?>" alt="Bruno" style="width: 100%; border-radius: 50%; box-shadow: 0 2px 12px rgba(72,191,249,0.25); margin-bottom: 1rem;" />
      <h3>Bruno Caron</h3>
      <p>Co-fondateur, chef de la création. Spécialiste en rénovation haut de gamme, il insuffle innovation et élégance à chaque projet.</p>
    </div>
  </div>

<!-- GSAP & Microinteractions: About Team -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  gsap.from('.team-member', {
    y: 40,
    opacity: 0,
    stagger: 0.15,
    duration: 1.1,
    ease: 'power3.out',
    delay: 0.2
  });
  document.querySelectorAll('.team-member').forEach(member => {
    member.addEventListener('mouseenter', () => {
      gsap.to(member, {scale: 1.04, boxShadow: '0 8px 32px #48BFF9', duration: 0.18});
    });
    member.addEventListener('mouseleave', () => {
      gsap.to(member, {scale: 1, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', duration: 0.18});
    });
  });
});
</script>

  <div class="values" style="margin-top: 3rem;">
    <h3>Nos valeurs fondamentales</h3>
    <ul>
      <li>Qualité supérieure : chaque détail compte, du premier plan à la touche finale.</li>
      <li>Honnêteté et transparence : des devis clairs, des délais respectés, aucune surprise.</li>
      <li>Innovation : intégration des meilleures technologies et matériaux pour des résultats durables.</li>
      <li>Respect : de nos clients, de leurs espaces, et de l’environnement.</li>
    </ul>
  </div>
  <div class="history-timeline" style="margin-top: 3rem;">
    <h3>Un parcours d’excellence</h3>
    <ol style="list-style: none; padding-left: 0;">
      <li><strong>2005 :</strong> Jonathan et Bruno unissent leurs expertises et fondent Gestion Lakeside Inc. à Laval.</li>
      <li><strong>2010 :</strong> L’entreprise se distingue par ses rénovations haut de gamme et son approche personnalisée.</li>
      <li><strong>2015 :</strong> Ajout des services de toitures et balcons sur mesure, avec une équipe en pleine croissance.</li>
      <li><strong>2020 :</strong> Pionniers dans l’intégration de l’IA et des technologies vertes pour des projets plus intelligents et durables.</li>
    </ol>
  </div>
  <div class="emotional-paragraph" style="margin-top: 3rem; font-style: italic; font-size:1.2rem; color:var(--color-glacier-blue); letter-spacing:0.01em;">
    <p>Après des années à bâtir pour d’autres, nous avons fondé Gestion Lakeside Inc. pour offrir une expérience humaine, transparente et sans compromis sur la qualité. Chaque projet est une promesse : celle de livrer l’excellence, d’innover, et de créer des espaces qui inspirent la fierté. Notre mission? Redéfinir la construction résidentielle au Québec, un projet à la fois.</p>
  </div>
</section>
