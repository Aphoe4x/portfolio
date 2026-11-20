/* ==========================================================================
   cards
   Progressive enhancement only. With JS off, the page still reads.
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var fan = document.getElementById('fan');

  /* ------------------------------------------------------------------------
     The hand arrives
     ---------------------------------------------------------------------- */

  if (fan && !reduceMotion) {
    fan.classList.add('is-dealt');
  }

  /* ------------------------------------------------------------------------
     A hand that fans with the pointer
     ---------------------------------------------------------------------- */

  if (fan) {
    var fanCards = Array.prototype.slice.call(fan.querySelectorAll('.fan-card'));
    var middle = (fanCards.length - 1) / 2;
    var lean = 0;

    var layOutFan = function (pull) {
      var base = fanCards[0] ? fanCards[0].offsetWidth : 74;
      var spacing = base * 0.72;
      var spread = 7 + Math.abs(pull) * 5;
      var drift = pull * base * 0.5;

      fanCards.forEach(function (card, index) {
        var offset = index - middle;

        card.style.setProperty('--x', (offset * spacing + drift).toFixed(1) + 'px');
        card.style.setProperty('--y', (Math.abs(offset) * base * 0.18).toFixed(1) + 'px');
        card.style.setProperty('--r', (offset * spread).toFixed(2) + 'deg');
      });
    };

    layOutFan(0);

    if (finePointer && !reduceMotion) {
      var hero = document.querySelector('.hero');

      if (hero) {
        hero.addEventListener(
          'pointermove',
          function (event) {
            var rect = hero.getBoundingClientRect();
            lean = ((event.clientX - rect.left) / rect.width - 0.5) * 1.6;
            layOutFan(Math.max(-1, Math.min(1, lean)));
          },
          { passive: true }
        );

        hero.addEventListener('pointerleave', function () {
          layOutFan(0);
        });
      }
    }

    var refit = null;

    window.addEventListener(
      'resize',
      function () {
        window.clearTimeout(refit);
        refit = window.setTimeout(function () {
          layOutFan(0);
        }, 160);
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------------
     Lagos clock
     ---------------------------------------------------------------------- */

  var clock = document.getElementById('clock');

  if (clock) {
    var readClock = function () {
      var time;

      try {
        time = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Africa/Lagos',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(new Date());
      } catch (error) {
        time = new Date().toTimeString().slice(0, 5);
      }

      clock.textContent = time;
    };

    readClock();
    window.setInterval(readClock, 20000);
  }

  /* ------------------------------------------------------------------------
     The rail: which seat are we at
     ---------------------------------------------------------------------- */

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.rail-item'));
  var spySections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if (spySections.length) {
    var ticking = false;

    var markRail = function () {
      ticking = false;

      var line = window.scrollY + window.innerHeight * 0.35;
      var active = spySections[0];

      spySections.forEach(function (section) {
        var top = section.getBoundingClientRect().top + window.scrollY;
        if (top <= line) active = section;
      });

      var atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;

      if (atBottom) {
        active = spySections[spySections.length - 1];
      }

      navLinks.forEach(function (link) {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + active.id);
      });
    };

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(markRail);
        }
      },
      { passive: true }
    );

    markRail();
  }

  /* ------------------------------------------------------------------------
     Reveal as things come up the table
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
      { rootMargin: '0px 0px -7% 0px', threshold: 0.12 }
    );

    revealables.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     Skill cards drift in with the scroll
     ---------------------------------------------------------------------- */

  var suits = Array.prototype.slice.call(document.querySelectorAll('.suit'));
  var slideQueued = false;

  var paintSlides = function () {
    slideQueued = false;

    var vh = window.innerHeight || 0;
    var start = vh * 0.98;
    var span = vh * 0.43;

    suits.forEach(function (el, index) {
      var top = el.getBoundingClientRect().top;
      var progress = (start - top) / span;
      progress = Math.max(0, Math.min(1, progress));

      var eased = 1 - Math.pow(1 - progress, 3);
      var distance = 80 + index * 8;

      el.style.setProperty('--slide', (-distance * (1 - eased)).toFixed(1) + 'px');
    });
  };

  var queueSlides = function () {
    if (slideQueued) return;
    slideQueued = true;
    window.requestAnimationFrame(paintSlides);
  };

  if (suits.length && !reduceMotion) {
    paintSlides();
    window.addEventListener('scroll', queueSlides, { passive: true });
    window.addEventListener('resize', queueSlides, { passive: true });
  }

  /* ------------------------------------------------------------------------
     Stats count up like chips being stacked
     ---------------------------------------------------------------------- */

  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          var el = entry.target;
          var target = Number(el.getAttribute('data-count'));
          var suffix = el.getAttribute('data-suffix') || '';
          var start = null;

          var run = function (now) {
            if (start === null) start = now;
            var progress = Math.min(1, (now - start) / 900);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) window.requestAnimationFrame(run);
          };

          window.requestAnimationFrame(run);
          countObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (counter) {
      countObserver.observe(counter);
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
          tilt.style.setProperty('--ty', (px * 5).toFixed(2) + 'deg');
          tilt.style.setProperty('--tx', (-py * 5).toFixed(2) + 'deg');
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
     Shuffle: gather the spread and deal it again
     ---------------------------------------------------------------------- */

  var shuffleBtn = document.getElementById('shuffle');

  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', function () {
      shuffleBtn.classList.remove('is-spinning');
      void shuffleBtn.offsetWidth;
      shuffleBtn.classList.add('is-spinning');

      workCards.forEach(function (card) {
        card.classList.remove('is-flipped');
        card.classList.remove('is-in');

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

      var grid = document.querySelector('.work-grid');
      if (grid) void grid.offsetWidth;

      window.setTimeout(function () {
        workCards.forEach(function (card) {
          card.classList.add('is-in');
        });
      }, reduceMotion ? 0 : 60);
    });
  }

  /* ------------------------------------------------------------------------
     Copy the address
     ---------------------------------------------------------------------- */

  var copyBtn = document.querySelector('[data-copy]');

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var value = copyBtn.getAttribute('data-copy');
      var label = copyBtn.textContent;

      var reset = function () {
        window.setTimeout(function () {
          copyBtn.textContent = label;
          copyBtn.classList.remove('is-done');
        }, 1600);
      };

      var done = function () {
        copyBtn.textContent = 'copied';
        copyBtn.classList.add('is-done');
        reset();
      };

      var failed = function () {
        copyBtn.textContent = 'copy failed';
        reset();
      };

      var legacy = function () {
        var field = document.createElement('textarea');
        field.value = value;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.top = '-1000px';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();

        var copied = false;

        try {
          copied = document.execCommand('copy');
        } catch (error) {
          copied = false;
        }

        document.body.removeChild(field);

        if (copied) {
          done();
        } else {
          failed();
        }
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, legacy);
      } else {
        legacy();
      }
    });
  }

  /* ------------------------------------------------------------------------
     The year
     ---------------------------------------------------------------------- */

  var year = document.getElementById('year');

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
