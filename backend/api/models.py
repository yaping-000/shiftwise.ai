from django.db import models
from django.contrib.auth.models import User

class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    analysis_complete = models.BooleanField(default=False)
    analysis_result = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.title

class ROIAnalysis(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='roi_analyses')
    score = models.FloatField()
    analysis_date = models.DateTimeField(auto_now_add=True)
    details = models.JSONField()
    
    def __str__(self):
        return f"ROI Analysis for {self.document.title}" 