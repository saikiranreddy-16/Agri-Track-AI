# Monitoring Manual – AgriTrack AI

The platform exposes endpoints to monitor application status and system metrics.

## 1. Monitoring Endpoints

### Liveness Endpoint
- **Path**: `GET /health`
- **Description**: Lightweight check to verify the process is alive.

### Readiness Endpoint
- **Path**: `GET /ready`
- **Description**: Verifies connection status with MongoDB.

### Application Version & Commit
- **Path**: `GET /version`
- **Description**: Returns package version, Node environment, and Git commit.

### Metric Streams
- **Path**: `GET /metrics`
- **Description**: Returns memory load, CPU usage, and system statistics formatted in standard Prometheus plain-text syntax.

### Component-Specific Health Checks
- `GET /api/v1/health/db` – MongoDB latency ping.
- `GET /api/v1/health/ai` – AI provider configurations and error logs stats.
- `GET /api/v1/health/cache` – Active cached keys total count.
- `GET /api/v1/health/system` – Raw host server statistics.
