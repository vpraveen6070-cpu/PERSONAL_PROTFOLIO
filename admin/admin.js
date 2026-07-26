/* ==========================================
   ADMIN.JS - Admin Panel Logic
   ========================================== */

'use strict';

function getSafeArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

// =============================================
// AUTHENTICATION
// =============================================
const DEFAULT_PASSWORD = 'praveen123';

function getAdminPassword() {
  return localStorage.getItem('admin-password') || DEFAULT_PASSWORD;
}

document.getElementById('admin-login-btn')?.addEventListener('click', () => {
  const pwd = document.getElementById('admin-password').value;
  if (pwd === getAdminPassword()) {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'grid';
    initAdmin();
  } else {
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('admin-password').style.borderColor = '#ef4444';
  }
});

document.getElementById('admin-password')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('admin-login-btn').click();
});

document.getElementById('pwd-toggle')?.addEventListener('click', function() {
  const pwdInput = document.getElementById('admin-password');
  const type = pwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
  pwdInput.setAttribute('type', type);
  this.classList.toggle('visible');
  
  // Update icon for visual feedback
  if (type === 'text') {
    this.innerHTML = `
      <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    `;
  } else {
    this.innerHTML = `
      <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    `;
  }
});

document.getElementById('admin-logout')?.addEventListener('click', () => {
  window.location.href = '../index.html';
});

// =============================================
// TAB SWITCHING
// =============================================
function switchTab(tabName) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById('tab-' + tabName)?.classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  document.getElementById('admin-page-title').textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);
}

document.querySelectorAll('.admin-nav-link[data-tab]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab(link.getAttribute('data-tab'));
  });
});

window.switchTab = switchTab;

// =============================================
// DATETIME
// =============================================
function updateDateTime() {
  const el = document.getElementById('admin-datetime');
  if (el) el.textContent = new Date().toLocaleString('en-IN');
}
setInterval(updateDateTime, 1000);
updateDateTime();

// =============================================
// STATS
// =============================================
async function updateStats() {
  if (!window.PortfolioUpload) return;
  const certs = await window.PortfolioUpload.Storage.get('portfolio-certs');
  const projects = await window.PortfolioUpload.Storage.get('portfolio-projects');

  const certCountEl = document.getElementById('cert-count');
  if (certCountEl) certCountEl.textContent = certs.length;

  const projCountEl = document.getElementById('project-count');
  if (projCountEl) projCountEl.textContent = projects.length;

  const resume = localStorage.getItem('portfolio-resume');
  const resumeStat = document.getElementById('resume-status-text');
  if (resumeStat) {
    resumeStat.textContent = resume ? 'ON' : 'OFF';
    resumeStat.style.color = resume ? 'var(--accent-1)' : '#ef4444';
  }

  const messages = await window.PortfolioUpload.Storage.get('portfolio-messages');
  const msgCountEl = document.getElementById('message-count');
  if (msgCountEl) msgCountEl.textContent = messages.length;
}

// =============================================
// CERTIFICATES MANAGEMENT
// =============================================
async function renderAdminCerts() {
  if (!window.PortfolioUpload) return;
  const certs = window.PortfolioUpload.getCerts ? await window.PortfolioUpload.getCerts() : await window.PortfolioUpload.Storage.get('portfolio-certs');
  const list = document.getElementById('admin-certs-list');
  if (!list) return;

  if (!certs || certs.length === 0) {
    list.innerHTML = '<p style="color:var(--text-secondary);font-size:0.9rem;">No certificates added yet.</p>';
    return;
  }

  list.innerHTML = certs.map(cert => {
    let thumbContent = '🏅';
    if (cert.icon) {
      thumbContent = `<span style="font-size:1.5rem;">${cert.icon}</span>`;
    } else if (cert.type === 'application/pdf') {
      thumbContent = '📄';
    } else if (cert.file) {
      thumbContent = `<img src="${cert.file}" style="width:100%;height:100%;object-fit:cover;" alt="${cert.name}">`;
    }

    return `
      <div class="admin-item-card" data-id="${cert.id}">
        <div class="admin-item-thumb-placeholder">
          ${thumbContent}
        </div>
        <div class="admin-item-info">
          <div class="admin-item-name">${cert.name}</div>
        </div>
        <button class="admin-item-delete" onclick="window.deleteCert('${cert.id}')">✕ Delete</button>
      </div>
    `;
  }).join('');
}

async function deleteCert(id) {
  if (confirm('Delete this certificate?')) {
    if (!window.PortfolioUpload) return;
    await window.PortfolioUpload.Storage.remove('portfolio-certs', id);
    await renderAdminCerts();
    await updateStats();
    if (window.PortfolioUpload.renderUploadedCerts) {
      await window.PortfolioUpload.renderUploadedCerts();
    }
    showAdminToast('Certificate deleted');
  }
}
window.deleteCert = deleteCert;

// =============================================
// MESSAGES MANAGEMENT
// =============================================
async function renderAdminMessages() {
  if (!window.PortfolioUpload) return;
  const messages = await window.PortfolioUpload.Storage.get('portfolio-messages');
  const list = document.getElementById('admin-messages-list');
  if (!list) return;

  if (messages.length === 0) {
    list.innerHTML = '<p style="color:var(--text-secondary);font-size:0.9rem;">No messages yet.</p>';
    return;
  }

  list.innerHTML = messages.map(msg => `
    <div class="admin-item-card message-item" data-id="${msg.id}" style="display:block; padding:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
        <div>
          <div class="admin-item-name" style="font-size:1.1rem; color:var(--accent-1);">${msg.name}</div>
          <div style="font-size:0.85rem; color:var(--text-secondary);">${msg.email}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.75rem; color:var(--text-secondary);">${new Date(msg.date).toLocaleString()}</div>
          <button class="admin-item-delete" onclick="deleteMessage('${msg.id}')" style="margin-top:0.5rem;">✕ Delete</button>
        </div>
      </div>
      <div style="margin-bottom:0.8rem;">
        <strong style="font-size:0.9rem; color:var(--text-primary);">Subject:</strong> 
        <span style="font-size:0.9rem; color:var(--text-secondary);">${msg.subject || '(No Subject)'}</span>
      </div>
      <div class="message-content" style="background: rgba(255,255,255,0.03); padding:1rem; border-radius:8px; font-size:0.9rem; line-height:1.6; color:var(--text-primary); border: 1px solid rgba(255,255,255,0.05);">
        ${msg.message.replace(/\n/g, '<br>')}
      </div>
    </div>
  `).join('');
}

async function deleteMessage(id) {
  if (confirm('Delete this message?')) {
    if (!window.PortfolioUpload) return;
    await window.PortfolioUpload.Storage.remove('portfolio-messages', id);
    await renderAdminMessages();
    await updateStats();
    showAdminToast('Message deleted');
  }
}
window.deleteMessage = deleteMessage;

// Cert upload handler
function setupCertUpload() {
  const zone = document.getElementById('cert-drop-zone');
  const fileInput = document.getElementById('cert-file-input');
  if (!zone || !fileInput || !window.PortfolioUpload) return;

  zone.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target !== fileInput) {
      fileInput.click();
    }
  });
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', async (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    await processCertFiles(Array.from(e.dataTransfer.files));
  });

  fileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await processCertFiles(Array.from(e.target.files));
      fileInput.value = '';
    }
  });
}

async function processCertFiles(files) {
  if (window.PortfolioUpload) {
    const results = await window.PortfolioUpload.handleCertUpload(files, 'General');
    if (results.length > 0) {
      await renderAdminCerts();
      await updateStats();
      if (window.PortfolioUpload.renderUploadedCerts) {
        await window.PortfolioUpload.renderUploadedCerts();
      }
      showAdminToast(`${results.length} certificate(s) uploaded!`);
    }
  }
}

// =============================================
// RESUME MANAGEMENT
// =============================================
function renderAdminResume() {
  const resumeData = localStorage.getItem('portfolio-resume');
  const container = document.getElementById('admin-resume-status');
  if (!container) return;

  if (!resumeData) {
    container.innerHTML = '<p style="color:var(--text-secondary);font-size:0.9rem;">No custom resume uploaded. Using default file.</p>';
    return;
  }

  const resume = JSON.parse(resumeData);
  container.innerHTML = `
    <div class="admin-item-card" style="display:flex;align-items:center;padding:1rem;gap:1.5rem;">
      <div style="font-size:2rem;">📄</div>
      <div style="flex:1;">
        <div class="admin-item-name">${resume.name}</div>
        <div style="font-size:0.75rem;color:var(--text-secondary);">Uploaded on: ${new Date(resume.date).toLocaleDateString()}</div>
      </div>
      <button class="btn-secondary" style="border-color:#ef4444;color:#ef4444;" onclick="deleteResume()">🗑 Delete</button>
    </div>
  `;
}

function deleteResume() {
  if (confirm('Are you sure you want to delete the custom resume and revert to default?')) {
    localStorage.removeItem('portfolio-resume');
    renderAdminResume();
    updateStats();
    showAdminToast('Resume deleted - reverted to default');
  }
}
window.deleteResume = deleteResume;

function setupResumeUpload() {
  const zone = document.getElementById('resume-drop-zone');
  const fileInput = document.getElementById('resume-file-input');
  if (!zone || !fileInput || !window.PortfolioUpload) return;

  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', async (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      await processResumeFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', async (e) => {
    if (e.target.files.length > 0) {
      await processResumeFile(e.target.files[0]);
    }
    fileInput.value = '';
  });
}

async function processResumeFile(file) {
  if (window.PortfolioUpload) {
    const result = await window.PortfolioUpload.handleResumeUpload(file);
    if (result) {
      renderAdminResume();
      updateStats();
      showAdminToast('Resume uploaded successfully!');
    }
  }
}



// =============================================
// PROJECTS MANAGEMENT
// =============================================
async function renderAdminProjects() {
  if (!window.PortfolioUpload) return;
  const projects = window.PortfolioUpload.getProjects ? await window.PortfolioUpload.getProjects() : await window.PortfolioUpload.Storage.get('portfolio-projects');
  const list = document.getElementById('admin-projects-list');
  if (!list) return;

  if (projects.length === 0) {
    list.innerHTML = '<p style="color:var(--text-secondary);font-size:0.9rem;">No projects added yet.</p>';
    return;
  }

  list.innerHTML = projects.map(p => `
    <div class="admin-item-card">
      <div class="admin-item-thumb-placeholder">${p.icon || '💻'}</div>
      <div class="admin-item-info">
        <div class="admin-item-name">${p.title}</div>
        <div class="admin-item-category">${p.tech || ''}</div>
      </div>
      <button class="admin-item-delete" onclick="window.deleteProject('${p.id}')">✕ Delete</button>
    </div>
  `).join('');
}

document.getElementById('add-project-btn')?.addEventListener('click', async () => {
  const title = document.getElementById('proj-title').value.trim();
  const desc = document.getElementById('proj-desc').value.trim();
  const tech = document.getElementById('proj-tech').value.trim();
  const github = document.getElementById('proj-github').value.trim();
  const demo = document.getElementById('proj-demo').value.trim();

  if (!title) { showAdminToast('Project title is required', 'error'); return; }

  const project = { id: String(Date.now() + Math.floor(Math.random() * 1000000)), title, desc, tech, github, demo, icon: '💻' };
  if (!window.PortfolioUpload) return;
  await window.PortfolioUpload.Storage.add('portfolio-projects', project);

  await renderAdminProjects();
  await updateStats();
  if (window.PortfolioUpload.renderProjects) {
    await window.PortfolioUpload.renderProjects();
  }
  ['proj-title','proj-desc','proj-tech','proj-github','proj-demo'].forEach(id => {
    document.getElementById(id).value = '';
  });
  showAdminToast('Project added!');
});

async function deleteProject(id) {
  if (confirm('Delete this project?')) {
    if (!window.PortfolioUpload) return;
    await window.PortfolioUpload.Storage.remove('portfolio-projects', id);
    await renderAdminProjects();
    await updateStats();
    if (window.PortfolioUpload.renderProjects) {
      await window.PortfolioUpload.renderProjects();
    }
    showAdminToast('Project deleted');
  }
}
window.deleteProject = deleteProject;

// =============================================
// SETTINGS
// =============================================
document.getElementById('change-pwd-btn')?.addEventListener('click', () => {
  const current = document.getElementById('current-pwd').value;
  const newPwd = document.getElementById('new-pwd').value;

  if (current !== getAdminPassword()) { showAdminToast('Current password is wrong', 'error'); return; }
  if (newPwd.length < 4) { showAdminToast('Password too short', 'error'); return; }

  localStorage.setItem('admin-password', newPwd);
  document.getElementById('current-pwd').value = '';
  document.getElementById('new-pwd').value = '';
  showAdminToast('Password updated!');
});

async function exportData() {
  if (!window.PortfolioUpload) return;
  const data = {
    certs: await window.PortfolioUpload.Storage.get('portfolio-certs'),
    projects: await window.PortfolioUpload.Storage.get('portfolio-projects'),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'portfolio-data.json';
  a.click();
  showAdminToast('Data exported!');
}
window.exportData = exportData;

async function confirmClearData() {
  if (confirm('⚠ This will delete ALL uploaded certificates and projects. Are you sure?')) {
    if (!window.PortfolioUpload) return;
    // For clear all, we should probably clear both local and firestore if possible
    // But for now we focus on the main keys
    localStorage.removeItem('portfolio-certs');
    localStorage.removeItem('portfolio-projects');
    // Note: This won't clear entire Firestore collections, but is a safe start
    await renderAdminCerts();
    await renderAdminProjects();
    await updateStats();
    showAdminToast('Local data cleared');
  }
}
window.confirmClearData = confirmClearData;

// =============================================
// TOAST FOR ADMIN
// =============================================
function showAdminToast(message, type = 'success') {
  const existing = document.querySelector('.admin-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast admin-toast ' + type;
  toast.textContent = (type === 'success' ? '✅ ' : '❌ ') + message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
}

// =============================================
// INIT
// =============================================
async function initAdmin() {
  await updateStats();
  await renderAdminCerts();
  renderAdminResume();
  await renderAdminProjects();
  await renderAdminMessages();
  setupCertUpload();
  setupResumeUpload();
  // Ensure view toggle reflects current state on the newly visible dashboard
  syncViewToggleUI();
  
  // Apply saved theme
  const theme = localStorage.getItem('portfolio-theme') || 'neon';
  document.documentElement.setAttribute('data-theme', theme);
}

// =============================================
// VIEW TOGGLE LOGIC
// =============================================
const VIEW_MODES = {
  desktop: { name: 'Mobile View', icon: '📱' },
  mobile: { name: 'Desktop View', icon: '💻' }
};

function setViewMode(mode) {
  const body = document.body;
  if (mode === 'mobile') {
    body.classList.add('view-mobile');
  } else {
    body.classList.remove('view-mobile');
  }
  localStorage.setItem('portfolio-view-mode', mode);
  syncViewToggleUI();
}

function syncViewToggleUI() {
  const isMobile = document.body.classList.contains('view-mobile');
  const links = document.querySelectorAll('.view-toggle-link');
  const modeInfo = isMobile ? VIEW_MODES.mobile : VIEW_MODES.desktop;
  
  links.forEach(link => {
    link.innerHTML = `<span>${modeInfo.icon}${modeInfo.name}</span>`;
  });
}

function toggleViewMode() {
  const isMobile = document.body.classList.contains('view-mobile');
  setViewMode(isMobile ? 'desktop' : 'mobile');
}

function initViewToggle() {
  if (window.__viewToggleInitialized) return;
  window.__viewToggleInitialized = true;

  const savedMode = localStorage.getItem('portfolio-view-mode') || 'desktop';
  setViewMode(savedMode);

  // Delegation for all current and future links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.view-toggle-link');
    if (link) {
      e.preventDefault();
      e.stopPropagation();
      toggleViewMode();
    }
  });

  // Handle window resize - clean up simulation on small screens
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 1024) {
      document.body.classList.remove('view-mobile');
      syncViewToggleUI();
    }
  });
}

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
  const theme = localStorage.getItem('portfolio-theme') || 'neon';
  document.documentElement.setAttribute('data-theme', theme);
  initViewToggle();
});
