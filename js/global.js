/* =========================================================
   IsaPlus E-Commerce — Global interactions
   Loader, page transitions, luxury cursor, nav, reveals,
   3D tilt, magnetic buttons, counters, mini 3D scenes.
   ========================================================= */
(function () {
  "use strict";

  const doc = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const lerp = (a, b, n) => a + (b - a) * n;

  // Safe sessionStorage access (private mode can throw)
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------------------------------------------------------
     1. 3D LOADER (first visit in a session) / curtain (after)
     --------------------------------------------------------- */
  const loader = document.querySelector(".loader");
  const curtain = document.querySelector(".curtain");
  const firstVisit = !store.get("isaplus-intro");

  function revealPage() {
    body.classList.remove("is-loading");
    document.dispatchEvent(new CustomEvent("isaplus:ready"));
  }

  if (loader && firstVisit && !reduceMotion) {
    body.classList.add("is-loading");
    const bar = loader.querySelector(".loader-bar i");
    const pct = loader.querySelector("[data-loader-pct]");
    const status = loader.querySelector("[data-loader-status]");
    const steps = ["Packing assets", "Mapping marketplace", "Calibrating growth", "Ready"];
    let progress = 0;
    let pageLoaded = document.readyState === "complete";
    window.addEventListener("load", () => (pageLoaded = true));
    const minTime = 2400;
    const start = performance.now();

    (function tick() {
      const elapsed = performance.now() - start;
      const target = pageLoaded ? 100 : Math.min(92, (elapsed / minTime) * 100);
      progress = lerp(progress, Math.min(target, (elapsed / minTime) * 100), 0.12);
      if (elapsed > minTime && pageLoaded) progress = Math.max(progress, 99.6);
      const p = Math.min(100, Math.round(progress));
      if (bar) bar.style.width = p + "%";
      if (pct) pct.textContent = String(p).padStart(3, "0");
      if (status) status.textContent = steps[Math.min(steps.length - 1, Math.floor(p / 26))];
      if (p >= 100) {
        store.set("isaplus-intro", "1");
        setTimeout(() => {
          loader.classList.add("done");
          revealPage();
          setTimeout(() => loader.classList.add("gone"), 1300);
        }, 250);
        return;
      }
      requestAnimationFrame(tick);
    })();
  } else {
    if (loader) loader.classList.add("gone");
    if (curtain && !firstVisit && !reduceMotion) {
      curtain.classList.add("leave");
      setTimeout(() => curtain.classList.remove("leave"), 1100);
    }
    store.set("isaplus-intro", "1");
    requestAnimationFrame(revealPage);
  }

  // Smooth page-to-page transition for internal links
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || !curtain || reduceMotion) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") ||
        a.target === "_blank" || a.hasAttribute("download") || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin && location.protocol !== "file:") return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    body.classList.remove("menu-open");
    curtain.classList.remove("leave");
    curtain.classList.add("enter");
    setTimeout(() => (location.href = a.href), 650);
  });
  // Back/forward cache: remove curtain if page restored
  window.addEventListener("pageshow", (e) => { if (e.persisted && curtain) curtain.classList.remove("enter"); });

  /* ---------------------------------------------------------
     2. LUXURY CURSOR
     --------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    ring.innerHTML = "<span></span>";
    body.append(dot, ring);
    const label = ring.querySelector("span");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      doc.classList.add("has-cursor");
    }, { passive: true });
    document.addEventListener("mouseleave", () => doc.classList.remove("has-cursor"));
    window.addEventListener("mousedown", () => ring.classList.add("down"));
    window.addEventListener("mouseup", () => ring.classList.remove("down"));

    (function loop() {
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)` + (ring.classList.contains("down") ? " scale(.8)" : "");
      requestAnimationFrame(loop);
    })();

    document.addEventListener("mouseover", (e) => {
      const t = e.target;
      const labelled = t.closest("[data-cursor-label]");
      const interactive = t.closest("a, button, [data-cursor], label, summary, [data-tilt]");
      const field = t.closest("input:not([type=checkbox]):not([type=radio]):not([type=file]), textarea");
      ring.classList.remove("hover", "label", "text");
      if (labelled) { ring.classList.add("label"); label.textContent = labelled.dataset.cursorLabel; }
      else if (field) ring.classList.add("text");
      else if (interactive) ring.classList.add("hover");
    });
  }

  /* ---------------------------------------------------------
     3. NAVIGATION
     --------------------------------------------------------- */
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const progressBar = document.querySelector(".scroll-progress");
  const toTop = document.querySelector(".to-top");
  const toTopCircle = toTop && toTop.querySelector("circle");
  let lastY = 0;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    const ratio = max > 0 ? y / max : 0;
    if (nav) {
      nav.classList.toggle("scrolled", y > 30);
      nav.classList.toggle("hidden", y > 400 && y > lastY && !body.classList.contains("menu-open"));
    }
    if (progressBar) progressBar.style.transform = `scaleX(${ratio})`;
    if (toTop) {
      toTop.classList.toggle("show", y > 700);
      if (toTopCircle) toTopCircle.style.strokeDashoffset = 157 - 157 * ratio;
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && body.classList.contains("menu-open")) { body.classList.remove("menu-open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }
  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------------------------------------------------------
     4. TEXT SPLIT + SCROLL REVEALS
     --------------------------------------------------------- */
  // [data-split] headings: each line (separated by <br>) slides up from a mask
  document.querySelectorAll("[data-split]").forEach((el) => {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((p, i) => `<span class="split-line"><span style="--d:${(i * 0.09).toFixed(2)}s">${p.trim()}</span></span>`).join("");
    el.classList.add("reveal-split");
  });

  const revealEls = document.querySelectorAll(".reveal, .reveal-split");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    const startObserving = () => revealEls.forEach((el) => io.observe(el));
    if (body.classList.contains("is-loading")) document.addEventListener("isaplus:ready", () => setTimeout(startObserving, 300), { once: true });
    else startObserving();
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------------------------------------------------------
     5. 3D TILT, CARD SPOTLIGHT, MAGNETIC BUTTONS
     --------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const max = parseFloat(el.dataset.tilt) || 8;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--ry", (px * max).toFixed(2) + "deg");
        el.style.setProperty("--rx", (-py * max).toFixed(2) + "deg");
      });
      el.addEventListener("mouseleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
    });

    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.3;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  // Spotlight position for cards + buttons (cheap, works with mouse only)
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".card, .btn");
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100 + "%";
    const y = ((e.clientY - r.top) / r.height) * 100 + "%";
    if (card.classList.contains("btn")) { card.style.setProperty("--bx", x); card.style.setProperty("--by", y); }
    else { card.style.setProperty("--mx", x); card.style.setProperty("--my", y); }
  }, { passive: true });

  /* ---------------------------------------------------------
     6. COUNTERS  <span data-count="98" data-suffix="%">
     --------------------------------------------------------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target; co.unobserve(el);
        const end = parseFloat(el.dataset.count);
        const dec = (el.dataset.count.split(".")[1] || "").length;
        const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
        const dur = reduceMotion ? 1 : 1800; const t0 = performance.now();
        (function step(t) {
          const k = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - k, 4);
          el.textContent = pre + (end * eased).toFixed(dec) + suf;
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => co.observe(c));
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------------------------------------------------------
     7. MINI 3D SCENES for inner-page heroes
        <div class="page-hero-3d" data-scene="box|globe|rings|crystal">
     --------------------------------------------------------- */
  function miniScene(host) {
    if (typeof THREE === "undefined") return;
    const type = host.dataset.scene || "globe";
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    const cyan = new THREE.Color("#2fe6ff"), azure = new THREE.Color("#1d7dff"), gold = new THREE.Color("#e3c98f");
    const group = new THREE.Group(); scene.add(group);
    scene.add(new THREE.AmbientLight(0x6688ff, 0.6));
    const key = new THREE.PointLight(0x2fe6ff, 2.2, 30); key.position.set(4, 4, 6); scene.add(key);
    const rim = new THREE.PointLight(0xe3c98f, 1.4, 30); rim.position.set(-5, -3, 2); scene.add(rim);

    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0b3a8c, metalness: 0.3, roughness: 0.15, transparent: true, opacity: 0.55, clearcoat: 1, emissive: 0x06204d, emissiveIntensity: 0.6 });
    const wire = (geo, color, op) => new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color, transparent: true, opacity: op }));

    if (type === "box") {
      const g = new THREE.BoxGeometry(2.2, 2.2, 2.2);
      group.add(new THREE.Mesh(g, glassMat));
      group.add(wire(g, cyan, 0.9));
      const tape = new THREE.Mesh(new THREE.BoxGeometry(2.24, 2.24, 0.34), new THREE.MeshStandardMaterial({ color: gold, metalness: 0.8, roughness: 0.3 }));
      group.add(tape);
      const tape2 = tape.clone(); tape2.rotation.y = Math.PI / 2; group.add(tape2);
      group.rotation.set(0.5, 0.6, 0);
    } else if (type === "rings") {
      for (let i = 0; i < 4; i++) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(1.1 + i * 0.42, 0.018 + i * 0.004, 16, 160), new THREE.MeshStandardMaterial({ color: i % 2 ? gold : cyan, emissive: i % 2 ? gold : cyan, emissiveIntensity: 0.5, metalness: 0.9, roughness: 0.2 }));
        t.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        t.userData.spin = 0.15 + i * 0.07;
        group.add(t);
      }
      group.add(new THREE.Mesh(new THREE.SphereGeometry(0.7, 48, 48), glassMat));
    } else if (type === "crystal") {
      const g = new THREE.OctahedronGeometry(1.8, 0);
      group.add(new THREE.Mesh(g, glassMat));
      group.add(wire(g, gold, 0.9));
      const inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 0), new THREE.MeshStandardMaterial({ color: cyan, emissive: cyan, emissiveIntensity: 0.8 }));
      group.add(inner);
    } else {
      const g = new THREE.IcosahedronGeometry(1.9, 2);
      group.add(new THREE.Mesh(new THREE.SphereGeometry(1.86, 48, 48), glassMat));
      group.add(wire(g, cyan, 0.55));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.012, 8, 200), new THREE.MeshBasicMaterial({ color: gold }));
      ring.rotation.x = 1.2; group.add(ring);
    }

    // Floating particles
    const pc = isMobile ? 120 : 260;
    const pos = new Float32Array(pc * 3);
    for (let i = 0; i < pc; i++) { const r = 2.6 + Math.random() * 2.2, a = Math.random() * Math.PI * 2, b = (Math.random() - 0.5) * Math.PI; pos.set([r * Math.cos(a) * Math.cos(b), r * Math.sin(b), r * Math.sin(a) * Math.cos(b)], i * 3); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const points = new THREE.Points(pg, new THREE.PointsMaterial({ color: cyan, size: 0.03, transparent: true, opacity: 0.8 }));
    scene.add(points);

    let tx = 0, ty = 0, visible = true;
    window.addEventListener("pointermove", (e) => { tx = (e.clientX / innerWidth - 0.5); ty = (e.clientY / innerHeight - 0.5); }, { passive: true });
    new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(host);

    function resize() { const s = host.clientWidth; renderer.setSize(s, s, false); camera.aspect = 1; camera.updateProjectionMatrix(); }
    resize(); window.addEventListener("resize", resize);

    const clock = new THREE.Clock();
    (function animate() {
      requestAnimationFrame(animate);
      if (!visible) return;
      const t = clock.getElapsedTime();
      group.rotation.y += 0.004;
      group.rotation.x = lerp(group.rotation.x, 0.4 + ty * 0.6, 0.04);
      group.position.y = Math.sin(t * 0.8) * 0.12;
      group.children.forEach((c) => { if (c.userData.spin) c.rotation.z += c.userData.spin * 0.01; });
      points.rotation.y = t * 0.03 + tx * 0.3;
      renderer.render(scene, camera);
    })();
  }
  document.querySelectorAll("[data-scene]").forEach(miniScene);

  // Expose helpers for page scripts
  window.IsaPlus = { reduceMotion, finePointer, isMobile, lerp };
})();
