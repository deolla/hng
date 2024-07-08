const express = require('express');
const userController = require('../controllers/userController');
const {
  authenticate
} = require('../utils/auth');
const router = express.Router();
router.get('/users', authenticate, userController.getUsers);
router.get('/users/:id', authenticate, userController.getuserInfoById);
module.exports = router;