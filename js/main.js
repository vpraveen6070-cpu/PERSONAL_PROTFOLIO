/* ==========================================
   MAIN.JS - Core Portfolio Interactions
   ========================================== */

'use strict';

// =============================================
// LOADING SCREEN
// =============================================
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.5s ease';
      setTimeout(() => { loader.style.display = 'none'; initAnimations(); }, 500);
    }
  }, 2800);
});

// =============================================
// SCROLL PROGRESS BAR
// =============================================
const scrollBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  if (scrollBar) scrollBar.style.width = progress + '%';

  // Navbar scroll state
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.classList.toggle('scrolled', scrollTop > 60);

  // Back to top
  const btn = document.getElementById('back-to-top');
  if (btn) btn.classList.toggle('visible', scrollTop > 400);
});

// =============================================
// BACK TO TOP
// =============================================
document.getElementById('back-to-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// =============================================
// TYPING EFFECT
// =============================================
function initTypingEffect() {
  const el = document.getElementById('typing-text');
  if (!el) return;
  const words = ['B.Tech CSE Student', 'Future Software Engineer', 'Full Stack Developer', 'Computer Science Enthusiast', 'Problem Solver'];
  let wordIndex = 0, charIndex = 0, isDeleting = false;

  function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      el.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }
    let speed = isDeleting ? 50 : 100;
    if (!isDeleting && charIndex === currentWord.length) {
      speed = 2000; isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 400;
    }
    setTimeout(type, speed);
  }
  setTimeout(type, 1500);
}

// =============================================
// HAMBURGER / MOBILE NAV
// =============================================
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-nav-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = mobileMenu.classList.contains('open') ? 'rotate(45deg) translate(5px, 5px)' : '';
    spans[1].style.opacity = mobileMenu.classList.contains('open') ? '0' : '1';
    spans[2].style.transform = mobileMenu.classList.contains('open') ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = '1'; });
    });
  });
}

// =============================================
// SCROLL REVEAL
// =============================================
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => observer.observe(el));
}

// =============================================
// PROGRESS BARS (About section)
// =============================================
function initProgressBars() {
  const bars = document.querySelectorAll('.progress-bar-fill');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target.getAttribute('data-width');
        entry.target.style.width = target + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  bars.forEach(bar => observer.observe(bar));
}

// =============================================
// SKILL PROGRESS BARS
// =============================================
function initSkillBars() {
  const fills = document.querySelectorAll('.skill-level-fill');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target.getAttribute('data-level');
        entry.target.style.width = target + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  fills.forEach(f => observer.observe(f));
}

// =============================================
// 3D TILT CARDS (Projects)
// =============================================
function initTiltCards() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
}
window.initTiltCards = initTiltCards;

// =============================================
// CERTIFICATE FILTER
// =============================================
function initCertFilter() {
  const filterBtns = document.querySelectorAll('.cert-filter-btn');
  const certCards = document.querySelectorAll('.cert-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      certCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'block';
          card.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// =============================================
// LIGHTBOX
// =============================================
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightbox-content');
  const lightboxClose = document.getElementById('lightbox-close');

  document.querySelectorAll('[data-lightbox]').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-lightbox');
      if (!lightbox || !lightboxContent) return;
      lightboxContent.src = src;
      lightbox.classList.add('open');
    });
  });

  lightboxClose?.addEventListener('click', () => lightbox?.classList.remove('open'));
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('open');
  });
}

// =============================================
// CONTACT FORM
// =============================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit-btn');
    const successMsg = form.querySelector('.form-success-msg');
    const originalText = btn.innerHTML;

    btn.innerHTML = '⏳ Sending...';
    btn.disabled = true;

    // Capture form data
    const formData = {
      name: document.getElementById('contact-name').value.trim(),
      email: document.getElementById('contact-email').value.trim(),
      subject: document.getElementById('contact-subject').value.trim(),
      message: document.getElementById('contact-message').value.trim(),
      date: new Date().toISOString()
    };

    // Save to Firestore
    const savePromise = window.PortfolioUpload ? window.PortfolioUpload.Storage.add('portfolio-messages', formData) : Promise.resolve();

    savePromise.then(() => {
      btn.innerHTML = '✅ Message Sent!';
      if (successMsg) { successMsg.style.display = 'block'; }
      showToast('Message sent successfully! 🚀', 'success');
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        form.reset();
        if (successMsg) successMsg.style.display = 'none';
      }, 3000);
    }).catch(err => {
      console.error("Form submission error:", err);
      btn.innerHTML = '❌ Error';
      showToast('Failed to send message. Please try again.', 'error');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 3000);
    });
  });
}

// =============================================
// TOAST NOTIFICATIONS
// =============================================
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
window.showToast = showToast;

// =============================================
// GALLERY
// =============================================
function initGallery() {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      const label = item.querySelector('.gallery-item-label')?.textContent;
      if (src) {
        const lightbox = document.getElementById('lightbox');
        const content = document.getElementById('lightbox-content');
        if (lightbox && content) {
          content.src = src;
          lightbox.classList.add('open');
        }
      }
    });
  });
}

// =============================================
// SMOOTH SCROLL NAV LINKS
// =============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href && href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navbar = document.getElementById('navbar');
          const offset = navbar ? navbar.offsetHeight : 80;
          const elementPosition = target.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - offset - 15; // 15px extra breathing room

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          const mobileMenu = document.getElementById('mobile-nav-menu');
          const hamburger = document.querySelector('.hamburger');
          if (mobileMenu && mobileMenu.classList.contains('open')) {
            mobileMenu.classList.remove('open');
            if (hamburger) hamburger.classList.remove('active');
          }
        }
      }
    });
  });
}

// =============================================
// STAT COUNTER ANIMATION
// =============================================
function initStatCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = +entry.target.getAttribute('data-target');
        const suffix = entry.target.getAttribute('data-suffix') || '';
        let count = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          count += step;
          if (count >= target) {
            entry.target.textContent = target + suffix;
            clearInterval(timer);
          } else {
            entry.target.textContent = Math.floor(count) + suffix;
          }
        }, 20);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// =============================================
// PARALLAX (subtle)
// =============================================
function initParallax() {
  const heroContent = document.querySelector('.hero-content');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (heroContent && scrollY < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
      heroContent.style.opacity = 1 - scrollY / window.innerHeight;
    }
  });
}

// =============================================
// INIT ALL
// =============================================
function initAnimations() {
  initScrollReveal();
  initProgressBars();
  initSkillBars();
  initTiltCards();
  initCertFilter();
  initLightbox();
  initContactForm();
  initGallery();
  initSmoothScroll();
  initStatCounters();
  initParallax();
}

document.addEventListener('DOMContentLoaded', () => {
  initTypingEffect();
  initMobileNav();
});
