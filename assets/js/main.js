/* Edge Smart Space — interactions, scroll scenes, form */
(function () {
  'use strict';
  /* Where enquiries go if the form service key isn't set yet (mailto fallback) */
  var CONTACT_EMAIL = 'edgesmartspace@gmail.com';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (!hasGSAP || reduce) document.documentElement.classList.add('no-motion');

  /* ---------- Header ---------- */
  var header = $('#siteHeader');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var toggle = $('#navToggle'), nav = $('#mainNav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeWA(); } });

  // Active nav link
  var navMap = { home: 'home', products: 'products', curtain: 'products', lighting: 'products', security: 'products', automation: 'products', solutions: 'solutions', pricing: 'pricing', contact: 'contact' };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var key = navMap[en.target.id];
        $$('.nav-link').forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + key); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(navMap).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ---------- Hero counters ---------- */
  $$('[data-count]').forEach(function (el) {
    var end = +el.dataset.count, start = null, dur = reduce ? 1 : 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* ---------- Scroll scenes (GSAP) ---------- */
  if (hasGSAP && !reduce) try {
    gsap.registerPlugin(ScrollTrigger);
    // Mobile address bar showing/hiding shouldn't recalculate pins (prevents jumps)
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();


    // Hero copy parallax
    gsap.to('.hero-content', { yPercent: -18, autoAlpha: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // a) Curtains part + window zooms, then copy slides in
    var pct = $('#curtainPct');
    var copy = $('.curtain-copy');
    var copyItems = $$('.curtain-copy > *');
    // Panel starts well below the window and fully transparent, so it can glide up over a long stretch of scroll
    gsap.set(copy, { xPercent: -50, yPercent: -50, x: 0, y: function () { return window.innerHeight * 0.55; }, autoAlpha: 0 });
    gsap.set(copyItems, { y: 28, autoAlpha: 0 });
    var ctl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#curtain', start: 'top top', end: '+=260%',
        scrub: 1.6,            // higher = more inertia, so the motion keeps easing after you stop scrolling
        pin: true, anticipatePin: 1, invalidateOnRefresh: true
      }
    });
    // 1) Curtains glide apart (0 → 1.2)
    ctl.to('.curtain-left',  { xPercent: -88, scaleX: 0.35, duration: 1.2, ease: 'sine.inOut' }, 0)
       .to('.curtain-right', { xPercent: 88,  scaleX: 0.35, duration: 1.2, ease: 'sine.inOut',
            onUpdate: function () { pct.textContent = Math.round(this.progress() * 100); } }, 0)
       .fromTo('.sun', { yPercent: 60 }, { yPercent: -40, duration: 1.8 }, 0)
    // 2) Window slowly pushes in and dims (opacity overlay — much smoother than animating CSS filters)
       .to('#curtainWindow', { scale: 1.3, duration: 1.8, ease: 'sine.inOut' }, 0.4)
       .to('.window-dim', { opacity: 1, duration: 1.0, ease: 'sine.inOut' }, 1.0)
    // 3) Glass panel glides up from below…
       .to(copy, { y: 0, autoAlpha: 1, duration: 1.4, ease: 'power2.out' }, 1.0)
    // 4) …and its lines drift into place one after another
       .to(copyItems, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' }, 1.35)
    // 5) Short hold so the text can be read before the section unpins
       .to({}, { duration: 0.6 });

    // b) Flip card spins into view — keyed to the card itself so it always finishes
    //    while the card sits mid-screen, whatever the screen height
    gsap.fromTo('#flipCard',
      { rotationY: -170, rotationX: 22, scale: 0.6, autoAlpha: 0, z: -300 },
      { rotationY: 0, rotationX: 0, scale: 1, autoAlpha: 1, z: 0, ease: 'power2.out',
        scrollTrigger: { trigger: '#flipCard', start: 'top 98%', end: 'center 55%', scrub: 1 } });
    gsap.from('#lighting .scene-copy > *', { y: 40, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '#lighting .scene-copy', start: 'top 85%' } });

    // c) Radar lens zoom reveal — lens grows until it covers the whole screen at any resolution
    function lensCover() {
      var lens = $('#lens');
      return (Math.hypot(window.innerWidth, window.innerHeight) / (lens.offsetWidth || 340)) * 1.15;
    }
    mm.add('(min-width: 1024px) and (min-height: 720px)', function () {
      document.documentElement.classList.add('sec-pinned');
      var stl = gsap.timeline({ scrollTrigger: { trigger: '#security', start: 'top top', end: '+=140%', scrub: 1.2, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
      stl.fromTo('#lens', { scale: 0.6, autoAlpha: 1 }, { scale: lensCover, duration: 1, ease: 'power2.in' })
         .to('#lens', { autoAlpha: 0.08, duration: 0.3 }, 0.7)
         .fromTo('#securityReveal', { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.5 }, 0.65)
         .from('.cam', { autoAlpha: 0, y: 30, stagger: 0.08, duration: 0.3 }, 0.8)
         .to({}, { duration: 0.3 });
      return function () { document.documentElement.classList.remove('sec-pinned'); };
    });
    mm.add('(max-width: 1023px), (max-height: 719px)', function () {
      gsap.fromTo('#lens', { scale: 0.5, autoAlpha: 1 }, { scale: function () { return lensCover() * 0.6; }, autoAlpha: 0.08, ease: 'none',
        scrollTrigger: { trigger: '#security', start: 'top 85%', end: 'top 5%', scrub: 1, invalidateOnRefresh: true } });
      gsap.utils.toArray('#securityReveal .lock-card, #securityReveal .cam, #securityReveal .scene-copy > *').forEach(function (el) {
        gsap.from(el, { y: 40, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
      });
    });

    // d) Cards fade in as each one actually reaches the screen (works on tall and short displays alike)
    gsap.set('.auto-card', { y: 70, autoAlpha: 0, scale: 0.96 });
    ScrollTrigger.batch('.auto-card', {
      start: 'top 92%',
      onEnter: function (els) { gsap.to(els, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.12, duration: 0.9, ease: 'power3.out', overwrite: true }); }
    });

    // Generic reveals, batched the same way
    ['.sol-card', '.process li', '.alacarte li', '.plan'].forEach(function (sel) {
      gsap.set(sel, { y: 50, autoAlpha: 0 });
      ScrollTrigger.batch(sel, {
        start: 'top 92%',
        onEnter: function (els) { gsap.to(els, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out', overwrite: true }); }
      });
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  } catch (err) {
    // Safety net: if any scroll animation fails, show all content normally and keep the rest of the site working
    console.error('Scroll animations disabled:', err);
    try {
      ScrollTrigger.getAll().forEach(function (t) { t.kill(true); });
      gsap.set('.hero-content, .curtain-copy, .curtain-copy > *, #flipCard, #lens, #securityReveal, .cam, .auto-card, .sol-card, .process li, .alacarte li, .plan, #lighting .scene-copy > *', { clearProps: 'all' });
    } catch (e) {}
    document.documentElement.classList.add('no-motion');
  }

  /* ---------- Arriving-home + gate sequence ----------
     Time-based (not scroll-based), so it can't finish before anyone sees it.
     Loops while the flow card or gate card is on screen, restarts from the
     beginning each time it comes back into view, pauses when off-screen. */
  (function gateSequence() {
    var gate = $('#gateVisual'), statusEl = $('#gateStatus'), dot = $('.gs-dot');
    var steps = $$('.flow li');
    if (!gate) return;
    var STATES = ['is-approach', 'is-open', 'is-lit', 'is-enter'];
    var script = [
      [0,    function () { gate.classList.remove.apply(gate.classList, STATES); light(-1); say('Monitoring driveway', ''); }],
      [1200,  function () { gate.classList.add('is-approach'); light(0); say('Vehicle detected · plate recognised', 'warn'); }],
      [2600, function () { gate.classList.add('is-open'); light(1); say('Opening gate…', 'warn'); }],
      [4000, function () { gate.classList.add('is-lit'); light(2); say('Gate open · porch lights on', 'ok'); }],
      [4800, function () { gate.classList.add('is-enter'); light(3); say('Welcome home · front door unlocked', 'ok'); }],
      [6800, function () { gate.classList.remove('is-open'); say('Closing · obstacle sensors active', 'warn'); }],
      [8400, function () { gate.classList.remove('is-approach', 'is-enter'); say('Secured', 'ok'); }],
      [9900, null] // loop
    ];
    function light(n) { steps.forEach(function (li, i) { li.classList.toggle('lit', i <= n); li.classList.toggle('current', i === n); }); }
    function say(t, cls) { if (statusEl) statusEl.textContent = t; if (dot) dot.className = 'gs-dot ' + cls; }

    if (reduce) { // static, fully-explained end state
      gate.classList.add('is-open', 'is-lit'); light(3); say('Gate open · porch lights on', 'ok'); return;
    }

    var timers = [], running = false;
    function run() {
      stop(); running = true;
      script.forEach(function (st) {
        timers.push(setTimeout(function () { if (st[1]) st[1](); else run(); }, st[0]));
      });
    }
    function stop() { timers.forEach(clearTimeout); timers = []; running = false; }

    var watched = [gate.closest('.auto-card'), $('.flow-card')].filter(Boolean);
    var vis = new Map();
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { vis.set(e.target, e.isIntersecting); });
        var any = watched.some(function (w) { return vis.get(w); });
        if (any && !running) run();          // came into view → start from the top
        else if (!any && running) stop();    // left view → pause, will restart fresh
      }, { threshold: 0.45 });
      watched.forEach(function (w) { io.observe(w); });
    } else run();
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
  })();

  /* ---------- Lighting demo ---------- */
  var keys = $$('.touch-key'), dimmer = $('#dimmer'), cct = $('#cct'), glow = $('#roomGlow');
  function cctColor(k) {
    var t = (k - 2700) / (6500 - 2700);
    var r = Math.round(255 - t * 55), g = Math.round(180 + t * 45), b = Math.round(100 + t * 155);
    return r + ',' + g + ',' + b;
  }
  function renderLight() {
    var on = keys.filter(function (k) { return k.classList.contains('on'); }).length;
    var a = (dimmer.value / 100) * (on / keys.length) * 0.85;
    dimmer.style.setProperty('--fill', dimmer.value + '%');
    glow.style.background = 'radial-gradient(circle, rgba(' + cctColor(+cct.value) + ',' + a.toFixed(2) + ') 0%, transparent 60%)';
  }
  keys.forEach(function (k) {
    k.addEventListener('click', function () {
      var on = !k.classList.contains('on');
      k.classList.toggle('on', on); k.setAttribute('aria-pressed', String(on));
      $$('.chip').forEach(function (c) { c.classList.remove('active'); });
      renderLight();
    });
  });
  [dimmer, cct].forEach(function (el) { el.addEventListener('input', renderLight); });
  var scenes = { relax: [70, 2700, [0, 1, 1, 0]], focus: [100, 5600, [1, 0, 1, 1]], movie: [20, 3000, [0, 1, 0, 1]], off: [0, 3500, [0, 0, 0, 0]] };
  $$('.chip').forEach(function (c) {
    c.addEventListener('click', function () {
      var s = scenes[c.dataset.scene];
      dimmer.value = s[0]; cct.value = s[1];
      keys.forEach(function (k, i) { k.classList.toggle('on', !!s[2][i]); k.setAttribute('aria-pressed', String(!!s[2][i])); });
      $$('.chip').forEach(function (x) { x.classList.toggle('active', x === c); });
      renderLight();
    });
  });
  renderLight();
  // Subtle tilt on the glass panel (desktop pointer only)
  var panel = $('.glass-panel');
  if (window.matchMedia('(hover: hover)').matches && !reduce) {
    panel.addEventListener('pointermove', function (e) {
      var r = panel.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      panel.style.transform = 'rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg)';
    });
    panel.addEventListener('pointerleave', function () { panel.style.transform = ''; });
    panel.style.transition = 'transform .25s ease-out';
  }

  /* ---------- Clocks & lock cycle ---------- */
  var panelTime = $('#panelTime'), camClocks = $$('.cam-clock');
  function tick() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    panelTime.textContent = p(d.getHours()) + ':' + p(d.getMinutes());
    var s = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    camClocks.forEach(function (c) { c.textContent = s; });
  }
  tick(); setInterval(tick, 1000);

  var fp = $('.fingerprint'), lockText = $('#lockText'), lockDot = $('.lock-dot');
  function lockCycle() {
    fp.classList.remove('ok'); lockDot.classList.remove('ok'); lockText.textContent = 'Scanning…';
    setTimeout(function () { fp.classList.add('ok'); lockDot.classList.add('ok'); lockText.textContent = 'Access granted · Unlocked'; }, 2200);
  }
  lockCycle(); setInterval(lockCycle, 5000);

  /* ---------- Currency toggle ---------- */
  function setCurrency(cur) {
    $$('.price').forEach(function (p) { if (p.dataset[cur]) p.textContent = p.dataset[cur]; });
    $$('.cur').forEach(function (b) { var on = b.dataset.cur === cur; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
    try { localStorage.setItem('ess-cur', cur); } catch (e) {}
  }
  $$('.cur').forEach(function (b) { b.addEventListener('click', function () { setCurrency(b.dataset.cur); }); });
  try { var saved = localStorage.getItem('ess-cur'); if (saved === 'usd') setCurrency('usd'); } catch (e) {}

  // Plan CTA pre-selects the package in the form
  $$('[data-plan]').forEach(function (a) {
    a.addEventListener('click', function () { var sel = $('#f-plan'); if (sel) sel.value = a.dataset.plan; });
  });

  /* ---------- WhatsApp widget ---------- */
  var waFab = $('#waFab'), waBubble = $('#waBubble');
  function openWA() { waBubble.hidden = false; waFab.setAttribute('aria-expanded', 'true'); }
  function closeWA() { if (!waBubble) return; waBubble.hidden = true; waFab.setAttribute('aria-expanded', 'false'); }
  waFab.addEventListener('click', function () { waBubble.hidden ? openWA() : closeWA(); });
  $('#waClose').addEventListener('click', closeWA);
  // Gentle nudge after 25s, once per session
  try {
    if (!sessionStorage.getItem('ess-wa')) setTimeout(function () { openWA(); sessionStorage.setItem('ess-wa', '1'); }, 25000);
  } catch (e) {}

  /* ---------- Contact form ---------- */
  var form = $('#contactForm'), status = $('#formStatus'), btn = $('#submitBtn');
  var rules = {
    name: function (v) { return v.trim().length >= 2 || 'Please enter your full name.'; },
    phone: function (v) { return (/^[0-9+()\-\s]{8,20}$/.test(v) && v.replace(/\D/g, '').length >= 8) || 'Please enter a valid phone number.'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Please enter a valid email address.'; },
    property: function (v) { return !!v || 'Please choose a property type.'; }
  };
  function setErr(name, msg) {
    if (name === 'consent') { $('.consent-err').textContent = msg || ''; return; }
    var input = form.elements[name]; if (!input) return;
    var field = input.closest('.field'); if (!field) return;
    field.classList.toggle('invalid', !!msg);
    var e = $('.err', field); if (e) e.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function validate() {
    var ok = true, first = null;
    Object.keys(rules).forEach(function (n) {
      var r = rules[n](form.elements[n].value);
      setErr(n, r === true ? '' : r);
      if (r !== true) { ok = false; first = first || form.elements[n]; }
    });
    if (!form.elements.consent.checked) { setErr('consent', 'Please accept so we can contact you.'); ok = false; first = first || form.elements.consent; }
    else setErr('consent', '');
    if (first) first.focus();
    return ok;
  }
  Object.keys(rules).forEach(function (n) {
    form.elements[n].addEventListener('blur', function () { var r = rules[n](this.value); setErr(n, r === true ? '' : r); });
  });

  // Builds a readable summary of the enquiry (used for email + mailto fallback)
  function summary() {
    var f = form.elements, ints = $$('input[name="interests[]"]:checked', form).map(function (c) { return c.nextElementSibling.textContent; });
    return {
      name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(),
      city: f.city.value.trim(), property: f.property.value, package: f.plan.value || 'Not sure yet',
      interests: ints.join(', ') || '—', message: f.message.value.trim()
    };
  }
  var startedAt = Date.now();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status'; status.textContent = '';
    if (!validate()) return;
    // Spam traps: hidden checkbox ticked, or submitted within 3 seconds of page load
    if (form.elements.botcheck.checked || Date.now() - startedAt < 3000) {
      status.className = 'form-status ok'; status.textContent = 'Thank you! We will be in touch shortly.'; return;
    }
    var data = summary();
    var key = form.elements.access_key.value;

    // Not configured yet → open the visitor's email app with the enquiry pre-filled
    if (!key || key.indexOf('YOUR_') === 0) {
      var body = Object.keys(data).map(function (k) { return k.charAt(0).toUpperCase() + k.slice(1) + ': ' + data[k]; }).join('\n');
      location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Consultation request — ' + data.name) + '&body=' + encodeURIComponent(body);
      status.className = 'form-status ok'; status.textContent = 'Opening your email app to send the request…';
      return;
    }

    btn.classList.add('loading'); btn.disabled = true;
    var payload = Object.assign({
      access_key: key,
      subject: 'New Lead: ' + data.name + ' — ' + data.property,
      from_name: form.elements.from_name.value,
      replyto: data.email,
      botcheck: false
    }, data);

    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success) {
          form.reset(); startedAt = Date.now();
          status.className = 'form-status ok';
          status.textContent = 'Thank you, ' + data.name + '! A specialist will call you within one working day.';
        } else {
          status.className = 'form-status fail';
          status.textContent = res.message || 'Something went wrong. Please try again or message us on WhatsApp.';
        }
      })
      .catch(function () {
        status.className = 'form-status fail';
        status.textContent = 'Network error. Please try again or message us on WhatsApp.';
      })
      .then(function () { btn.classList.remove('loading'); btn.disabled = false; });
  });

  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
})();
