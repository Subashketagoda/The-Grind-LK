/**
 * THE GRIND LK — SPECIALTY CAFÉ
 * Interactive Application & Video Engine
 */



document.addEventListener('DOMContentLoaded', () => {
  // Purge any lingering bottom bar or status bar elements
  document.querySelectorAll('.top-live-status-bar, .live-status-chip, .status-bar-container, .mobile-bottom-bar').forEach(el => el.remove());
  
  initCoffeePreloader();
  initNavbarScroll();
  initMobileDrawer();
  initVideoReels();
  initScrollAnimations();
  initScrollDrivenSwipe();
});

/* ==================== CINEMATIC VIDEO PRELOADER ==================== */
function initCoffeePreloader() {
  const preloader = document.getElementById('coffee-preloader');
  if (!preloader) return;

  const video = document.getElementById('preloader-video');
  const progressBar = document.getElementById('preloader-progress-bar');
  const percentEl = document.getElementById('preloader-percent');
  const statusText = document.getElementById('preloader-status-text');
  const soundBtn = document.getElementById('preloader-sound-toggle');
  const skipBtn = document.getElementById('preloader-skip');

  let isFinished = false;

  const finishPreloader = () => {
    if (isFinished) return;
    isFinished = true;

    if (progressBar) progressBar.style.width = '100%';
    if (percentEl) percentEl.textContent = '100%';
    if (statusText) statusText.textContent = 'WELCOME TO THE GRIND';

    // Force ALL cards, text, and sections on the page to be visible immediately
    document.querySelectorAll('.glass-feature-card, .specialty-card, .reel-card, .experience-container, .testimonial-card-wrap').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.visibility = 'visible';
    });

    preloader.classList.add('preloader-fade-out');
    document.body.classList.remove('preloader-active');

    setTimeout(() => {
      preloader.style.display = 'none';
    }, 600);
  };

  // Immediate dismiss on skip button or tapping preloader
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      finishPreloader();
    });
  }

  preloader.addEventListener('click', (e) => {
    if (!e.target.closest('#preloader-sound-toggle')) {
      finishPreloader();
    }
  });

  if (video) {
    video.muted = true;
    video.playsInline = true;

    // Track playback progress
    video.addEventListener('timeupdate', () => {
      if (video.duration && !isFinished) {
        const progress = Math.min(100, Math.round((video.currentTime / video.duration) * 100));
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (percentEl) percentEl.textContent = `${progress}%`;
      }
    });

    // When video finishes, unlock the site!
    video.addEventListener('ended', finishPreloader);

    // Auto-trigger video play
    const tryPlay = () => {
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {
          // If browser policy requires user interaction, tap unlocks video & finishes
          const unlock = () => {
            finishPreloader();
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
          };
          document.addEventListener('click', unlock, { once: true });
          document.addEventListener('touchstart', unlock, { once: true });
        });
      }
    };

    tryPlay();
    video.addEventListener('loadedmetadata', tryPlay);
    video.addEventListener('canplay', tryPlay);

    // Safety fallback: if video stalls or takes longer than 5s, unlock gracefully
    setTimeout(() => {
      if (!isFinished) finishPreloader();
    }, 5000);
  } else {
    finishPreloader();
  }

  // Audio Toggle
  if (soundBtn && video) {
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      const icon = soundBtn.querySelector('i');
      const text = soundBtn.querySelector('span');
      if (video.muted) {
        soundBtn.classList.remove('unmuted');
        if (icon) icon.className = 'fa-solid fa-volume-xmark';
        if (text) text.textContent = 'Sound';
      } else {
        soundBtn.classList.add('unmuted');
        if (icon) icon.className = 'fa-solid fa-volume-high';
        if (text) text.textContent = 'Mute';
      }
    });
  }

  // Skip Button
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      finishPreloader();
    });
  }
}

/* ==================== NAVBAR SCROLL DETECTOR ==================== */
function initNavbarScroll() {
  const siteHeader = document.getElementById('site-header');
  const navbar = document.getElementById('navbar');

  const handleScroll = () => {
    const isScrolled = window.scrollY > 30;
    if (siteHeader) siteHeader.classList.toggle('scrolled', isScrolled);
    if (navbar) navbar.classList.toggle('scrolled', isScrolled);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run once on load
}

/* ==================== MOBILE DRAWER ==================== */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const closeBtn = document.getElementById('drawer-close');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('drawer-backdrop');

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  const drawerLinks = document.querySelectorAll('.drawer-link');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

function closeDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
}

/* ==================== MENU CATEGORY FILTER ==================== */
function filterMenu(category, btnElement) {
  // Update active pill button
  if (btnElement) {
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.classList.remove('active');
      pill.setAttribute('aria-selected', 'false');
    });
    btnElement.classList.add('active');
    btnElement.setAttribute('aria-selected', 'true');
  } else {
    // If called via card link without btnElement
    document.querySelectorAll('.filter-pill').forEach(pill => {
      const match = pill.getAttribute('onclick')?.includes(`'${category}'`);
      if (match) {
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');
      } else {
        pill.classList.remove('active');
        pill.setAttribute('aria-selected', 'false');
      }
    });
  }

  // Filter cards
  const cards = document.querySelectorAll('.specialty-card');
  cards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    if (category === 'all' || cardCategory === category) {
      card.classList.remove('hidden');
      card.style.opacity = '0';
      card.style.transform = 'translateY(12px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50);
    } else {
      card.classList.add('hidden');
    }
  });
}

/* ==================== VIDEO REELS INTERACTIONS (AUTOPLAY) ==================== */
function initVideoReels() {
  const reelCards = document.querySelectorAll('.reel-card');

  // Trigger autoplay on all reels immediately
  reelCards.forEach(card => {
    const video = card.querySelector('.reel-video');
    if (!video) return;

    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    const playVideo = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          card.classList.add('playing');
        }).catch(() => {
          // Autoplay will activate on intersection or first user interaction
        });
      }
    };

    playVideo();
    video.addEventListener('loadeddata', playVideo);
    video.addEventListener('canplay', playVideo);
  });

  // IntersectionObserver: automatically play when in viewport, pause when scrolled away
  if ('IntersectionObserver' in window) {
    const reelsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target.querySelector('.reel-video');
        if (!video) return;

        if (entry.isIntersecting) {
          video.play().then(() => {
            entry.target.classList.add('playing');
          }).catch(() => {});
        } else {
          // Pause when off-screen to save CPU and battery
          video.pause();
          entry.target.classList.remove('playing');
        }
      });
    }, {
      threshold: 0.15
    });

    reelCards.forEach(card => reelsObserver.observe(card));
  }

  // Backup trigger on first user interaction (scroll or touch) to satisfy strict mobile browser policies
  const triggerAllAutoplay = () => {
    reelCards.forEach(card => {
      const video = card.querySelector('.reel-video');
      if (video && video.paused) {
        video.play().then(() => {
          card.classList.add('playing');
        }).catch(() => {});
      }
    });
    window.removeEventListener('scroll', triggerAllAutoplay);
    window.removeEventListener('touchstart', triggerAllAutoplay);
    window.removeEventListener('click', triggerAllAutoplay);
  };

  window.addEventListener('scroll', triggerAllAutoplay, { passive: true, once: true });
  window.addEventListener('touchstart', triggerAllAutoplay, { passive: true, once: true });
  window.addEventListener('click', triggerAllAutoplay, { passive: true, once: true });
}

function toggleReelPlay(card) {
  const video = card.querySelector('.reel-video');
  if (!video) return;

  if (video.paused) {
    video.play().then(() => {
      card.classList.add('playing');
    }).catch(err => {
      console.log('Video playback error:', err);
    });
  } else {
    video.pause();
    card.classList.remove('playing');
  }
}

function toggleMute(event, btn) {
  event.stopPropagation(); // Don't trigger toggleReelPlay
  const card = btn.closest('.reel-card');
  if (!card) return;

  const video = card.querySelector('.reel-video');
  if (!video) return;

  video.muted = !video.muted;
  const icon = btn.querySelector('i');

  if (video.muted) {
    card.classList.remove('unmuted');
    if (icon) icon.className = 'fa-solid fa-volume-xmark';
    showToast('Video muted');
  } else {
    // Mute all other videos when one is unmuted
    document.querySelectorAll('.reel-video').forEach(otherVideo => {
      if (otherVideo !== video) {
        otherVideo.muted = true;
        const otherCard = otherVideo.closest('.reel-card');
        if (otherCard) {
          otherCard.classList.remove('unmuted');
          const otherIcon = otherCard.querySelector('.reel-mute-btn i');
          if (otherIcon) otherIcon.className = 'fa-solid fa-volume-xmark';
        }
      }
    });

    card.classList.add('unmuted');
    if (icon) icon.className = 'fa-solid fa-volume-high';
    if (video.paused) {
      video.play().then(() => card.classList.add('playing')).catch(() => {});
    }
    showToast('Sound enabled &bull; Audio playing');
  }
}



/* ==================== TOAST NOTIFICATIONS ==================== */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-mug-hot" style="color: var(--color-primary-gold);"></i> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ==================== SCROLL REVEAL ANIMATIONS ==================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.glass-feature-card, .specialty-card, .reel-card, .experience-container, .testimonial-card-wrap');
  
  // Guarantee all elements are visible by default so no text is ever hidden
  elements.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

/* ==================== SCROLL-DRIVEN HORIZONTAL SWIPE ==================== */
function initScrollDrivenSwipe() {
  const configs = [
    {
      selector: '.cards-grid',
      // Start swiping when cards container enters viewport from bottom (top at 88% vh)
      // Finish swiping when cards container top reaches 10% vh
      getRange: (rect, vh) => ({
        startY: vh * 0.88,
        endY: vh * 0.10
      })
    },
    {
      selector: '.video-reels-grid',
      // Start swiping when reels top enters at 86% vh
      // Finish swiping when reels top reaches -rect.height * 0.25
      getRange: (rect, vh) => ({
        startY: vh * 0.86,
        endY: -rect.height * 0.25
      })
    }
  ];

  const containers = [];

  configs.forEach(cfg => {
    const el = document.querySelector(cfg.selector);
    if (!el) return;

    const data = {
      el,
      cfg,
      isManualSwipe: false,
      manualSwipeTimeout: null,
      touchStartX: 0,
      touchStartY: 0
    };

    // Ensure programmatic scrolling is instant without CSS smooth-scroll fighting
    el.style.scrollBehavior = 'auto';

    el.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        data.touchStartX = e.touches[0].clientX;
        data.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    el.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        const dx = Math.abs(e.touches[0].clientX - data.touchStartX);
        const dy = Math.abs(e.touches[0].clientY - data.touchStartY);
        // User deliberately moved horizontally more than vertically
        if (dx > 10 && dx > dy * 1.25) {
          data.isManualSwipe = true;
          el.style.scrollSnapType = 'x proximity';
          if (data.manualSwipeTimeout) clearTimeout(data.manualSwipeTimeout);
        }
      }
    }, { passive: true });

    const endTouch = () => {
      if (data.manualSwipeTimeout) clearTimeout(data.manualSwipeTimeout);
      data.manualSwipeTimeout = setTimeout(() => {
        data.isManualSwipe = false;
        el.style.scrollSnapType = 'none';
      }, 900);
    };

    el.addEventListener('touchend', endTouch, { passive: true });
    el.addEventListener('touchcancel', endTouch, { passive: true });

    containers.push(data);
  });

  if (containers.length === 0) return;

  let lastScrollY = window.scrollY || window.pageYOffset || 0;
  let isTicking = false;

  const updateSwipes = () => {
    isTicking = false;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const scrollDelta = Math.abs(currentScrollY - lastScrollY);

    containers.forEach(item => {
      const { el, cfg } = item;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 8) return; // Not horizontally scrollable on desktop

      // If user is actively scrolling page vertically by >= 15px, resume auto-swipe
      if (scrollDelta > 15 && item.isManualSwipe) {
        item.isManualSwipe = false;
        el.style.scrollSnapType = 'none';
        if (item.manualSwipeTimeout) clearTimeout(item.manualSwipeTimeout);
      }

      if (item.isManualSwipe) return;

      const rect = el.getBoundingClientRect();
      // If outside viewport range, ignore
      if (rect.bottom < -60 || rect.top > vh + 60) return;

      const { startY, endY } = cfg.getRange(rect, vh);
      const rawProgress = (startY - rect.top) / (startY - endY);
      const progress = Math.min(1, Math.max(0, rawProgress));

      el.scrollLeft = progress * maxScroll;
    });

    lastScrollY = currentScrollY;
  };

  const onScroll = () => {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(updateSwipes);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Initial updates to sync position on load
  updateSwipes();
  setTimeout(updateSwipes, 250);
  setTimeout(updateSwipes, 600);
}
