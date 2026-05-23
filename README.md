# Studio Refraction — five sites, one Django project

A single Django project that hosts five visually and technically distinct marketing
sites for the same fictional digital marketing agency. Each site has the four
requested pages (Home / Services / Projects / Contact) but uses its own
animation stack, type system, color palette, layout grid, and overall feel.

## The five sites

| Subdomain | Concept | Animation stack |
|-----------|---------|------------------|
| `pulse.localhost` | Neo-Brutalist Kinetic — Archivo Black headlines, sticker UI, hard shadows, acidic accent | GSAP + ScrollTrigger + Lenis smooth scroll + custom split/glitch + magnetic cursor |
| `atelier.localhost` | Editorial / Swiss Magazine — Cormorant Garamond serif, asymmetric grid, parallax spreads, drop-caps | Motion One (`motion.dev`) + scroll-driven parallax + page-turn link transitions |
| `orbit.localhost` | 3D Immersive — dark mode, glassmorphism, gradient text, persistent WebGL background | Three.js (wireframe icosahedron + ring + particle field) + scroll-driven camera dolly + tilt cards + glow tracking |
| `signal.localhost` | Retro Y2K / Vaporwave Glitch — Major Mono + VT323, neon, CRT scanlines, chromatic offsets | Anime.js letter cascade + custom chromatic-aberration glitch + text scramble + marquee ticker |
| `quiet.localhost` | Minimalist Bento — Inter + Newsreader, generous whitespace, soft cards, single accent | Barba.js page transitions, View Transitions API enhancement, magnetic CTAs, count-up stats, tilt cards |

The landing page at `localhost` is an index that links to all five.

## Setup

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata core/fixtures/seed.json
python manage.py createsuperuser     # optional, to see inquiries
python manage.py runserver
```

Then visit:

- http://localhost:8000/ — landing index (links to all five sites)
- http://pulse.localhost:8000/
- http://atelier.localhost:8000/
- http://orbit.localhost:8000/
- http://signal.localhost:8000/
- http://quiet.localhost:8000/

On most Linux/macOS systems `*.localhost` already resolves to `127.0.0.1`. If
yours doesn't, add to `/etc/hosts`:

```
127.0.0.1 pulse.localhost atelier.localhost orbit.localhost signal.localhost quiet.localhost
```

Admin: http://localhost:8000/admin/ — manage services, projects, testimonials,
and view contact-form submissions (`Inquiry` rows tagged with the site key).

## Architecture

```
agency_showcase/         Django project (settings, root urls, wsgi/asgi)
core/                    Shared models, SEO infra, sitemap, middleware,
                         site_views factory, fixtures, admin
apps/
  site_pulse/            Subdomain-routed app — own templates + urls
  site_atelier/          ...
  site_orbit/
  site_signal/
  site_quiet/
templates/landing.html   Bare-host index page
static/
  shared/                logo, landing CSS
  site_pulse/            per-site CSS + JS
  site_atelier/
  site_orbit/
  site_signal/
  site_quiet/
```

**Routing.** `core.middleware.SubdomainRoutingMiddleware` inspects the
`Host` header on each request and swaps `request.urlconf` to the matching
per-site URLconf. Bare `localhost` falls through to the root URLconf
(landing + admin + sitemap).

**Shared data.** All five sites pull from the same `Service` / `Project` /
`Testimonial` records in `core`. Add a project once and it shows up in all
five — styled radically differently.

## SEO baseline (applied to every site)

- Server-rendered Django HTML — all content crawlable, no SPA hydration gap.
- Per-view `<title>`, meta description, canonical, Open Graph, Twitter card.
- JSON-LD: `ProfessionalService`, `WebSite`, `BreadcrumbList` on every page;
  `Service` schema on services pages; `ItemList` + `CreativeWork` on projects;
  `ContactPage` on contact.
- `robots.txt` (`/robots.txt`) and XML sitemap (`/sitemap.xml`).
- WhiteNoise compressed static (CWV-friendly), preconnect to Google Fonts.
- `prefers-reduced-motion` honored across all five sites.
- Semantic HTML5, descriptive link text, mobile-first responsive at all breakpoints.

## Notes on animation libraries

All libraries load from public CDNs at runtime (no build step required):

- **Pulse**: GSAP 3.12.5 + ScrollTrigger + Lenis 1.1
- **Atelier**: Motion One 11.11.17 (`motion.dev`) via `+esm`
- **Orbit**: Three.js 0.160 via import map
- **Signal**: Anime.js 3.2.2
- **Quiet**: Barba.js 2.10.3 + native View Transitions API

For production you'd typically self-host these for CWV / privacy reasons.
