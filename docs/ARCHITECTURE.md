# Архитектура

## Общая схема

```
                    ┌─────────────┐
                    │   Browser   │
                    └──────┬──────┘
                           │ :80
                    ┌──────▼──────┐
                    │    nginx    │  Reverse proxy
                    └──────┬──────┘
              ┌────────────┼────────────┐
              │            │            │
       /      │     /api/  │   /admin/  │
   frontend   │    backend │   backend  │
              │            │            │
    ┌─────────▼──┐  ┌──────▼──────┐     │
    │  frontend  │  │   backend   │     │
    │  (nginx +  │  │  (Django)   │     │
    │   SPA)     │  └──────┬──────┘     │
    │  :3000     │         │            │
    └────────────┘         │            │
                    ┌──────▼──────┐     │
                    │  PostgreSQL │     │
                    │   :5432     │     │
                    └─────────────┘     │
```

## Backend (Django)

### Приложения

- **core.apps.DDS** — модели и логика ДДС (Status, TransactionType, Category, Subcategory, CashFlowRecord)
- **core.apps.common** — общие модели (TimeBaseModel)
- **core.api.v1.auth** — аутентификация (регистрация, вход, выход)
- **core.api.v1.DDS** — REST API для записей и справочников

### Зависимости сущностей

```
User
 └── Status
 └── TransactionType
      └── Category
           └── Subcategory
                └── CashFlowRecord (status, transaction_type, category, subcategory, amount, comment)
```

### При создании пользователя

Автоматически создаются дефолтные данные (сервис `create_default_dds_data`):
- Статусы: Бизнес, Личное, Налог
- Типы: Пополнение, Списание
- Категории и подкатегории: Инфраструктура (VPS, Proxy), Маркетинг (Farpost, Avito)

## Frontend (SPA)

- Роутинг: hash-based (`#/records`, `#/records/new`, `#/settings`)
- Сессии: cookies + CSRF
- API: `fetch` с `credentials: 'include'`

## Docker

| Сервис | Образ | Порты |
|--------|-------|-------|
| nginx | nginx:stable-alpine | 80 |
| frontend | сборка из frontent/ | 3000 (внутр.) |
| backend | сборка из backend/ | 8000 |
| postgres | postgres:16 | 5432 |
