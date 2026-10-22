/* =========================================================
   Services page — highlight the active service chip on scroll
   ========================================================= */
(function () {
  "use strict";
  const chips = [...document.querySelectorAll(".svc-jump a")];
  const rows = chips.map((c) => document.querySelector(c.getAttribute("href"))).filter(Boolean);
  if (!rows.length || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      chips.forEach((c) => {
        const on = c.getAttribute("href") === "#" + en.target.id;
        c.style.borderColor = on ? "var(--cyan)" : "";
        c.style.color = on ? "#fff" : "";
      });
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  rows.forEach((r) => io.observe(r));

  // Animate mock visuals when their row enters (adds .is-in to the mock wrapper)
  const mocks = document.querySelectorAll(".svc-mock");
  const mo = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); mo.unobserve(en.target); } });
  }, { threshold: 0.3 });
  mocks.forEach((m) => mo.observe(m));
})();
