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
          const firestoreIds = new Set(firestoreDocs.map(d => String(d.id)));
          return [...firestoreDocs, ...localData.filter(i => !firestoreIds.has(String(i.id)))];
        }
      } catch (err) {
        console.warn("Firestore fetch error, falling back to localStorage:", err);
      }
    }
    return localData;
  },
  
  set: async (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  },
  
  add: async (key, item) => {
    item.id = String(item.id || (Date.now() + Math.floor(Math.random() * 1000000)));

    const arr = JSON.parse(localStorage.getItem(key)) || [];
    if (!arr.some(i => String(i.id) === String(item.id))) {
      arr.unshift(item);
      localStorage.setItem(key, JSON.stringify(arr));
    }

    if (db && (key === 'portfolio-certs' || key === 'portfolio-projects' || key === 'portfolio-videos' || key === 'portfolio-messages')) {
      try {
        await db.collection(key).doc(item.id).set(item);
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
      } catch (err) {
        console.warn("Firestore delete error:", err);
      }
    }
    return arr;
  },
};

// =============================================
// FILE READER UTILITY
// =============================================
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
    const dataURL = await readFileAsDataURL(file);
    const cert = {
      id: String(Date.now() + Math.floor(Math.random() * 1000000)),
      name: file.name.replace(/\.[^/.]+$/, ''),
      category,
      file: dataURL,
      type: file.type,
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }),
    };
    await Storage.add('portfolio-certs', cert);
    results.push(cert);
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
// RENDER UPLOADED CERTS TO PORTFOLIO
// =============================================
async function renderUploadedCerts() {
  const certs = await Storage.get('portfolio-certs');
  const grid = document.getElementById('certs-grid');
  if (!grid) return;

  // Remove elements that were deleted
  const existingCards = grid.querySelectorAll('[data-cert-id]');
  existingCards.forEach(card => {
    const cardId = card.getAttribute('data-cert-id');
    if (!certs.some(c => String(c.id) === String(cardId))) {
      card.remove();
    }
  });

  if (certs.length === 0) return;

  certs.forEach(cert => {
    if (document.querySelector(`[data-cert-id="${cert.id}"]`)) return; // skip dups
    const card = document.createElement('div');
    card.className = 'cert-card';
    card.setAttribute('data-category', cert.category || 'General');
    card.setAttribute('data-cert-id', cert.id);
    card.innerHTML = `
      <div class="cert-preview">
        ${cert.type === 'application/pdf'
          ? `<span style="font-size:4rem">📄</span>`
          : `<img src="${cert.file}" alt="${cert.name}" style="width:100%;height:100%;object-fit:cover;">`
        }
        <div class="cert-overlay">
          <span class="cert-view-btn" data-lightbox="${cert.file}">👁 View</span>
        </div>
      </div>
      <div class="cert-info">
        <div class="cert-title">${cert.name}</div>
        <div class="cert-date">${cert.date}</div>
      </div>
    `;
    grid.insertBefore(card, grid.firstChild);
  });
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
function renderUploadedResume() {
  const resumeData = localStorage.getItem('portfolio-resume');
  if (!resumeData) return;

  try {
    const resume = JSON.parse(resumeData);
    const links = document.querySelectorAll('.resume-download-link');
    links.forEach(link => {
      link.href = resume.file;
      link.setAttribute('download', resume.name || 'resume.pdf');
      // If it's the preview card text, maybe update it? 
      // For now just the href is most important.
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
// PROJECTS MANAGEMENT (DEFAULT & DYNAMIC)
// =============================================
const DEFAULT_PROJECTS = [
  {
    id: 'default-proj-1',
    title: 'AI Image Classifier',
    icon: '🤖',
    tech: 'Python, TensorFlow, CNN',
    desc: 'Deep learning model that classifies images with 95%+ accuracy using Convolutional Neural Networks. Trained on custom datasets with data augmentation techniques.',
    github: 'https://github.com/vpraveen6070-cpu',
    demo: ''
  },
  {
    id: 'default-proj-2',
    title: 'ML Sentiment Analyzer',
    icon: '📊',
    tech: 'Python, Scikit-learn, Pandas',
    desc: 'Natural Language Processing model that analyzes sentiment in social media posts and reviews. Built with BERT and fine-tuned for domain-specific data.',
    github: 'https://github.com/vpraveen6070-cpu',
    demo: ''
  },
  {
    id: 'default-proj-3',
    title: 'House Price Predictor',
    icon: '🏠',
    tech: 'Python, Flask, ML',
    desc: 'Machine learning web app that predicts housing prices based on location, features, and market trends. Deployed with Flask API and interactive front-end.',
    github: 'https://github.com/vpraveen6070-cpu',
    demo: ''
  },
  {
    id: 'default-proj-4',
    title: 'AI Chatbot Assistant',
    icon: '💬',
    tech: 'Python, NLP, Streamlit',
    desc: 'Intelligent conversational AI assistant built with transformer models. Features context-aware responses, multi-turn conversations, and topic-specific knowledge.',
    github: 'https://github.com/vpraveen6070-cpu',
    demo: ''
  }
];

async function getProjects() {
  const stored = await Storage.get('portfolio-projects');
  if (!stored || stored.length === 0) {
    if (!localStorage.getItem('portfolio-projects-initialized')) {
      localStorage.setItem('portfolio-projects', JSON.stringify(DEFAULT_PROJECTS));
      localStorage.setItem('portfolio-projects-initialized', 'true');
      return DEFAULT_PROJECTS;
    }
  }
  return stored;
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
// INIT ON PAGE LOAD
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  renderUploadedCerts();
  renderUploadedVideos();
  renderUploadedResume();
  renderProjects();
});

// Export for admin
window.PortfolioUpload = {
  handleCertUpload, handleResumeUpload, addVideoEmbed,
  renderUploadedCerts, renderUploadedVideos, renderUploadedResume,
  renderProjects, getProjects, DEFAULT_PROJECTS,
  Storage, openVideoModal,
};
