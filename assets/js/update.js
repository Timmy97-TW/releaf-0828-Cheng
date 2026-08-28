/* ReLeaf · progress update page. Three small jobs: language, contents rail,
   lightbox. No dependencies, no build step.                                  */
(function () {
  'use strict';

  /* ------------------------------------------------------------ language */
  var KEY = 'releaf-update-lang';
  var root = document.documentElement;

  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'zh' ? 'zh-Hant' : 'en');
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    document.querySelectorAll('.langtoggle button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
  }

  try { setLang(localStorage.getItem(KEY) || 'zh'); } catch (e) { setLang('zh'); }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.langtoggle button');
    if (b) setLang(b.dataset.lang);
  });

  /* ------------------------------------------------------------ contents */
  var body = document.querySelector('.pagebody');
  var list = document.querySelector('.toc__list');
  if (body && list) {
    /* the closing band sits outside .pagebody but still belongs in the rail */
    var heads = document.querySelectorAll('.pagebody section.sec > h2, section.bigband > .bigband__inner > h2');
    heads.forEach(function (h) {
      /* the closing band wraps its heading in an inner div, so walk up to the
         section rather than assuming the heading's parent carries the id */
      var sec = h.closest('section');
      if (!sec || !sec.id) return;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + sec.id;
      /* the rail follows the active language too */
      var zh = h.querySelector('.zh'), en = h.querySelector('.en');
      if (zh && en) {
        a.innerHTML = '<span class="zh">' + zh.textContent.trim() + '</span>' +
                      '<span class="en">' + en.textContent.trim() + '</span>';
      } else {
        a.textContent = h.textContent.trim();
      }
      li.appendChild(a);
      list.appendChild(li);
    });

    var links = list.querySelectorAll('a');
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    document.querySelectorAll('.pagebody section.sec, section.bigband').forEach(function (s) { if (s.id) obs.observe(s); });
  }

  /* ------------------------------------------------- big-picture iframe */
  /* Same origin, so the parent can read the real height and keep the frame as
     tall as its content: no scrollbar inside a scrollbar. The content reflows
     hard between phone and desktop widths and its own images load late, so
     watch the body rather than measuring once.                               */
  var bp = document.querySelector('.bigpic iframe');
  if (bp) {
    var fit = function () {
      try {
        var d = bp.contentDocument;
        /* measure the body, not documentElement: the html element stretches to
           whatever height we last set on the frame, so reading it would just
           feed our own number back and the frame could never shrink. */
        if (!d || !d.body) return;
        var hgt = Math.ceil(d.body.getBoundingClientRect().height);
        /* never collapse to something implausible: if the measurement comes back
           tiny the content is not laid out yet, and shrinking the frame would
           stop it ever laying out. */
        if (hgt > 400) bp.style.height = hgt + 'px';
      } catch (e) {}
    };
    var watch = function () {
      fit();
      try {
        var d = bp.contentDocument;
        if (d && d.body && window.ResizeObserver) new ResizeObserver(fit).observe(d.body);
        if (d) d.querySelectorAll('img').forEach(function (i) {
          if (!i.complete) i.addEventListener('load', fit, { once: true });
        });
      } catch (e) {}
      [200, 800, 2000].forEach(function (ms) { setTimeout(fit, ms); });
    };
    bp.addEventListener('load', watch);
    /* the frame is lazy, so its load event can fire before or after this script
       runs, and on a cold load it may still be about:blank here. Watch for it
       coming into view as well, and re-measure while it settles.             */
    if (bp.contentDocument && bp.contentDocument.readyState === 'complete') watch();
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) watch(); });
      }, { rootMargin: '600px' }).observe(bp);
    }
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    window.addEventListener('load', function () { watch(); setTimeout(fit, 1200); });
  }

  /* ------------------------------------------------------------ lightbox */
  /* Opening fits the photograph to the screen. From there it is a magnifier:
     click, wheel, pinch or the buttons zoom about the point being looked at,
     and past 1x the image can be dragged.                                    */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var stage = lb.querySelector('.lightbox__stage');
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('figcaption');
    var out   = lb.querySelector('output');
    var fit = 1, scale = 1, tx = 0, ty = 0, dragging = false, sx = 0, sy = 0;

    function apply() {
      lbImg.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
      lb.classList.toggle('is-zoomed', scale > fit * 1.02);
      if (out) out.textContent = Math.round(scale / fit * 100) + '%';
    }
    function fitToStage() {
      var r = stage.getBoundingClientRect();
      var nw = lbImg.naturalWidth || 1, nh = lbImg.naturalHeight || 1;
      fit = Math.min((r.width - 48) / nw, (r.height - 140) / nh);
      if (!isFinite(fit) || fit <= 0) fit = 1;
      scale = fit;
      tx = (r.width - nw * scale) / 2;
      ty = (r.height - nh * scale) / 2;
      apply();
    }
    /* zoom about a point so the pixel under the cursor stays put */
    function zoomAt(next, px, py) {
      next = Math.max(fit, Math.min(fit * 8, next));
      var r = stage.getBoundingClientRect();
      var cx = (px - r.left - tx) / scale, cy = (py - r.top - ty) / scale;
      tx += cx * (scale - next);
      ty += cy * (scale - next);
      scale = next;
      if (scale <= fit * 1.02) { fitToStage(); return; }
      apply();
    }
    function open(img) {
      var pic = img.closest('picture');
      var src = img.currentSrc || img.src;
      if (pic) { var s = pic.querySelector('source'); if (s && img.currentSrc) src = img.currentSrc; }
      lbImg.src = src;
      lbImg.alt = img.alt || '';
      var fg = img.closest('figure');
      var cap = fg && fg.querySelector('figcaption');
      if (cap) {
        var lang = root.getAttribute('data-lang') || 'zh';
        var span = cap.querySelector('.' + lang);
        lbCap.textContent = (span ? span.textContent : cap.textContent).trim();
      } else { lbCap.textContent = ''; }
      lb.classList.add('is-open');
      if (lbImg.complete && lbImg.naturalWidth) fitToStage();
      else lbImg.addEventListener('load', fitToStage, { once: true });
    }
    function close() { lb.classList.remove('is-open', 'is-zoomed'); lbImg.src = ''; }

    /* the big-picture band is a same-origin iframe; its tiles borrow this
       lightbox rather than shipping a second one */
    window.__releafZoom = function (src, caption) {
      lbImg.src = src; lbImg.alt = caption || '';
      lbCap.textContent = caption || '';
      lb.classList.add('is-open');
      if (lbImg.complete && lbImg.naturalWidth) fitToStage();
      else lbImg.addEventListener('load', fitToStage, { once: true });
    };

    document.addEventListener('click', function (e) {
      var t = e.target.closest('.fig img, .gal__grid img, .gal__one img, .spread img, .proto img, .hand__c img');
      if (t) { open(t); return; }
      var btn = e.target.closest('.lightbox__tools button');
      if (btn) {
        var r = stage.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2;
        var k = btn.dataset.zoom;
        if (k === 'in')  zoomAt(scale * 1.5, mx, my);
        if (k === 'out') zoomAt(scale / 1.5, mx, my);
        if (k === 'reset') fitToStage();
        return;
      }
      if (e.target === lbImg) { zoomAt(scale > fit * 1.02 ? fit : fit * 2.5, e.clientX, e.clientY); return; }
      if (e.target.closest('.lightbox')) close();
    });

    lb.addEventListener('wheel', function (e) {
      if (!lb.classList.contains('is-open')) return;
      e.preventDefault();
      zoomAt(scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12), e.clientX, e.clientY);
    }, { passive: false });

    lbImg.addEventListener('pointerdown', function (e) {
      if (scale <= fit * 1.02) return;
      dragging = true; sx = e.clientX - tx; sy = e.clientY - ty;
      lbImg.classList.add('is-dragging'); lbImg.setPointerCapture(e.pointerId);
    });
    lbImg.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      tx = e.clientX - sx; ty = e.clientY - sy; apply();
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      lbImg.addEventListener(ev, function () { dragging = false; lbImg.classList.remove('is-dragging'); });
    });

    window.addEventListener('resize', function () { if (lb.classList.contains('is-open')) fitToStage(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === '+' || e.key === '=') { var r = stage.getBoundingClientRect(); zoomAt(scale * 1.5, r.left + r.width / 2, r.top + r.height / 2); }
      if (e.key === '-') { var r2 = stage.getBoundingClientRect(); zoomAt(scale / 1.5, r2.left + r2.width / 2, r2.top + r2.height / 2); }
      if (e.key === '0') fitToStage();
    });
  }
})();
