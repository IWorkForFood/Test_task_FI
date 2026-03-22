# Разработка

## Локальный запуск без Docker

### Backend

```bash
cd backend
# Активировать venv и установить зависимости
poetry install
# PostgreSQL должен быть запущен (локально или в Docker)
# Настроить .env: POSTGRES_HOST=localhost
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontent
npm install
npm run dev
```

Frontend на `http://localhost:5173` с прокси `/api` → `http://localhost:8000`.

## Переменные окружения (.env)

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| POSTGRES_DB | Имя БД | my_database |
| POSTGRES_USER | Пользователь PostgreSQL | my_user |
| POSTGRES_PASSWORD | Пароль | — |
| POSTGRES_HOST | Хост БД | postgres (в Docker) |
| POSTGRES_PORT | Порт | 5432 |
| DJANGO_SECRET_KEY | Секретный ключ Django | — |
| DEBUG | Режим отладки | false |
| ALLOWED_HOSTS | Разрешённые хосты | localhost,127.0.0.1,... |
| CSRF_TRUSTED_ORIGINS | Origins для CSRF | http://localhost,... |

## Миграции

```bash
# Создать миграции
docker compose exec backend python manage.py makemigrations

# Применить
make migrate
# Без make: docker compose exec backend python manage.py migrate
```

## Логи

```bash
# Все сервисы
make logs
# Без make: docker compose logs -f

# Только backend
docker compose logs backend -f
```
