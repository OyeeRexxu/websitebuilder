from core import site_views

SITE_TITLE = "Signal"
TAGLINE = "Glitch, gloss, and growth for digital-native brands."


def home(request):
    return site_views.home(request, template="site_signal/home.html",
                           site_title=SITE_TITLE, site_tagline=TAGLINE)


def services(request):
    return site_views.services(request, template="site_signal/services.html",
                               site_title=SITE_TITLE)


def projects(request):
    return site_views.projects(request, template="site_signal/projects.html",
                               site_title=SITE_TITLE)


def contact(request):
    return site_views.contact(request, template="site_signal/contact.html",
                              site_title=SITE_TITLE)
