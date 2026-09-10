// main.js - Core UI Interactivity for Cutflow Website

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initFaqAccordion();
  initVideoHoverPlay();
  initWorkTabs();
  initReactionsCounter();
  initAboutTabs();
  
  // Only execute contact page logic if elements exist
  if (document.getElementById('contact-form')) {
    initContactForm();
  }
});

/**
 * 1. Sticky Header scroll effect
 */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Run initially in case page loaded scrolled down
}

/**
 * 2. Mobile Navigation Toggle
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleBtn.classList.toggle('open');
    navMenu.classList.toggle('open');
  });

  // Close menu when clicking links
  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleBtn.classList.remove('open');
      navMenu.classList.remove('open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      toggleBtn.classList.remove('open');
      navMenu.classList.remove('open');
    }
  });
}

/**
 * 3. FAQ Accordion Logic
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length === 0) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other open items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        // Calculate dynamic height for transition
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/**
 * 4. Hover to Play/Pause Showcase Videos
 */
function initVideoHoverPlay() {
  const videoCards = document.querySelectorAll('.work-card');
  const heroVideo = document.querySelector('.hero-video-card video');
  
  // Setup showcase video hover and click fullscreen
  videoCards.forEach(card => {
    const video = card.querySelector('video');
    if (!video) return;

    // Cursor feedback for the entire card
    card.style.cursor = 'pointer';

    // Hover mouse over card -> Play video silently
    card.addEventListener('mouseenter', () => {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.log("Auto-play blocked: ", e));
      }
    });

    // Hover mouse off card -> Pause video
    card.addEventListener('mouseleave', () => {
      video.pause();
    });

    // Click card -> Enter Fullscreen and Unmute (prevents overlay click blocking)
    card.addEventListener('click', (e) => {
      enterFullscreen(video);
    });
  });

  // Setup hero video click fullscreen
  const heroCard = document.querySelector('.hero-video-card');
  if (heroCard && heroVideo) {
    heroCard.style.cursor = 'pointer';
    heroCard.addEventListener('click', (e) => {
      enterFullscreen(heroVideo);
    });
  }

  // Handle exiting fullscreen -> Mute the videos again
  const handleFullscreenChange = () => {
    const isFullscreen = document.fullscreenElement || 
                         document.webkitFullscreenElement || 
                         document.mozFullScreenElement || 
                         document.msFullscreenElement;
    if (!isFullscreen) {
      const allVideos = document.querySelectorAll('video');
      allVideos.forEach(vid => {
        vid.muted = true;
      });
    }
  };

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);
}

function enterFullscreen(video) {
  if (video.requestFullscreen) {
    video.requestFullscreen();
  } else if (video.webkitRequestFullscreen) { /* Safari */
    video.webkitRequestFullscreen();
  } else if (video.msRequestFullscreen) { /* IE11 */
    video.msRequestFullscreen();
  }
  
  // Unmute in fullscreen so they can hear the audio!
  video.muted = false;
  video.play();
}

/**
 * 5. Contact Form Validation and Success Animations
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const formContainer = document.getElementById('form-container');
  const successContainer = document.getElementById('success-container');
  const resetBtn = document.getElementById('reset-form-btn');

  if (!form || !formContainer || !successContainer) return;

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset error visuals
    const inputs = form.querySelectorAll('.form-input, .form-textarea');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.style.borderColor = 'var(--accent-red)';
        isValid = false;
      } else {
        input.style.borderColor = 'var(--border-color)';
      }
    });

    if (!isValid) return;

    // Simulate form submission process (loading states)
    const submitBtn = form.querySelector('.form-submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    setTimeout(() => {
      // Transition to custom success view
      formContainer.style.display = 'none';
      successContainer.style.display = 'flex';
      
      // Reset button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 1000);
  });

  // Handle Reset Form button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      const inputs = form.querySelectorAll('.form-input, .form-textarea');
      inputs.forEach(input => input.style.borderColor = 'var(--border-color)');
      successContainer.style.display = 'none';
      formContainer.style.display = 'block';
    });
  }
}


/**
 * 6. Work Section Category Tab Filtering
 */
function initWorkTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const wTitle = document.querySelector('.widescreen-section-title');
  const wContainer = document.getElementById('widescreen-container');
  const vTitle = document.querySelector('.vertical-section-title');
  const vContainer = document.getElementById('vertical-container');

  if (tabBtns.length === 0) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Set active button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tab = btn.getAttribute('data-tab');

      // Pause all playing videos when tabs switch to prevent hidden media background audio/rendering
      const allVideos = document.querySelectorAll('.work-video');
      allVideos.forEach(vid => {
        try {
          vid.pause();
        } catch (e) {
          console.log("Error pausing video: ", e);
        }
      });

      if (tab === 'all') {
        if (wTitle) wTitle.classList.add('active');
        if (wContainer) wContainer.classList.add('active');
        if (vTitle) vTitle.classList.add('active');
        if (vContainer) vContainer.classList.add('active');
      } else if (tab === 'widescreen') {
        if (wTitle) wTitle.classList.add('active');
        if (wContainer) wContainer.classList.add('active');
        if (vTitle) vTitle.classList.remove('active');
        if (vContainer) vContainer.classList.remove('active');
      } else if (tab === 'vertical') {
        if (wTitle) wTitle.classList.remove('active');
        if (wContainer) wContainer.classList.remove('active');
        if (vTitle) vTitle.classList.add('active');
        if (vContainer) vContainer.classList.add('active');
      }
    });
  });
}

/**
 * 7. Infinite Reacts Counter (0 to 100.000+ loops)
 */
function initReactionsCounter() {
  const counterEl = document.getElementById('reactions-counter');
  if (!counterEl) return;

  const target = 100000;
  const duration = 5000; // 5 seconds to count up (slower counting)
  const holdTime = 3000; // 3 seconds delay before restarting

  function formatCommaNumber(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  let startTime = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smoother finishing deceleration (easeOutQuad)
    const easeOutQuad = progress * (2 - progress);
    const currentVal = Math.floor(easeOutQuad * target);

    if (progress < 1) {
      counterEl.textContent = formatCommaNumber(currentVal);
      requestAnimationFrame(animate);
    } else {
      counterEl.textContent = "100,000+";
      setTimeout(() => {
        startTime = null;
        requestAnimationFrame(animate);
      }, holdTime);
    }
  }

  requestAnimationFrame(animate);
}

/**
 * 8. About Section Dashboard Tab Switching
 */
function initAboutTabs() {
  const tabs = document.querySelectorAll('.about-tab-btn');
  const panels = document.querySelectorAll('.about-tab-content');
  
  if (tabs.length === 0) return;
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetSuffix = tab.getAttribute('data-about-tab');
      
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      
      const targetPanel = document.getElementById(`about-tab-${targetSuffix}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}
