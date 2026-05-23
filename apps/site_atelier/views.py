from core import site_views

SITE_TITLE = "Atelier"
TAGLINE = "Considered storytelling for considered brands."


def home(request):
    return site_views.home(request, template="site_atelier/home.html",
                           site_title=SITE_TITLE, site_tagline=TAGLINE)


def services(request):
    return site_views.services(request, template="site_atelier/services.html",
                               site_title=SITE_TITLE)


def projects(request):
    return site_views.projects(request, template="site_atelier/projects.html",
                               site_title=SITE_TITLE)


def contact(request):
    return site_views.contact(request, template="site_atelier/contact.html",
                              site_title=SITE_TITLE)
