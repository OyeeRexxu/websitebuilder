/* === QUIET v2 — Emerald Theatre motion ===
   Signatures:
   • Spotlight cursor — dimming overlay + warm projector beam follow the pointer
   • Magnetic CTAs, count-up stats, tilt covers
   • Barba.js + View Transitions API for page transitions
*/
(function () {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Reveal on enter
  function setupReveal(scope) {
    const root = scope || document;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); obs.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: "-5% 0px" });
    root.querySelectorAll("[data-reveal]").forEach(el => obs.observe(el));
  }

  // ---- Count-up stats
  function setupCountups(scope) {
    const root = scope || document;
    const els = root.querySelectorAll("[data-count]");
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting || en.target.dataset.counted) return;
        en.target.dataset.counted = "1";
        const target = parseFloat(en.target.dataset.count);
        const duration = 1300;
        const start = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);
        const step = (now) => {
          const p = Math.min(1, (now - start) / duration);
          en.target.textContent = Math.round(target * ease(p));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    els.forEach(el => obs.observe(el));
  }

  // ---- Magnetic CTAs (only buttons / nav; not cards)
  function setupMagnetic(scope) {
    if (reduced || !matchMedia("(hover: hover)").matches) return;
    const root = scope || document;
    root.querySelectorAll("[data-magnetic]").forEach(el => {
      const strength = el.classList.contains("qwork-card") ? 0.04 : 0.2;
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      };
      const onLeave = () => { el.style.transform = ""; };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
    });
  }

  // ---- Tilt
  function setupTilt(scope) {
    if (reduced || !matchMedia("(hover: hover)").matches) return;
    const root = scope || document;
    root.querySelectorAll("[data-tilt]").forEach(el => {
      const max = 4;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        el.style.transform = `perspective(1000px) rotateY(${dx * max}deg) rotateX(${-dy * max}deg)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  // ---- Spotlight cursor — dim overlay + warm projector beam
  function setupSpotlight() {
    if (reduced || !matchMedia("(hover: hover)").matches) return;
    const dim = document.querySelector(".spotlight");
    const warm = document.querySelector(".spotlight-warm");
    if (!dim || !warm) return;
    let x = innerWidth / 2, y = innerHeight / 2;
    let tx = x, ty = y;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      dim.style.setProperty("--mx", `${x}px`);
      dim.style.setProperty("--my", `${y}px`);
      warm.style.setProperty("--mx", `${x}px`);
      warm.style.setProperty("--my", `${y}px`);
      requestAnimationFrame(tick);
    };
    tick();
  }

  function initAll(scope) {
    setupReveal(scope);
    setupCountups(scope);
    setupMagnetic(scope);
    setupTilt(scope);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initAll(document);
    setupSpotlight();

    // ---- Barba page transitions
    if (window.barba) {
      const supportsViewTx = !reduced && typeof document.startViewTransition === "function";
      barba.init({
        transitions: [{
          name: "default",
          async leave(data) {
            if (supportsViewTx) return Promise.resolve();
            return new Promise((resolve) => {
              data.current.container.animate(
                [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-12px)" }],
                { duration: 350, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" }
              ).onfinish = resolve;
            });
          },
          async enter(data) {
            if (supportsViewTx) return;
            data.next.container.animate(
              [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }],
              { duration: 450, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" }
            );
          },
        }],
      });
      barba.hooks.afterEnter((data) => {
        initAll(data.next.container);
        window.scrollTo(0, 0);
      });
      if (supportsViewTx) {
        const original = barba.go;
        barba.go = function (...args) {
          document.startViewTransition(() => original.apply(barba, args));
        };
      }
    }
  });

  // Safety net — reveal anything still hidden after 4s
  setTimeout(() => {
    document.querySelectorAll("[data-reveal]:not(.is-in)").forEach(el => el.classList.add("is-in"));
  }, 4000);
})();
