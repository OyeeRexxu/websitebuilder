"""
Root URLconf — all sites are served from path prefixes on a single domain.

  /              → landing page
  /pulse/        → Pulse site
  /atelier/      → Atelier site
  /orbit/        → Orbit site
  /signal/       → Signal site
  /quiet/        → Quiet site
  /admin/        → Django admin
  /sitemap.xml   → sitemap
  /robots.txt    → robots

Works on localhost:8000 and PythonAnywhere (no subdomains required).
"""
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

from core import views as core_views
from core.sitemaps import sitemaps_dict

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # Landing page
    path("", core_views.landing, name="landing"),

    # Per-site routes — path prefix acts as the site selector
    path("pulse/",   include("apps.site_pulse.urls")),
    path("atelier/", include("apps.site_atelier.urls")),
    path("orbit/",   include("apps.site_orbit.urls")),
    path("signal/",  include("apps.site_signal.urls")),
    path("quiet/",   include("apps.site_quiet.urls")),

    # Utilities
    path("robots.txt", core_views.robots_txt, name="robots"),
    path("sitemap.xml", sitemap, {"sitemaps": sitemaps_dict}, name="sitemap"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
