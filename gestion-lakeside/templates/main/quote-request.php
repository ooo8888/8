<?php
// Soumission (Quote Request) multi-step form template
?>
<section id="quote-request" class="quote-request container" style="padding: 4rem 1rem; color: var(--color-arctic-white); max-width: 600px;">
  <h2>Demandez une soumission</h2>
  <form id="quoteForm" method="post" enctype="multipart/form-data" style="margin-top: 2rem;">
    <div class="form-step" data-step="1">
      <label for="project_type">Type de projet</label>
      <select id="project_type" name="project_type" required>
        <option value="">Sélectionnez un type</option>
        <option value="balcons">Balcons</option>
        <option value="toitures">Toitures</option>
        <option value="cabanons">Cabanons</option>
        <option value="renovations">Rénovations</option>
      </select>
      <button type="button" class="next-step">Suivant</button>
    </div>
    <div class="form-step" data-step="2" style="display:none;">
      <label for="project_photo">Photo du projet (optionnel)</label>
      <input type="file" id="project_photo" name="project_photo" accept="image/*" />
      <button type="button" class="prev-step">Précédent</button>
      <button type="button" class="next-step">Suivant</button>
    </div>
    <div class="form-step" data-step="3" style="display:none;">
      <label for="location">Emplacement</label>
      <input type="text" id="location" name="location" required />
      <label for="preferred_dates">Dates préférées</label>
      <input type="text" id="preferred_dates" name="preferred_dates" placeholder="Ex: 01/06/2025 - 15/06/2025" />
      <button type="button" class="prev-step">Précédent</button>
      <input type="submit" value="Envoyer" />
    </div>
    <div class="progress-bar" style="height: 5px; background: var(--color-glacier-blue); margin-top: 1rem; width: 0%; transition: width 0.3s ease;"></div>
  </form>
</section>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quoteForm');
    const steps = form.querySelectorAll('.form-step');
    const progressBar = form.querySelector('.progress-bar');
    let currentStep = 0;

    function showStep(index) {
      steps.forEach((step, i) => {
        step.style.display = i === index ? 'block' : 'none';
      });
      progressBar.style.width = ((index + 1) / steps.length) * 100 + '%';
    }

    form.addEventListener('click', (e) => {
      if (e.target.classList.contains('next-step')) {
        if (form.checkValidity()) {
          currentStep++;
          if (currentStep >= steps.length) currentStep = steps.length - 1;
          showStep(currentStep);
        } else {
          form.reportValidity();
        }
      } else if (e.target.classList.contains('prev-step')) {
        currentStep--;
        if (currentStep < 0) currentStep = 0;
        showStep(currentStep);
      }
    });

    showStep(currentStep);

    // TODO: Implement cookie save/load and form submission handling
  });
</script>
