# Backend (Django)

API для приложения ДДС. Django 5 + Django REST Framework + PostgreSQL.

## Запуск

Через Docker (из корня проекта):
```bash
make up-build
```

Или локально:
```bash
poetry install
cp .env.example .env   # настроить переменные
python manage.py migrate
python manage.py runserver
```

## Структура

```
backend/
├── core/
│   ├── apps/
│   │   ├── DDS/         # Модели, сервисы ДДС
│   │   └── common/      # Общие модели
│   ├── api/v1/
│   │   ├── auth/        # Регистрация, вход, выход
│   │   └── DDS/         # REST API записей и справочников
│   └── project/         # Настройки, urls, wsgi
├── .env
└── Dockerfile
```

## Документация

См. [../docs/API.md](../docs/API.md) и [../README.md](../README.md).
