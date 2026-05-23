from django import forms
from .models import Inquiry


class InquiryForm(forms.ModelForm):
    class Meta:
        model = Inquiry
        fields = ["name", "email", "company", "budget", "message"]
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Your name", "autocomplete": "name"}),
            "email": forms.EmailInput(attrs={"placeholder": "you@brand.com", "autocomplete": "email"}),
            "company": forms.TextInput(attrs={"placeholder": "Company / brand", "autocomplete": "organization"}),
            "message": forms.Textarea(attrs={"placeholder": "Tell us about the project…", "rows": 5}),
        }
