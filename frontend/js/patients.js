/**
 * Patient Records Page Controller - Search, Sorting, Pagination
 */

document.addEventListener('DOMContentLoaded', () => {
  const patientsTableBody = document.getElementById('patientsTableBody');
  if (!patientsTableBody) return;

  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const limitSelect = document.getElementById('limitSelect');
  const paginationControls = document.getElementById('paginationControls');
  const recordCountInfo = document.getElementById('recordCountInfo');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const emptyState = document.getElementById('emptyState');

  // Modal elements
  const detailsModal = document.getElementById('detailsModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalToken = document.getElementById('modalToken');
  const modalName = document.getElementById('modalName');
  const modalAge = document.getElementById('modalAge');
  const modalMobile = document.getElementById('modalMobile');
  const modalSymptoms = document.getElementById('modalSymptoms');
  const modalDate = document.getElementById('modalDate');

  let state = {
    search: '',
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    order: 'DESC'
  };

  let searchTimeout = null;

  /**
   * Fetch and render patients
   */
  async function loadPatients() {
    // Show loading spinner
    loadingIndicator.classList.remove('hidden');
    patientsTableBody.classList.add('opacity-40');
    emptyState.classList.add('hidden');

    const response = await PatientAPI.getPatients(state);

    loadingIndicator.classList.add('hidden');
    patientsTableBody.classList.remove('opacity-40');

    if (response.success) {
      renderTable(response.data);
      renderPagination(response.page, response.totalPages, response.total);
      
      recordCountInfo.textContent = `Showing ${response.data.length} of ${response.total} patient records`;
      
      if (response.data.length === 0) {
        emptyState.classList.remove('hidden');
      }
    } else {
      Toast.error(response.message || 'Error loading patient records');
    }
  }

  /**
   * Render Table Rows
   */
  function renderTable(patients) {
    patientsTableBody.innerHTML = '';

    patients.forEach(patient => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-700/50 hover:bg-slate-800/60 transition-colors';

      const dateObj = new Date(patient.created_at);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const formattedTime = dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center justify-center px-3 py-1 text-sm font-bold text-teal-300 bg-teal-950/80 border border-teal-500/30 rounded-full font-mono-token shadow-sm">
            #${patient.token}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
              ${patient.patient_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-100">${escapeHtml(patient.patient_name)}</p>
              <p class="text-xs text-slate-400">ID: OP-${patient.id}</p>
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
          ${patient.age} yrs
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
          <span class="font-mono text-xs text-cyan-300 bg-slate-800 px-2 py-1 rounded border border-slate-700">
            ${escapeHtml(patient.mobile)}
          </span>
        </td>
        <td class="px-6 py-4 text-sm text-slate-300 max-w-xs truncate" title="${escapeHtml(patient.symptoms)}">
          ${escapeHtml(patient.symptoms)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
          <div class="font-medium text-slate-200">${formattedDate}</div>
          <div class="text-slate-500">${formattedTime}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
          <button data-token="${patient.token}" class="view-btn px-3 py-1.5 text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg transition-colors inline-flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            View
          </button>
        </td>
      `;

      patientsTableBody.appendChild(tr);
    });

    // Attach click handlers to View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const token = e.currentTarget.getAttribute('data-token');
        openDetailsModal(token);
      });
    });
  }

  /**
   * Render Pagination Buttons
   */
  function renderPagination(currentPage, totalPages, totalItems) {
    paginationControls.innerHTML = '';
    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.className = `px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
      currentPage === 1 
        ? 'border-slate-800 text-slate-600 cursor-not-allowed' 
        : 'border-slate-700 text-slate-300 hover:bg-slate-800'
    }`;
    prevBtn.innerHTML = '← Prev';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (state.page > 1) {
        state.page--;
        loadPatients();
      }
    });
    paginationControls.appendChild(prevBtn);

    // Page Number Buttons
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
          i === currentPage
            ? 'bg-teal-600 text-white font-bold shadow-md'
            : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
        }`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
          state.page = i;
          loadPatients();
        });
        paginationControls.appendChild(pageBtn);
      } else if (
        (i === 2 && currentPage > 3) ||
        (i === totalPages - 1 && currentPage < totalPages - 2)
      ) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'px-1 text-slate-500 text-xs self-center';
        ellipsis.textContent = '...';
        paginationControls.appendChild(ellipsis);
      }
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = `px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
      currentPage === totalPages 
        ? 'border-slate-800 text-slate-600 cursor-not-allowed' 
        : 'border-slate-700 text-slate-300 hover:bg-slate-800'
    }`;
    nextBtn.innerHTML = 'Next →';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (state.page < totalPages) {
        state.page++;
        loadPatients();
      }
    });
    paginationControls.appendChild(nextBtn);
  }

  /**
   * Open Patient Details Modal
   */
  async function openDetailsModal(token) {
    const response = await PatientAPI.getPatientByToken(token);
    if (response.success) {
      const patient = response.data;
      if (modalToken) modalToken.textContent = `#${patient.token}`;
      if (modalName) modalName.textContent = patient.patient_name;
      if (modalAge) modalAge.textContent = `${patient.age} Years Old`;
      if (modalMobile) modalMobile.textContent = patient.mobile;
      if (modalSymptoms) modalSymptoms.textContent = patient.symptoms;
      if (modalDate) {
        const dateObj = new Date(patient.created_at);
        modalDate.textContent = dateObj.toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'medium'
        });
      }

      if (detailsModal) detailsModal.classList.remove('hidden');
    } else {
      Toast.error(response.message || 'Could not fetch patient details');
    }
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (detailsModal) detailsModal.classList.add('hidden');
    });
  }

  if (detailsModal) {
    detailsModal.addEventListener('click', (e) => {
      if (e.target === detailsModal) {
        detailsModal.classList.add('hidden');
      }
    });
  }

  /**
   * Search Input Event Listener (Debounced)
   */
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.search = e.target.value;
        state.page = 1; // Reset to page 1 on search change
        loadPatients();
      }, 300);
    });
  }

  /**
   * Sort Dropdown Handler
   */
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'newest') {
        state.sortBy = 'created_at';
        state.order = 'DESC';
      } else if (val === 'oldest') {
        state.sortBy = 'created_at';
        state.order = 'ASC';
      } else if (val === 'token_asc') {
        state.sortBy = 'token';
        state.order = 'ASC';
      } else if (val === 'token_desc') {
        state.sortBy = 'token';
        state.order = 'DESC';
      } else if (val === 'name_asc') {
        state.sortBy = 'patient_name';
        state.order = 'ASC';
      }
      state.page = 1;
      loadPatients();
    });
  }

  /**
   * Limit Per Page Handler
   */
  if (limitSelect) {
    limitSelect.addEventListener('change', (e) => {
      state.limit = parseInt(e.target.value, 10);
      state.page = 1;
      loadPatients();
    });
  }

  /**
   * Utility - Escape HTML to prevent XSS
   */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Load
  loadPatients();
});
