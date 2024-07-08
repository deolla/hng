const express = require('express');
const {
  getOrganisations,
  getOrganisationById,
  createOrganisation,
  addUserToOrganisation
} = require('../controllers/organisationController');
const {
  authenticate
} = require('../utils/auth');
const router = express.Router();

// Route to get organisations (protected)
router.get('/organisations', authenticate, getOrganisations);
router.get('/organisations/:orgId', authenticate, getOrganisationById);
router.post('/organisations', authenticate, createOrganisation);
router.post('/organisations/:orgId/users', authenticate, addUserToOrganisation);
module.exports = router;