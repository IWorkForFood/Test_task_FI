from django.apps import AppConfig
from django.db.models.signals import post_save


def create_dds_data_for_new_user(sender, instance, created, **kwargs):
    if created:
        from core.apps.DDS.services import create_default_dds_data

        create_default_dds_data(instance)


class DDSConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core.apps.DDS'
    verbose_name = 'Записи ДДС'

    def ready(self):
        from django.contrib.auth import get_user_model

        post_save.connect(
            create_dds_data_for_new_user,
            sender=get_user_model(),
        )