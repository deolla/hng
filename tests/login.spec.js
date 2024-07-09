const request = require('supertest');
const app = require('../src/server'); // Adjust path as necessary
const db = require('../src/database/db'); // Adjust path as necessary
const bcrypt = require('bcrypt');
//const { generateToken } = require('../src/auth/tokenService'); // Adjust path as necessary

describe('POST /auth/login', () => {
  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('testPassword123', 10); // Hashing password for testing
    await db('users').insert({
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: passwordHash,
      phone: '+123456789'
    });
  });

  afterAll(async () => {
    // Perform any teardown tasks after running the tests
    // For example, removing the test user from the database
    await db('users').where('email', 'johndoe@example.com').del();
  });

  it('should log in user with correct credentials', async () => {
    const userData = {
      email: 'johndoe@example.com',
      password: 'testPassword123'
    };

    const response = await request(app)
      .post('/auth/login')
      .send(userData)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.user.firstName).toBe('John');
    // Add more assertions as needed for user details
  });

  it('should return 401 for incorrect password', async () => {
    const userData = {
      email: 'johndoe@example.com',
      password: 'wrongPassword'
    };

    const response = await request(app)
      .post('/auth/login')
      .send(userData)
      .expect(401);

    expect(response.body.status).toBe('Unauthorized');
    expect(response.body.message).toBe('Invalid email or password');
  });

  it('should return 404 for non-existent user', async () => {
    const userData = {
      email: 'nonexistent@example.com',
      password: 'testPassword123'
    };

    const response = await request(app)
      .post('/auth/login')
      .send(userData)
      .expect(404);

    expect(response.body.status).toBe('Not Found');
    expect(response.body.message).toBe('User not found');
  });
  it('should return 400 for missing email or password', async () => {
    const userData = {}; // Empty object for missing email and password

    const response = await request(app)
      .post('/auth/login')
      .send(userData)
      .expect(400);

      expect(response.body).toBeDefined();
      expect(response.body.status).toBe();
      expect(response.body.message).toBe('All fields are required for login');
  });
});
