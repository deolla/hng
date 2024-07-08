const db = require('../database/db');
const userSchema = require('../schema/user');
const getUsers = async (req, res) => {
  try {
    const users = await db("users").select("*");
    res.status(200).json({
      status: 'success',
      message: 'Users fetched successfully',
      users
    });
  } catch (err) {
    console.error(`Error fetching Users: ${err}`);
    res.status(500).json({
      status: 'error',
      message: "Error getting users",
      error: err.message
    });
  }
};
const getuserInfoById = async (req, res) => {
  const {
    id
  } = req.params;
  const requestingUserId = req.user.userId; // Assuming authentication sets req.user

  try {
    // Fetch user data from database using Knex.js
    const user = await db('users').where('userId', id).first();
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Authorization check
    if (user.userId !== requestingUserId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to view this user record'
      });
    }
    await userSchema.validate(user);

    // Return user data
    res.json({
      status: 'success',
      message: 'User record retrieved successfully',
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user record'
    });
  }
};
module.exports = {
  getUsers,
  getuserInfoById
};