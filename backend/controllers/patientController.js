const PatientModel = require('../models/patientModel');

/**
 * Validate Patient Input Fields
 */
const validatePatientInput = ({ patient_name, age, mobile, symptoms }) => {
  const errors = {};

  // Patient Name
  if (!patient_name || typeof patient_name !== 'string' || !patient_name.trim()) {
    errors.patient_name = 'Patient Name is required';
  } else if (patient_name.trim().length < 3) {
    errors.patient_name = 'Patient Name must be at least 3 characters long';
  } else if (!/^[a-zA-Z\s]+$/.test(patient_name.trim())) {
    errors.patient_name = 'Patient Name must contain alphabets and spaces only';
  }

  // Age
  if (age === undefined || age === null || age === '') {
    errors.age = 'Age is required';
  } else {
    const ageNum = Number(age);
    if (isNaN(ageNum) || !Number.isInteger(ageNum)) {
      errors.age = 'Age must be a valid whole number';
    } else if (ageNum < 0 || ageNum > 120) {
      errors.age = 'Age must be between 0 and 120';
    }
  }

  // Mobile Number
  if (!mobile || typeof mobile !== 'string' || !mobile.trim()) {
    errors.mobile = 'Mobile Number is required';
  } else if (!/^\d{10}$/.test(mobile.trim())) {
    errors.mobile = 'Mobile Number must be exactly 10 digits';
  }

  // Symptoms / Issues
  if (!symptoms || typeof symptoms !== 'string' || !symptoms.trim()) {
    errors.symptoms = 'Issues / Symptoms is required';
  } else if (symptoms.trim().length < 5) {
    errors.symptoms = 'Issues / Symptoms must be at least 5 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Register Patient & Generate Token
 * POST /api/patients
 */
exports.registerPatient = (req, res) => {
  try {
    const { patient_name, age, mobile, symptoms } = req.body;

    const validation = validatePatientInput({ patient_name, age, mobile, symptoms });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const newPatient = PatientModel.create({
      patient_name: patient_name.trim(),
      age: Number(age),
      mobile: mobile.trim(),
      symptoms: symptoms.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      token: newPatient.token,
      data: newPatient
    });
  } catch (error) {
    console.error('Error registering patient:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while registering patient',
      error: error.message
    });
  }
};

/**
 * Get All Patients with Pagination, Search, and Sorting
 * GET /api/patients
 */
exports.getPatients = (req, res) => {
  try {
    const { search, page, limit, sortBy, order } = req.query;

    const result = PatientModel.findAll({
      search,
      page,
      limit,
      sortBy,
      order
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching patients',
      error: error.message
    });
  }
};

/**
 * Get Patient by Token Number
 * GET /api/patients/:token
 */
exports.getPatientByToken = (req, res) => {
  try {
    const { token } = req.params;

    if (!token || isNaN(Number(token))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token number parameter'
      });
    }

    const patient = PatientModel.findByToken(token);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `No patient found with token #${token}`
      });
    }

    return res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error fetching patient by token:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching patient record',
      error: error.message
    });
  }
};

/**
 * Get Summary Stats for Dashboard
 * GET /api/stats
 */
exports.getStats = (req, res) => {
  try {
    const stats = PatientModel.getStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching stats',
      error: error.message
    });
  }
};
