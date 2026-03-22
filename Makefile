# Запуск: nginx + frontend + backend + postgres
# Из корня проекта: make up

DC = docker compose
ENV_FILE = --env-file backend/.env

.PHONY: up
up:
	$(DC) $(ENV_FILE) up -d

.PHONY: build
build:
	$(DC) $(ENV_FILE) build

.PHONY: up-build
up-build:
	$(DC) $(ENV_FILE) up --build -d

.PHONY: down
down:
	$(DC) down

.PHONY: logs
logs:
	$(DC) logs -f

.PHONY: migrate
migrate:
	$(DC) exec backend python manage.py migrate

.PHONY: superuser
superuser:
	$(DC) exec backend python manage.py createsuperuser
