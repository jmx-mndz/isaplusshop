/* =========================================================
   FAQ page — category tabs, live search with highlights,
   single-open accordion
   ========================================================= */
(function () {
  "use strict";
  const items = [...document.querySelectorAll(".faq-item")];
  const tabs = [...document.querySelectorAll(".faq-tab")];
  const search = document.getElementById("faqSearch");
  const empty = document.getElementById("faqEmpty");
  if (!items.length) return;

  // Keep original text so highlights can be reset
  items.forEach((it) => {
    it._q = it.querySelector("summary span");
    it._qText = it._q.textContent;
    it._body = it.querySelector(".faq-body").textContent.toLowerCase();
  });

  let cat = "all";
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function filter() {
    const q = (search ? search.value : "").trim().toLowerCase();
    let shown = 0;
    items.forEach((it) => {
      const matchCat = cat === "all" || it.dataset.cat === cat;
      const matchQ = !q || it._qText.toLowerCase().includes(q) || it._body.includes(q);
      const show = matchCat && matchQ;
      it.classList.toggle("hide", !show);
      it.classList.add("is-in");
      if (show) shown++;
      it._q.innerHTML = q && show
        ? escapeHtml(it._qText).replace(new RegExp("(" + escapeRe(escapeHtml(q)) + ")", "ig"), "<mark>$1</mark>")
        : escapeHtml(it._qText);
    });
    if (empty) empty.hidden = shown > 0;
  }

  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((x) => { x.classList.toggle("active", x === t); x.setAttribute("aria-selected", x === t); });
    cat = t.dataset.cat; filter();
  }));
  if (search) {
    search.addEventListener("input", filter);
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== search && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); search.focus(); }
    });
  }

  // Only one open at a time + entry animation
  items.forEach((it) => it.addEventListener("toggle", () => {
    if (!it.open) return;
    it.classList.add("anim");
    items.forEach((o) => { if (o !== it) o.open = false; });
  }));
})();
