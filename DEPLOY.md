# Запуск

```bash
# 1. Создать .env (если ещё нет)
cp backend/.env.example backend/.env

# 2. Запустить всё
make up-build
```

Приложение: http://localhost

- `/` — фронтенд
- `/api/` — API
- `/admin/` — админ-панель Django

## Схема nginx

| Путь     | Проксирование |
|----------|----------------|
| /        | frontend:3000  |
| /api/    | backend:8000   |
| /admin/  | backend:8000   |
| /static/ | backend:8000   |
