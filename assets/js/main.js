/* Edge Smart Space — v2 interactions (vanilla JS, no libraries) */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduce = root.classList.contains('no-motion');
  var CONTACT_EMAIL = 'edgesmartspace@gmail.com';
  var WHATSAPP = '919315824206';
  var WA_MSG = "Hi Edge Smart Space! I'm interested in automating my home. Can you help me get started?";

  /* ---------- Theme switch (light default, remembered) ---------- */
  var sw = $('#themeSwitch');
  function syncSwitch() { if (sw) sw.setAttribute('aria-checked', String(root.getAttribute('data-theme') === 'dark')); }
  function setTheme(next) {
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('ess-theme', next); } catch (e) {}
    syncSwitch();
  }
  syncSwitch();
  if (sw) sw.addEventListener('click', function (e) {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    // Circular reveal where supported, gentle colour fade otherwise
    if (doc.startViewTransition && !reduce) {
      var r = sw.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      var t = doc.startViewTransition(function () { setTheme(next); });
      t.ready.then(function () {
        root.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 650, easing: 'cubic-bezier(.22,.8,.2,1)', pseudoElement: '::view-transition-new(root)' });
      }).catch(function () {});
    } else {
      root.classList.add('theme-anim'); setTheme(next);
      setTimeout(function () { root.classList.remove('theme-anim'); }, 500);
    }
  });

  /* ---------- Header + mobile menu ---------- */
  var header = $('#siteHeader');
  var toTop = $('#toTop');
  function onScroll() {
    header.classList.toggle('scrolled', scrollY > 10);
    if (toTop) toTop.classList.toggle('show', scrollY > innerHeight * 1.2);
  }
  if (toTop) toTop.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var toggle = $('#navToggle'), nav = $('#mainNav');
  function menu(open) {
    nav.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    doc.body.style.overflow = open ? 'hidden' : '';
    if (open) header.classList.add('scrolled'); else onScroll();
  }
  if (toggle && nav) toggle.addEventListener('click', function () { menu(!nav.classList.contains('open')); });
  if (nav) $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (nav) menu(false); closeWA(); } });

  // Active nav link
  var sections = { home: 'home', products: 'products', 'touch-panels': 'products', curtains: 'products', security: 'products', automation: 'products', solutions: 'solutions', pricing: 'pricing', contact: 'contact' };
  if ('IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var k = sections[e.target.id];
        if (nav) $$('a', nav).forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + k); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(sections).forEach(function (id) { var el = doc.getElementById(id); if (el) navIO.observe(el); });
  }

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    var rio = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.rv').forEach(function (el) { rio.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- 01 Touch panel: lighting moods ---------- */
  var MOODS = {
    day:   { name: 'Daylight',     note: 'lights off, curtains open' },
    warm:  { name: 'Warm Evening', note: 'cove, pendants & lamps · 2700K' },
    cool:  { name: 'Cool Night',   note: 'cove 6500K · blue accent strip' },
    movie: { name: 'Movie',        note: 'cove 15% · warm underglow' },
    off:   { name: 'All Off',      note: 'everything off · panel nightlight' }
  };
  if ($('#tpStage')) (function touchPanel() {
  var stage = $('#tpStage'), imgs = $$('.tp-img'), keys = $$('.tp-key[data-mood]'), dim = $('#tpDim'), dimOut = $('#tpDimOut'), statusEl = $('#tpStatus');
  var current = 'day';
  function loadMood(img) {
    if (img.dataset.srcset) { img.srcset = img.dataset.srcset; img.removeAttribute('data-srcset'); img.src = img.srcset.split(' ')[0]; }
  }
  function preloadMoods() { imgs.forEach(loadMood); }
  // Fetch the other scenes shortly before the section is reached, so taps feel instant
  if ('IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { preloadMoods(); pio.disconnect(); } }, { rootMargin: '600px 0px' });
    pio.observe(stage);
  } else preloadMoods();

  function applyDim() {
    var v = +dim.value; dimOut.textContent = v + '%';
    dim.style.setProperty('--fill', ((v - 40) / 70 * 100) + '%');
    var b = v / 100;
    imgs.forEach(function (im) { im.style.filter = b === 1 ? '' : 'brightness(' + b + ')'; });
  }
  function setMood(m) {
    if (!MOODS[m] || m === current) return;
    current = m;
    var img = imgs.filter(function (i) { return i.dataset.mood === m; })[0];
    loadMood(img);
    keys.forEach(function (k) { k.setAttribute('aria-pressed', String(k.dataset.mood === m)); });
    statusEl.innerHTML = '<b>' + MOODS[m].name + '</b> · ' + MOODS[m].note;
    function show() {
      stage.classList.remove('is-loading');
      imgs.forEach(function (i) { i.classList.toggle('on', i === img); });
    }
    if (img.complete && img.naturalWidth) show();
    else { stage.classList.add('is-loading'); img.addEventListener('load', show, { once: true }); img.addEventListener('error', show, { once: true }); }
  }
  keys.forEach(function (k) { k.addEventListener('click', function () { setMood(k.dataset.mood); }); });
  dim.addEventListener('input', applyDim); applyDim();
  })();

  /* ---------- 02 Curtains: scroll-driven image sequence ---------- */
  (function curtains() {
    var scene = $('#curtains'), canvas = $('#curCanvas'), copy = $('#curCopy'), head = $('#curHead'), pct = $('#curPct'), shade = $('#curShade');
    if (!scene || reduce || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var N = 16, frames = [], loaded = 0, started = false;
    var items = $$('#curCopy > *');
    var target = 0, shown = 0, raf = 0, active = false;

    function pickSet() { return (innerWidth * Math.min(devicePixelRatio || 1, 2)) > 1100 ? 1280 : 720; }
    function start() {
      if (started) return; started = true;
      var w = pickSet();
      for (var i = 0; i < N; i++) {
        (function (i) {
          var im = new Image(); im.decoding = 'async';
          im.onload = function () { loaded++; if (i === 0 || i === Math.round(shown * (N - 1))) draw(); };
          im.src = 'assets/img/render/curtain-' + w + '-' + (i < 10 ? '0' : '') + i + '.webp';
          frames[i] = im;
        })(i);
      }
    }
    function size() {
      var dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(canvas.clientWidth * dpr); canvas.height = Math.round(canvas.clientHeight * dpr);
      draw();
    }
    function ready(i) { var f = frames[i]; return f && f.complete && f.naturalWidth; }
    function nearest(i) {
      for (var d = 0; d < N; d++) { if (ready(i - d)) return i - d; if (ready(i + d)) return i + d; }
      return -1;
    }
    function cover(img, alpha) {
      var cw = canvas.width, ch = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
      var s = Math.max(cw / iw, ch / ih), w = iw * s, h = ih * s;
      ctx.globalAlpha = alpha; ctx.drawImage(img, (cw - w) * 0.5, (ch - h) * 0.42, w, h);
    }
    function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

    function draw() {
      if (!canvas.width) return;
      var p = shown;
      // 0 → 0.55 of the scroll: curtains open; then the copy glides up
      var c = clamp(p / 0.55), f = c * (N - 1), i0 = Math.floor(f), i1 = Math.min(N - 1, i0 + 1), t = f - i0;
      var a = nearest(i0), b = ready(i1) ? i1 : a;
      // show each frame crisply; cross-fade only briefly around the hand-off so pleats never look ghosted
      var bt = clamp((t - 0.35) / 0.3); bt = bt * bt * (3 - 2 * bt);
      if (a >= 0) { ctx.globalAlpha = 1; cover(frames[a], 1); if (b !== a && bt > 0.01) cover(frames[b], bt); ctx.globalAlpha = 1; }
      pct.textContent = Math.round(c * 100);
      var k = ease(clamp((p - 0.42) / 0.38));
      copy.style.opacity = k;
      copy.style.transform = 'translate(-50%, ' + ((1 - k) * 70) + 'vh)';
      items.forEach(function (el, j) {
        var kj = ease(clamp((p - 0.48 - j * 0.035) / 0.3));
        el.style.opacity = kj; el.style.transform = 'translateY(' + ((1 - kj) * 22) + 'px)';
      });
      head.style.opacity = 1 - ease(clamp((p - 0.35) / 0.2));
      shade.style.setProperty('--shade', k.toFixed(3));
    }
    function progress() {
      var r = scene.getBoundingClientRect(), total = r.height - innerHeight;
      return clamp(-r.top / (total || 1));
    }
    function tick() {
      // gentle glide towards the scroll position (eases out, never lags noticeably)
      var d = target - shown;
      shown = Math.abs(d) < 0.0005 ? target : shown + d * 0.2;
      draw();
      raf = (shown !== target) ? requestAnimationFrame(tick) : 0;
    }
    function onScrollC() { if (!active) return; target = progress(); if (!raf) raf = requestAnimationFrame(tick); }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { if (en[0].isIntersecting) start(); }, { rootMargin: '150% 0px' }).observe(scene);
      new IntersectionObserver(function (en) { active = en[0].isIntersecting; if (active) onScrollC(); }, { rootMargin: '20% 0px' }).observe(scene);
    } else { start(); active = true; }
    addEventListener('scroll', onScrollC, { passive: true });
    addEventListener('resize', function () { size(); onScrollC(); });
    size(); target = shown = progress(); draw();
  })();

  /* ---------- Clocks ---------- */
  var tpClock = $('#tpClock'), camClocks = $$('.cam-clock');
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var d = new Date();
    if (tpClock) tpClock.textContent = two(d.getHours()) + ':' + two(d.getMinutes());
    var s = two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds());
    camClocks.forEach(function (c) { c.textContent = s; });
  }
  if (tpClock || camClocks.length) { tick(); setInterval(tick, 1000); }

  /* ---------- 03 Lock cycle ---------- */
  var fp = $('#fp'), lockText = $('#lockText'), lockDot = $('#lockDot');
  function lockCycle() {
    fp.classList.remove('ok'); lockDot.classList.remove('ok'); lockText.textContent = 'Scanning…';
    setTimeout(function () { fp.classList.add('ok'); lockDot.classList.add('ok'); lockText.textContent = 'Access granted · Unlocked'; }, 2200);
  }
  if (fp) { lockCycle(); setInterval(lockCycle, 5200); }

  /* ---------- 04 Gate + arriving-home sequence (time based, plays while visible) ---------- */
  (function gate() {
    var g = $('#gateVisual'), st = $('#gateStatus'), dot = $('.gs-dot'), steps = $$('.flow li');
    if (!g) return;
    var STATES = ['is-approach', 'is-open', 'is-lit', 'is-enter'];
    function light(n) { steps.forEach(function (li, i) { li.classList.toggle('lit', i <= n); li.classList.toggle('current', i === n); }); }
    function say(t, c) { st.textContent = t; dot.className = 'gs-dot ' + (c || ''); }
    var script = [
      [0, function () { g.classList.remove.apply(g.classList, STATES); light(-1); say('Monitoring driveway'); }],
      [1200, function () { g.classList.add('is-approach'); light(0); say('Vehicle recognised', 'warn'); }],
      [2600, function () { g.classList.add('is-open'); light(1); say('Opening gate…', 'warn'); }],
      [4000, function () { g.classList.add('is-lit'); light(2); say('Gate open · porch lights on', 'ok'); }],
      [4800, function () { g.classList.add('is-enter'); light(3); say('Welcome home · door unlocked', 'ok'); }],
      [6800, function () { g.classList.remove('is-open'); say('Closing · obstacle sensors on', 'warn'); }],
      [8400, function () { g.classList.remove('is-approach', 'is-enter'); say('Secured', 'ok'); }],
      [9900, null]
    ];
    if (reduce) { g.classList.add('is-open', 'is-lit'); light(3); say('Gate open · porch lights on', 'ok'); return; }
    var timers = [], running = false;
    function run() { stop(); running = true; script.forEach(function (s) { timers.push(setTimeout(function () { s[1] ? s[1]() : run(); }, s[0])); }); }
    function stop() { timers.forEach(clearTimeout); timers = []; running = false; }
    var watched = [g.closest('.card'), $('.flow-card')], vis = [false, false];
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) { vis[watched.indexOf(e.target)] = e.isIntersecting; });
        var any = vis[0] || vis[1];
        if (any && !running) run(); else if (!any && running) stop();
      }, { threshold: 0.45 });
      watched.forEach(function (w) { if (w) io.observe(w); });
    } else run();
    doc.addEventListener('visibilitychange', function () { if (doc.hidden) stop(); });
  })();

  /* ---------- Currency ---------- */
  function setCur(c) {
    $$('.price').forEach(function (p) { if (p.dataset[c]) p.textContent = p.dataset[c]; });
    $$('.cur-toggle button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.cur === c)); });
    try { localStorage.setItem('ess-cur', c); } catch (e) {}
  }
  $$('.cur-toggle button').forEach(function (b) { b.addEventListener('click', function () { setCur(b.dataset.cur); }); });
  try { if (localStorage.getItem('ess-cur') === 'usd') setCur('usd'); } catch (e) {}
  $$('[data-plan]').forEach(function (a) { a.addEventListener('click', function () { var s = $('#f-plan'); if (s && a.dataset.plan) s.value = a.dataset.plan; }); });

  /* ---------- WhatsApp ---------- */
  var waHref = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(WA_MSG);
  $$('.wa-link').forEach(function (a) { a.href = waHref; });
  var waFab = $('#waFab'), waBubble = $('#waBubble');
  function openWA() { waBubble.hidden = false; waFab.setAttribute('aria-expanded', 'true'); }
  function closeWA() { if (waBubble && waFab) { waBubble.hidden = true; waFab.setAttribute('aria-expanded', 'false'); } }
  if (waFab && waBubble) {
    waFab.addEventListener('click', function () { waBubble.hidden ? openWA() : closeWA(); });
    $('#waClose').addEventListener('click', closeWA);
  }

  /* ---------- Contact form (Web3Forms, mailto fallback) ---------- */
  if ($('#contactForm')) (function contactForm() {
  var form = $('#contactForm'), status = $('#formStatus'), btn = $('#submitBtn'), startedAt = Date.now();
  var rules = {
    name: function (v) { return v.trim().length >= 2 || 'Please enter your name.'; },
    phone: function (v) { return (/^[0-9+()\-\s]{8,20}$/.test(v) && v.replace(/\D/g, '').length >= 8) || 'Please enter a valid phone number.'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Please enter a valid email.'; },
    property: function (v) { return !!v || 'Please choose a property type.'; }
  };
  function setErr(n, msg) {
    if (n === 'consent') { $('#consentErr').textContent = msg || ''; return; }
    var el = form.elements[n], f = el.closest('.field');
    f.classList.toggle('invalid', !!msg); $('.err', f).textContent = msg || ''; el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function validate() {
    var ok = true, first = null;
    Object.keys(rules).forEach(function (n) { var r = rules[n](form.elements[n].value); setErr(n, r === true ? '' : r); if (r !== true) { ok = false; first = first || form.elements[n]; } });
    if (!form.elements.consent.checked) { setErr('consent', 'Please accept so we can contact you.'); ok = false; first = first || form.elements.consent; } else setErr('consent', '');
    if (first) first.focus();
    return ok;
  }
  Object.keys(rules).forEach(function (n) { form.elements[n].addEventListener('blur', function () { var r = rules[n](this.value); setErr(n, r === true ? '' : r); }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); status.className = 'form-status'; status.textContent = '';
    if (!validate()) return;
    if (form.elements.botcheck.checked || Date.now() - startedAt < 3000) { status.className = 'form-status ok'; status.textContent = 'Thank you! We will be in touch shortly.'; return; }
    var f = form.elements;
    var data = { name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(), property: f.property.value,
      package: f.plan.value || 'Not sure yet', interests: $$('input[name="interests[]"]:checked', form).map(function (c) { return c.value; }).join(', ') || '—',
      message: f.message.value.trim() || '(no details provided)' };
    if (f.city && f.city.value) data.city = f.city.value;
    data.page = location.pathname;
    var key = f.access_key.value;
    if (!key || key.indexOf('YOUR_') === 0) {
      var body = Object.keys(data).map(function (k) { return k.charAt(0).toUpperCase() + k.slice(1) + ': ' + data[k]; }).join('\n');
      location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Consultation request — ' + data.name) + '&body=' + encodeURIComponent(body);
      status.className = 'form-status ok'; status.textContent = 'Opening your email app to send the request…'; return;
    }
    btn.classList.add('loading'); btn.disabled = true;
    fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.assign({ access_key: key, subject: 'New Lead: ' + data.name + ' — ' + data.property + (data.city ? ' — ' + data.city : ''), from_name: f.from_name.value, replyto: data.email, botcheck: false }, data)) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success) { form.reset(); startedAt = Date.now(); status.className = 'form-status ok'; status.textContent = 'Thank you, ' + data.name + '! A specialist will call you shortly.'; }
        else { status.className = 'form-status fail'; status.textContent = res.message || 'Something went wrong. Please try WhatsApp.'; }
      })
      .catch(function () { status.className = 'form-status fail'; status.textContent = 'Network error. Please try again or message us on WhatsApp.'; })
      .then(function () { btn.classList.remove('loading'); btn.disabled = false; });
  });
  })();

  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
})();
