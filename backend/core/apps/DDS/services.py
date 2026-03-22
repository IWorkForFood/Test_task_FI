"""Сервисы приложения DDS."""

from core.apps.DDS.models import Category, Status, Subcategory, TransactionType


DEFAULT_STATUSES = ["Бизнес", "Личное", "Налог"]

DEFAULT_TRANSACTION_TYPES = ["Пополнение", "Списание"]

# (категория, [подкатегории]) — все привязаны к типу "Списание"
DEFAULT_CATEGORIES = [
    ("Инфраструктура", ["VPS", "Proxy"]),
    ("Маркетинг", ["Farpost", "Avito"]),
]


def create_default_dds_data(user):
    """Создаёт стандартные статусы, типы, категории и подкатегории для пользователя."""
    # Статусы
    for name in DEFAULT_STATUSES:
        Status.objects.get_or_create(user=user, name=name)

    # Типы операций
    type_popolnenie, _ = TransactionType.objects.get_or_create(
        user=user, name="Пополнение"
    )
    type_spisanie, _ = TransactionType.objects.get_or_create(
        user=user, name="Списание"
    )

    # Категории и подкатегории (для типа "Списание")
    for category_name, subcategory_names in DEFAULT_CATEGORIES:
        category, _ = Category.objects.get_or_create(
            transaction_type=type_spisanie,
            name=category_name,
        )
        for sub_name in subcategory_names:
            Subcategory.objects.get_or_create(
                category=category,
                name=sub_name,
            )
