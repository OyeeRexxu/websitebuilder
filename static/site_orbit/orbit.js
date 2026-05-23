/* === ORBIT v2 — WebGL Dreamscape ===
   A full-screen Three.js raymarching shader as the persistent background.
   The shader renders a torus + sphere SDF with magenta/cyan/amber lighting,
   pointer-driven camera rotation, and scroll-driven mood (zoom + saturation).
   No premade meshes — this is procedural geometry sculpted in GLSL.
*/
import * as THREE from "three";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const fragmentShader = /* glsl */ `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;     // 0..1
uniform float uScroll;     // 0..1
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

// --- SDF primitives
float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

// smooth min
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

// --- Scene SDF
float map(vec3 p) {
  // rotate the whole scene
  p.xz *= rot(uTime * 0.18 + uPointer.x * 0.6);
  p.yz *= rot(uTime * 0.12 + uPointer.y * 0.4);
  float torus = sdTorus(p, vec2(1.6, 0.45));
  float sphere = sdSphere(p + vec3(sin(uTime * 0.6) * 0.6, cos(uTime * 0.7) * 0.5, 0.0), 0.55);
  float d = smin(torus, sphere, 0.55);
  // small companion bubbles
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec3 op = p + vec3(
      sin(uTime * 0.5 + fi * 1.7) * 2.2,
      cos(uTime * 0.4 + fi * 2.1) * 1.4,
      sin(uTime * 0.3 + fi * 0.9) * 1.8
    );
    d = smin(d, sdSphere(op, 0.2 + 0.08 * sin(uTime * 1.2 + fi)), 0.4);
  }
  return d;
}

// --- Normal
vec3 calcNormal(vec3 p) {
  const float e = 0.0015;
  return normalize(vec3(
    map(p + vec3(e, 0, 0)) - map(p - vec3(e, 0, 0)),
    map(p + vec3(0, e, 0)) - map(p - vec3(0, e, 0)),
    map(p + vec3(0, 0, e)) - map(p - vec3(0, 0, e))
  ));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

  // camera dolly: scroll pulls camera in/out
  float dolly = 4.5 + uScroll * 6.0;
  vec3 ro = vec3(0.0, 0.0, dolly);
  vec3 rd = normalize(vec3(uv, -1.4));

  // raymarch
  float t = 0.0;
  float minDist = 1e9;
  for (int i = 0; i < 80; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    minDist = min(minDist, d);
    if (d < 0.002 || t > 20.0) break;
    t += d * 0.85;
  }

  // background gradient
  vec3 bg = mix(vec3(0.04, 0.02, 0.09), vec3(0.10, 0.04, 0.20), uv.y * 0.5 + 0.5);
  // nebula bloom in background tied to scroll
  float bloom = exp(-length(uv - vec2(uPointer.x - 0.5, 0.0)) * 1.5);
  bg += uColorA * bloom * 0.35 * (1.0 - uScroll * 0.5);
  bg += uColorB * exp(-length(uv + vec2(0.3, 0.2)) * 2.0) * 0.18;

  vec3 col = bg;
  if (t < 20.0) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 lightDir1 = normalize(vec3(0.6, 0.6, 0.8));
    vec3 lightDir2 = normalize(vec3(-0.6, -0.2, 0.6));
    float diff1 = max(dot(n, lightDir1), 0.0);
    float diff2 = max(dot(n, lightDir2), 0.0);
    // fresnel-ish rim
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.2);

    vec3 base = mix(uColorA, uColorB, n.x * 0.5 + 0.5);
    base = mix(base, uColorC, rim);
    col = base * (0.25 + diff1 * 0.55) + uColorA * diff2 * 0.4 + rim * uColorB * 0.6;
    col = mix(bg, col, 0.92);
  }

  // glow from near-misses
  col += uColorA * 0.04 / (0.02 + minDist * minDist);

  // gamma + vignette
  col = pow(col, vec3(0.85));
  float vig = smoothstep(1.5, 0.5, length(uv));
  col *= 0.45 + 0.55 * vig;

  // subtle noise
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.015;

  gl_FragColor = vec4(col, 1.0);
}
`;

const vertexShader = /* glsl */ `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

function initShader() {
  const canvas = document.getElementById("orbit-canvas");
  if (!canvas || reduced) {
    if (canvas) canvas.style.background = "radial-gradient(ellipse at center, #1A0833, #0A0517)";
    return null;
  }
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uScroll: { value: 0 },
    uColorA: { value: new THREE.Color(0xff3cc8) },  // magenta
    uColorB: { value: new THREE.Color(0x00e5ff) },  // cyan
    uColorC: { value: new THREE.Color(0xffb627) },  // amber
  };

  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  let px = 0.5, py = 0.5, tx = 0.5, ty = 0.5;
  addEventListener("pointermove", (e) => {
    tx = e.clientX / window.innerWidth;
    ty = 1.0 - e.clientY / window.innerHeight;
  }, { passive: true });

  let scrollT = 0;
  const updateScroll = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollT = Math.min(1, Math.max(0, window.scrollY / max));
  };
  addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  }
  addEventListener("resize", onResize);

  const clock = new THREE.Clock();
  function tick() {
    px += (tx - px) * 0.04;
    py += (ty - py) * 0.04;
    uniforms.uPointer.value.set(px, py);
    uniforms.uScroll.value += (scrollT - uniforms.uScroll.value) * 0.04;
    uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
  return { renderer, scene, camera, uniforms };
}

// ---- Line-by-line hero reveal
function revealLines() {
  document.querySelectorAll(".hero h1, .page-head h1").forEach(h => {
    const lines = h.querySelectorAll(".line");
    lines.forEach((l, i) => setTimeout(() => l.classList.add("is-in"), 100 + i * 130));
  });
}

// ---- Count-up
function setupCountups() {
  const els = document.querySelectorAll("[data-count]");
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting || en.target.dataset.counted) return;
      en.target.dataset.counted = "1";
      const target = parseFloat(en.target.dataset.count);
      const duration = 1400;
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

// ---- Reveal on scroll
function setupReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) en.target.classList.add("is-in"); });
  }, { threshold: 0.1, rootMargin: "-5% 0px" });
  document.querySelectorAll("[data-reveal]").forEach(el => obs.observe(el));
}

// ---- Card hover glow
function setupGlow() {
  document.querySelectorAll(".cap-card").forEach(card => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
}

// ---- Tilt
function setupTilt() {
  if (reduced || !matchMedia("(hover: hover)").matches) return;
  document.querySelectorAll("[data-tilt]").forEach(el => {
    const max = 6;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.transform = `perspective(900px) rotateY(${dx * max}deg) rotateX(${-dy * max}deg) translateZ(0)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
}

// ---- Clock
function setupClock() {
  const el = document.querySelector("[data-clock]");
  if (!el) return;
  const tick = () => {
    const d = new Date();
    el.textContent = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };
  tick(); setInterval(tick, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  initShader();
  revealLines();
  setupCountups();
  setupReveal();
  setupGlow();
  setupTilt();
  setupClock();
});

// Safety net — reveal anything still hidden after 4s
setTimeout(() => {
  document.querySelectorAll("[data-reveal]:not(.is-in)").forEach(el => el.classList.add("is-in"));
  document.querySelectorAll(".hero h1 .line:not(.is-in), .page-head h1 .line:not(.is-in)").forEach(el => el.classList.add("is-in"));
}, 4000);
