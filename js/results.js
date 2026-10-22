/* =========================================================
   Results page — YOUR RESULTS LIVE HERE
   ---------------------------------------------------------
   HOW TO ADD RESULTS
   1. Put your screenshots/images in the  images/results/  folder.
   2. Use the file names below (or change "image" to your own names).
   3. Edit the titles, categories and numbers below.
   Any image that doesn't exist yet shows an elegant placeholder.

   Preview tip: open the page locally (file:// or localhost) or add
   ?admin to the URL to see file names on each frame and drag-and-drop
   images onto frames for a quick preview (preview only, not saved).
   ========================================================= */

// Headline numbers shown in the hero. Leave value as "—" until you have it.
const RESULT_STATS = [
  { value: "—", label: "Brands served" },
  { value: "—", label: "Listings optimised" },
  { value: "—", label: "Hours automated / mo" },
  { value: "—", label: "Avg. ROAS lift" }
];

// The big before/after slider at the top.
const FEATURED = {
  title: "Featured case study",
  text: "Add a short story here: the brand, the problem, what we built, and the outcome. Drag the slider to compare before and after.",
  before: "images/results/featured-before.jpg",
  after: "images/results/featured-after.jpg",
  metrics: [
    { value: "—", label: "Conversion" },
    { value: "—", label: "ACoS" },
    { value: "—", label: "Hours saved" }
  ]
};

// Filter buttons. "id" must match the "category" used in RESULTS.
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "websites", label: "Websites" },
  { id: "automation", label: "AI Automation" },
  { id: "listings", label: "Listings" },
  { id: "ppc", label: "PPC & Ads" },
  { id: "reporting", label: "Reporting" }
];

// Gallery items. size: "wide" (double width) | "" (normal)
// Tip: on desktop the grid is 3 columns — keep each row adding up to 3 (wide = 2).
const RESULTS = [
  { image: "images/results/result-1.jpg", category: "reporting", size: "wide", title: "Profit dashboard", metric: "—", metricLabel: "Net margin", text: "Describe the result in one or two sentences." },
  { image: "images/results/result-2.jpg", category: "listings", size: "", title: "Listing makeover", metric: "—", metricLabel: "Conversion", text: "Describe the result in one or two sentences." },
  { image: "images/results/result-3.jpg", category: "ppc", size: "", title: "PPC restructure", metric: "—", metricLabel: "ACoS", text: "Describe the result in one or two sentences." },
  { image: "images/results/result-4.jpg", category: "websites", size: "", title: "Brand website", metric: "—", metricLabel: "Email sign-ups", text: "Describe the result in one or two sentences." },
  { image: "images/results/result-5.jpg", category: "automation", size: "", title: "AI support assistant", metric: "—", metricLabel: "Hours saved", text: "Describe the result in one or two sentences." },
  { image: "images/results/result-6.jpg", category: "listings", size: "", title: "A+ Content", metric: "—", metricLabel: "Sessions", text: "Describe the result in one or two sentences." },
  { image: "images/results/result-7.jpg", category: "automation", size: "wide", title: "Inventory alerts", metric: "—", metricLabel: "Stock-outs avoided", text: "Describe the result in one or two sentences." },
  { image: "images/results/result-8.jpg", category: "ppc", size: "", title: "Wasted-spend cleanup", metric: "—", metricLabel: "Spend saved", text: "Describe the result in one or two sentences." },
  { image: "images/results/result-9.jpg", category: "websites", size: "wide", title: "Product landing page", metric: "—", metricLabel: "Click-through", text: "Describe the result in one or two sentences." }
];

/* ======================= engine ======================= */
(function () {
  "use strict";
  const { finePointer, reduceMotion } = window.IsaPlus || {};
  const params = new URLSearchParams(location.search);
  const admin = params.has("admin") || location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const ICON = {
    image: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></svg>',
    eye: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>'
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const catLabel = (id) => (CATEGORIES.find((c) => c.id === id) || { label: id }).label;
  const preview = {}; // drag-dropped object URLs (session only)

  if (admin) { const bar = document.getElementById("adminBar"); if (bar) bar.hidden = false; }

  // Placeholder markup
  function placeholder(path, alt) {
    const file = path.split("/").pop();
    return `<div class="ph${alt ? " alt" : ""}" data-path="${esc(path)}">${ICON.image}<strong>${admin ? "Upload result" : "Coming soon"}</strong>${admin ? `<code>${esc(path)}</code>` : ""}</div>`;
  }
  // Load an image into a slot; fall back to placeholder if missing
  function fill(slot, path, alt, isAltPh) {
    const src = preview[path] || path;
    slot.innerHTML = placeholder(path, isAltPh);
    const img = new Image();
    img.alt = alt; img.loading = "lazy"; img.decoding = "async";
    img.onload = () => { slot.innerHTML = ""; slot.appendChild(img); slot.dataset.loaded = "1"; };
    img.onerror = () => { slot.dataset.loaded = ""; };
    img.src = src;
    if (admin) enableDrop(slot, path, alt, isAltPh);
  }
  function enableDrop(slot, path, alt, isAltPh) {
    if (slot._drop) return; slot._drop = true;
    const on = (e) => { e.preventDefault(); const ph = slot.querySelector(".ph"); if (ph) ph.classList.add("drag"); };
    const off = () => { const ph = slot.querySelector(".ph"); if (ph) ph.classList.remove("drag"); };
    slot.addEventListener("dragover", on); slot.addEventListener("dragleave", off);
    slot.addEventListener("drop", (e) => {
      e.preventDefault(); off();
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f || !f.type.startsWith("image/")) return;
      preview[path] = URL.createObjectURL(f);
      fill(slot, path, alt, isAltPh);
    });
  }

  /* ---------- Hero stats ---------- */
  const statsEl = document.getElementById("resStats");
  if (statsEl) statsEl.innerHTML = RESULT_STATS.map((s) => `<div><b>${esc(s.value)}</b><small>${esc(s.label)}</small></div>`).join("");

  /* ---------- Featured before/after ---------- */
  document.getElementById("featTitle").textContent = FEATURED.title;
  document.getElementById("featText").textContent = FEATURED.text;
  document.getElementById("featMetrics").innerHTML = FEATURED.metrics.map((m) => `<div><b>${esc(m.value)}</b><small>${esc(m.label)}</small></div>`).join("");
  fill(document.getElementById("beforeSlot"), FEATURED.before, "Before", true);
  fill(document.getElementById("afterSlot"), FEATURED.after, "After", false);

  const compare = document.getElementById("compare");
  const handle = document.getElementById("compareHandle");
  let dragging = false;
  const setPos = (pct) => { pct = Math.max(2, Math.min(98, pct)); compare.style.setProperty("--pos", pct + "%"); handle.setAttribute("aria-valuenow", Math.round(pct)); };
  const fromEvent = (e) => { const r = compare.getBoundingClientRect(); setPos(((e.clientX - r.left) / r.width) * 100); };
  compare.addEventListener("pointerdown", (e) => { dragging = true; compare.setPointerCapture(e.pointerId); fromEvent(e); });
  compare.addEventListener("pointermove", (e) => { if (dragging) fromEvent(e); });
  compare.addEventListener("pointerup", () => (dragging = false));
  compare.addEventListener("pointercancel", () => (dragging = false));
  handle.addEventListener("keydown", (e) => {
    const cur = parseFloat(handle.getAttribute("aria-valuenow"));
    if (e.key === "ArrowLeft") { setPos(cur - 5); e.preventDefault(); }
    if (e.key === "ArrowRight") { setPos(cur + 5); e.preventDefault(); }
  });
  // Gentle intro sweep so visitors know it's interactive
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      (function sweep(t) {
        if (dragging) return;
        const k = Math.min(1, (t - t0) / 2200);
        setPos(50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k));
        if (k < 1) requestAnimationFrame(sweep);
      })(t0);
    }, { threshold: 0.5 });
    io.observe(compare);
  }

  /* ---------- Filters + gallery ---------- */
  const grid = document.getElementById("resGrid");
  const filtersEl = document.getElementById("resFilters");
  const used = new Set(RESULTS.map((r) => r.category));
  filtersEl.innerHTML = CATEGORIES.filter((c) => c.id === "all" || used.has(c.id))
    .map((c, i) => `<button class="res-filter${i === 0 ? " active" : ""}" data-filter="${c.id}" role="tab" aria-selected="${i === 0}">${esc(c.label)}</button>`).join("");

  grid.innerHTML = RESULTS.map((r, i) => `
    <article class="res-card ${r.size || ""} reveal" style="--d:${((i % 3) * 0.08).toFixed(2)}s" data-cat="${esc(r.category)}" data-index="${i}" tabindex="0" data-cursor-label="View" aria-label="${esc(r.title)}">
      <div class="res-media" data-slot="${i}"></div>
      <span class="res-view">${ICON.eye}</span>
      <div class="res-overlay">
        <div><span class="res-cat">${esc(catLabel(r.category))}</span><h3>${esc(r.title)}</h3></div>
        <div class="res-metric"><b>${esc(r.metric)}</b><small>${esc(r.metricLabel)}</small></div>
      </div>
    </article>`).join("");

  const cards = [...grid.querySelectorAll(".res-card")];
  cards.forEach((c, i) => fill(c.querySelector(".res-media"), RESULTS[i].image, RESULTS[i].title, i % 2 === 1));

  // Reveal newly rendered cards
  if ("IntersectionObserver" in window && !reduceMotion) {
    const ro = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); ro.unobserve(en.target); } }), { threshold: 0.12 });
    cards.forEach((c) => ro.observe(c));
  } else cards.forEach((c) => c.classList.add("is-in"));

  // 3D tilt on cards
  if (finePointer && !reduceMotion) cards.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 8).toFixed(2) + "deg");
      el.style.setProperty("--rx", (-((e.clientY - r.top) / r.height - 0.5) * 8).toFixed(2) + "deg");
    });
    el.addEventListener("mouseleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
  });

  let activeFilter = "all";
  filtersEl.addEventListener("click", (e) => {
    const b = e.target.closest(".res-filter"); if (!b) return;
    activeFilter = b.dataset.filter;
    filtersEl.querySelectorAll(".res-filter").forEach((x) => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", x === b); });
    cards.forEach((c) => {
      const show = activeFilter === "all" || c.dataset.cat === activeFilter;
      if (show) { c.hidden = false; requestAnimationFrame(() => c.classList.remove("out")); }
      else { c.classList.add("out"); setTimeout(() => { if (c.classList.contains("out")) c.hidden = true; }, 400); }
    });
  });

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById("lightbox");
  const lbMedia = document.getElementById("lbMedia");
  let current = 0, lastFocus = null;
  const visibleIdx = () => cards.filter((c) => !c.hidden).map((c) => +c.dataset.index);

  function show(i) {
    current = i; const r = RESULTS[i];
    document.getElementById("lbCat").textContent = catLabel(r.category);
    document.getElementById("lbTitle").textContent = r.title;
    document.getElementById("lbText").textContent = r.text;
    document.getElementById("lbMetric").innerHTML = `<b>${esc(r.metric)}</b><small>${esc(r.metricLabel)}</small>`;
    fill(lbMedia, r.image, r.title, false);
  }
  function open(i) {
    // Don't open a lightbox for an empty frame in admin mode (keeps drag-drop usable)
    lastFocus = document.activeElement; show(i);
    lb.hidden = false; document.body.style.overflow = "hidden";
    requestAnimationFrame(() => lb.classList.add("open"));
    lb.querySelector(".lb-close").focus();
  }
  function close() {
    lb.classList.remove("open"); document.body.style.overflow = "";
    setTimeout(() => { lb.hidden = true; if (lastFocus) lastFocus.focus(); }, 350);
  }
  function step(d) { const v = visibleIdx(); const p = v.indexOf(current); show(v[(p + d + v.length) % v.length]); }

  grid.addEventListener("click", (e) => { const c = e.target.closest(".res-card"); if (c) open(+c.dataset.index); });
  grid.addEventListener("keydown", (e) => { const c = e.target.closest(".res-card"); if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(+c.dataset.index); } });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".prev").addEventListener("click", () => step(-1));
  lb.querySelector(".next").addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
  // Swipe on touch
  let sx = null;
  lb.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); sx = null; });
})();
