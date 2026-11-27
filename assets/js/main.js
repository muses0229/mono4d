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

  /* ---------- demo gallery: one stage, thumbnail sheet ---------- */
  (function () {
    var root = document.getElementById('demoGallery');
    if (!root) return;

    var stage = document.getElementById('dgStage');
    var counter = document.getElementById('dgCounter');
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.dg-tab'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('.dg-panel'));

    var currentGroup = 'wild';

    function panelOf(group) {
      return root.querySelector('.dg-panel#dg-panel-' + group);
    }

    function thumbsOf(group) {
      var panel = panelOf(group);
      return panel ? Array.prototype.slice.call(panel.querySelectorAll('.dg-thumb')) : [];
    }

    function updateCounter() {
      if (!counter) return;
      var list = thumbsOf(currentGroup);
      if (!list.length) { counter.textContent = ''; return; }
      var index = 0;
      list.forEach(function (b, i) {
        if (b.getAttribute('aria-pressed') === 'true') index = i;
      });
      counter.textContent = (index + 1) + ' / ' + list.length;
    }

    function select(button, play) {
      var src = button.getAttribute('data-src');
      var label = button.getAttribute('data-label') || '';
      if (!src || !stage) return;

      var siblings = thumbsOf(currentGroup);
      siblings.forEach(function (b) {
        b.setAttribute('aria-pressed', b === button ? 'true' : 'false');
      });

      var poster = button.querySelector('img');
      stage.poster = poster ? poster.getAttribute('src') : '';
      stage.setAttribute('aria-label', label);
      stage.src = src;
      updateCounter();

      if (play) {
        var p = stage.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      }
    }

    function showGroup(group) {
      currentGroup = group;
      tabs.forEach(function (t) {
        var on = t.id === 'dg-tab-' + group;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panels.forEach(function (p) {
        p.classList.toggle('is-active', p.id === 'dg-panel-' + group);
      });
      var first = thumbsOf(group)[0];
      if (first) select(first, false);
      if (stage) stage.pause();
    }

    var splatFrame = document.getElementById('splatFrame');
    var splatVeil = document.getElementById('splatVeil');
    var splatBooted = false;

    function bootSplat() {
      if (splatBooted || !splatFrame) return;
      splatBooted = true;
      splatFrame.src = splatFrame.getAttribute('data-src');
    }

    window.addEventListener('message', function (event) {
      if (event.data && event.data.type === 'mono4d-viewer-ready' && splatVeil) {
        splatVeil.classList.add('hide');
      }
    });

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var group = tab.id.replace('dg-tab-', '');
        showGroup(group);
        if (group === '3d') bootSplat();
      });
    });

    root.querySelectorAll('.dg-thumb').forEach(function (btn) {
      btn.addEventListener('click', function () { select(btn, true); });
    });

    /* click the stage to open the current clip full screen */
    if (stage) {
      stage.addEventListener('click', function (event) {
        /* let the native controls work, only open the overlay on the picture */
        if (event.target !== stage) return;
        var big = document.createElement('video');
        big.src = stage.currentSrc || stage.src;
        big.poster = stage.poster || '';
        big.controls = true;
        big.autoplay = true;
        big.loop = true;
        big.muted = stage.muted;
        big.playsInline = true;
        openLightbox(big);
        var p = big.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      });

      /* auto-advance when a clip ends */
      stage.addEventListener('ended', function () {
        var list = thumbsOf(currentGroup);
        var i = list.findIndex(function (b) { return b.getAttribute('aria-pressed') === 'true'; });
        if (i < 0 || !list.length) return;
        select(list[(i + 1) % list.length], true);
      });

      /* pause when scrolled away */
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting && !stage.paused) stage.pause();
          });
        }, { rootMargin: '120px 0px' });
        io.observe(stage);
      }
    }

    var initial = thumbsOf('wild')[0];
    if (initial) select(initial, false);
  })();

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
