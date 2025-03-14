from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, ROIAnalysisViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet)
router.register(r'analyses', ROIAnalysisViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 