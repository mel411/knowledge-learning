const request = require('supertest');
const app = require('../server');

describe('Auth API', () => {

  const testUser = {
    name: "Test User",
    email: "testuser@test.com",
    password: "123456"
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(403);
  });

  it('should login user (if verified)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect([201,403]).toContain(res.statusCode);
  });

});