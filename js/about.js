/* =========================================================
   About page — mouse-reactive emblem parallax
   ========================================================= */
(function () {
  "use strict";
  const { finePointer, reduceMotion } = window.IsaPlus || {};
  const visual = document.querySelector(".story-visual");
  if (!visual || !finePointer || reduceMotion) return;

  const tags = visual.querySelectorAll(".sv-tag");
  visual.addEventListener("pointermove", (e) => {
    const r = visual.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tags.forEach((t, i) => {
      const d = (i + 1) * 10;
      t.style.translate = `${x * d}px ${y * d}px`;
    });
  });
  visual.addEventListener("pointerleave", () => tags.forEach((t) => (t.style.translate = "")));
})();
