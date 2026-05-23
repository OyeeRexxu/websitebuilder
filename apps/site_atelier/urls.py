from django.urls import path
from . import views

app_name = "atelier"
urlpatterns = [
    path("", views.home, name="home"),
    path("services/", views.services, name="services"),
    path("projects/", views.projects, name="projects"),
    path("contact/", views.contact, name="contact"),
]
