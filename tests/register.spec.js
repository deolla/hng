const request = require('supertest');
const app = require('../src/server');
const db = require('../src/database/db');


beforeAll(async () => {
  await db.migrate.latest();
});

// After all tests, clean up the database
afterAll(async () => {
  await db.migrate.rollback();
  await db.destroy();
});

describe('POST /auth/register', () => {
  it('should register user successfully with default organisation', async () => {
    const userData = {
      firstName: 'J',
      lastName: 'e',
      email: 'je@example.com',
      password: 'whatsup23456',
      phone: '+213546789'
    };

    // Perform the registration request
    const response = await request(app)
      .post('/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('firstName', 'J');
    expect(response.body.user).toHaveProperty('lastName', 'e');
    expect(response.body.user).toHaveProperty('email', 'je@example.com');
    expect(response.body.user).toHaveProperty('organisation', "J's Organisation");
    expect(response.body).toHaveProperty('token');
  });
});
