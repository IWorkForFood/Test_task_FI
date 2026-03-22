# REST API

Базовый URL: `/api/v1`

## Аутентификация

Используется сессионная аутентификация Django (cookies). CSRF-токен передаётся в заголовке `X-CSRFToken`.

### Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/v1/auth/register/` | Регистрация |
| POST | `/api/v1/auth/login/` | Вход |
| POST | `/api/v1/auth/logout/` | Выход |
| GET | `/api/v1/auth/me/` | Текущий пользователь |

### Регистрация (POST /auth/register/)

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "password_confirm": "string"
}
```

### Вход (POST /auth/login/)

```json
{
  "username": "string",
  "password": "string"
}
```

---

## Записи ДДС

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/dds/records/` | Список записей (с фильтрами) |
| POST | `/api/v1/dds/records/` | Создать запись |
| GET | `/api/v1/dds/records/{id}/` | Одна запись |
| PATCH | `/api/v1/dds/records/{id}/` | Обновить запись |
| DELETE | `/api/v1/dds/records/{id}/` | Удалить запись |

### Параметры фильтрации GET /records/

| Параметр | Тип | Описание |
|----------|-----|----------|
| date_from | date | Дата от (YYYY-MM-DD) |
| date_to | date | Дата до |
| status | int | ID статуса |
| transaction_type | int | ID типа |
| category | int | ID категории |
| subcategory | int | ID подкатегории |

### Тело запроса POST/PATCH /records/

```json
{
  "record_date": "2025-01-15",
  "status": 1,
  "transaction_type": 1,
  "category": 1,
  "subcategory": 1,
  "amount": "1000.00",
  "comment": "Текст комментария"
}
```

Обязательные поля: `record_date`, `status`, `transaction_type`, `category`, `subcategory`, `amount`.

---

## Справочники

### Статусы

| Метод | Endpoint |
|-------|----------|
| GET | `/api/v1/dds/statuses/` |
| POST | `/api/v1/dds/statuses/` |
| PATCH | `/api/v1/dds/statuses/{id}/` |
| DELETE | `/api/v1/dds/statuses/{id}/` |

### Типы операций

| Метод | Endpoint |
|-------|----------|
| GET | `/api/v1/dds/transaction-types/` |
| POST | `/api/v1/dds/transaction-types/` |
| PATCH | `/api/v1/dds/transaction-types/{id}/` |
| DELETE | `/api/v1/dds/transaction-types/{id}/` |

### Категории

| Метод | Endpoint |
|-------|----------|
| GET | `/api/v1/dds/categories/?transaction_type={id}` |
| POST | `/api/v1/dds/categories/` |
| PATCH | `/api/v1/dds/categories/{id}/` |
| DELETE | `/api/v1/dds/categories/{id}/` |

### Подкатегории

| Метод | Endpoint |
|-------|----------|
| GET | `/api/v1/dds/subcategories/?category={id}` |
| POST | `/api/v1/dds/subcategories/` |
| PATCH | `/api/v1/dds/subcategories/{id}/` |
| DELETE | `/api/v1/dds/subcategories/{id}/` |

---

## Валидация и зависимости

- Категория должна относиться к выбранному типу операции.
- Подкатегория должна относиться к выбранной категории.
- При ошибке валидации возвращается `400` с JSON `{ "field": ["message"] }`.
