import { describe, it, expect, vi } from 'vitest';
import { xssClean, requestTimeout } from '../../../middleware/securityMiddleware.js';

describe('Security Middlewares', () => {
  it('should scrub HTML tags recursively from req.body, req.query, and req.params in xssClean', () => {
    const req = {
      body: {
        name: '<script>alert("xss")</script>Farmer Bob',
        nested: {
          comment: 'This is a <b>great</b> field!'
        }
      },
      query: {
        search: '<u>wheat</u>'
      },
      params: {
        id: 'some<tag>id'
      }
    };
    const res = {};
    const next = vi.fn();

    xssClean(req, res, next);

    expect(req.body.name).toBe('alert("xss")Farmer Bob');
    expect(req.body.nested.comment).toBe('This is a great field!');
    expect(req.query.search).toBe('wheat');
    expect(req.params.id).toBe('someid');
    expect(next).toHaveBeenCalled();
  });

  it('should call setTimeout on response in requestTimeout middleware', () => {
    const req = {};
    const res = {
      setTimeout: vi.fn()
    };
    const next = vi.fn();

    requestTimeout(req, res, next);

    expect(res.setTimeout).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
