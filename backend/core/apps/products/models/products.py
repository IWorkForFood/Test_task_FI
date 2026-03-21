from django.db import models

from core.apps.common.models import TimeBaseModel

class Product(TimeBaseModel):
    title = models.CharField(
        verbose_name="Название товара",
        max_length = 255
    )

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
