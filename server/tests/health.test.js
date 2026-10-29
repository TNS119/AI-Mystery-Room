import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Health Check API (§9.7)', () => {
  it('GET /api/health returns ok status and envelope', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status', 'ok');
    expect(res.body.data).toHaveProperty('db');
    expect(res.body.data).toHaveProperty('uptime');
  });

  it('GET /api/unknown-route returns 404 with error envelope', async () => {
    const res = await request(app).get('/api/unknown-route');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
