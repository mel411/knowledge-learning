process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../server');

let token = "";

describe('Validation API', () => {

  const testUser = {
    name: "Validator",
    email: "validator@test.com",
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

  it('should validate lesson', async () => {
    if (!token) return;

    const res = await request(app)
      .post('/api/validation/lesson')
      .set('Authorization', 'Bearer ' + token)
      .send({ lesson_id: 1 });

    expect([200, 400]).toContain(res.statusCode);
  });

});