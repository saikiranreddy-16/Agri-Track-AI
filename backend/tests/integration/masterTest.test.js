import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import dotenv from 'dotenv';

dotenv.config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

import app from '../../app.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../helpers/dbHelper.js';
import User from '../../models/userModel.js';
import Machine from '../../models/machineModel.js';
import Farm from '../../models/farmModel.js';

describe('AgriTrack AI Complete E2E Integration Test Suite', () => {
  let companyAdminToken = '';
  let farmAdminToken = '';
  let companyAdminUser = null;
  let farmAdminUser = null;
  let testFarm = null;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // 1. Seed Company Admin (Requires email login)
    companyAdminUser = await User.create({
      name: 'Test Company Admin',
      phone: '9999988888',
      email: 'admin@company.com',
      password: 'password123',
      role: 'Company Admin',
      company: 'AgriTrack Enterprise'
    });

    // 2. Seed Farm Admin (Requires phone login)
    farmAdminUser = await User.create({
      name: 'Test Farm Admin',
      phone: '8888877777',
      password: 'password123',
      role: 'Farm Admin'
    });

    // 3. Seed Farm
    testFarm = await Farm.create({
      name: 'Guntur Model Farm',
      owner: companyAdminUser._id,
      location: { lat: 16.978, lng: 79.432 }
    });

    // Login Company Admin via Email
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@company.com', password: 'password123' });
    
    companyAdminToken = adminLoginRes.body.data?.token || adminLoginRes.body.token || '';

    // Login Farm Admin via Phone
    const farmLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ phone: '8888877777', password: 'password123' });
    
    farmAdminToken = farmLoginRes.body.data?.token || farmLoginRes.body.token || '';
  });

  describe('1. Health & Infrastructure Endpoints', () => {
    it('GET /api/v1/health should return 200 OK status', async () => {
      const res = await request(app).get('/api/v1/health').expect(200);
      expect(res.body.status).toBe('healthy');
    });

    it('GET /health should return standard liveness JSON payload', async () => {
      const res = await request(app).get('/health').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('healthy');
    });

    it('GET /ready should return readiness status', async () => {
      const res = await request(app).get('/ready').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('ready');
    });

    it('GET /version should return version environment info', async () => {
      const res = await request(app).get('/version').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.version).toBeDefined();
    });

    it('GET /metrics should return Prometheus metrics payload format', async () => {
      const res = await request(app).get('/metrics').expect(200);
      expect(res.text).toContain('agritrack_free_memory');
    });
  });

  describe('2. Authentication & Security Testing', () => {
    it('POST /api/v1/auth/login - valid email credentials should succeed', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@company.com', password: 'password123' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data?.token || res.body.token).toBeDefined();
    });

    it('POST /api/v1/auth/login - valid phone credentials should succeed for Farm Admin', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ phone: '8888877777', password: 'password123' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data?.token || res.body.token).toBeDefined();
    });

    it('POST /api/v1/auth/login - invalid password should reject with 401', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@company.com', password: 'wrongpassword' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/me - protected endpoint without token should return 401', async () => {
      const res = await request(app).get('/api/v1/auth/me').expect(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/me - protected endpoint with invalid token should return 401', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/me - protected endpoint with valid token should return user details', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${companyAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('admin@company.com');
    });
  });

  describe('3. Machine Management CRUD Operations', () => {
    it('POST /api/v1/machines - create machine with valid schema should succeed', async () => {
      const res = await request(app)
        .post('/api/v1/machines')
        .set('Authorization', `Bearer ${companyAdminToken}`)
        .send({
          name: 'John Deere 5042D',
          model: '2024 Model',
          brand: 'John Deere',
          type: 'Tractor',
          registrationNumber: 'AP39TE1234',
          chassisNumber: 'CHS123456789',
          owner: companyAdminUser._id,
          farmId: testFarm._id
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBeDefined();
    });

    it('GET /api/v1/machines - list machines should return created records', async () => {
      await Machine.create({
        name: 'Mahindra Yuvo 575',
        model: '2024 Model',
        brand: 'Mahindra',
        type: 'Tractor',
        registrationNumber: 'AP39TE9999',
        chassisNumber: 'CHS999999999',
        owner: companyAdminUser._id,
        farmId: testFarm._id
      });

      const res = await request(app)
        .get('/api/v1/machines')
        .set('Authorization', `Bearer ${companyAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/v1/machines/:id - non-existent ID should return 404', async () => {
      const res = await request(app)
        .get('/api/v1/machines/60d5ecb8b5c9c22b1c8e1234')
        .set('Authorization', `Bearer ${companyAdminToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Expense Logging Operations', () => {
    it('POST /api/v1/expenses/diesel - should log diesel expense record', async () => {
      const machine = await Machine.create({
        name: 'Preet Combine',
        type: 'Harvester',
        registrationNumber: 'AP39TE4321',
        chassisNumber: 'CHS43214321',
        owner: companyAdminUser._id,
        farmId: testFarm._id
      });

      const res = await request(app)
        .post('/api/v1/expenses/diesel')
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .send({
          vehicleId: machine._id,
          dieselQuantity: 100,
          costPerLitre: 95,
          petrolPumpName: 'HP Station',
          remarks: 'Daily harvest refill'
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCost).toBe(9500);
    });

    it('GET /api/v1/expenses/diesel - should fetch logged expenses', async () => {
      const res = await request(app)
        .get('/api/v1/expenses/diesel')
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('5. Maintenance & System Alerts', () => {
    it('GET /api/v1/maintenance - list maintenance records', async () => {
      const res = await request(app)
        .get('/api/v1/maintenance')
        .set('Authorization', `Bearer ${companyAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/alerts - list system alerts', async () => {
      const res = await request(app)
        .get('/api/v1/alerts')
        .set('Authorization', `Bearer ${companyAdminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('6. AI Assistant Endpoints', () => {
    it('POST /api/v1/ai/conversation - start AI session', async () => {
      const res = await request(app)
        .post('/api/v1/ai/conversation')
        .set('Authorization', `Bearer ${farmAdminToken}`)
        .send({
          message: 'How is my tractor fuel level?',
          context: { machineName: 'John Deere 5042D' }
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });
});
