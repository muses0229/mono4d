/* ===========================================================
   Mono4D project page — interactions
   =========================================================== */
(function () {
  'use strict';

  /* ---------- sticky nav shadow + scrollspy ---------- */
  var nav = document.getElementById('nav');
  var navLinks = document.getElementById('navLinks');
  var navToggle = document.getElementById('navToggle');

  function onScroll() {
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- scrollspy ---------- */
  var sections = Array.prototype.slice
    .call(document.querySelectorAll('main section[id]'));
  var anchors = navLinks
    ? Array.prototype.slice.call(navLinks.querySelectorAll('a[href^="#"]'))
    : [];

  if ('IntersectionObserver' in window && sections.length && anchors.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = '#' + en.target.id;
        anchors.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var reveal = function (el) { el.classList.add('in'); };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        reveal(en.target);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0 });
    reveals.forEach(function (el) { io.observe(el); });

    /* Safety net: anything already on screen (or above a deep-linked anchor)
       is shown even if the observer never fired for it. */
    var sweep = function () {
      reveals.forEach(function (el) {
        if (el.classList.contains('in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) reveal(el);
      });
    };
    setTimeout(sweep, 900);
    window.addEventListener('hashchange', function () { setTimeout(sweep, 60); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbBody = document.getElementById('lbBody');
  var lbClose = document.getElementById('lbClose');

  function openLightbox(html) {
    if (!lb || !lbBody) return;
    lbBody.innerHTML = '';
    lbBody.appendChild(html);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove('open');
    lbBody.innerHTML = '';
    document.body.style.overflow = '';
  }
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lb && lb.classList.contains('open')) closeLightbox();
  });

  /* zoomable figures */
  document.querySelectorAll('img[data-zoom]').forEach(function (img) {
    img.addEventListener('click', function () {
      var big = document.createElement('img');
      big.src = img.getAttribute('data-zoom');
      big.alt = img.alt || '';
      openLightbox(big);
    });
  });

  /* ---------- video cards: hover-preview + click-to-open ---------- */
  var cards = Array.prototype.slice.call(document.querySelectorAll('.vcard'));

  function pauseAll(except) {
    cards.forEach(function (c) {
      var v = c.querySelector('video');
      if (!v || v === except) return;
      if (!v.paused) v.pause();
      c.classList.remove('playing');
    });
  }

  cards.forEach(function (card) {
    var frame = card.querySelector('.vframe');
    var video = card.querySelector('video');
    if (!frame || !video) return;

    /* lazy-load only when near viewport */
    if ('IntersectionObserver' in window) {
      var lio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          if (!video.getAttribute('src')) {
            video.setAttribute('src', video.getAttribute('data-src') || '');
          }
          lio.unobserve(en.target);
        });
      }, { rootMargin: '260px 0px' });
      lio.observe(video);
    }

    frame.addEventListener('mouseenter', function () {
      pauseAll(video);
      var p = video.play();
      if (p && typeof p.catch === 'function') {
        p.then(function () { card.classList.add('playing'); })
         .catch(function () { /* autoplay blocked: keep poster */ });
      } else {
        card.classList.add('playing');
      }
    });
    frame.addEventListener('mouseleave', function () {
      if (!video.paused) video.pause();
      card.classList.remove('playing');
    });

    frame.addEventListener('click', function () {
      pauseAll(null);
      var big = document.createElement('video');
      big.src = video.currentSrc || video.getAttribute('src') || video.getAttribute('data-src');
      big.poster = video.getAttribute('poster') || '';
      big.controls = true;
      big.autoplay = true;
      big.loop = true;
      big.muted = true;
      big.playsInline = true;
      openLightbox(big);
      var p = big.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    });
  });

  /* pause offscreen videos to save memory */
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (!en.isIntersecting && !v.paused) {
          v.pause();
          var c = v.closest('.vcard');
          if (c) c.classList.remove('playing');
        }
      });
    }, { rootMargin: '120px 0px' });
    cards.forEach(function (c) {
      var v = c.querySelector('video');
      if (v) vio.observe(v);
    });
  }

  /* ---------- copy bibtex ---------- */
  var copyBtn = document.getElementById('copyBib');
  var bibText = document.getElementById('bibText');
  if (copyBtn && bibText) {
    copyBtn.addEventListener('click', function () {
      var text = bibText.textContent;
      var done = function () {
        copyBtn.textContent = 'Copied';
        copyBtn.classList.add('done');
        setTimeout(function () {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('done');
        }, 1800);
      };
      var fallback = function () {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (err) { /* ignore */ }
        document.body.removeChild(ta);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }
    });
  }
})();
