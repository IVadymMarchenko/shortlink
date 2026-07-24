# ShortLink — URL Shortener with Analytics

A full-stack web application for shortening long URLs with advanced click-tracking statistics (device, OS, geolocation) and Google OAuth 2.0 authentication.

## 🛠 Tech Stack

*   **Backend:** Python 3.12, Django 6.0, Django REST Framework, Simple JWT, Django Allauth
*   **Frontend:** React, Vite, Axios, React OAuth Google
*   **Database:** PostgreSQL 15
*   **Asynchronous Tasks:** 
    *   **Celery** — processes heavy operations in the background (logging redirects, parsing User-Agents, and gathering analytics without blocking the main application thread).
    *   **Redis** — a high-performance message broker used to route tasks from Django to Celery workers.
*   **Web Server / Reverse Proxy:** Nginx (serves frontend static assets and routes API requests)
*   **Containerization:** Docker, Docker Compose

---

## Quick Start Locally (Docker)

The project is fully pre-configured for local development using Docker Compose. The Nginx network architecture automatically proxies `/api/` and `/admin/` requests straight to the Django backend. Locally, a complete stack including Django, Redis, and Celery spins up automatically.

### 1. Environment Setup
Create a `.env` file in the root directory of the project and fill it with your local variables:

```env
# Database
DB_NAME=shortlink_db
DB_USER=postgres
DB_PASSWORD=secret_postgres_pass
DB_HOST=db
DB_PORT=5432

# Django Settings
DEBUG=True
SECRET_KEY=local-secret-key-12345
ALLOWED_HOSTS=localhost 127.0.0.1 0.0.0.0

# Celery / Redis Settings
CELERY_BROKER_URL=redis://redis:6379/1
USE_CELERY=True

# Frontend Settings
FRONTEND_URL=http://localhost:5173


# start
docker compose up --build -d
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser