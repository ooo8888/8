// Gestion Lakeside Inc. - GSAP Animations and Interactive UX Triggers

document.addEventListener('DOMContentLoaded', () => {
  // Cursor glow effect
  const cursorGlow = document.createElement('div');
  cursorGlow.classList.add('cursor-glow');
  document.body.appendChild(cursorGlow);

  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });

  // Header shrink on scroll
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('shrink');
      } else {
        header.classList.remove('shrink');
      }
    });
  }

  // Floating CTA bar click
  const floatingCTA = document.querySelector('.floating-cta');
  if (floatingCTA) {
    floatingCTA.addEventListener('click', () => {
      window.location.href = '#quote-request';
    });
  }

  // GSAP parallax for hero mountains
  if (typeof gsap !== 'undefined') {
    const mountains = document.querySelectorAll('.parallax-mountain');
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;
      mountains.forEach((mountain, index) => {
        const depth = (index + 1) * 0.3;
        gsap.to(mountain, { y: scrollPos * depth, ease: 'power1.out', overwrite: 'auto' });
      });
    });
  }

  // Hover reveals with blurred background flicker
  const hoverElements = document.querySelectorAll('.hover-reveal');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.classList.add('blur-flicker');
    });
    el.addEventListener('mouseleave', () => {
      el.classList.remove('blur-flicker');
    });
  });

});
