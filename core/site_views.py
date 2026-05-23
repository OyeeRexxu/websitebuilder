"""
Shared view factory for each per-site app.

Every site exposes 4 views — home / services / projects / contact — that all
hit the same data layer. The only thing that varies is which template each
view renders. So we centralise the logic here and let each app's urls.py
choose its own template paths.
"""
from django.contrib import messages
from django.shortcuts import redirect, render

from . import seo
from .forms import InquiryForm
from .models import Project, Service, Testimonial


def _site_key(request):
    return getattr(request, "site_key", "landing")


def home(request, *, template, site_title, site_tagline):
    services = Service.objects.all()
    projects = Project.objects.filter(featured=True)[:4]
    testimonials = Testimonial.objects.all()[:3]
    meta = seo.page_meta(
        title=f"{site_title} — {site_tagline}",
        description=(
            "Studio Refraction is a digital marketing agency for content, production, "
            "influencer marketing and integrated campaigns. " + site_tagline
        ),
        path="/",
        request=request,
    )
    schemas = [
        seo.organization_schema(request),
        seo.website_schema(request),
        seo.breadcrumb_schema(request, [("Home", "/")]),
    ]
    return render(request, template, {
        "meta": meta,
        "schemas": [seo.jsonld(s) for s in schemas],
        "services": services,
        "projects": projects,
        "testimonials": testimonials,
        "site_title": site_title,
        "site_tagline": site_tagline,
    })


def services(request, *, template, site_title):
    services_qs = Service.objects.all()
    meta = seo.page_meta(
        title=f"Services — {site_title} | Studio Refraction",
        description=(
            "Social-first content, AI-led production, influencer management, "
            "shoots, and end-to-end campaigns. Five capabilities, one accountable team."
        ),
        path="/services/",
        request=request,
    )
    schemas = [
        seo.organization_schema(request),
        seo.breadcrumb_schema(request, [("Home", "/"), ("Services", "/services/")]),
    ]
    schemas += [seo.service_schema(request, s) for s in services_qs]
    return render(request, template, {
        "meta": meta,
        "schemas": [seo.jsonld(s) for s in schemas],
        "services": services_qs,
        "site_title": site_title,
    })


def projects(request, *, template, site_title):
    projects_qs = Project.objects.all()
    meta = seo.page_meta(
        title=f"Selected work — {site_title} | Studio Refraction",
        description=(
            "Selected projects across beauty, tech, beverage, apparel, furniture and "
            "mobility — launches, always-on social, films, and integrated campaigns."
        ),
        path="/projects/",
        request=request,
    )
    schemas = [
        seo.organization_schema(request),
        seo.breadcrumb_schema(request, [("Home", "/"), ("Projects", "/projects/")]),
        seo.project_item_list_schema(request, projects_qs),
    ]
    return render(request, template, {
        "meta": meta,
        "schemas": [seo.jsonld(s) for s in schemas],
        "projects": projects_qs,
        "site_title": site_title,
    })


def contact(request, *, template, site_title, success_template=None):
    if request.method == "POST":
        form = InquiryForm(request.POST)
        if form.is_valid():
            inquiry = form.save(commit=False)
            inquiry.source_site = _site_key(request)
            inquiry.save()
            messages.success(request, "Thanks — we'll be in touch within one working day.")
            return redirect(request.path)
    else:
        form = InquiryForm()

    meta = seo.page_meta(
        title=f"Contact — {site_title} | Studio Refraction",
        description=(
            "Tell us about your brand, your timeline, and your ambition. "
            "We reply within one working day."
        ),
        path="/contact/",
        request=request,
    )
    schemas = [
        seo.organization_schema(request),
        seo.breadcrumb_schema(request, [("Home", "/"), ("Contact", "/contact/")]),
        seo.contact_schema(request),
    ]
    return render(request, template, {
        "meta": meta,
        "schemas": [seo.jsonld(s) for s in schemas],
        "form": form,
        "site_title": site_title,
    })
