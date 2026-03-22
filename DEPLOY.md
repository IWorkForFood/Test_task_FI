# Развёртывание

Краткая справка по запуску. Полная документация — [README.md](README.md).

## Быстрый старт

```bash
cp backend/.env.example backend/.env
make up-build
```

Приложение: **http://localhost**

## Схема nginx

| Путь     | Проксирование |
|----------|----------------|
| /        | frontend:3000  |
| /api/    | backend:8000   |
| /admin/  | backend:8000   |
| /static/ | backend:8000   |

## Команды

- `make up` — запустить
- `make down` — остановить
- `make migrations` — создание миграций
- `make migrate` — выполнение миграций
- `make superuser` — создать админа
