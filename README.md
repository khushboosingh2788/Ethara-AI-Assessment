# Ethara Inventory & Order Management

A modern, enterprise-grade Inventory and Order Management platform designed to streamline stock control, customer management, order processing, and business analytics. Built with a scalable microservice-friendly architecture using FastAPI, PostgreSQL, React, TypeScript, Tailwind CSS, React Query, Framer Motion, and Recharts, the system delivers high performance, real-time insights, and an exceptional user experience.

## Features

Comprehensive Product Management
Full CRUD operations for products
Unique SKU validation
Advanced search, filtering, and category management
Automated low-stock monitoring and alerts
Customer Management
Complete customer lifecycle management
Unique email validation to prevent duplicate records
Efficient customer search and organization
Smart Order Processing
Seamless order creation and tracking
Automatic order total calculations
Real-time inventory updates and stock deduction
Backend safeguards against insufficient inventory
Business Analytics Dashboard
Real-time KPI and performance metrics
Interactive line, bar, and pie charts
Inventory health and low-stock insights
Recent activities and operational summaries
Modern User Experience
Responsive SaaS-inspired interface
Dark and light mode support
Glassmorphism design elements
Smooth animations powered by Framer Motion
Interactive modals, notifications, and data tables
Scalable & Deployment Ready
Docker Compose setup for frontend, backend, and PostgreSQL
Environment-based configuration management
Production-ready deployment support
Easily extensible architecture for future business requirements
Technology Stack

Frontend: React, TypeScript, Tailwind CSS, React Query, Framer Motion, Recharts
Backend: FastAPI, Python
Database: PostgreSQL
DevOps & Deployment: Docker, Docker Compose

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

The backend runs at `http://localhost:8000`. API docs are at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Docker

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

## Environment Variables

Backend:

- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`

Frontend:

- `VITE_API_URL`

PostgreSQL:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

## Database Schema

See [docs/schema.sql](docs/schema.sql).

## API Documentation

See [docs/API.md](docs/API.md), or run the backend and open `/docs`.

## Deployment

### Frontend on Vercel or Netlify

1. Set root directory to `frontend`.
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Add `VITE_API_URL` pointing to the deployed backend URL.

### Backend on Render or Railway

1. Set root directory to `backend`.
2. Install command: `pip install -r requirements.txt`.
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Add `DATABASE_URL`, `SECRET_KEY`, and `CORS_ORIGINS`.

### Database on Neon PostgreSQL

1. Create a Neon project.
2. Copy the pooled PostgreSQL connection string.
3. Use it as `DATABASE_URL`.
4. Keep SSL enabled in the Neon connection string.

## Notes

This project uses SQLAlchemy `create_all` for straightforward portfolio deployment. For a larger production team, add Alembic migrations before release.
