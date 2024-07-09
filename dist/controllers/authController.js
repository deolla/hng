const bcrypt = require('bcrypt');
const {
  v4: uuidv4
} = require('uuid');
const jwt = require('jsonwebtoken');
const userSchema = require('../schema/user');
const {
  generateVerificationToken
} = require('../services/verificationToken');
const {
  sendVerificationEmail
} = require('../services/emailvalidation');
const {
  generateToken
} = require('../utils/auth');
const db = require('../database/db');
const dotenv = require('dotenv');
dotenv.config();
const register = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone
  } = req.body;
  if (!firstName || !lastName || !email || !password || !phone) {
    return res.status(400).json({
      message: "All fields are required for registration"
    });
  }
  try {
    console.log("Validating user input...");
    await userSchema.validate({
      firstName,
      lastName,
      email,
      password,
      phone
    }, {
      abortEarly: false
    });
    console.log("Checking if user already exists...");
    const existingUser = await db("users").where("email", email).first();
    if (existingUser) {
      return res.status(409).json({
        status: "Bad request",
        message: "Email already in use"
      });
    }
    console.log("Hashing password...");
    const hashpass = await bcrypt.hash(password, 10);
    await db.transaction(async trx => {
      const userId = uuidv4();
      await trx("users").insert({
        userId,
        firstName,
        lastName,
        email,
        password: hashpass,
        phone
      });
      console.log("Creating default organisation...");
      await trx("organisations").insert({
        name: `${firstName}'s Organisation`,
        description: `${firstName}'s default organisation`
      });
      const verificationToken = generateVerificationToken();
      console.log("Sending verification email...");
      await sendVerificationEmail(email, verificationToken);
      const token = jwt.sign({
        userId,
        email
      }, process.env.BATTLE_GROUND, {
        expiresIn: "24h"
      });
      console.log("Registration successful...");
      return res.status(201).json({
        status: "success",
        message: "Registration successful",
        data: {
          accessToken: token,
          user: {
            userId,
            firstName,
            lastName,
            email,
            phone
          }
        }
      });
    });
  } catch (err) {
    console.error(`Registration Error: ${err}`);
    if (err.name === "ValidationError") {
      const validationErrors = err.inner.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(422).json({
        message: "Validation failed",
        errors: validationErrors
      });
    } else if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "User already exists"
      });
    }
    return res.status(400).json({
      status: "Bad Request",
      message: "Registration unsuccessful",
      statusCode: 400
    });
  }
};
const login = async (req, res) => {
  const {
    email,
    password
  } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required for login"
    });
  }
  try {
    const user = await db("users").where("email", email).first();
    if (!user) {
      return res.status(404).json({
        status: "Not Found",
        message: "User not found"
      });
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.status(401).json({
        status: "Unauthorized",
        message: "Invalid email or password"
      });
    }
    const accessToken = generateToken({
      userId: user.userId,
      email: user.email
    });
    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        accessToken: accessToken,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        }
      }
    });
  } catch (err) {
    console.error(`Login Error: ${err}`);
    return res.status(400).json({
      status: "Bad Request",
      message: "Login unsuccessful",
      statusCode: 400
    });
  }
};
const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({
      status: "success",
      message: "Logout successful"
    });
  } catch (err) {
    console.error(`Logout Error: ${err}`);
    return res.status(400).json({
      status: "Bad Request",
      message: "Logout unsuccessful",
      statusCode: 400
    });
  }
};
module.exports = {
  register,
  login,
  logout
};