"""
Subdomain → URLconf routing.

A request to `pulse.localhost:8000/services/` is rewritten to use
apps.site_pulse.urls so that each site has its own isolated URL namespace
without colliding on the path. The bare host (`localhost`) still goes
through the root URLconf for the landing index + admin + sitemap.
"""
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin


class SubdomainRoutingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        host = request.get_host().split(":")[0]
        parts = host.split(".")
        # On `pulse.localhost` parts == ["pulse", "localhost"] → sub = "pulse".
        # On `localhost` parts == ["localhost"] → no subdomain match.
        if len(parts) >= 2 and parts[-1] == "localhost":
            sub = parts[0]
            urlconf = settings.SUBDOMAIN_URLCONFS.get(sub)
            if urlconf:
                request.urlconf = urlconf
                request.site_key = sub
        return None
