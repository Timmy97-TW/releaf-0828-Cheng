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
        if (d && d.documentElement) bp.style.height = d.documentElement.scrollHeight + 'px';
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
    if (bp.contentDocument && bp.contentDocument.readyState === 'complete') watch();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
  }

  /* ------------------------------------------------------------ lightbox */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption');
    document.addEventListener('click', function (e) {
      var img = e.target.closest('.fig img, .gal__grid img, .spread img');
      if (img) {
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        /* a caption holds both languages; show only the one currently on */
        var cap = img.closest('figure').querySelector('figcaption');
        if (cap) {
          var lang = root.getAttribute('data-lang') || 'zh';
          var span = cap.querySelector('.' + lang);
          lbCap.textContent = (span ? span.textContent : cap.textContent).trim();
        } else {
          lbCap.textContent = '';
        }
        lb.classList.add('is-open');
        return;
      }
      if (e.target.closest('.lightbox')) lb.classList.remove('is-open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') lb.classList.remove('is-open');
    });
  }
})();
