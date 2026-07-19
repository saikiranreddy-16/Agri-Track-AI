# Performance Benchmarks – AgriTrack AI

Operational latency thresholds and load limits for AgriTrack AI.

## 1. Latency Budgets

| Endpoint / Action | Target Response Time (Average) | Max Allowable Limit (99th percentile) |
|---|---|---|
| **Liveness Check (`/health`)** | < 50ms | < 100ms |
| **Readiness Check (`/ready`)** | < 100ms | < 250ms |
| **Authentication (`/login`)** | < 300ms | < 500ms |
| **GPS Telemetry Updates** | < 150ms | < 300ms |
| **Static Assets (Served via Nginx)** | < 100ms | < 200ms |
| **AI Responses (Cached)** | < 100ms | < 200ms |
| **AI Responses (External Gemini)** | < 4.0s | < 8.0s |

## 2. Load Testing Specifications
- **Tool**: Artillery
- **Production Target Capacity**:
  - Support **100 concurrent requests** at <500ms response time.
  - Peak limit support for **500 concurrent connections** with <1% error rate thresholds.
- **CPU & Memory limits**:
  - Max RSS memory footprint: 512MB per instance.
  - Idle CPU load: <5% utilization.
