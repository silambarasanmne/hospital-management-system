require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const patientRoutes = require('./routes/patientRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api', patientRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Hospital Management System API is running' });
});

// Fallback to index.html for unknown HTML requests
app.get('*', (req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } else {
    res.status(404).json({ error: 'Endpoint not found' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🏥 Hospital Management Server running on port ${PORT}`);
  console.log(`🌐 Local Access: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
