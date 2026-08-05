const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// REST API endpoints
router.post('/patients', patientController.registerPatient);
router.get('/patients', patientController.getPatients);
router.get('/patients/:token', patientController.getPatientByToken);
router.get('/stats', patientController.getStats);

module.exports = router;
