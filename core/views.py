from django.http import HttpResponse
from django.shortcuts import render

from .models import Project, Service, Testimonial
from . import seo


def landing(request):
    meta = seo.page_meta(
        title="Studio Refraction — Five takes on one agency",
        description=(
            "A digital marketing agency for content, production, influencer marketing "
            "and end-to-end campaigns — presented across five distinct design worlds."
        ),
        path="/",
        request=request,
    )
    schemas = [
        seo.organization_schema(request),
        seo.website_schema(request),
    ]
    return render(
        request,
        "landing.html",
        {
            "meta": meta,
            "schemas": [seo.jsonld(s) for s in schemas],
            "featured_projects": Project.objects.filter(featured=True)[:4],
        },
    )


def robots_txt(request):
    host = request.get_host()
    body = "\n".join([
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin/",
        f"Sitemap: http://{host}/sitemap.xml",
        "",
    ])
    return HttpResponse(body, content_type="text/plain")
