/**
 * Hospital Management System - API Helper Module
 */

// Production Render API URL (Fallback for GitHub Pages or static files)
const RENDER_BACKEND_URL = 'https://hospital-management-system.onrender.com/api';

/**
 * Determine API Base URL intelligently:
 * 1. If running on Express server (localhost:5000 or on Render site), use relative '/api'
 * 2. If running via file:// or GitHub Pages, use live Render backend URL
 */
function getApiBaseUrl() {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  if (protocol === 'file:' || hostname.includes('github.io')) {
    return RENDER_BACKEND_URL;
  }
  
  return '/api';
}

const API_BASE_URL = getApiBaseUrl();

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

  show(message, type = 'success', duration = 4500) {
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
 * Generic API Fetch Handler with Auto-Retry for Render Free Tier Sleep
 */
async function apiRequest(endpoint, options = {}, retries = 2) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || 'An error occurred while communicating with the server.';
        return { success: false, status: response.status, data, message: errorMsg, errors: data.errors };
      }

      return { success: true, ...data };
    } catch (error) {
      console.warn(`API Request attempt ${attempt + 1} failed for ${url}:`, error);
      
      if (attempt < retries) {
        Toast.show('Connecting to server... (Render instance may be waking up)', 'error', 3000);
        // Wait 3 seconds before retrying to allow Render free instance to spin up
        await new Promise(res => setTimeout(res, 3000));
      } else {
        Toast.error('Network connection error. If using Render, please wait 30 seconds for the free server to wake up and refresh.');
        return { success: false, message: 'Network connection failed' };
      }
    }
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
