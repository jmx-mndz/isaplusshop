/* =========================================================
   Packages page — live price estimator
   ========================================================= */
(function () {
  "use strict";
  const opts = [...document.querySelectorAll("#estOptions input")];
  const range = document.getElementById("products");
  const rangeWrap = document.getElementById("estProducts");
  const productsOut = document.getElementById("productsOut");
  const out = document.getElementById("estOut");
  const cta = document.getElementById("estCta");
  if (!opts.length || !out) return;

  const fmt = (n) => "$" + n.toLocaleString("en-US");
  let shown = { min: 0, max: 0 };

  function animateTo(min, max) {
    const from = { ...shown }, t0 = performance.now(), dur = 600;
    (function step(t) {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      const a = Math.round(from.min + (min - from.min) * e), b = Math.round(from.max + (max - from.max) * e);
      out.textContent = a === 0 && b === 0 ? "Select a service" : fmt(a) + " – " + fmt(b);
      if (k < 1) requestAnimationFrame(step); else shown = { min, max };
    })(t0);
  }

  function update() {
    const n = parseInt(range.value, 10);
    productsOut.textContent = n;
    range.style.setProperty("--p", ((n - 1) / 19) * 100 + "%");
    let min = 0, max = 0; const picked = [];
    opts.forEach((o) => {
      if (!o.checked) return;
      const mult = o.dataset.per === "product" ? n : 1;
      min += +o.dataset.min * mult; max += +o.dataset.max * mult;
      picked.push(o.parentElement.textContent.trim());
    });
    const listingOn = opts.some((o) => o.dataset.per && o.checked);
    rangeWrap.classList.toggle("off", !listingOn);
    animateTo(min, max);
    if (cta) cta.href = "audit.html?services=" + encodeURIComponent(picked.join(", "));
  }
  opts.forEach((o) => o.addEventListener("change", update));
  range.addEventListener("input", update);
  update();
})();
