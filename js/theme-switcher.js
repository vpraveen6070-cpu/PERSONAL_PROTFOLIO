/* ==========================================
   VIEW-TOGGLE.JS  — Mobile / Desktop Toggle
   ========================================== */

'use strict';

const VIEW_MODES = {
  desktop: { name: 'Mobile View', icon: '📱' },
  mobile: { name: 'Desktop View', icon: '💻' }
};

function setViewMode(mode) {
  const body = document.body;
  const links = document.querySelectorAll('.view-toggle-link');
  
  if (mode === 'mobile') {
    body.classList.add('view-mobile');
    links.forEach(link => {
      link.innerHTML = `<span>${VIEW_MODES.mobile.icon}${VIEW_MODES.mobile.name}</span>`;
    });
  } else {
    body.classList.remove('view-mobile');
    links.forEach(link => {
      link.innerHTML = `<span>${VIEW_MODES.desktop.icon}${VIEW_MODES.desktop.name}</span>`;
    });
  }
  
  localStorage.setItem('portfolio-view-mode', mode);
  
  if (window.showToast) {
    showToast(`${mode.charAt(0).toUpperCase() + mode.slice(1)} View enabled`, 'success');
  }
}

function toggleViewMode() {
  const isMobile = document.body.classList.contains('view-mobile');
  const nextMode = isMobile ? 'desktop' : 'mobile';
  setViewMode(nextMode);
}

function initViewToggle() {
  const savedMode = localStorage.getItem('portfolio-view-mode') || 'desktop';
  
  // Only apply simulation on screens wider than 1024px
  if (window.innerWidth > 1024) {
    setViewMode(savedMode);
  }

  const links = document.querySelectorAll('.view-toggle-link');
  links.forEach(link => {
    link?.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent jump for href="javascript:void(0)"
      e.stopPropagation();
      toggleViewMode();
    });
  });
  
  // Handle window resize - remove simulation if window becomes small
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 1024) {
      document.body.classList.remove('view-mobile');
    }
  });
}

document.addEventListener('DOMContentLoaded', initViewToggle);
