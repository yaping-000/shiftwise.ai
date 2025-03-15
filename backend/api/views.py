from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.core.files.storage import default_storage
from azure.storage.blob import BlobServiceClient
from azure.identity import DefaultAzureCredential
from .models import Document, ROIAnalysis
from .serializers import DocumentSerializer, ROIAnalysisSerializer
import os
import json
import requests
from django.conf import settings

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Save the document with the current user
        document = serializer.save(uploaded_by=self.request.user)
        
        # Upload to Azure Blob Storage
        file_obj = self.request.FILES['file']
        blob_name = f"documents/{document.id}/{file_obj.name}"
        
        # Get Azure credentials
        credential = DefaultAzureCredential()
        blob_service_client = BlobServiceClient(
            account_url=f"https://{settings.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net",
            credential=credential
        )
        
        # Upload file
        container_client = blob_service_client.get_container_client("documents")
        blob_client = container_client.get_blob_client(blob_name)
        blob_client.upload_blob(file_obj.read())
        
        # Trigger AI analysis
        self._trigger_analysis(document, blob_name)

    def _trigger_analysis(self, document, blob_path):
        # Call Azure Function for AI processing
        function_url = settings.AZURE_FUNCTION_URL
        headers = {
            'Content-Type': 'application/json',
            'x-functions-key': settings.AZURE_FUNCTION_KEY
        }
        
        payload = {
            'document_id': document.id,
            'blob_path': blob_path,
            'callback_url': f"{settings.API_BASE_URL}/api/documents/{document.id}/analysis_callback/"
        }
        
        requests.post(function_url, json=payload, headers=headers)

    @action(detail=True, methods=['post'])
    def analysis_callback(self, request, pk=None):
        document = self.get_object()
        analysis_result = request.data.get('analysis')
        
        # Create ROI Analysis
        ROIAnalysis.objects.create(
            document=document,
            score=analysis_result.get('roi_score', 0.0),
            details=analysis_result
        )
        
        # Update document
        document.analysis_complete = True
        document.analysis_result = analysis_result
        document.save()
        
        return Response({'status': 'analysis saved'})

class ROIAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ROIAnalysis.objects.all()
    serializer_class = ROIAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ROIAnalysis.objects.filter(document__uploaded_by=self.request.user)

@api_view(['GET'])
def health_check(request):
    """
    A simple health check endpoint to verify deployment
    """
    return Response({
        "status": "healthy",
        "message": "Backend is running successfully!"
    }) 