from datetime import date

from django.conf import settings
from django.db import models

from core.apps.common.models import TimeBaseModel


class Status(models.Model):
    """Статус записи ДДС (расширяемый список, привязан к пользователю)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="dds_statuses",
        verbose_name="Пользователь",
    )
    name = models.CharField(
        verbose_name="Название",
        max_length=100,
    )

    class Meta:
        verbose_name = "Статус"
        verbose_name_plural = "Статусы"
        unique_together = ("user", "name")

    def __str__(self):
        return self.name


class TransactionType(models.Model):
    """Тип операции (расширяемый список, привязан к пользователю)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="dds_transaction_types",
        verbose_name="Пользователь",
    )
    name = models.CharField(
        verbose_name="Название",
        max_length=100,
    )

    class Meta:
        verbose_name = "Тип операции"
        verbose_name_plural = "Типы операций"
        unique_together = ("user", "name")

    def __str__(self):
        return self.name


class Category(models.Model):
    """Категория (расширяемый список, привязана к типу операции)."""

    transaction_type = models.ForeignKey(
        TransactionType,
        on_delete=models.CASCADE,
        related_name="categories",
        verbose_name="Тип операции",
    )
    name = models.CharField(
        verbose_name="Название",
        max_length=255,
    )

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        unique_together = ("transaction_type", "name")

    def __str__(self):
        return self.name


class Subcategory(models.Model):
    """Подкатегория (расширяемый список, привязана к категории)."""

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="subcategories",
        verbose_name="Категория",
    )
    name = models.CharField(
        verbose_name="Название",
        max_length=255,
    )

    class Meta:
        verbose_name = "Подкатегория"
        verbose_name_plural = "Подкатегории"
        unique_together = ("category", "name")

    def __str__(self):
        return f"{self.category.name} — {self.name}"


class CashFlowRecord(TimeBaseModel):
    """Запись о движении денежных средств (ДДС)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cash_flow_records",
        verbose_name="Пользователь",
    )
    record_date = models.DateField(
        verbose_name="Дата создания записи",
        default=date.today,
    )
    status = models.ForeignKey(
        Status,
        on_delete=models.PROTECT,
        related_name="cash_flow_records",
        verbose_name="Статус",
    )
    transaction_type = models.ForeignKey(
        TransactionType,
        on_delete=models.PROTECT,
        related_name="cash_flow_records",
        verbose_name="Тип",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="cash_flow_records",
        verbose_name="Категория",
    )
    subcategory = models.ForeignKey(
        Subcategory,
        on_delete=models.PROTECT,
        related_name="cash_flow_records",
        verbose_name="Подкатегория",
    )
    amount = models.DecimalField(
        verbose_name="Сумма",
        max_digits=12,
        decimal_places=2,
        help_text="Сумма в рублях",
    )
    comment = models.TextField(
        verbose_name="Комментарий",
        blank=True,
        default="",
    )

    class Meta:
        verbose_name = "Запись ДДС"
        verbose_name_plural = "Записи ДДС"
        ordering = ["-record_date", "-created_at"]

    def __str__(self):
        return f"{self.record_date} — {self.amount} ₽ ({self.transaction_type})"
