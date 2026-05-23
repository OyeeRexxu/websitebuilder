/* === ATELIER v2.1 — Pure vanilla motion ===
   No external module imports. All animations use Web Animations API +
   CSS transitions + IntersectionObserver. This file cannot fail because
   of a CDN issue.

   Signature: liquid SVG ink-blob cursor with goo filter. Three blobs trail
   the pointer with different lag values, blending into one liquid form.
*/
(function () {
  "use strict";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hover = matchMedia("(hover: hover)").matches;

  // ===== Liquid ink cursor =====
  function setupCursor() {
    if (reduced || !hover) return;
    const layer = document.querySelector(".ink-cursor");
    if (!layer) return;
    const svg = layer.querySelector("svg");
    const group = document.getElementById("ink-group");
    const c1 = document.getElementById("ink-1");
    const c2 = document.getElementById("ink-2");
    const c3 = document.getElementById("ink-3");
    if (!svg || !group || !c1 || !c2 || !c3) return;

    const setSize = () => {
      svg.setAttribute("viewBox", `0 0 ${innerWidth} ${innerHeight}`);
      c1.setAttribute("r", 24);
      c2.setAttribute("r", 14);
      c3.setAttribute("r", 8);
    };
    setSize();
    addEventListener("resize", setSize);

    let tx = innerWidth / 2, ty = innerHeight / 2;
    const blobs = [
      { el: c1, x: tx, y: ty, lag: 0.22 },
      { el: c2, x: tx, y: ty, lag: 0.14 },
      { el: c3, x: tx, y: ty, lag: 0.08 },
    ];
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });

    document.querySelectorAll("a, button, .folio-card, .feature, .capability, .press-quote, .dropcap, .qbtn, .invite-cta").forEach(el => {
      el.addEventListener("pointerenter", () => group.setAttribute("fill", "#B43A2E"));
      el.addEventListener("pointerleave", () => group.setAttribute("fill", "#1B3A2F"));
    });

    function tick() {
      blobs.forEach(b => {
        b.x += (tx - b.x) * b.lag;
        b.y += (ty - b.y) * b.lag;
        b.el.setAttribute("cx", b.x);
        b.el.setAttribute("cy", b.y);
      });
      requestAnimationFrame(tick);
    }
    tick();
  }

  // ===== Live clock =====
  function setupClock() {
    const clock = document.querySelector("[data-clock]");
    if (!clock) return;
    const tick = () => {
      const d = new Date();
      const opts = { weekday: "short", day: "numeric", month: "short" };
      const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      clock.textContent = `${d.toLocaleDateString("en-GB", opts).toUpperCase()} — ${time}`;
    };
    tick(); setInterval(tick, 30 * 1000);
  }

  // ===== Reveal on enter (IntersectionObserver + CSS class) =====
  function setupReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      // Old browser fallback — just reveal everything.
      els.forEach(el => el.classList.add("is-in"));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "-5% 0px" });
    els.forEach(el => obs.observe(el));
  }

  // ===== Folio cover hover scale (Web Animations API) =====
  function setupCoverHover() {
    if (reduced || !hover) return;
    document.querySelectorAll(".folio-cover, .feature-image, .qproject-cover").forEach(el => {
      el.addEventListener("mouseenter", () => {
        el.animate([{ transform: "scale(1)" }, { transform: "scale(1.02)" }],
          { duration: 600, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" });
      });
      el.addEventListener("mouseleave", () => {
        el.animate([{ transform: "scale(1.02)" }, { transform: "scale(1)" }],
          { duration: 600, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" });
      });
    });
  }

  // ===== Cover figure plate breathing + parallax =====
  function setupPlates() {
    if (reduced) return;
    document.querySelectorAll(".plate").forEach((p, i) => {
      p.animate([{ transform: "translateY(0)" }, { transform: "translateY(-10px)" }, { transform: "translateY(0)" }],
        { duration: (7 + i) * 1000, iterations: Infinity, easing: "ease-in-out" });
    });
    const figure = document.querySelector(".cover-figure");
    if (figure && hover) {
      const plates = figure.querySelectorAll(".plate");
      figure.addEventListener("mousemove", (e) => {
        const r = figure.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / r.width;
        const dy = (e.clientY - r.top - r.height / 2) / r.height;
        plates.forEach((p, i) => {
          const f = (i + 1) * 8;
          p.style.transform = `translate(${dx * f}px, ${dy * f}px) rotate(${(i - 1) * 3 + dx * 2}deg)`;
        });
      });
      figure.addEventListener("mouseleave", () => { plates.forEach(p => p.style.transform = ""); });
    }
  }

  function init() {
    setupClock();
    setupCursor();
    setupReveal();
    setupCoverHover();
    setupPlates();
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);

  // Final safety net: after 4 seconds, reveal anything still hidden
  setTimeout(() => {
    document.querySelectorAll("[data-reveal]:not(.is-in)").forEach(el => el.classList.add("is-in"));
  }, 4000);
})();
