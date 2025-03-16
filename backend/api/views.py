from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.core.files.storage import default_storage
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from azure.core.exceptions import ResourceNotFoundError
from .models import Document, ROIAnalysis
from .serializers import DocumentSerializer, ROIAnalysisSerializer
import os
import json
import requests
from django.conf import settings
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    def create(self, request, *args, **kwargs):
        try:
            # Enhanced request logging
            logger.info("=== File Upload Request Debug ===")
            logger.info(f"Request Files: {request.FILES}")
            logger.info(f"Request Data: {request.data}")
            logger.info(f"Content Type: {request.content_type}")
            logger.info("================================")
            
            file_obj = request.FILES.get('file')
            if not file_obj:
                logger.warning(f"No file found in request. Available fields: {list(request.FILES.keys())}")
                return Response(
                    {"error": "No file provided", "available_fields": list(request.FILES.keys())},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Log file details
            logger.info(f"File name: {file_obj.name}")
            logger.info(f"File size: {file_obj.size}")
            logger.info(f"Content type: {file_obj.content_type}")

            # Verify file is not empty
            if file_obj.size == 0:
                return Response(
                    {"error": "The submitted file is empty"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create document first with just the title
            document_data = {'title': request.data.get('title', file_obj.name)}
            serializer = self.get_serializer(data=document_data)
            if not serializer.is_valid():
                logger.error(f"Serializer validation failed: {serializer.errors}")
                return Response(
                    {"error": "Invalid data", "details": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            document = serializer.save()
            response_data = serializer.data
            
            # Handle Azure upload
            try:
                if not settings.AZURE_STORAGE_KEY:
                    logger.warning("AZURE_STORAGE_KEY not set")
                    return Response(
                        {"error": "Azure storage not configured"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                blob_url = self._handle_azure_upload(document, file_obj)
                
                # Update document with Azure URL
                document.azure_url = blob_url
                document.save()
                
                response_data['azure_url'] = blob_url
                return Response(response_data, status=status.HTTP_201_CREATED)
                
            except Exception as azure_error:
                # If Azure upload fails, delete the document and return error
                document.delete()
                logger.error(f"Azure upload failed: {str(azure_error)}")
                return Response(
                    {"error": f"Azure upload failed: {str(azure_error)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
        except Exception as e:
            logger.error(f"Document creation failed: {str(e)}")
            return Response(
                {"error": "Document creation failed", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _handle_azure_upload(self, document, file_obj):
        """Upload file to Azure Blob Storage and return the blob URL with SAS token"""
        try:
            # Create blob name
            blob_name = f"documents/{document.id}/{file_obj.name}"
            
            # Log Azure storage settings
            logger.info(f"Azure Storage Settings - Account: {settings.AZURE_STORAGE_ACCOUNT}, Container: {settings.AZURE_CONTAINER}")
            if not settings.AZURE_STORAGE_KEY:
                raise ValueError("AZURE_STORAGE_KEY is not set or is empty")
            
            # Initialize the BlobServiceClient
            connection_string = f"DefaultEndpointsProtocol=https;AccountName={settings.AZURE_STORAGE_ACCOUNT};AccountKey={settings.AZURE_STORAGE_KEY};EndpointSuffix=core.windows.net"
            logger.info("Attempting to connect to Azure Storage with connection string")
            try:
                blob_service_client = BlobServiceClient.from_connection_string(connection_string)
            except Exception as conn_error:
                logger.error(f"Failed to create BlobServiceClient: {str(conn_error)}")
                raise
            
            try:
                # Get container client, create if doesn't exist
                container_client = blob_service_client.get_container_client(settings.AZURE_CONTAINER)
                container_client.get_container_properties()
                logger.info(f"Found existing container: {settings.AZURE_CONTAINER}")
            except ResourceNotFoundError:
                logger.info(f"Container {settings.AZURE_CONTAINER} not found, creating...")
                try:
                    container_client = blob_service_client.create_container(settings.AZURE_CONTAINER)
                except Exception as container_error:
                    logger.error(f"Failed to create container: {str(container_error)}")
                    raise
            
            # Upload the file
            logger.info(f"Starting blob upload for {blob_name}")
            blob_client = container_client.get_blob_client(blob_name)
            file_content = file_obj.read()
            logger.info(f"Read {len(file_content)} bytes from file")
            blob_client.upload_blob(file_content, overwrite=True)
            logger.info(f"Successfully uploaded blob {blob_name}")
            
            # Generate SAS token (valid for 24 hours)
            sas_token = generate_blob_sas(
                account_name=settings.AZURE_STORAGE_ACCOUNT,
                container_name=settings.AZURE_CONTAINER,
                blob_name=blob_name,
                account_key=settings.AZURE_STORAGE_KEY,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.utcnow() + timedelta(hours=24)
            )
            
            # Get the blob URL with SAS token
            blob_url = f"https://{settings.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/{settings.AZURE_CONTAINER}/{blob_name}?{sas_token}"
            logger.info("Generated SAS URL for blob access")
            
            # Trigger analysis if function URL is configured
            if settings.AZURE_FUNCTION_URL and settings.AZURE_FUNCTION_KEY:
                self._trigger_analysis(document, blob_name)
            else:
                logger.info("Skipping analysis trigger - Azure Function not configured")
            
            return blob_url
                
        except ValueError as ve:
            logger.error(f"Configuration error: {str(ve)}")
            raise
        except Exception as e:
            logger.error(f"Azure upload error: {type(e).__name__}: {str(e)}")
            raise

    def _trigger_analysis(self, document, blob_path):
        """Trigger document analysis via Azure Function"""
        try:
            headers = {
                'Content-Type': 'application/json',
                'x-functions-key': settings.AZURE_FUNCTION_KEY
            }
            
            payload = {
                'document_id': document.id,
                'blob_path': blob_path,
                'callback_url': f"{settings.API_BASE_URL}/api/documents/{document.id}/analysis_callback/"
            }
            
            response = requests.post(
                settings.AZURE_FUNCTION_URL,
                json=payload,
                headers=headers
            )
            
            if not response.ok:
                logger.error(f"Analysis trigger failed: {response.text}")
            else:
                logger.info("Successfully triggered analysis")
                
        except Exception as e:
            logger.error(f"Error triggering analysis: {str(e)}")
            # Don't raise the error, just log it

    @action(detail=True, methods=['post'])
    def analysis_callback(self, request, pk=None):
        """Handle analysis results callback"""
        try:
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
            
        except Exception as e:
            logger.error(f"Analysis callback failed: {str(e)}")
            return Response(
                {"error": "Analysis callback failed", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ROIAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ROIAnalysis.objects.all()
    serializer_class = ROIAnalysisSerializer

    def get_queryset(self):
        return ROIAnalysis.objects.all()

@api_view(['GET'])
def health_check(request):
    """
    A simple health check endpoint to verify deployment
    """
    return Response({
        "status": "healthy",
        "message": "Backend is running successfully!"
    })

@api_view(['POST'])
def test_connection(request):
    """
    A simple test endpoint that echoes back the received message.
    """
    message = request.data.get('message', '')
    return Response({
        'status': 'success',
        'message': message,
        'note': 'API connection successful'
    }) 