### Docs



для каждого приложения из apps запишем имя относительно core

```
class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core.apps.products.apps.ProductsConfig'
    verbose_name = 'Товары'