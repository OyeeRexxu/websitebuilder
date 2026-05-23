from django.conf import settings


def site_context(request):
    """Inject the current site key, meta, and URL prefix into every template."""
    site_key = getattr(request, "site_key", None)
    # site_prefix is the path prefix for this site, e.g. "/pulse/"
    # Use it in templates as: href="{{ site_prefix }}contact/"
    site_prefix = f"/{site_key}/" if site_key else "/"
    return {
        "site_key": site_key,
        "site_prefix": site_prefix,
        "site_meta": settings.SITE_META.get(site_key, {}) if site_key else {},
        "all_sites": settings.SITE_META,
    }
