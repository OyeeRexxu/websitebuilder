"""
SEO helpers — JSON-LD builders and per-page metadata defaults.
Each site view imports these and feeds them per-page values.
"""
import json
from django.conf import settings
from django.utils.safestring import mark_safe

ORG_NAME = "Studio Refraction"
ORG_DESCRIPTION = (
    "Full-service digital marketing agency for content creation, production, "
    "influencer management, and end-to-end brand campaigns."
)
ORG_LOGO_PATH = "/static/shared/logo.svg"
ORG_SAMEAS = [
    "https://www.instagram.com/studio.refraction/",
    "https://www.linkedin.com/company/studio-refraction/",
    "https://www.youtube.com/@studio.refraction",
]


def absolute_url(request, path: str) -> str:
    """Return a canonical absolute URL for the given path, using the current host."""
    if path.startswith("http://") or path.startswith("https://"):
        return path
    scheme = "https" if request.is_secure() else settings.CANONICAL_SCHEME
    host = request.get_host()
    return f"{scheme}://{host}{path}"


def jsonld(data) -> str:
    return mark_safe(
        f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>'
    )


def organization_schema(request):
    return {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "@id": absolute_url(request, "/#organization"),
        "name": ORG_NAME,
        "description": ORG_DESCRIPTION,
        "url": absolute_url(request, "/"),
        "logo": absolute_url(request, ORG_LOGO_PATH),
        "image": absolute_url(request, ORG_LOGO_PATH),
        "sameAs": ORG_SAMEAS,
        "serviceType": [
            "Social media content",
            "AI-led content production",
            "Influencer management",
            "Photo and video production",
            "End-to-end campaign execution",
        ],
        "areaServed": {"@type": "Country", "name": "Global"},
    }


def website_schema(request):
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": absolute_url(request, "/"),
        "name": ORG_NAME,
        "publisher": {"@id": absolute_url(request, "/#organization")},
    }


def breadcrumb_schema(request, trail):
    """trail: list of (name, path) tuples in order."""
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": i + 1,
                "name": name,
                "item": absolute_url(request, path),
            }
            for i, (name, path) in enumerate(trail)
        ],
    }


def service_schema(request, service):
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": service.title,
        "description": service.summary,
        "provider": {"@id": absolute_url(request, "/#organization")},
        "serviceType": service.title,
        "url": absolute_url(request, f"/services/#{service.slug}"),
    }


def project_item_list_schema(request, projects):
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": i + 1,
                "item": {
                    "@type": "CreativeWork",
                    "name": p.title,
                    "creator": {"@id": absolute_url(request, "/#organization")},
                    "about": p.category,
                    "dateCreated": str(p.year),
                    "description": p.summary,
                },
            }
            for i, p in enumerate(projects)
        ],
    }


def contact_schema(request):
    return {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "url": absolute_url(request, "/contact/"),
        "about": {"@id": absolute_url(request, "/#organization")},
    }


def page_meta(*, title, description, path, request, image=None):
    """Build a dict that templates use to populate <head> meta tags."""
    canonical = absolute_url(request, path)
    return {
        "title": title,
        "description": description,
        "canonical": canonical,
        "og_image": absolute_url(request, image) if image else absolute_url(request, ORG_LOGO_PATH),
    }
