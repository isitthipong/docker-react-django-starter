# Docker React + Django Starter

Stack: React (Vite), Django REST Framework, PostgreSQL, Gunicorn and Nginx.

## 1. Prepare environment

Copy `.env.example` to `.env`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Change passwords and `DJANGO_SECRET_KEY` in `.env` before production use.

## 2. Build and start

```bash
docker compose up --build -d
```

Open:

- Application: http://localhost
- Product API: http://localhost/api/products/
- Django admin: http://localhost/admin/
- Health check: http://localhost/api/health/

## 3. Create administrator

```bash
docker compose exec backend python manage.py createsuperuser
admin
P@sswxxxx
```

## 4. Useful commands

```bash
docker compose ps
docker compose logs -f
docker compose logs -f backend
docker compose restart
docker compose down
docker compose down -v
```

Warning: `docker compose down -v` deletes PostgreSQL data volumes.

## 5. Create sample product

Use Django admin, or execute:

```bash
docker compose exec backend python manage.py shell -c "from products.models import Product; Product.objects.get_or_create(name='Sample Product', defaults={'price':99.00,'stock':10})"
```

## 6. Project structure

```text
docker-react-django-starter/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── entrypoint.sh
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/
│   └── products/
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── vite.config.js
│   └── src/
└── nginx/
    └── nginx.conf
```

## Production checklist

- Set `DJANGO_DEBUG=False`.
- Set a strong secret key and database password.
- Set `DJANGO_ALLOWED_HOSTS` to the actual DNS name/IP.
- Add HTTPS/TLS certificate at Nginx or the organisation's load balancer.
- Back up the PostgreSQL volume.
- Do not commit `.env` to source control.
- Restrict server and database access according to organisational security requirements.
