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

## 7. Deploy to a VPS

The production stack can run on an Ubuntu VPS with Docker Compose. The commands below assume that the server is reachable over SSH and that DNS for the domain is available.

### Install Docker

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
```

### Download the project

```bash
git clone <repository-url>
cd docker-react-django-starter
```

### Configure production environment

```bash
cp .env.example .env
nano .env
```

Set production values in `.env`:

```env
POSTGRES_DB=appdb
POSTGRES_USER=appuser
POSTGRES_PASSWORD=use-a-long-random-password
DJANGO_SECRET_KEY=use-a-long-random-secret-key
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=example.com,www.example.com,SERVER_IP
```

Do not commit `.env` to source control.

### Start the services

```bash
docker compose up --build -d
docker compose ps
```

Create the Django administrator:

```bash
docker compose exec backend python manage.py createsuperuser
```

Check the application:

```bash
curl http://localhost/api/health/
```

The application is then available at `http://SERVER_IP` or at the configured domain. Create DNS `A` records that point the domain and `www` subdomain to the server IP.

### Enable HTTPS

The included Nginx configuration listens on HTTP port 80 only. Before production use, put a TLS reverse proxy such as Caddy, or a load balancer with a Let's Encrypt certificate, in front of this stack. Configure the domain and HTTPS there, and forward requests to this project's Nginx service.

When using Django Admin over HTTPS, add the HTTPS domain to `CSRF_TRUSTED_ORIGINS` in `backend/config/settings.py` as required by the deployment.

### Update a running deployment

```bash
git pull
docker compose up --build -d
docker compose logs -f backend
```

### Production safety notes

- Allow only SSH, HTTP, and HTTPS through the server firewall; do not expose PostgreSQL port 5432 publicly.
- Back up the `postgres_data` volume regularly.
- `docker compose down -v` deletes the PostgreSQL data volume and must not be used unless data removal is intentional.

## Production checklist

- Set `DJANGO_DEBUG=False`.
- Set a strong secret key and database password.
- Set `DJANGO_ALLOWED_HOSTS` to the actual DNS name/IP.
- Add HTTPS/TLS certificate at Nginx or the organisation's load balancer.
- Back up the PostgreSQL volume.
- Do not commit `.env` to source control.
- Restrict server and database access according to organisational security requirements.
