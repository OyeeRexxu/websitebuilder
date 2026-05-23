/* === SIGNAL v2 — Glitch Arcade Physics ===
   Signatures:
   • Matter.js physics — sticker service cards fall, bounce, are draggable
   • Scanbeam cursor — yellow horizontal beam tracks pointer Y
   • Glitch flash on titles (CSS clip-path + RGB shift)
   • Anime.js entrance staggers + idle glitch pulses
*/
(function () {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Live clock
  const clock = document.querySelector("[data-clock]");
  if (clock) {
    const tick = () => {
      const d = new Date();
      const t = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      clock.textContent = `${t} LOCAL`;
    };
    tick(); setInterval(tick, 1000);
  }

  // ---- Scanbeam cursor (horizontal yellow beam follows pointer Y)
  if (!reduced && matchMedia("(hover: hover)").matches) {
    const beam = document.querySelector(".scanbeam");
    if (beam) {
      let y = window.innerHeight / 2, ty = y;
      addEventListener("pointermove", e => { ty = e.clientY; });
      const tick = () => {
        y += (ty - y) * 0.16;
        beam.style.transform = `translateY(${y}px)`;
        requestAnimationFrame(tick);
      };
      tick();
    }
  }

  // ---- Reveal on scroll
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("is-in");
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "-5% 0px" });
  document.querySelectorAll("[data-reveal]").forEach(el => obs.observe(el));

  // ---- Headline glitch flash (chromatic offset clones via clip-path)
  function flashGlitch(el) {
    if (reduced) return;
    const text = (el.getAttribute("data-glitch") || el.textContent).trim();
    if (!text) return;
    el.style.position = "relative";
    el.style.display = el.style.display || "inline-block";

    const before = document.createElement("span");
    before.setAttribute("aria-hidden", "true");
    before.textContent = text;
    before.style.cssText = "position:absolute;inset:0;color:#FF00C8;mix-blend-mode:screen;clip-path:inset(0 0 0 0);pointer-events:none;";
    const after = before.cloneNode(true);
    after.style.color = "#00FFE0";
    el.appendChild(before); el.appendChild(after);

    let t = 0;
    const id = setInterval(() => {
      t++;
      if (Math.random() < 0.7) {
        const top = Math.random() * 80;
        const bottom = top + Math.random() * 20;
        before.style.transform = `translate(${(Math.random() - 0.5) * 8}px, 0)`;
        before.style.clipPath = `inset(${top}% 0 ${100 - bottom}% 0)`;
        after.style.transform = `translate(${(Math.random() - 0.5) * 8}px, 0)`;
        after.style.clipPath = `inset(${100 - bottom}% 0 ${top}% 0)`;
      } else {
        before.style.clipPath = "inset(0 0 100% 0)";
        after.style.clipPath = "inset(100% 0 0 0)";
      }
      if (t > 14) {
        clearInterval(id);
        before.remove(); after.remove();
      }
    }, 60);
  }

  // ---- Anime.js entrance + idle glitch
  if (window.anime && !reduced) {
    anime({
      targets: ".hero-headline span, .page-head h1 span",
      translateY: [40, 0],
      opacity: [0, 1],
      easing: "easeOutExpo",
      duration: 900,
      delay: anime.stagger(120, { start: 200 }),
    });
    anime({
      targets: ".drop, .quote-card, .service-deep, .drop-row",
      translateY: [30, 0],
      skewY: [-1.5, 0],
      opacity: [0, 1],
      easing: "easeOutBack",
      duration: 800,
      delay: anime.stagger(80, { start: 400 }),
    });
    // Idle headline glitch every few seconds
    setInterval(() => {
      const head = document.querySelector(".hero-headline .accent, .hero-headline .accent2, .page-head h1 .accent");
      if (head) flashGlitch(head);
    }, 6000);
  }

  // ---- MATTER.JS PHYSICS PLAYGROUND
  function initPhysics() {
    if (reduced || !window.Matter) return;
    const stage = document.getElementById("physics-stage");
    if (!stage) return;

    let dataAttr = stage.getAttribute("data-stickers") || '{"items":[]}';
    // Normalise whitespace newlines from Django template into valid JSON
    dataAttr = dataAttr.replace(/\s+/g, " ");
    let data;
    try { data = JSON.parse(dataAttr); } catch { data = { items: [] }; }
    const items = data.items || [];
    if (!items.length) return;

    const { Engine, Render, World, Bodies, Body, Mouse, MouseConstraint, Composite, Events } = Matter;
    const W = stage.clientWidth, H = stage.clientHeight;
    const engine = Engine.create();
    engine.gravity.y = 0.9;

    // walls (invisible)
    const wallOpts = { isStatic: true, render: { visible: false } };
    World.add(engine.world, [
      Bodies.rectangle(W / 2, H + 30, W + 100, 60, wallOpts),    // floor
      Bodies.rectangle(-30, H / 2, 60, H + 100, wallOpts),       // left
      Bodies.rectangle(W + 30, H / 2, 60, H + 100, wallOpts),    // right
      Bodies.rectangle(W / 2, -30, W + 100, 60, wallOpts),       // ceiling
    ]);

    // create one DOM card per service, paired with one Matter body
    const colors = ["", "cyan", "yellow", "blue", "orange"];
    const cards = items.map((it, i) => {
      const node = document.createElement("div");
      node.className = "physics-card " + colors[i % colors.length];
      node.innerHTML = `<span class="ph-num">№ ${it.num} / 05</span><span class="ph-title">${it.title}</span>`;
      stage.appendChild(node);
      // Measure after insertion
      const r = node.getBoundingClientRect();
      const ww = r.width, hh = r.height;
      const startX = (W / 2) + (Math.random() - 0.5) * (W * 0.7);
      const startY = -50 - i * 60;
      const body = Bodies.rectangle(startX, startY, ww, hh, {
        chamfer: { radius: 8 },
        restitution: 0.45,
        friction: 0.05,
        frictionAir: 0.012,
        angle: (Math.random() - 0.5) * 0.4,
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
      World.add(engine.world, body);
      return { body, node, ww, hh };
    });

    // Mouse drag — bind to canvas-free stage via DOM events
    const mouse = Mouse.create(stage);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse, constraint: { stiffness: 0.18, render: { visible: false } },
    });
    World.add(engine.world, mouseConstraint);

    // Update DOM transforms from Matter bodies every frame
    function sync() {
      cards.forEach(c => {
        const { x, y } = c.body.position;
        c.node.style.transform = `translate(${x - c.ww / 2}px, ${y - c.hh / 2}px) rotate(${c.body.angle}rad)`;
      });
      Engine.update(engine, 1000 / 60);
      requestAnimationFrame(sync);
    }
    sync();

    // Resize handler
    addEventListener("resize", () => {
      const nW = stage.clientWidth, nH = stage.clientHeight;
      Composite.allBodies(engine.world).forEach(b => {
        if (b.isStatic) Composite.remove(engine.world, b);
      });
      World.add(engine.world, [
        Bodies.rectangle(nW / 2, nH + 30, nW + 100, 60, wallOpts),
        Bodies.rectangle(-30, nH / 2, 60, nH + 100, wallOpts),
        Bodies.rectangle(nW + 30, nH / 2, 60, nH + 100, wallOpts),
        Bodies.rectangle(nW / 2, -30, nW + 100, 60, wallOpts),
      ]);
    });

    // Optional: a little "shake" when something idles too long → re-energize
    let idleT = 0;
    setInterval(() => {
      const moving = cards.some(c => Math.abs(c.body.velocity.x) > 0.5 || Math.abs(c.body.velocity.y) > 0.5);
      idleT = moving ? 0 : idleT + 1;
      if (idleT > 8) {
        idleT = 0;
        cards.forEach(c => Body.applyForce(c.body, c.body.position, { x: (Math.random() - 0.5) * 0.06, y: -0.05 - Math.random() * 0.05 }));
      }
    }, 1500);
  }

  // Wait for Matter.js to be available (defer'd <script>)
  function tryInitPhysics(attempts = 30) {
    if (window.Matter) { initPhysics(); return; }
    if (attempts <= 0) return;
    setTimeout(() => tryInitPhysics(attempts - 1), 100);
  }
  document.addEventListener("DOMContentLoaded", tryInitPhysics);

  // Safety net — reveal anything still hidden after 4s
  setTimeout(() => {
    document.querySelectorAll("[data-reveal]:not(.is-in)").forEach(el => el.classList.add("is-in"));
  }, 4000);
})();
