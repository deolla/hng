const jwt = require('jsonwebtoken');
const { authenticate } = require('../src/utils/auth');
const {
  getOrganisations,
  getOrganisationById,
} = require('../src/controllers/organisationController');
const db = require('../src/database/db');
const { v4:uuidv4 } = require('uuid');
const knex = require('knex');
const app = require('../src/server.js');
const request = require('supertest');
const { generateToken } = require('../src/utils/auth');
//const Config = require('../src/database/knexfile.js');
// Remove the incorrect const
// const { describe } = require('../src/schema/organisation.js";

jest.mock('../src/database/db')


describe("Token Generation", () => {
  let userId = uuidv4();
  it("should generate a token with correct expiry time and user details", () => {
    const user = { userId: userId, email: "test@example.com" };
    const token = jwt.sign(user, process.env.BATTLE_GROUND, {
      expiresIn: "1h",
    });

    const decoded = jwt.verify(token, process.env.BATTLE_GROUND);
    expect(decoded.userId).toEqual(user.userId);
    expect(decoded.email).toEqual(user.email);
    expect(decoded.exp).toBeDefined();
  });
});

describe('Organisation Access Control', () => {
  it('should return organisations for the authenticated user', async () => {
    const req = {
      user: { userId: '123' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockOrganisations = [
      { orgId: '1', name: 'Org 1', description: 'Description 1' },
      { orgId: '2', name: 'Org 2', description: 'Description 2' },
    ];

    db.mockImplementation(() => ({
      select: () => ({
        join: () => ({
          where: jest.fn().mockResolvedValue(mockOrganisations),
        }),
      }),
    }));

    await getOrganisations(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: { organisations: mockOrganisations },
    });
  });
  it('should return 400 if user ID is missing', async () => {
    const req = {
      user: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getOrganisations(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'User ID is missing',
    });
  });
  it('should not return organisations the user does not have access to', async () => {
    const req = {
      user: { userId: '123' },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockOrganisations = [
      { orgId: '1', name: 'Org 1', description: 'Description 1' },
    ];

    db.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      join: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue(mockOrganisations),
    });

    await getOrganisations(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: { organisations: mockOrganisations },
    });
  });
});