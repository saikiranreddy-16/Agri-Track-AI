import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { createConversation, getConversations } from '../../../ai/aiController.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../helpers/dbHelper.js';
import mongoose from 'mongoose';

describe('AI Controller Unit Tests', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  it('should successfully create conversation sessions inside MongoMemoryServer', async () => {
    const req = {
      body: { title: 'Wheat Farm Analytics' },
      user: {
        _id: new mongoose.Types.ObjectId(),
        role: 'Farm Admin'
      }
    };
    
    let resData = null;
    let resStatus = null;
    
    const res = {
      status: (code) => {
        resStatus = code;
        return res;
      },
      json: (payload) => {
        resData = payload;
        return res;
      }
    };
    
    const next = (err) => {
      if (err) throw err;
    };

    await createConversation(req, res, next);

    expect(resStatus).toBe(201);
    expect(resData.success).toBe(true);
    expect(resData.data.title).toBe('Wheat Farm Analytics');
    expect(resData.data.userRole).toBe('Farm Admin');
  });
});
