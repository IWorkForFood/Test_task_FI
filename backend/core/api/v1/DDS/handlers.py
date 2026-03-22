from rest_framework import viewsets

from core.apps.DDS.models import (
    CashFlowRecord,
    Category,
    Status,
    Subcategory,
    TransactionType,
)
from core.api.v1.DDS.serializers import (
    CashFlowRecordSerializer,
    CategorySerializer,
    StatusSerializer,
    SubcategorySerializer,
    TransactionTypeSerializer,
)


class StatusViewSet(viewsets.ModelViewSet):
    serializer_class = StatusSerializer

    def get_queryset(self):
        return Status.objects.filter(user=self.request.user).order_by("name")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionTypeViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionTypeSerializer

    def get_queryset(self):
        return TransactionType.objects.filter(user=self.request.user).order_by("name")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        qs = Category.objects.filter(
            transaction_type__user=self.request.user
        ).select_related("transaction_type").prefetch_related("subcategories")
        transaction_type = self.request.query_params.get("transaction_type")
        if transaction_type:
            qs = qs.filter(transaction_type_id=transaction_type)
        return qs.order_by("name")

    def perform_create(self, serializer):
        serializer.save()


class SubcategoryViewSet(viewsets.ModelViewSet):
    serializer_class = SubcategorySerializer

    def get_queryset(self):
        qs = Subcategory.objects.filter(
            category__transaction_type__user=self.request.user
        ).select_related("category", "category__transaction_type")
        category = self.request.query_params.get("category")
        transaction_type = self.request.query_params.get("transaction_type")
        if category:
            qs = qs.filter(category_id=category)
        if transaction_type:
            qs = qs.filter(category__transaction_type_id=transaction_type)
        return qs.order_by("name")

    def perform_create(self, serializer):
        serializer.save()


class CashFlowRecordViewSet(viewsets.ModelViewSet):
    serializer_class = CashFlowRecordSerializer

    def get_queryset(self):
        return CashFlowRecord.objects.filter(
            user=self.request.user
        ).select_related(
            "status",
            "transaction_type",
            "category",
            "subcategory",
        ).order_by("-record_date", "-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
