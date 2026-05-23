"""
Root URLconf — used only when no subdomain is matched (i.e., bare localhost).
Subdomain-routed requests are dispatched by core.middleware.SubdomainRoutingMiddleware
to per-site URLconfs before they reach here.
"""
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from core import views as core_views
from core.sitemaps import sitemaps_dict

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", core_views.landing, name="landing"),
    path("robots.txt", core_views.robots_txt, name="robots"),
    path("sitemap.xml", sitemap, {"sitemaps": sitemaps_dict}, name="sitemap"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
