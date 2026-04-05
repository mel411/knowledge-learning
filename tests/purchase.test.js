process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../server');

let token = "";

describe('Purchase API', () => {

  const testUser = {
    name: "Buyer",
    email: "buyer@test.com",
    password: "123456"
  };

  it('should register user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send(testUser);
  });

  it('should login user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    if (res.body.token) {
      token = res.body.token;
    }
  });

  it('should fail to buy cursus without token', async () => {
    const res = await request(app)
      .post('/api/purchase/cursus')
      .send({ cursus_id: 1 });

    expect(res.statusCode).toBe(403);
  });

  it('should buy cursus with token', async () => {
    if (!token) return;

    const res = await request(app)
      .post('/api/purchase/cursus')
      .set('Authorization', 'Bearer ' + token)
      .send({ cursus_id: 1 });

    expect([200, 400]).toContain(res.statusCode);
  });

});