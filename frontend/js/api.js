/**
 * Hospital Management System - API Helper Module
 */

const API_BASE_URL = window.location.origin.includes('5000') 
  ? '/api' 
  : 'http://localhost:5000/api';

/**
 * Global Toast Notification Controller
 */
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'success', duration = 4000) {
    this.init();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' 
      ? '<svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
      : '<svg class="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
    
    toast.innerHTML = `
      ${icon}
      <span class="text-sm font-medium text-slate-100">${message}</span>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); }
};

/**
 * Generic API Fetch Handler
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || 'An error occurred while communicating with the server.';
      return { success: false, status: response.status, data, message: errorMsg, errors: data.errors };
    }

    return { success: true, ...data };
  } catch (error) {
    console.error('API Request Error:', error);
    Toast.error('Network error. Please check if the backend server is running.');
    return { success: false, message: 'Network connection failed' };
  }
}

/**
 * API Service Methods
 */
const PatientAPI = {
  // Register Patient
  registerPatient: (patientData) => apiRequest('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData)
  }),

  // Get Paginated Patients List
  getPatients: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/patients?${query}`);
  },

  // Get Patient by Token
  getPatientByToken: (token) => apiRequest(`/patients/${token}`),

  // Get Dashboard Stats
  getStats: () => apiRequest('/stats')
};

window.Toast = Toast;
window.PatientAPI = PatientAPI;
