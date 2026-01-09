import { createApp } from '../../src/app';
import request from 'supertest';
const app = createApp();

describe('intro', () => {
  it('Sucess hello world', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.type).toBe('text/html')
    expect(response.text).toBe('Hello world')
  });
});
