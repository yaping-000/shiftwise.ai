from rest_framework import serializers
from .models import Document, ROIAnalysis
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class ROIAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ROIAnalysis
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('id', 'title', 'azure_url', 'uploaded_at', 
                 'analysis_complete', 'analysis_result')
        read_only_fields = ('uploaded_at', 'analysis_complete', 
                          'analysis_result', 'azure_url') 