from django.contrib import admin
from .models import Service, Project, Testimonial, Inquiry


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("title", "order", "icon")
    list_editable = ("order",)
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "summary")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "client", "category", "year", "featured", "order")
    list_editable = ("featured", "order")
    list_filter = ("category", "year", "featured")
    search_fields = ("title", "client", "tags")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("author", "company", "order")
    list_editable = ("order",)


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "company", "source_site", "created_at")
    list_filter = ("source_site", "budget", "created_at")
    search_fields = ("name", "email", "company", "message")
    readonly_fields = ("created_at",)
