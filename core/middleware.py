"""
Path-prefix → site key routing.

Maps the first URL segment to a site key so each site has its own
isolated namespace without requiring subdomains.

  /pulse/           → site_key = "pulse"
  /pulse/services/  → site_key = "pulse"
  /atelier/         → site_key = "atelier"
  etc.

Works on any host (localhost, PythonAnywhere, custom domain).
"""
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin


class PathPrefixRoutingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Strip leading slash and grab the first path segment
        path = request.path_info.lstrip("/")
        prefix = path.split("/")[0]  # e.g. "pulse", "atelier", ""

        if prefix in settings.PATH_PREFIX_SITES:
            request.site_key = prefix
        return None
