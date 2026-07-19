import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { connectTestDB, closeTestDB } from '../helpers/dbHelper.js';

describe('Root Level Infrastructure Integration Tests', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  it('GET /health should return standard liveness JSON payload', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('GET /ready should return standard readiness JSON payload', async () => {
    const res = await request(app)
      .get('/ready')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ready');
  });

  it('GET /version should return package environment details', async () => {
    const res = await request(app)
      .get('/version')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.version).toBeDefined();
    expect(res.body.environment).toBeDefined();
  });

  it('GET /metrics should return Prometheus metrics payload format', async () => {
    const res = await request(app)
      .get('/metrics')
      .expect(200);

    expect(res.text).toContain('agritrack_free_memory');
    expect(res.text).toContain('agritrack_process_uptime');
  });
});
