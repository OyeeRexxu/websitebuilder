from core import site_views

SITE_TITLE = "Orbit"
TAGLINE = "Immersive worlds for brands that move forward."


def home(request):
    return site_views.home(request, template="site_orbit/home.html",
                           site_title=SITE_TITLE, site_tagline=TAGLINE)


def services(request):
    return site_views.services(request, template="site_orbit/services.html",
                               site_title=SITE_TITLE)


def projects(request):
    return site_views.projects(request, template="site_orbit/projects.html",
                               site_title=SITE_TITLE)


def contact(request):
    return site_views.contact(request, template="site_orbit/contact.html",
                              site_title=SITE_TITLE)
