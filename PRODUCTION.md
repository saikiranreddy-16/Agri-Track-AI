# Production Best Practices – AgriTrack AI

Guidelines for running and optimizing AgriTrack AI in a production environment.

## 1. Startup Checks Validation
On server initialization, the boot routine performs fail-fast validation check gates:
- Halts process if `MONGO_URI` is undefined.
- Halts process if `JWT_SECRET` is undefined.

## 2. Server Signal Interrupt Handling
The server registers `SIGTERM` and `SIGINT` signals to close down cleanly:
1. Shuts down background scheduler cron loops.
2. Stops HTTP server from receiving new incoming connections.
3. Allows current pending connection pools to drain and finish.
4. Safely disconnects Mongoose connections.
5. Logs shutdown status metrics and exits.

## 3. Environment Separations
- Use `.env.production` in production.
- Disable debug logging configurations.
- Ensure API tokens use SSL-only cookies.
