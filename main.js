/* ==========================================================================
   cards
   Progressive enhancement only. With JS off, the page still reads.
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------------------
     Reveal sections as they come up the table
     ---------------------------------------------------------------------- */

  var revealables = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function showAll() {
    revealables.forEach(function (el) {
      el.classList.add('is-in');
    });
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.15 }
    );

    revealables.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     The card that follows the cursor
     ---------------------------------------------------------------------- */

  var ghost = document.getElementById('ghost');

  if (ghost && finePointer && !reduceMotion) {
    var targetX = window.innerWidth / 2;
    var targetY = window.innerHeight / 2;
    var currentX = targetX;
    var currentY = targetY;
    var frame = null;

    function step() {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;

      var tilt = Math.max(-14, Math.min(14, (targetX - currentX) * 0.12));

      ghost.style.transform =
        'translate3d(' + currentX + 'px,' + currentY + 'px,0)' +
        ' translate(-50%,-50%) rotate(' + tilt + 'deg)';

      if (Math.abs(targetX - currentX) > 0.4 || Math.abs(targetY - currentY) > 0.4) {
        frame = window.requestAnimationFrame(step);
      } else {
        frame = null;
      }
    }

    window.addEventListener(
      'pointermove',
      function (event) {
        targetX = event.clientX;
        targetY = event.clientY;

        if (!ghost.classList.contains('is-live')) {
          currentX = targetX;
          currentY = targetY;
          ghost.classList.add('is-live');
        }

        if (frame === null) {
          frame = window.requestAnimationFrame(step);
        }
      },
      { passive: true }
    );

    document.addEventListener('pointerleave', function () {
      ghost.classList.remove('is-live');
    });
  }

  /* ------------------------------------------------------------------------
     Shuffle: re-deal the page
     ---------------------------------------------------------------------- */

  var shuffleBtn = document.getElementById('shuffle');

  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', function () {
      shuffleBtn.classList.remove('is-spinning');
      // Force the animation to restart if it is already running.
      void shuffleBtn.offsetWidth;
      shuffleBtn.classList.add('is-spinning');

      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });

      var cards = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
      cards.forEach(function (card, index) {
        card.classList.remove('is-in');
        card.classList.remove('re-dealt');
        void card.offsetWidth;
        card.style.setProperty('--i', String(index % 6));
      });

      window.setTimeout(function () {
        cards.forEach(function (card) {
          card.classList.add('is-in');
        });
      }, reduceMotion ? 0 : 260);
    });
  }
})();
