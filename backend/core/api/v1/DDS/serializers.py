from rest_framework import serializers

from core.apps.DDS.models import (
    CashFlowRecord,
    Category,
    Status,
    Subcategory,
    TransactionType,
)


class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = ("id", "name")


class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = ("id", "name")


class SubcategorySerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.none(),
    )

    class Meta:
        model = Subcategory
        fields = ("id", "name", "category")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            self.fields["category"].queryset = Category.objects.filter(
                transaction_type__user=request.user
            )


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubcategorySerializer(many=True, read_only=True)
    transaction_type = serializers.PrimaryKeyRelatedField(
        queryset=TransactionType.objects.none(),
    )

    class Meta:
        model = Category
        fields = ("id", "name", "transaction_type", "subcategories")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            self.fields["transaction_type"].queryset = TransactionType.objects.filter(
                user=request.user
            )


class CashFlowRecordSerializer(serializers.ModelSerializer):
    status = serializers.PrimaryKeyRelatedField(
        queryset=Status.objects.none(),
    )
    transaction_type = serializers.PrimaryKeyRelatedField(
        queryset=TransactionType.objects.none(),
    )
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.none(),
    )
    subcategory = serializers.PrimaryKeyRelatedField(
        queryset=Subcategory.objects.none(),
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            self.fields["status"].queryset = Status.objects.filter(user=request.user)
            self.fields["transaction_type"].queryset = TransactionType.objects.filter(
                user=request.user
            )
            self.fields["category"].queryset = Category.objects.filter(
                transaction_type__user=request.user
            )
            self.fields["subcategory"].queryset = Subcategory.objects.filter(
                category__transaction_type__user=request.user
            )

    class Meta:
        model = CashFlowRecord
        fields = (
            "id",
            "record_date",
            "status",
            "transaction_type",
            "category",
            "subcategory",
            "amount",
            "comment",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["status"] = {"id": instance.status_id, "name": instance.status.name}
        data["transaction_type"] = {
            "id": instance.transaction_type_id,
            "name": instance.transaction_type.name,
        }
        data["category"] = {"id": instance.category_id, "name": instance.category.name}
        data["subcategory"] = (
            {"id": instance.subcategory_id, "name": instance.subcategory.name}
            if instance.subcategory_id
            else None
        )
        return data

    def validate(self, attrs):
        instance = self.instance
        transaction_type = attrs.get("transaction_type") or (
            instance.transaction_type if instance else None
        )
        category = attrs.get("category") or (instance.category if instance else None)
        subcategory = attrs.get("subcategory")
        if subcategory is None and instance:
            subcategory = instance.subcategory

        if transaction_type and category and category.transaction_type_id != transaction_type.id:
            raise serializers.ValidationError(
                {"category": "Категория не относится к выбранному типу операции."}
            )

        if category and subcategory and subcategory.category_id != category.id:
            raise serializers.ValidationError(
                {"subcategory": "Подкатегория не относится к выбранной категории."}
            )

        return attrs
