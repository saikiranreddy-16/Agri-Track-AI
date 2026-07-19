# Deployment Guide – AgriTrack AI

This document provides deployment guidelines for running the containerized layouts on local or VPS instances.

## Prerequisite Tools
1. **Docker Engine & Compose** (v2.0+)
2. **Git**

## Setup Environment Files
Make a copy of the production environment file:
```bash
cp backend/.env.production backend/.env
```
Ensure that `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY` have secure values inside `backend/.env`.

## Deploying via Docker Compose

### 1. Production Mode
Runs Nginx (serving static files on port 80/443 and proxying to Backend) + MongoDB.
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

### 2. Development Mode
Mounts hot-reloads and maps development ports.
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```
The application will be accessible at `http://localhost:5173`.
