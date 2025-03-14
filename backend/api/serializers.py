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
    uploaded_by = UserSerializer(read_only=True)
    roi_analyses = ROIAnalysisSerializer(many=True, read_only=True)

    class Meta:
        model = Document
        fields = ('id', 'title', 'file', 'uploaded_by', 'uploaded_at', 
                 'analysis_complete', 'analysis_result', 'roi_analyses')
        read_only_fields = ('uploaded_by', 'uploaded_at', 'analysis_complete', 
                          'analysis_result', 'roi_analyses') 