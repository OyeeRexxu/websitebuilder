from core import site_views

SITE_TITLE = "Pulse"
TAGLINE = "Loud creative for brands that refuse to whisper."


def home(request):
    return site_views.home(request, template="site_pulse/home.html",
                           site_title=SITE_TITLE, site_tagline=TAGLINE)


def services(request):
    return site_views.services(request, template="site_pulse/services.html",
                               site_title=SITE_TITLE)


def projects(request):
    return site_views.projects(request, template="site_pulse/projects.html",
                               site_title=SITE_TITLE)


def contact(request):
    return site_views.contact(request, template="site_pulse/contact.html",
                              site_title=SITE_TITLE)
