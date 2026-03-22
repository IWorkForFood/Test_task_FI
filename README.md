# ДДС — Учёт движения денежных средств

Веб-приложение для учёта, управления и анализа поступлений и списаний денежных средств. Позволяет создавать, просматривать, редактировать и удалять записи о движении денежных средств (ДДС) с учётом статусов, типов операций, категорий и подкатегорий.

## Возможности

- **Записи ДДС:** дата, статус (Бизнес/Личное/Налог и др.), тип (Пополнение/Списание), категория, подкатегория, сумма, комментарий
- **Фильтрация** по дате, статусу, типу, категории, подкатегории
- **Справочники:** расширяемые статусы, типы, категории, подкатегории
- **Логические зависимости:** категории зависят от типа, подкатегории от категории

## Технологии

| Компонент | Стек |
|-----------|------|
| Backend | Django 5, Django REST Framework |
| БД | PostgreSQL |
| Frontend | Vite, vanilla JavaScript |
| Инфраструктура | Docker, nginx |

---

## Быстрый старт

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd Test_task_FI

# 2. Создать файл для своих переменных окружения и задать их
cp backend/.env.example backend/.env

# 3. Запустить
make up-build
# Без make:
# docker compose --env-file backend/.env up --build -d

# 4. Создать миграции
make migrations
# Без make: docker compose exec backend python manage.py makemigrations

# 5. Выполнить миграции
make migrate
# Без make: docker compose exec backend python manage.py migrate
```

Приложение: **http://localhost**

---

## Установка

### Требования

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

Отдельная установка Python или Node.js не требуется.

---

## Настройка базы данных

База PostgreSQL поднимается в Docker. Миграции применяются автоматически при старте backend.

Ручной запуск миграций:
```bash
make migrate
# Без make: docker compose exec backend python manage.py migrate
```

Создание миграций:
```bash
make migrations
# Без make: docker compose exec backend python manage.py makemigrations
```

Создание суперпользователя Django (для `/admin/`):
```bash
make superuser
# Без make: docker compose exec backend python manage.py createsuperuser
```

---

## Запуск веб-сервиса

| Команда | Описание | Аналог (без make) |
|---------|----------|-------------------|
| `make up-build` | Собрать образы и запустить | `docker compose --env-file backend/.env up --build -d` |
| `make up` | Запустить (без пересборки) | `docker compose --env-file backend/.env up -d` |
| `make down` | Остановить | `docker compose down` |
| `make build` | Только собрать образы | `docker compose --env-file backend/.env build` |
| `make logs` | Логи всех сервисов | `docker compose logs -f` |
| `make migrate` | Применить миграции | `docker compose exec backend python manage.py migrate` |
| `make migrations` | Создать миграции | `docker compose exec backend python manage.py makemigrations` |
| `make superuser` | Создать суперпользователя | `docker compose exec backend python manage.py createsuperuser` |

### Доступные URL

| Путь | Описание |
|------|----------|
| http://localhost/ | Фронтенд (SPA) |
| http://localhost/api/ | API (REST) |
| http://localhost/admin/ | Админ-панель Django |

---

## Документация

- [docs/API.md](docs/API.md) — описание REST API
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — разработка и отладка
