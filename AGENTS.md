# AGENTS.md

## Project overview

This repo is a Dockerized starter for a full-stack app using:

- React + Vite in `frontend/`
- Django + Django REST Framework in `backend/`
- PostgreSQL in the `db` service
- Nginx in `nginx/`

The app is intended to run through Docker Compose from the repo root. See [README.md](README.md) for the canonical setup and service URLs.

## Working conventions

- Keep environment config in `.env`; do not commit secrets or local overrides.
- Prefer changes that preserve the Docker-first workflow: backend and frontend are both containerized and run through `docker compose`.
- Treat the Django app under `backend/products/` as the API boundary for product data.
- Treat the React app under `frontend/src/` as the UI layer; it expects the API at `/api` via Vite build-time config and Nginx.
- If an API contract changes, update the backend serializer/view and the frontend fetch logic together.

## Common commands

Run the stack:

```bash
docker compose up --build -d
```

Check status/logs:

```bash
docker compose ps
docker compose logs -f
docker compose logs -f backend
```

Django management commands:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py shell
```

Frontend-only local development:

```bash
cd frontend
npm install
npm run dev
```

Build frontend for production:

```bash
cd frontend
npm run build
```

Stop/remove containers:

```bash
docker compose down
docker compose down -v
```

## Architecture notes

- `backend/config/settings.py` contains Django settings, database config, CORS, and DRF configuration.
- `backend/products/models.py`, `serializers.py`, `views.py`, and `urls.py` define the product API.
- `frontend/src/App.jsx` is the main client UI and fetches product data from the backend API.
- `nginx/nginx.conf` routes requests between the frontend and backend.
- `docker-compose.yml` defines the application stack and shared volumes.

## Safety and deployment notes

- `DJANGO_DEBUG` should be `False` in production.
- Set a strong `DJANGO_SECRET_KEY` and secure PostgreSQL credentials before deployment.
- `docker compose down -v` removes PostgreSQL data volumes; use it only when intentional.
- Update `DJANGO_ALLOWED_HOSTS` and TLS/front-end security settings before exposing the project beyond local development.

## When making changes

- Prefer small, focused edits that match the existing structure.
- Keep naming and file placement consistent with the current Django app and Vite app layout.
- Verify behavior with the smallest relevant command, usually a Docker Compose or Django management command.
