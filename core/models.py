from django.db import models
from django.utils.text import slugify


class Service(models.Model):
    title = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    summary = models.CharField(max_length=240, help_text="One-line elevator pitch.")
    body = models.TextField(help_text="Plain text or simple HTML.")
    icon = models.CharField(
        max_length=40,
        blank=True,
        help_text="Optional emoji or short label used by sites that want a glyph.",
    )
    accent_color = models.CharField(max_length=20, blank=True, default="")
    hero_image = models.ImageField(upload_to="services/", blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    deliverables = models.TextField(
        blank=True, help_text="One per line — used as a bullet list."
    )

    class Meta:
        ordering = ["order", "title"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def deliverable_list(self):
        return [line.strip() for line in self.deliverables.splitlines() if line.strip()]

    @property
    def image_url(self):
        """Deterministic dummy image based on PK (1–5 → /static/images/services/N.jpg)."""
        idx = ((self.pk - 1) % 5) + 1 if self.pk else 1
        return f"/static/images/services/{idx}.jpg"


class Project(models.Model):
    title = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    client = models.CharField(max_length=120)
    category = models.CharField(max_length=80)
    year = models.PositiveIntegerField()
    summary = models.CharField(max_length=280)
    body = models.TextField(blank=True)
    hero_image = models.ImageField(upload_to="projects/", blank=True, null=True)
    cover_color = models.CharField(
        max_length=20, default="#111111", help_text="Fallback background when image missing."
    )
    tags = models.CharField(
        max_length=240, blank=True, help_text="Comma-separated tags."
    )
    featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    metrics = models.TextField(
        blank=True,
        help_text="One metric per line, format: 'Reach | 12M impressions'.",
    )

    class Meta:
        ordering = ["order", "-year", "title"]

    def __str__(self):
        return f"{self.title} — {self.client}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.client}-{self.title}")[:180]
        super().save(*args, **kwargs)

    @property
    def tag_list(self):
        return [t.strip() for t in self.tags.split(",") if t.strip()]

    @property
    def metric_pairs(self):
        pairs = []
        for line in self.metrics.splitlines():
            if "|" in line:
                k, v = line.split("|", 1)
                pairs.append((k.strip(), v.strip()))
        return pairs

    @property
    def image_url(self):
        """Deterministic dummy image based on PK (1–6 → /static/images/projects/N.jpg)."""
        idx = ((self.pk - 1) % 6) + 1 if self.pk else 1
        return f"/static/images/projects/{idx}.jpg"


class Testimonial(models.Model):
    quote = models.TextField()
    author = models.CharField(max_length=120)
    role = models.CharField(max_length=120)
    company = models.CharField(max_length=120, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.author} — {self.company}"

    @property
    def image_url(self):
        """Deterministic dummy image based on PK (uses the project image set)."""
        idx = ((self.pk - 1) % 6) + 1 if self.pk else 1
        return f"/static/images/projects/{idx}.jpg"


class Inquiry(models.Model):
    SOURCE_CHOICES = [
        ("pulse", "Pulse"),
        ("atelier", "Atelier"),
        ("orbit", "Orbit"),
        ("signal", "Signal"),
        ("quiet", "Quiet"),
        ("landing", "Landing"),
    ]
    BUDGET_CHOICES = [
        ("under-10k", "Under $10k"),
        ("10-25k", "$10k – $25k"),
        ("25-75k", "$25k – $75k"),
        ("75k-plus", "$75k+"),
        ("unsure", "Not sure yet"),
    ]

    name = models.CharField(max_length=120)
    email = models.EmailField()
    company = models.CharField(max_length=160, blank=True)
    budget = models.CharField(max_length=20, choices=BUDGET_CHOICES, blank=True)
    message = models.TextField()
    source_site = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="landing")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Inquiries"

    def __str__(self):
        return f"{self.name} <{self.email}> via {self.source_site}"
