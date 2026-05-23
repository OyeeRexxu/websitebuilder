from core import site_views

SITE_TITLE = "Quiet"
TAGLINE = "Restraint is the loudest signal of confidence."


def home(request):
    return site_views.home(request, template="site_quiet/home.html",
                           site_title=SITE_TITLE, site_tagline=TAGLINE)


def services(request):
    return site_views.services(request, template="site_quiet/services.html",
                               site_title=SITE_TITLE)


def projects(request):
    return site_views.projects(request, template="site_quiet/projects.html",
                               site_title=SITE_TITLE)


def contact(request):
    return site_views.contact(request, template="site_quiet/contact.html",
                              site_title=SITE_TITLE)
