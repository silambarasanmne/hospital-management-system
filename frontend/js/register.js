/**
 * Patient Registration Form Handler & Client-side Validation
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm');
  if (!form) return;

  const patientNameInput = document.getElementById('patient_name');
  const ageInput = document.getElementById('age');
  const mobileInput = document.getElementById('mobile');
  const symptomsInput = document.getElementById('symptoms');
  const submitBtn = document.getElementById('submitBtn');
  const submitSpinner = document.getElementById('submitSpinner');
  const submitBtnText = document.getElementById('submitBtnText');

  const tokenDisplayCard = document.getElementById('tokenDisplayCard');
  const generatedTokenElem = document.getElementById('generatedToken');
  const registeredPatientNameElem = document.getElementById('registeredPatientName');
  const registeredMobileElem = document.getElementById('registeredMobile');
  const registeredDateElem = document.getElementById('registeredDate');

  /**
   * Field Validation Rules
   */
  const validateName = (value) => {
    if (!value || !value.trim()) return 'Patient Name is required';
    if (value.trim().length < 3) return 'Patient Name must be at least 3 characters';
    if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Alphabets and spaces only';
    return '';
  };

  const validateAge = (value) => {
    if (value === '' || value === null || value === undefined) return 'Age is required';
    const ageNum = Number(value);
    if (isNaN(ageNum) || !Number.isInteger(ageNum)) return 'Must be a valid number';
    if (ageNum < 0 || ageNum > 120) return 'Age must be between 0 and 120';
    return '';
  };

  const validateMobile = (value) => {
    if (!value || !value.trim()) return 'Mobile Number is required';
    if (!/^\d{10}$/.test(value.trim())) return 'Mobile Number must be exactly 10 digits';
    return '';
  };

  const validateSymptoms = (value) => {
    if (!value || !value.trim()) return 'Issues / Symptoms is required';
    if (value.trim().length < 5) return 'Minimum 5 characters required';
    return '';
  };

  /**
   * Display or Clear Field Error
   */
  const setFieldError = (fieldId, errorMessage) => {
    const inputElem = document.getElementById(fieldId);
    const errorElem = document.getElementById(`${fieldId}_error`);

    if (!inputElem || !errorElem) return;

    if (errorMessage) {
      inputElem.classList.add('is-invalid');
      errorElem.innerHTML = `
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>${errorMessage}</span>
      `;
      errorElem.classList.remove('hidden');
    } else {
      inputElem.classList.remove('is-invalid');
      errorElem.innerHTML = '';
      errorElem.classList.add('hidden');
    }
  };

  /**
   * Real-time Validation Listeners
   */
  patientNameInput.addEventListener('input', () => {
    setFieldError('patient_name', validateName(patientNameInput.value));
  });

  ageInput.addEventListener('input', () => {
    setFieldError('age', validateAge(ageInput.value));
  });

  // Limit mobile to digits only
  mobileInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFieldError('mobile', validateMobile(mobileInput.value));
  });

  symptomsInput.addEventListener('input', () => {
    setFieldError('symptoms', validateSymptoms(symptomsInput.value));
  });

  /**
   * Form Submit Event Handler
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Perform comprehensive validation
    const nameError = validateName(patientNameInput.value);
    const ageError = validateAge(ageInput.value);
    const mobileError = validateMobile(mobileInput.value);
    const symptomsError = validateSymptoms(symptomsInput.value);

    setFieldError('patient_name', nameError);
    setFieldError('age', ageError);
    setFieldError('mobile', mobileError);
    setFieldError('symptoms', symptomsError);

    if (nameError || ageError || mobileError || symptomsError) {
      Toast.error('Please fix the errors in the form before submitting.');
      return;
    }

    // Set loading UI state
    submitBtn.disabled = true;
    if (submitSpinner) submitSpinner.classList.remove('hidden');
    if (submitBtnText) submitBtnText.textContent = 'Generating Token...';

    const payload = {
      patient_name: patientNameInput.value.trim(),
      age: parseInt(ageInput.value.trim(), 10),
      mobile: mobileInput.value.trim(),
      symptoms: symptomsInput.value.trim()
    };

    const response = await PatientAPI.registerPatient(payload);

    // Reset button state
    submitBtn.disabled = false;
    if (submitSpinner) submitSpinner.classList.add('hidden');
    if (submitBtnText) submitBtnText.textContent = 'Generate Patient Token';

    if (response.success) {
      Toast.success('Patient Registered Successfully! Token Issued.');

      // Display the token result prominently
      if (generatedTokenElem) generatedTokenElem.textContent = response.token;
      if (registeredPatientNameElem) registeredPatientNameElem.textContent = response.data.patient_name;
      if (registeredMobileElem) registeredMobileElem.textContent = response.data.mobile;
      if (registeredDateElem) {
        const date = new Date(response.data.created_at || Date.now());
        registeredDateElem.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString();
      }

      if (tokenDisplayCard) {
        tokenDisplayCard.classList.remove('hidden');
        tokenDisplayCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Clear the form fields after submission while keeping generated token visible
      form.reset();
      
      // Clear validation styles
      ['patient_name', 'age', 'mobile', 'symptoms'].forEach(fieldId => {
        setFieldError(fieldId, '');
      });

    } else {
      if (response.errors) {
        Object.keys(response.errors).forEach(fieldId => {
          setFieldError(fieldId, response.errors[fieldId]);
        });
      }
      Toast.error(response.message || 'Failed to register patient');
    }
  });
});
