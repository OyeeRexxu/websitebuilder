from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Project


class StaticLandingSitemap(Sitemap):
    priority = 1.0
    changefreq = "monthly"

    def items(self):
        return ["landing"]

    def location(self, item):
        return reverse(item)


# Per-site sitemaps would be served from each site's host. For the root
# (localhost) sitemap we only expose the landing index.
sitemaps_dict = {
    "landing": StaticLandingSitemap,
}
