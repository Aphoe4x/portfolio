/* ==========================================================================
   cards
   Progressive enhancement only. With JS off, the page still reads.
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------------------
     Masthead: quiet until the page moves
     ---------------------------------------------------------------------- */

  var masthead = document.getElementById('masthead');

  if (masthead) {
    var syncMasthead = function () {
      masthead.classList.toggle('is-stuck', window.scrollY > 12);
    };

    window.addEventListener('scroll', syncMasthead, { passive: true });
    syncMasthead();
  }

  /* ------------------------------------------------------------------------
     Scrollspy: a dot under the section you are reading
     ---------------------------------------------------------------------- */

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var spySections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    })
    .filter(Boolean);

  if (spySections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var hash = '#' + entry.target.id;

          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === hash);
          });
        });
      },
      { rootMargin: '-42% 0px -52% 0px', threshold: 0 }
    );

    spySections.forEach(function (section) {
      spy.observe(section);
    });
  }

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
     Work cards: flip, tilt, and reset
     ---------------------------------------------------------------------- */

  var workCards = Array.prototype.slice.call(document.querySelectorAll('.work-card'));

  workCards.forEach(function (card) {
    var front = card.querySelector('.card-hit');
    var back = card.querySelector('.flip-back');
    var close = card.querySelector('.back-close');

    if (!front || !back || !close) return;

    function setFlipped(on) {
      card.classList.toggle('is-flipped', on);
      front.setAttribute('aria-expanded', on ? 'true' : 'false');

      if (on) {
        back.removeAttribute('inert');
        front.setAttribute('tabindex', '-1');
        close.focus({ preventScroll: true });
      } else {
        back.setAttribute('inert', '');
        front.removeAttribute('tabindex');
      }
    }

    front.addEventListener('click', function () {
      setFlipped(true);
    });

    close.addEventListener('click', function () {
      setFlipped(false);
      front.focus({ preventScroll: true });
    });

    card.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && card.classList.contains('is-flipped')) {
        event.stopPropagation();
        setFlipped(false);
        front.focus({ preventScroll: true });
      }
    });
  });

  if (finePointer && !reduceMotion) {
    workCards.forEach(function (card) {
      var tilt = card.querySelector('.card-tilt');
      if (!tilt) return;

      card.addEventListener(
        'pointermove',
        function (event) {
          if (card.classList.contains('is-flipped')) return;
          var rect = card.getBoundingClientRect();
          var px = (event.clientX - rect.left) / rect.width - 0.5;
          var py = (event.clientY - rect.top) / rect.height - 0.5;
          tilt.style.setProperty('--ty', (px * 9).toFixed(2) + 'deg');
          tilt.style.setProperty('--tx', (-py * 9).toFixed(2) + 'deg');
        },
        { passive: true }
      );

      card.addEventListener('pointerleave', function () {
        tilt.style.removeProperty('--tx');
        tilt.style.removeProperty('--ty');
      });
    });
  }

  /* ------------------------------------------------------------------------
     The room: Whot in a dialog
     ---------------------------------------------------------------------- */

  var room = document.getElementById('whot-room');
  var roomFrame = document.getElementById('room-frame');
  var roomClose = document.getElementById('room-close');
  var roomTriggers = Array.prototype.slice.call(document.querySelectorAll('[data-open-room]'));

  function openRoom() {
    if (!room) return;

    if (roomFrame && !roomFrame.getAttribute('src')) {
      roomFrame.setAttribute('src', roomFrame.getAttribute('data-src'));
    }

    if (typeof room.showModal === 'function') {
      room.showModal();
    } else {
      room.setAttribute('open', '');
    }

    document.body.classList.add('is-locked');

    if (roomClose) {
      roomClose.focus({ preventScroll: true });
    }
  }

  function closeRoom() {
    if (!room) return;

    if (typeof room.close === 'function') {
      room.close();
    } else {
      room.removeAttribute('open');
    }

    document.body.classList.remove('is-locked');
  }

  roomTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', openRoom);
  });

  if (roomClose) {
    roomClose.addEventListener('click', closeRoom);
  }

  if (room) {
    room.addEventListener('click', function (event) {
      if (event.target === room) {
        closeRoom();
      }
    });

    room.addEventListener('close', function () {
      document.body.classList.remove('is-locked');
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

      workCards.forEach(function (card) {
        card.classList.remove('is-flipped');
        var front = card.querySelector('.card-hit');
        var back = card.querySelector('.flip-back');
        var tilt = card.querySelector('.card-tilt');
        if (front) {
          front.setAttribute('aria-expanded', 'false');
          front.removeAttribute('tabindex');
        }
        if (back) back.setAttribute('inert', '');
        if (tilt) {
          tilt.style.removeProperty('--tx');
          tilt.style.removeProperty('--ty');
        }
      });

      if (room && room.hasAttribute('open')) {
        closeRoom();
      }

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
