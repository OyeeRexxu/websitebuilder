from django.conf import settings


def site_context(request):
    """Inject the current site key + meta into every template."""
    site_key = getattr(request, "site_key", None)
    return {
        "site_key": site_key,
        "site_meta": settings.SITE_META.get(site_key, {}) if site_key else {},
        "all_sites": settings.SITE_META,
    }
