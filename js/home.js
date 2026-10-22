/* =========================================================
   Home page — 3D globe hero, scroll-linked cube, timeline
   ========================================================= */
(function () {
  "use strict";
  const { reduceMotion, finePointer, lerp } = window.IsaPlus || { lerp: (a, b, n) => a + (b - a) * n };
  const small = () => window.innerWidth < 1100;

  /* ---------------------------------------------------------
     1. THREE.JS HERO — glowing commerce globe with orbiting
        packages and animated shipping routes
     --------------------------------------------------------- */
  const canvas = document.getElementById("hero-canvas");
  if (canvas && typeof THREE !== "undefined") {
    const lowPower = window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    camera.position.set(0, 0, 14);

    const CYAN = new THREE.Color("#2fe6ff");
    const AZURE = new THREE.Color("#1d7dff");
    const GOLD = new THREE.Color("#e3c98f");

    // Lights
    scene.add(new THREE.AmbientLight(0x4466aa, 0.55));
    const keyL = new THREE.PointLight(0x2fe6ff, 2.4, 60); keyL.position.set(-6, 6, 10); scene.add(keyL);
    const goldL = new THREE.PointLight(0xe3c98f, 1.6, 60); goldL.position.set(8, -4, 6); scene.add(goldL);
    const dirL = new THREE.DirectionalLight(0xffffff, 0.6); dirL.position.set(2, 4, 8); scene.add(dirL);

    const world = new THREE.Group(); scene.add(world);
    const globe = new THREE.Group(); world.add(globe);
    const R = 3;

    // Core glass sphere
    globe.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.985, 64, 64),
      new THREE.MeshPhysicalMaterial({ color: 0x07204f, emissive: 0x03112e, emissiveIntensity: 0.8, metalness: 0.35, roughness: 0.55, clearcoat: 0.5, clearcoatRoughness: 0.6, transparent: true, opacity: 0.94 })
    ));

    // Lat / long grid lines (echoes the logo's globe)
    const gridMat = new THREE.LineBasicMaterial({ color: 0x7ff2ff, transparent: true, opacity: 0.22 });
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = []; const phi = THREE.MathUtils.degToRad(lat);
      for (let i = 0; i <= 128; i++) { const t = (i / 128) * Math.PI * 2; pts.push(new THREE.Vector3(R * Math.cos(phi) * Math.cos(t), R * Math.sin(phi), R * Math.cos(phi) * Math.sin(t))); }
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }
    for (let lon = 0; lon < 180; lon += 30) {
      const pts = []; const th = THREE.MathUtils.degToRad(lon);
      for (let i = 0; i <= 128; i++) { const t = (i / 128) * Math.PI * 2; pts.push(new THREE.Vector3(R * Math.cos(t) * Math.cos(th), R * Math.sin(t), R * Math.cos(t) * Math.sin(th))); }
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }

    // Fibonacci dot surface
    const DOTS = lowPower ? 900 : 1800;
    const dotPos = new Float32Array(DOTS * 3);
    const dotCol = new Float32Array(DOTS * 3);
    const surface = [];
    for (let i = 0; i < DOTS; i++) {
      const y = 1 - (i / (DOTS - 1)) * 2; const rad = Math.sqrt(1 - y * y); const th = Math.PI * (3 - Math.sqrt(5)) * i;
      const v = new THREE.Vector3(Math.cos(th) * rad, y, Math.sin(th) * rad).multiplyScalar(R * 1.004);
      surface.push(v); dotPos.set([v.x, v.y, v.z], i * 3);
      const c = Math.random() > 0.92 ? GOLD : CYAN.clone().lerp(AZURE, Math.random() * 0.6);
      dotCol.set([c.r, c.g, c.b], i * 3);
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(dotPos, 3));
    dotGeo.setAttribute("color", new THREE.BufferAttribute(dotCol, 3));
    globe.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.9 })));

    // Fresnel atmosphere
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.18, 64, 64),
      new THREE.ShaderMaterial({
        uniforms: { c: { value: CYAN } },
        vertexShader: "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: "uniform vec3 c; varying vec3 vN; void main(){ float i = pow(0.66 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(c, 1.0) * i * 0.95; }",
        side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
      })
    );
    world.add(atmo);

    // Shipping-route arcs with travelling light heads
    const arcs = [];
    const arcMat = () => new THREE.LineBasicMaterial({ color: Math.random() > 0.5 ? 0x2fe6ff : 0xe3c98f, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
    const ARC_COUNT = lowPower ? 7 : 12;
    for (let i = 0; i < ARC_COUNT; i++) {
      const a = surface[(Math.random() * surface.length) | 0];
      let b = surface[(Math.random() * surface.length) | 0];
      if (a.distanceTo(b) < R * 0.8) b = surface[(Math.random() * surface.length) | 0];
      const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * (1.35 + a.distanceTo(b) * 0.12));
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const pts = curve.getPoints(80);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      geo.setDrawRange(0, 0);
      const line = new THREE.Line(geo, arcMat());
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), new THREE.MeshBasicMaterial({ color: line.material.color }));
      globe.add(line, head);
      arcs.push({ line, head, curve, t: -Math.random() * 1.5, speed: 0.25 + Math.random() * 0.25 });
    }

    // Gold orbit rings
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(R * 1.55, 0.012, 8, 240), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.7 }));
    ringA.rotation.set(1.25, 0.15, 0);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(R * 1.85, 0.008, 8, 240), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.35 }));
    ringB.rotation.set(1.05, -0.35, 0);
    world.add(ringA, ringB);

    // Orbiting packages (from the IsaPlus emblem)
    function makeBox(size) {
      const g = new THREE.Group();
      const card = new THREE.MeshStandardMaterial({ color: 0xa8763f, roughness: 0.7, metalness: 0.1, emissive: 0x4a2a0a, emissiveIntensity: 0.6 });
      const tape = new THREE.MeshStandardMaterial({ color: 0xf2d79a, metalness: 0.85, roughness: 0.25, emissive: 0x6b4d12, emissiveIntensity: 0.5 });
      g.add(new THREE.Mesh(new THREE.BoxGeometry(size, size * 0.85, size), card));
      g.add(new THREE.Mesh(new THREE.BoxGeometry(size * 1.01, size * 0.86, size * 0.16), tape));
      const t2 = new THREE.Mesh(new THREE.BoxGeometry(size * 0.16, size * 0.86, size * 1.01), tape); g.add(t2);
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size * 0.85, size)), new THREE.LineBasicMaterial({ color: 0xffe9b8, transparent: true, opacity: 0.5 })));
      return g;
    }
    const boxes = [];
    const orbitParent = new THREE.Group(); orbitParent.rotation.copy(ringA.rotation); world.add(orbitParent);
    const BOX_COUNT = 4;
    for (let i = 0; i < BOX_COUNT; i++) {
      const b = makeBox(0.42 + (i % 2) * 0.12);
      orbitParent.add(b);
      boxes.push({ mesh: b, angle: (i / BOX_COUNT) * Math.PI * 2, spin: 0.4 + Math.random() * 0.6 });
    }

    // Background starfield
    const STARS = lowPower ? 500 : 1100;
    const sPos = new Float32Array(STARS * 3);
    for (let i = 0; i < STARS; i++) sPos.set([(Math.random() - 0.5) * 70, (Math.random() - 0.5) * 40, -10 - Math.random() * 40], i * 3);
    const sGeo = new THREE.BufferGeometry(); sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    const stars = new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0x9fdcff, size: 0.06, transparent: true, opacity: 0.55 }));
    scene.add(stars);

    // Layout: globe right on desktop, centred/upper on smaller screens
    let baseX = 0, baseY = 0, baseScale = 1;
    function layout() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      if (w >= 1100) { baseX = 3.4; baseY = 0; baseScale = 1; }
      else { const a = w / h; baseX = 0; baseScale = Math.max(0.42, Math.min(0.8, a * 1.05)); baseY = 4.82 - 3.4 * baseScale - 0.5; }
    }
    layout();
    window.addEventListener("resize", layout);

    // Interaction
    let mx = 0, my = 0, sx = 0, sy = 0, scrollK = 0, visible = true, intro = 0;
    window.addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
    window.addEventListener("scroll", () => { scrollK = Math.min(1, window.scrollY / innerHeight); }, { passive: true });
    new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(canvas);
    document.addEventListener("isaplus:ready", () => (intro = 0.0001));
    if (!document.body.classList.contains("is-loading")) intro = 0.0001;

    const clock = new THREE.Clock();
    (function animate() {
      requestAnimationFrame(animate);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      if (intro > 0 && intro < 1) intro = Math.min(1, intro + dt * 0.55);
      const ease = 1 - Math.pow(1 - intro, 3);

      sx = lerp(sx, mx, 0.05); sy = lerp(sy, my, 0.05);
      const speed = reduceMotion ? 0 : 1;

      globe.rotation.y += 0.0025 * speed;
      world.rotation.x = 0.18 + sy * 0.35;
      world.rotation.y = sx * 0.5;
      world.position.set(baseX + sx * 0.4, baseY - scrollK * 2.2 + Math.sin(t * 0.6) * 0.08, -scrollK * 3);
      const s = baseScale * (0.6 + 0.4 * ease);
      world.scale.setScalar(s);

      ringA.rotation.z += 0.0015 * speed; ringB.rotation.z -= 0.001 * speed;
      boxes.forEach((b) => {
        b.angle += 0.004 * speed;
        const r = R * 1.55;
        b.mesh.position.set(Math.cos(b.angle) * r, Math.sin(b.angle) * r, Math.sin(b.angle * 2) * 0.15);
        b.mesh.rotation.x += 0.01 * b.spin * speed; b.mesh.rotation.y += 0.014 * b.spin * speed;
      });

      arcs.forEach((a) => {
        a.t += dt * a.speed * speed;
        if (a.t > 2.2) a.t = -Math.random() * 0.8;
        const grow = THREE.MathUtils.clamp(a.t, 0, 1);
        const fade = THREE.MathUtils.clamp(a.t - 1.2, 0, 1);
        const start = Math.floor(fade * 81), end = Math.floor(grow * 81);
        a.line.geometry.setDrawRange(start, Math.max(0, end - start));
        a.head.visible = a.t > 0 && a.t < 1;
        if (a.head.visible) a.head.position.copy(a.curve.getPoint(grow));
      });

      stars.rotation.y = t * 0.005 + sx * 0.05;
      camera.position.x = lerp(camera.position.x, sx * 0.6, 0.05);
      camera.position.y = lerp(camera.position.y, -sy * 0.4, 0.05);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    })();
  }

  /* ---------------------------------------------------------
     2. Floating hero cards parallax (mouse depth)
     --------------------------------------------------------- */
  const floats = document.querySelectorAll(".float-card[data-depth]");
  if (floats.length && finePointer && !reduceMotion) {
    window.addEventListener("pointermove", (e) => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      floats.forEach((f) => { const d = parseFloat(f.dataset.depth); f.style.transform = `translate3d(${-x * 40 * d}px, ${-y * 30 * d}px, 0) rotateX(${y * 8}deg) rotateY(${-x * 8}deg)`; });
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     3. Scroll-driven 3D package cube + process timeline
     --------------------------------------------------------- */
  const cube = document.getElementById("bigCube");
  const timeline = document.getElementById("timeline");
  const fill = timeline && timeline.querySelector(".timeline-line i");
  const steps = timeline ? [...timeline.querySelectorAll(".step")] : [];
  let cubeMouse = 0;
  if (cube && finePointer) {
    cube.parentElement.addEventListener("pointermove", (e) => {
      const r = cube.parentElement.getBoundingClientRect();
      cubeMouse = ((e.clientX - r.left) / r.width - 0.5) * 60;
    });
    cube.parentElement.addEventListener("pointerleave", () => (cubeMouse = 0));
  }

  function onScroll() {
    const vh = innerHeight;
    if (cube) {
      const r = cube.getBoundingClientRect();
      const p = 1 - (r.top + r.height / 2) / vh; // 0 → 1 as it travels the viewport
      cube.style.setProperty("--cy", (30 + p * 220 + cubeMouse).toFixed(1) + "deg");
    }
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height + vh * 0.2)));
      if (fill) fill.style.width = (p * 100).toFixed(1) + "%";
      steps.forEach((s, i) => s.classList.toggle("active", p >= i / steps.length + 0.02 || (small() && s.getBoundingClientRect().top < vh * 0.7)));
    }
  }
  let ticking = false;
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { onScroll(); ticking = false; }); } }, { passive: true });
  if (cube && finePointer) cube.parentElement.addEventListener("pointermove", () => requestAnimationFrame(onScroll));
  onScroll();
})();
