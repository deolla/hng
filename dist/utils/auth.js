const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: 'Access denied, no token provided'
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.BATTLE_GROUND);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Invalid token for user:', req.user, 'Error:', error.message);
    return res.status(401).json({
      message: 'Invalid token'
    });
  }
};
const generateToken = user => {
  const payload = {
    userId: user.userId,
    email: user.email
  };
  const options = {
    expiresIn: '1h'
  };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
};
module.exports = {
  authenticate,
  generateToken
};