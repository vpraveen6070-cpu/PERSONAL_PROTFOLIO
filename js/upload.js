/* ==========================================
   UPLOAD.JS - Gallery, Certificates, Videos
   Admin content management (localStorage)
   ========================================== */

'use strict';

// =============================================
// STORAGE UTILITIES (Firestore + LocalStorage Fallback)
// =============================================
let db = null;

// Initialize Firebase if config is valid
if (typeof firebase !== 'undefined' && window.firebaseConfig && window.firebaseConfig.apiKey !== 'YOUR_API_KEY') {
  try {
    firebase.initializeApp(window.firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase initialized successfully! 🔥");
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
}

const Storage = {
  get: async (key) => {
    let localData = [];
    try {
      localData = JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      localData = [];
    }

    if (db) {
      try {
        const snapshot = await db.collection(key).get();
        const firestoreDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (firestoreDocs.length > 0) {
          localStorage.setItem(key, JSON.stringify(firestoreDocs));
          return firestoreDocs;
        } else if (localData.length > 0) {
          // If Firestore is empty, auto-push local items to Cloud Firestore
          for (const item of localData) {
            if (item && item.id) {
              db.collection(key).doc(String(item.id)).set(item).catch(console.warn);
            }
          }
          return localData;
        }
      } catch (err) {
        console.warn("Firestore fetch error, falling back to localStorage:", err);
      }
    }
    return localData;
  },
  
  set: async (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
    if (db) {
      try {
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item && item.id) {
              await db.collection(key).doc(String(item.id)).set(item);
            }
          }
        } else if (typeof data === 'object' && data !== null) {
          await db.collection(key).doc(data.id || 'single').set(data);
        }
      } catch (err) {
        console.warn("Firestore set error:", err);
      }
    }
  },
  
  add: async (key, item) => {
    item.id = String(item.id || (Date.now() + Math.floor(Math.random() * 1000000)));

    const arr = JSON.parse(localStorage.getItem(key)) || [];
    if (!arr.some(i => String(i.id) === String(item.id))) {
      arr.unshift(item);
      try {
        localStorage.setItem(key, JSON.stringify(arr));
      } catch (quotaErr) {
        console.error("Storage quota exceeded:", quotaErr);
        if (window.showAdminToast) {
          window.showAdminToast("Storage full! Remove older files to add more.", "error");
        }
        return null;
      }
    }

    if (db && (key === 'portfolio-certs' || key === 'portfolio-projects' || key === 'portfolio-videos' || key === 'portfolio-messages')) {
      try {
        await db.collection(key).doc(item.id).set(item);
        console.log(`Saved ${key}/${item.id} to Firestore 🔥`);
      } catch (err) {
        console.warn("Firestore add error (saved to localStorage):", err);
      }
    }
    return item;
  },
  
  remove: async (key, id) => {
    const stringId = String(id);
    const arr = (JSON.parse(localStorage.getItem(key)) || []).filter(i => String(i.id) !== stringId);
    localStorage.setItem(key, JSON.stringify(arr));

    if (db) {
      try {
        await db.collection(key).doc(stringId).delete();
        console.log(`Deleted ${key}/${stringId} from Firestore 🔥`);
      } catch (err) {
        console.warn("Firestore delete error:", err);
      }
    }
    return arr;
  },
};

// =============================================
// IMAGE COMPRESSION & FILE READER UTILITIES
// =============================================
function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    if (!file.type || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// =============================================
// CERTIFICATE UPLOAD (for admin & portfolio)
// =============================================
async function handleCertUpload(files, category = 'General') {
  const results = [];
  for (const file of files) {
    if (!file.type.match(/image\/*|application\/pdf/)) continue;
    const dataURL = await compressImage(file);
    if (!dataURL) continue;
    const cert = {
      id: String(Date.now() + Math.floor(Math.random() * 1000000)),
      name: file.name.replace(/\.[^/.]+$/, ''),
      category,
      file: dataURL,
      type: file.type.startsWith('image/') ? 'image/jpeg' : file.type,
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }),
    };
    const added = await Storage.add('portfolio-certs', cert);
    if (added) {
      results.push(cert);
    }
  }
  return results;
}

// =============================================
// RESUME UPLOAD
// =============================================
async function handleResumeUpload(file) {
  if (!file) return null;
  const dataURL = await readFileAsDataURL(file);
  const resume = {
    id: 'current-resume',
    name: file.name,
    file: dataURL,
    type: file.type,
    date: new Date().toISOString()
  };
  localStorage.setItem('portfolio-resume', JSON.stringify(resume));
  if (db) {
    try {
      await db.collection('portfolio-resume').doc('current-resume').set(resume);
      console.log("Resume uploaded to Firestore 🔥");
    } catch (err) {
      console.warn("Firestore resume upload error:", err);
    }
  }
  await renderUploadedResume();
  return resume;
}

// =============================================
// VIDEO UPLOAD / EMBED
// =============================================
async function addVideoEmbed(title, embedUrl, description) {
  const video = {
    id: String(Date.now() + Math.floor(Math.random() * 1000000)),
    title,
    embedUrl,
    description,
    date: new Date().toISOString(),
  };
  await Storage.add('portfolio-videos', video);
  return video;
}

// =============================================
// CERTIFICATES RETRIEVAL
// =============================================
const DEFAULT_CERTS = [];

async function getCerts() {
  const stored = (await Storage.get('portfolio-certs')) || [];
  return stored.filter(cert => cert && cert.id && !String(cert.id).startsWith('default-cert-'));
}

// =============================================
// RENDER UPLOADED CERTS TO PORTFOLIO
// =============================================
async function renderUploadedCerts() {
  const certs = await getCerts();
  const grid = document.getElementById('certs-grid');
  if (!grid) return;

  if (!certs || certs.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-secondary);grid-column:1/-1;text-align:center;padding:2rem;">No certificates available.</p>';
    return;
  }

  grid.innerHTML = certs.map((cert, idx) => {
    let previewContent = '';
    if (cert.icon) {
      previewContent = `<span style="font-size:4rem;">${cert.icon}</span>`;
    } else if (cert.type === 'application/pdf') {
      previewContent = `<span style="font-size:4rem;">📄</span>`;
    } else {
      previewContent = `<img src="${cert.file}" alt="${cert.name}" style="width:100%;height:100%;object-fit:cover;">`;
    }

    const bgStyle = cert.bg ? `style="background:${cert.bg};"` : '';
    const issuerHtml = cert.issuer ? `<div class="cert-issuer">${cert.issuer}</div>` : '';

    return `
      <div class="cert-card cert-reveal stagger-${(idx % 5) + 1}" data-cert-id="${cert.id}">
        <div class="cert-preview" ${bgStyle}>
          ${previewContent}
          <div class="cert-overlay">
            <span class="cert-view-btn" data-lightbox="${cert.file}">👁 View Certificate</span>
          </div>
        </div>
        <div class="cert-info">
          <div class="cert-title">${cert.name}</div>
          ${issuerHtml}
          <div class="cert-date">${cert.date || ''}</div>
        </div>
      </div>
    `;
  }).join('');

  if (window.initLightbox) {
    window.initLightbox();
  }
}


// =============================================
// RENDER UPLOADED VIDEOS
// =============================================
async function renderUploadedVideos() {
  const videos = await Storage.get('portfolio-videos');
  const grid = document.getElementById('videos-grid');
  if (!grid || videos.length === 0) return;

  videos.forEach(video => {
    if (document.querySelector(`[data-video-id="${video.id}"]`)) return;
    const card = document.createElement('div');
    card.className = 'video-card';
    card.setAttribute('data-video-id', video.id);
    card.innerHTML = `
      <div class="video-thumbnail">
        <div class="play-btn">▶</div>
      </div>
      <div class="video-info">
        <div class="video-title">${video.title}</div>
        <div class="video-desc">${video.description}</div>
      </div>
    `;
    card.querySelector('.video-thumbnail').addEventListener('click', () => {
      openVideoModal(video.embedUrl, video.title);
    });
    grid.appendChild(card);
  });
}

// =============================================
// RENDER UPLOADED RESUME
// =============================================
async function renderUploadedResume() {
  let resume = null;
  if (db) {
    try {
      const doc = await db.collection('portfolio-resume').doc('current-resume').get();
      if (doc.exists) {
        resume = doc.data();
        localStorage.setItem('portfolio-resume', JSON.stringify(resume));
      }
    } catch (e) {
      console.warn("Error fetching resume from Firestore:", e);
    }
  }

  if (!resume) {
    const resumeData = localStorage.getItem('portfolio-resume');
    if (resumeData) {
      try { resume = JSON.parse(resumeData); } catch (e) {}
    }
  }
  if (!resume) return;

  try {
    const links = document.querySelectorAll('.resume-download-link');
    links.forEach(link => {
      link.href = resume.file;
      link.setAttribute('download', resume.name || 'resume.pdf');
    });
  } catch (e) {
    console.error("Error rendering resume:", e);
  }
}

// =============================================
// VIDEO MODAL
// =============================================
function openVideoModal(embedUrl, title) {
  const existing = document.getElementById('video-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'video-modal';
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.92);
    z-index:99999;display:flex;align-items:center;justify-content:flex-start;
    flex-direction:column;padding:2rem;gap:1rem;
  `;
  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;
      width:100%;max-width:800px;color:white;">
      <h3 style="font-size:1.1rem;">${title}</h3>
      <span id="close-video-modal" style="font-size:2rem;cursor:pointer;line-height:1;">✕</span>
    </div>
    <iframe src="${embedUrl}" width="100%" style="max-width:800px;height:450px;border-radius:12px;border:none;" allowfullscreen></iframe>
  `;
  document.body.appendChild(modal);
  modal.querySelector('#close-video-modal').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// =============================================
// DRAG & DROP SETUP (for portfolio sections)
// =============================================
function initDragDrop(dropZoneId, onFileDrop) {
  const zone = document.getElementById(dropZoneId);
  if (!zone) return;

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files);
    onFileDrop(files);
  });
  zone.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,application/pdf,video/*';
    input.addEventListener('change', (e) => onFileDrop(Array.from(e.target.files)));
    input.click();
  });
}

// =============================================
// PROJECTS MANAGEMENT
// =============================================
const DEFAULT_PROJECTS = [];

async function getProjects() {
  const stored = (await Storage.get('portfolio-projects')) || [];
  return stored.filter(p => p && p.id && !String(p.id).startsWith('default-proj-'));
}

async function renderProjects() {
  const projects = await getProjects();
  const grid = document.querySelector('.projects-grid');
  if (!grid) return;

  if (!projects || projects.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-secondary);grid-column:1/-1;text-align:center;padding:2rem;">No projects available.</p>';
    return;
  }

  grid.innerHTML = projects.map(p => {
    const tagsHtml = (p.tech || p.tags || '').split(',')
      .map(t => t.trim())
      .filter(t => t)
      .map(t => `<span class="project-tag">${t}</span>`)
      .join('');

    const githubLink = p.github ? `<a href="${p.github}" class="project-link link-github" target="_blank">🐙 GitHub</a>` : '';
    const demoLink = p.demo ? `<a href="${p.demo}" class="project-link link-demo" target="_blank">🚀 Live Demo</a>` : '';

    return `
      <div class="project-card" data-project-id="${p.id}">
        <div class="project-image-placeholder">${p.icon || '💻'}</div>
        <div class="project-content">
          <div class="project-tags">
            ${tagsHtml}
          </div>
          <h3 class="project-title">${p.title}</h3>
          <p class="project-description">${p.desc || p.description || ''}</p>
          <div class="project-links">
            ${githubLink}
            ${demoLink}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.initTiltCards) {
    window.initTiltCards();
  }
}

// =============================================
// REALTIME FIRESTORE LISTENERS FOR CROSS-DEVICE SYNC
// =============================================
function initFirestoreListeners() {
  if (!db) return;
  const collections = ['portfolio-certs', 'portfolio-projects', 'portfolio-videos', 'portfolio-messages'];
  collections.forEach(key => {
    try {
      db.collection(key).onSnapshot(snapshot => {
        const firestoreDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (firestoreDocs.length > 0) {
          localStorage.setItem(key, JSON.stringify(firestoreDocs));
          if (key === 'portfolio-certs') renderUploadedCerts();
          if (key === 'portfolio-projects') renderProjects();
          if (key === 'portfolio-videos') renderUploadedVideos();
        }
      }, err => {
        console.warn(`Firestore onSnapshot warning for ${key}:`, err);
      });
    } catch (e) {
      console.warn(`Firestore listener setup error for ${key}:`, e);
    }
  });

  try {
    db.collection('portfolio-resume').doc('current-resume').onSnapshot(doc => {
      if (doc.exists) {
        const resume = doc.data();
        localStorage.setItem('portfolio-resume', JSON.stringify(resume));
        renderUploadedResume();
      }
    });
  } catch (e) {}
}

async function cleanLegacyDefaults() {
  try {
    ['portfolio-certs', 'portfolio-projects'].forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const items = JSON.parse(raw) || [];
          const filtered = items.filter(i => i && i.id && !String(i.id).startsWith('default-'));
          localStorage.setItem(key, JSON.stringify(filtered));
        } catch(e) {}
      }
    });

    if (db) {
      const defaultDocIds = [
        'default-proj-1', 'default-proj-2', 'default-proj-3', 'default-proj-4',
        'default-cert-1', 'default-cert-2', 'default-cert-3', 'default-cert-4', 'default-cert-5', 'default-cert-6'
      ];
      for (const id of defaultDocIds) {
        const col = id.startsWith('default-proj') ? 'portfolio-projects' : 'portfolio-certs';
        db.collection(col).doc(id).delete().catch(() => {});
      }
    }
  } catch (e) {}
}

// =============================================
// INIT ON PAGE LOAD
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
  await cleanLegacyDefaults();
  renderUploadedCerts();
  renderUploadedVideos();
  renderUploadedResume();
  renderProjects();
  initFirestoreListeners();
  syncAllToCloud().catch(console.warn);
});

// Export for admin
window.PortfolioUpload = {
  handleCertUpload, handleResumeUpload, addVideoEmbed,
  renderUploadedCerts, renderUploadedVideos, renderUploadedResume,
  renderProjects, getProjects, DEFAULT_PROJECTS,
  getCerts, DEFAULT_CERTS,
  Storage, openVideoModal, db, syncAllToCloud
};
