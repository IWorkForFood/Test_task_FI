from django.urls import path, include
from rest_framework.routers import DefaultRouter

from core.api.v1.DDS.handlers import (
    CashFlowRecordViewSet,
    CategoryViewSet,
    StatusViewSet,
    SubcategoryViewSet,
    TransactionTypeViewSet,
)

router = DefaultRouter()
router.register(r"records", CashFlowRecordViewSet, basename="cashflowrecord")
router.register(r"statuses", StatusViewSet, basename="status")
router.register(r"transaction-types", TransactionTypeViewSet, basename="transactiontype")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"subcategories", SubcategoryViewSet, basename="subcategory")

urlpatterns = [
    path("", include(router.urls)),
]
