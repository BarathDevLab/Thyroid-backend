import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

const run = async () => {
  const response = await request(app).post('/api/analyze');

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: 'No image provided' });

  console.log('analyze.test.ts passed');
};

run().catch((err) => {
  console.error('analyze.test.ts failed:', err);
  process.exitCode = 1;
});
