from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, ROIAnalysisViewSet
from . import views

router = DefaultRouter()
router.register(r'documents', DocumentViewSet)
router.register(r'analyses', ROIAnalysisViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('health/', views.health_check, name='health_check'),
] 