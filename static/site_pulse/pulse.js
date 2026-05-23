/* === PULSE v2 — Kinetic Type Warehouse ===
   Signature interactions:
   • Morphing cursor (yellow blob → cyan square on hover, scale on click)
   • Hero words: each letter EXPLODES outward on hover, then re-forms
   • Pinned horizontal scroll through massive typographic project spreads
   • Lenis smooth scroll synced to GSAP ScrollTrigger
   • Random rotation on sticker cards for visible chaos
*/
(function () {
  const ready = (fn) => {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Inject the cursor span (must exist before anything else)
  function ensureCursor() {
    if (document.querySelector(".cursor")) return;
    const el = document.createElement("div");
    el.className = "cursor";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = "<span></span>";
    document.body.appendChild(el);
  }

  // ---- Split each hero word into letters wrapped in spans
  function splitWords() {
    document.querySelectorAll(".hero-shout .word, .pin-shout, .services-shout, .footer-shout span").forEach(word => {
      if (word.dataset.split) return;
      word.dataset.split = "1";
      const text = word.textContent;
      word.innerHTML = "";
      [...text].forEach(ch => {
        if (ch === " ") { word.appendChild(document.createTextNode(" ")); return; }
        const s = document.createElement("span");
        s.className = "letter";
        s.style.display = "inline-block";
        s.textContent = ch;
        word.appendChild(s);
      });
    });
  }

  ready(() => {
    ensureCursor();
    splitWords();

    const hasGSAP = window.gsap && window.ScrollTrigger;
    if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

    // ---- Lenis smooth scroll synced to ScrollTrigger
    if (window.Lenis && !reduced) {
      const lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis.on("scroll", () => hasGSAP && ScrollTrigger.update());
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    // ---- Morphing cursor — only on hover-capable devices
    if (!reduced && matchMedia("(hover: hover)").matches) {
      const cursor = document.querySelector(".cursor");
      if (cursor) {
        let x = innerWidth / 2, y = innerHeight / 2;
        let tx = x, ty = y;
        addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; });
        addEventListener("pointerdown", () => cursor.classList.add("is-click"));
        addEventListener("pointerup", () => cursor.classList.remove("is-click"));
        const tick = () => {
          x += (tx - x) * 0.22;
          y += (ty - y) * 0.22;
          cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
          requestAnimationFrame(tick);
        };
        tick();
        // Auto-hover detection on links / buttons / interactive cards
        document.querySelectorAll("a, button, [data-magnetic], .sticker-card, .pin-card, .project-row, .quote-card").forEach(el => {
          el.addEventListener("pointerenter", () => cursor.classList.add("is-hover"));
          el.addEventListener("pointerleave", () => cursor.classList.remove("is-hover"));
        });
      }
    }

    // ---- Hero word EXPLODE on hover — each letter flies outward then reforms
    if (!reduced && hasGSAP) {
      document.querySelectorAll(".hero-shout .word").forEach(word => {
        const letters = word.querySelectorAll(".letter");
        if (!letters.length) return;
        word.addEventListener("pointerenter", () => {
          gsap.killTweensOf(letters);
          letters.forEach(letter => {
            const dx = gsap.utils.random(-140, 140);
            const dy = gsap.utils.random(-90, 90);
            const rot = gsap.utils.random(-90, 90);
            gsap.to(letter, {
              x: dx, y: dy, rotation: rot, duration: 0.45,
              ease: "power3.out", overwrite: true,
            });
          });
        });
        word.addEventListener("pointerleave", () => {
          gsap.to(letters, {
            x: 0, y: 0, rotation: 0,
            duration: 0.9, ease: "elastic.out(1, 0.55)",
            stagger: { each: 0.015, from: "random" }, overwrite: true,
          });
        });
        // Tap-once on touch
        word.addEventListener("click", () => {
          gsap.killTweensOf(letters);
          letters.forEach(letter => {
            gsap.to(letter, {
              x: gsap.utils.random(-160, 160),
              y: gsap.utils.random(-100, 100),
              rotation: gsap.utils.random(-120, 120),
              duration: 0.4, ease: "power3.out",
              onComplete: () => gsap.to(letter, { x: 0, y: 0, rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.55)" }),
            });
          });
        });
      });
    }

    if (!hasGSAP || reduced) {
      document.querySelectorAll("[data-fade], [data-reveal]").forEach(el => { el.style.opacity = 1; el.style.transform = "none"; });
      return;
    }

    // ---- Reveals on scroll
    document.querySelectorAll("[data-fade]").forEach(el => {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
    });
    document.querySelectorAll("[data-reveal]").forEach(el => {
      gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
    });

    // ---- Headline word stagger on services / footer shouts
    document.querySelectorAll(".services-shout, .pin-shout, .footer-shout").forEach(h => {
      const letters = h.querySelectorAll(".letter");
      if (!letters.length) return;
      gsap.from(letters, {
        yPercent: 110, opacity: 0,
        duration: 0.9, ease: "expo.out",
        stagger: { each: 0.025, from: "random" },
        scrollTrigger: { trigger: h, start: "top 85%" },
      });
    });

    // ---- Hero letters cascade in on load
    const heroLetters = document.querySelectorAll(".hero-shout .letter");
    if (heroLetters.length) {
      gsap.from(heroLetters, {
        yPercent: 110, opacity: 0,
        duration: 1.0, ease: "expo.out",
        stagger: { each: 0.018, from: "start" },
        delay: 0.15,
      });
    }

    // ---- Hero kicker + blurb fade-in
    gsap.from(".hero-kicker", { opacity: 0, y: -10, duration: 0.6, delay: 0.1, ease: "power2.out" });
    gsap.from(".hero-blurb, .hero-cta, .hero-stack .sticker", {
      opacity: 0, y: 24, duration: 0.8, delay: 0.4, ease: "power3.out", stagger: 0.08,
    });

    // ---- Featured projects — "STICKER STRIKE"
    //   Cards fly in from the four corners of the viewport as the section
    //   scrolls through. ScrollTrigger.scrub couples the entry 1:1 to scroll
    //   velocity — no pin, no scroll-jacking. By the time the section is
    //   centered, all four cards have landed on the wall.
    const track = document.getElementById("pin-track");
    const isMobile = matchMedia("(max-width: 720px)").matches;
    if (track && !isMobile) {
      const cards = track.querySelectorAll(".pin-card");

      // Each corner is a (x,y,rot) origin in pixels relative to the card's
      // final position. Massive throws so cards clearly come from off-page.
      const throws = [
        { x: -window.innerWidth * 0.7, y: -window.innerHeight * 0.6, rot: -55 },  // top-left
        { x:  window.innerWidth * 0.7, y: -window.innerHeight * 0.6, rot:  48 },  // top-right
        { x: -window.innerWidth * 0.7, y:  window.innerHeight * 0.5, rot:  35 },  // bottom-left
        { x:  window.innerWidth * 0.7, y:  window.innerHeight * 0.5, rot: -42 },  // bottom-right
      ];

      cards.forEach((card, i) => {
        const t = throws[i % 4];
        const baseRot = parseFloat(getComputedStyle(card).getPropertyValue("--rot")) || 0;

        // Stagger by tying each card to a slightly later slice of the scroll.
        // Card 1 finishes at 55% of section progress; card 4 finishes at 100%.
        const startScroll = 5 + i * 8;   // %
        const endScroll = 55 + i * 14;   // %

        gsap.fromTo(card,
          { x: t.x, y: t.y, rotation: t.rot, scale: 0.6, opacity: 0 },
          {
            x: 0, y: 0, rotation: baseRot, scale: 1, opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: track,
              start: `top ${100 - startScroll}%`,
              end: `top ${100 - endScroll}%`,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      // After each card has landed, give it a tiny settle wobble.
      // (Triggered by hitting its final scroll position, once.)
      cards.forEach((card, i) => {
        const baseRot = parseFloat(getComputedStyle(card).getPropertyValue("--rot")) || 0;
        ScrollTrigger.create({
          trigger: track,
          start: `top ${100 - (55 + i * 14)}%`,
          once: true,
          onEnter: () => {
            gsap.fromTo(card,
              { rotation: baseRot + (i % 2 === 0 ? -2 : 2) },
              { rotation: baseRot, duration: 0.6, ease: "elastic.out(1, 0.45)" }
            );
          },
        });
      });

      // Per-card 3D cursor tilt + image parallax (kept from before — looks great)
      if (!reduced && matchMedia("(hover: hover)").matches) {
        cards.forEach((card) => {
          const img = card.querySelector(".pin-card-image img");
          const baseRot = parseFloat(getComputedStyle(card).getPropertyValue("--rot")) || 0;
          card.addEventListener("pointermove", (e) => {
            const r = card.getBoundingClientRect();
            const dx = ((e.clientX - r.left) / r.width - 0.5);
            const dy = ((e.clientY - r.top) / r.height - 0.5);
            const rotY = dx * 10;
            const rotX = -dy * 8;
            card.style.transform = `perspective(1200px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotate(${baseRot}deg) translateZ(10px)`;
            if (img) img.style.transform = `translate3d(${-dx * 28}px, ${-dy * 22}px, 0) scale(1.08)`;
          });
          card.addEventListener("pointerleave", () => {
            card.style.transform = "";
            if (img) img.style.transform = "";
          });
        });
      }
    } else if (track && isMobile) {
      // Mobile: simple reveal stagger
      track.querySelectorAll(".pin-card").forEach((card) => {
        gsap.from(card, {
          opacity: 0, y: 60, duration: 0.9, ease: "expo.out",
          scrollTrigger: { trigger: card, start: "top 88%" },
        });
      });
    }

    // ---- Service row + project row enter
    document.querySelectorAll(".sticker-card").forEach(card => {
      gsap.from(card, { opacity: 0, y: 60, scale: 0.95, duration: 0.9, ease: "back.out(1.2)",
        scrollTrigger: { trigger: card, start: "top 85%" } });
    });
    document.querySelectorAll(".project-row, .service-block").forEach(card => {
      const cover = card.querySelector(".project-row-cover");
      if (cover) {
        gsap.from(cover, { scale: 0.9, opacity: 0, duration: 1.0, ease: "back.out(1.2)",
          scrollTrigger: { trigger: card, start: "top 80%" } });
      }
    });

    // ---- Marquee bands: keep CSS animation, but pause when off-screen for perf
    document.querySelectorAll(".marquee-row").forEach(row => {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => row.style.animationPlayState = e.isIntersecting ? "running" : "paused");
      });
      io.observe(row);
    });

    ScrollTrigger.refresh();
  });

  // Safety net — reveal anything still hidden after 4 seconds
  setTimeout(() => {
    document.querySelectorAll("[data-fade], [data-reveal]").forEach(el => {
      if (parseFloat(getComputedStyle(el).opacity) < 0.05) {
        el.style.opacity = "1";
        el.style.transform = "none";
      }
    });
  }, 4000);
})();
