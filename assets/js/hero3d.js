/* Edge Smart Space — Hero 3D "smart home node" (Three.js r128)
   Wireframe house inside an icosahedral shell, orbited by device nodes
   linked back to the hub. Reacts to mouse and scroll. */
(function () {
  'use strict';
  var canvas = document.getElementById('hero3d');
  if (!canvas || typeof THREE === 'undefined') return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CYAN = 0x00f2fe, BLUE = 0x4facfe;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  // 1.5x is visually identical for thin glowing lines but ~45% fewer pixels than 2x — keeps scrolling fluid
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth > 1600 ? 1.25 : 1.5));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0a, 0.045);
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  var root = new THREE.Group();
  scene.add(root);

  /* --- House (hub) --- */
  var house = new THREE.Group();
  var lineMat = new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.95 });
  var body = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.6, 1.1, 1.6)), lineMat);
  body.position.y = -0.25;
  var roofGeo = new THREE.ConeGeometry(1.35, 0.85, 4, 1, true);
  var roof = new THREE.LineSegments(new THREE.EdgesGeometry(roofGeo), lineMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 0.72;
  var door = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.34, 0.56)), lineMat);
  door.position.set(0, -0.52, 0.801);
  var win1 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.3, 0.3)), lineMat);
  win1.position.set(-0.48, -0.12, 0.801);
  var win2 = win1.clone(); win2.position.x = 0.48;
  house.add(body, roof, door, win1, win2);
  // inner glow core
  var core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), new THREE.MeshBasicMaterial({ color: CYAN }));
  core.position.y = -0.2;
  house.add(core);
  var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: CYAN, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.set(3.4, 3.4, 1); halo.position.y = -0.2;
  house.add(halo);
  root.add(house);

  /* --- Icosahedral shell --- */
  var shell = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.7, 1)),
    new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.18 })
  );
  root.add(shell);
  var shellPts = new THREE.Points(
    new THREE.IcosahedronGeometry(2.7, 1),
    new THREE.PointsMaterial({ color: CYAN, size: 0.06, transparent: true, opacity: 0.8 })
  );
  root.add(shellPts);

  /* --- Orbit rings --- */
  function ring(r, tiltX, tiltZ, op) {
    var g = new THREE.BufferGeometry().setFromPoints(new THREE.Path().absarc(0, 0, r, 0, Math.PI * 2).getSpacedPoints(128));
    var l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: op }));
    l.rotation.x = tiltX; l.rotation.z = tiltZ;
    root.add(l); return l;
  }
  var rings = [ring(3.4, 1.25, 0.2, 0.25), ring(3.9, 1.6, -0.5, 0.15), ring(3.1, 0.9, 0.9, 0.12)];

  /* --- Device nodes + data links --- */
  var nodes = [];
  var linkPositions = new Float32Array(6 * 6);
  var linkGeo = new THREE.BufferGeometry();
  linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPositions, 3));
  var links = new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.35 }));
  root.add(links);
  for (var i = 0; i < 6; i++) {
    var n = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({ color: i % 2 ? BLUE : CYAN }));
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: CYAN, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    s.scale.set(0.8, 0.8, 1); n.add(s);
    n.userData = { r: 3.1 + (i % 3) * 0.4, speed: 0.25 + i * 0.05, phase: (i / 6) * Math.PI * 2, tilt: (i % 3 - 1) * 0.6 };
    root.add(n); nodes.push(n);
  }

  /* --- Starfield --- */
  var starCount = window.innerWidth < 700 ? 350 : 800;
  var starPos = new Float32Array(starCount * 3);
  for (var k = 0; k < starCount; k++) {
    starPos[k * 3] = (Math.random() - 0.5) * 40;
    starPos[k * 3 + 1] = (Math.random() - 0.5) * 24;
    starPos[k * 3 + 2] = (Math.random() - 0.5) * 30 - 6;
  }
  var starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  var stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x9fdcff, size: 0.035, transparent: true, opacity: 0.6 }));
  scene.add(stars);

  function glowTexture() {
    if (glowTexture.tex) return glowTexture.tex;
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var g = c.getContext('2d'), grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.25, 'rgba(255,255,255,.45)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    glowTexture.tex = new THREE.CanvasTexture(c);
    return glowTexture.tex;
  }

  /* --- Layout / resize --- */
  var baseX = 0, baseScale = 1;
  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (w > 1024) { baseX = 3.0; baseScale = 1; }
    else if (w > 700) { baseX = 2.2; baseScale = 0.85; }
    else { baseX = 0; baseScale = 0.72; }
    canvas.style.opacity = w > 700 ? '1' : '.45';
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  /* --- Interaction --- */
  var mouse = { x: 0, y: 0 }, target = { x: 0, y: 0 }, scrollP = 0;
  window.addEventListener('pointermove', function (e) {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  window.addEventListener('scroll', function () {
    scrollP = Math.min(window.scrollY / window.innerHeight, 1.5);
  }, { passive: true });

  var visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(canvas);
  }

  var clock = new THREE.Clock(), running = false;
  function loop() {
    if (running) return; running = true;
    requestAnimationFrame(frame);
  }
  function frame() {
    if (!visible) { running = false; return; }
    var t = clock.getElapsedTime();
    mouse.x += (target.x - mouse.x) * 0.05;
    mouse.y += (target.y - mouse.y) * 0.05;

    var spin = reduce ? 0 : t;
    root.position.x = baseX - scrollP * 1.2;
    root.position.y = scrollP * 1.4;
    root.scale.setScalar(baseScale * (1 + scrollP * 0.35));
    root.rotation.y = spin * 0.15 + mouse.x * 0.5 + scrollP * 1.6;
    root.rotation.x = mouse.y * 0.3 + scrollP * 0.4;

    house.rotation.y = -spin * 0.35;
    shell.rotation.y = spin * 0.08; shell.rotation.z = spin * 0.04;
    shellPts.rotation.copy(shell.rotation);
    rings.forEach(function (r, i) { r.rotation.z += reduce ? 0 : 0.002 * (i + 1); });

    var pulse = 0.5 + Math.sin(t * 2.2) * 0.15;
    halo.material.opacity = pulse;
    core.scale.setScalar(1 + Math.sin(t * 2.2) * 0.12);

    nodes.forEach(function (n, i) {
      var d = n.userData, a = d.phase + spin * d.speed;
      n.position.set(Math.cos(a) * d.r, Math.sin(a * 1.3) * 0.8 + d.tilt, Math.sin(a) * d.r);
      n.rotation.x += 0.02; n.rotation.y += 0.03;
      linkPositions[i * 6] = 0; linkPositions[i * 6 + 1] = -0.2; linkPositions[i * 6 + 2] = 0;
      linkPositions[i * 6 + 3] = n.position.x; linkPositions[i * 6 + 4] = n.position.y; linkPositions[i * 6 + 5] = n.position.z;
    });
    linkGeo.attributes.position.needsUpdate = true;
    links.material.opacity = 0.2 + Math.abs(Math.sin(t * 1.5)) * 0.3;

    stars.rotation.y = spin * 0.01 + mouse.x * 0.05;
    stars.position.y = scrollP * 2;

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  loop();
})();
