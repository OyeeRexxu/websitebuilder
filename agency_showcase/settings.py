"""
Django settings for the multi-site agency showcase.
One Django project, 5 dramatically different design apps, served via Host-based
subdomain routing (pulse.localhost, atelier.localhost, etc.).

Environment variables (via .env or shell) override defaults for production.
"""
import os
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent

# django-environ: read .env file if present, fall back to OS env vars
env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, ["*"]),
)
environ.Env.read_env(BASE_DIR / ".env", overwrite=False)

SECRET_KEY = env("SECRET_KEY", default="dev-secret-not-for-production-change-me")
DEBUG = env("DEBUG", default=True)
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["*"])

# Map Host header subdomains -> per-site URLconf modules.
SUBDOMAIN_URLCONFS = {
    "pulse": "apps.site_pulse.urls",
    "atelier": "apps.site_atelier.urls",
    "orbit": "apps.site_orbit.urls",
    "signal": "apps.site_signal.urls",
    "quiet": "apps.site_quiet.urls",
}

SITE_META = {
    "pulse": {
        "name": "Pulse",
        "tagline": "Loud creative for brands that refuse to whisper.",
        "accent": "#FF3B00",
    },
    "atelier": {
        "name": "Atelier",
        "tagline": "Considered storytelling for considered brands.",
        "accent": "#1A1A1A",
    },
    "orbit": {
        "name": "Orbit",
        "tagline": "Immersive worlds for brands that move forward.",
        "accent": "#7C5CFF",
    },
    "signal": {
        "name": "Signal",
        "tagline": "Glitch, gloss, and growth for digital-native brands.",
        "accent": "#FF00C8",
    },
    "quiet": {
        "name": "Quiet",
        "tagline": "Restraint is the loudest signal of confidence.",
        "accent": "#0F766E",
    },
}

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sitemaps",
    "core",
    "apps.site_pulse",
    "apps.site_atelier",
    "apps.site_orbit",
    "apps.site_signal",
    "apps.site_quiet",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "core.middleware.SubdomainRoutingMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "agency_showcase.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "core.context_processors.site_context",
            ],
        },
    },
]

WSGI_APPLICATION = "agency_showcase.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Email: console backend for dev; override EMAIL_* vars in .env for production.
EMAIL_BACKEND = env(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.console.EmailBackend",
)

# Canonical site origin (used for absolute URLs in sitemaps & OG tags).
CANONICAL_HOST = env("CANONICAL_HOST", default="localhost:8000")
CANONICAL_SCHEME = env("CANONICAL_SCHEME", default="http")

# Security hardening for production
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
