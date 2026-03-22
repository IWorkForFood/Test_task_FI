from django.contrib import admin
from django.contrib.admin import TabularInline

from core.apps.DDS.models import (
    CashFlowRecord,
    Category,
    Status,
    Subcategory,
    TransactionType,
)


class SubcategoryInline(TabularInline):
    model = Subcategory
    extra = 1


@admin.register(Status)
class StatusAdmin(admin.ModelAdmin):
    list_display = ("name", "user")
    list_filter = ("user",)


@admin.register(TransactionType)
class TransactionTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "user")
    list_filter = ("user",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "transaction_type")
    list_filter = ("transaction_type",)
    inlines = (SubcategoryInline,)


@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "category")
    list_filter = ("category",)


@admin.register(CashFlowRecord)
class CashFlowRecordAdmin(admin.ModelAdmin):
    list_display = (
        "record_date",
        "user",
        "status",
        "transaction_type",
        "category",
        "subcategory",
        "amount",
        "comment_preview",
    )
    list_filter = ("user", "status", "transaction_type", "category", "record_date")
    search_fields = ("comment",)
    date_hierarchy = "record_date"
    ordering = ("-record_date", "-created_at")

    def comment_preview(self, obj):
        return obj.comment[:50] + "..." if len(obj.comment) > 50 else obj.comment

    comment_preview.short_description = "Комментарий"
