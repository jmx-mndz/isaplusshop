/* =========================================================
   Free Audit page — 3-step form
   ---------------------------------------------------------
   WHERE SUBMISSIONS GO
   Paste a webhook URL into FORM_ENDPOINT (e.g. a GoHighLevel
   inbound webhook, Make.com / Zapier webhook, Formspree…).
   The form POSTs JSON to it.
   If FORM_ENDPOINT is empty, the form opens the visitor's email
   app with everything pre-filled to the addresses below.
   ========================================================= */
const FORM_ENDPOINT = "";
const AUDIT_EMAILS = ["matthew@isaplus.shop", "jonathan@isaplus.shop"];

(function () {
  "use strict";
  const form = document.getElementById("auditForm");
  if (!form) return;
  const panels = [...form.querySelectorAll(".af-panel")];
  const dots = [...form.querySelectorAll(".af-steps span")];
  const bars = [...form.querySelectorAll(".af-steps i")];
  const label = document.getElementById("stepLabel");
  const prev = document.getElementById("prevBtn");
  const next = document.getElementById("nextBtn");
  const submit = document.getElementById("submitBtn");
  const err = document.getElementById("formError");
  const names = ["About you", "Your brand", "Your goals"];
  let step = 0;

  // Pre-fill from links like audit.html?package=growth or ?services=...
  const qs = new URLSearchParams(location.search);
  const pkg = qs.get("package");
  const pre = (qs.get("services") || "").toLowerCase();
  const pkgMap = { launch: ["Brand website"], growth: ["Brand website", "AI automation", "Reporting"], elite: ["Brand website", "AI automation", "Listing optimization", "PPC & ads", "Email & retention", "Reporting"] };
  form.querySelectorAll('input[name="services"]').forEach((c) => {
    const v = c.value.toLowerCase();
    if ((pkg && pkgMap[pkg] && pkgMap[pkg].includes(c.value)) || (pre && new RegExp("\\b" + v.split(" ")[0] + "\\b").test(pre))) c.checked = true;
  });
  if (pkg && pkgMap[pkg]) document.getElementById("message").value = `Interested in the ${pkg.charAt(0).toUpperCase() + pkg.slice(1)} package.`;

  function go(to) {
    const back = to < step;
    step = to;
    panels.forEach((p, i) => { p.classList.toggle("active", i === step); p.classList.toggle("back", back); });
    dots.forEach((d, i) => { d.classList.toggle("active", i === step); d.classList.toggle("done", i < step); });
    bars.forEach((b, i) => b.classList.toggle("done", i < step));
    label.textContent = `Step ${step + 1} of ${panels.length} · ${names[step]}`;
    prev.hidden = step === 0;
    next.hidden = step === panels.length - 1;
    submit.hidden = step !== panels.length - 1;
    err.hidden = true;
    const first = panels[step].querySelector("input, select, textarea");
    if (first && window.innerWidth > 1024) setTimeout(() => first.focus({ preventScroll: true }), 300);
  }

  function validate() {
    let ok = true, msg = "";
    panels[step].querySelectorAll("[required]").forEach((f) => {
      const wrap = f.closest(".field");
      let valid = f.value.trim() !== "";
      if (valid && f.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (wrap) wrap.classList.toggle("invalid", !valid);
      if (!valid && ok) { ok = false; msg = f.type === "email" && f.value ? "Please enter a valid email address." : "Please fill in the highlighted field."; f.focus(); }
    });
    if (!ok) { err.textContent = msg; err.hidden = false; }
    return ok;
  }
  form.addEventListener("input", (e) => { const w = e.target.closest(".field"); if (w) w.classList.remove("invalid"); });

  next.addEventListener("click", () => { if (validate()) go(step + 1); });
  prev.addEventListener("click", () => go(step - 1));
  // Enter key moves forward instead of submitting early
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && step < panels.length - 1) { e.preventDefault(); next.click(); }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const fd = new FormData(form);
    const data = {
      name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"),
      brand: fd.get("brand"), store: fd.get("store"), revenue: fd.get("revenue"),
      services: fd.getAll("services").join(", "), message: fd.get("message"),
      package: pkg || "", source: "IsaPlus website — Free Audit", submitted_at: new Date().toISOString()
    };

    submit.disabled = true;
    submit.firstChild.textContent = "Sending… ";

    if (FORM_ENDPOINT) {
      try {
        const res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(res.status);
        success(`Thank you, ${data.name.split(" ")[0]}! We'll review ${data.brand} and be in touch shortly with your audit.`);
      } catch (x) {
        submit.disabled = false; submit.firstChild.textContent = "Request my free audit ";
        err.textContent = "Something went wrong sending your request. Please try again or email " + AUDIT_EMAILS[0] + ".";
        err.hidden = false;
      }
    } else {
      const body = [
        `Name: ${data.name}`, `Email: ${data.email}`, `Phone: ${data.phone || "-"}`,
        `Brand: ${data.brand}`, `Amazon store / listing: ${data.store || "-"}`, `Monthly sales: ${data.revenue}`,
        `Interested in: ${data.services || "-"}`, "", `Biggest challenge:`, data.message || "-"
      ].join("\n");
      const href = `mailto:${AUDIT_EMAILS.join(",")}?subject=${encodeURIComponent("Free Audit Request — " + data.brand)}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
      success(`Thanks, ${data.name.split(" ")[0]}! Your email app should open with your request ready — just press send. Prefer to call? ${"(206) 209-6553"}.`);
    }
  });

  function success(text) {
    document.getElementById("successText").textContent = text;
    document.getElementById("formSuccess").hidden = false;
    form.classList.add("sent");
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  go(0);
})();
