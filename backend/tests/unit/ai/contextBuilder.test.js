import { describe, it, expect } from 'vitest';
import { sanitizeData } from '../../../ai/contextBuilder.js';

describe('AI Context Sanitization Tests', () => {
  it('should filter secret parameters and tokens from context payloads', () => {
    const rawPayload = {
      name: 'Corn Field East',
      apiKey: 'sec_gemini_xyz_123',
      secret: 'super_secret_value',
      token: 'jwt_auth_token_here',
      password: 'mySecretPassword',
      passwordHash: '$2b$10$abcdefghijk',
      __v: 0,
      nested: {
        _id: 'mongo_id_value',
        owner: 'user_owner_id',
        title: 'Harvester Machine #1',
        jwt: 'nested_jwt_value'
      }
    };

    const sanitized = sanitizeData(rawPayload);

    expect(sanitized.name).toBe('Corn Field East');
    expect(sanitized.apiKey).toBeUndefined();
    expect(sanitized.secret).toBeUndefined();
    expect(sanitized.token).toBeUndefined();
    expect(sanitized.password).toBeUndefined();
    expect(sanitized.passwordHash).toBeUndefined();
    expect(sanitized.__v).toBeUndefined();
    
    expect(sanitized.nested.title).toBe('Harvester Machine #1');
    expect(sanitized.nested._id).toBeUndefined();
    expect(sanitized.nested.owner).toBeUndefined();
    expect(sanitized.nested.jwt).toBeUndefined();
  });
});
