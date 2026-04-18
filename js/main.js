/* ============================================
   FUCHS MESSEBAU – Main JavaScript (2026)
   ============================================ */

(function () {
  'use strict';

  var SCROLL_THRESHOLD = 40;
  var COOKIE_DELAY_MS = 1000;
  var THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var THEME_KEY = 'fm_theme';
  var COOKIE_KEY = 'fm_cookie_consent';

  // ---------- THEME ----------
  var root = document.documentElement;
  function currentTheme() { return root.dataset.theme === 'dark' ? 'dark' : 'light'; }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    var toggle = document.getElementById('themeToggle');
    if (toggle) toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }

  function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
    var theme = stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(theme);

    var toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
        if (document.startViewTransition) {
          document.startViewTransition(function () { applyTheme(next); });
        } else {
          applyTheme(next);
        }
      });
    }
  }
  initTheme();

  // ---------- HEADER SCROLL ----------
  var header = document.getElementById('siteHeader');
  if (header) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        if (window.pageYOffset > SCROLL_THRESHOLD) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
        ticking = false;
      });
    }, { passive: true });
  }

  // ---------- MOBILE NAV ----------
  var hamburger = document.getElementById('hamburger');
  var mainNav = document.getElementById('mainNav');
  var navOverlay = document.getElementById('navOverlay');

  function openNav() {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Menü schließen');
    mainNav.classList.add('open');
    if (navOverlay) navOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Menü öffnen');
    mainNav.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', function () {
      mainNav.classList.contains('open') ? closeNav() : openNav();
    });
    if (navOverlay) navOverlay.addEventListener('click', closeNav);
    mainNav.querySelectorAll('.nav-list a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (mainNav.classList.contains('open')) closeNav();
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('open')) {
        closeNav();
        hamburger.focus();
      }
    });
  }

  // ---------- FAQ ----------
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;
    if (!answer.querySelector('.faq-answer-inner') && answer.children.length === 0) {
      // wrap inline text content
      var html = answer.innerHTML;
      answer.innerHTML = '<div class="faq-answer-inner">' + html + '</div>';
    }
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('active');
      faqItems.forEach(function (other) {
        other.classList.remove('active');
        var oa = other.querySelector('.faq-answer');
        if (oa) oa.style.maxHeight = null;
        var ob = other.querySelector('.faq-question');
        if (ob) ob.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---------- FADE-IN ON SCROLL ----------
  var fadeElements = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window && fadeElements.length) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    fadeElements.forEach(function (el) { fadeObserver.observe(el); });
  } else {
    fadeElements.forEach(function (el) { el.classList.add('visible'); });
  }

  // ---------- LAZY 3D LOADER ----------
  var threeLoader = null;
  function loadThree() {
    if (window.THREE) return Promise.resolve();
    if (threeLoader) return threeLoader;
    threeLoader = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = THREE_CDN;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { threeLoader = null; reject(new Error('Three.js failed to load')); };
      document.head.appendChild(s);
    });
    return threeLoader;
  }

  function loadScene(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Scene failed: ' + src)); };
      document.body.appendChild(s);
    });
  }

  var sceneMap = {
    heroCanvas: 'js/hero3d.js',
    aboutCanvas: 'js/about3d.js',
    leistungenCanvas: 'js/leistungen3d.js'
  };

  if ('IntersectionObserver' in window) {
    var canvasObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        var src = sceneMap[id];
        if (!src) return;
        obs.unobserve(entry.target);
        loadThree()
          .then(function () { return loadScene(src); })
          .catch(function (err) { console.warn(err); });
      });
    }, { rootMargin: '200px 0px' });

    Object.keys(sceneMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) canvasObserver.observe(el);
    });
  } else {
    // No IO support: load eagerly
    Object.keys(sceneMap).forEach(function (id) {
      if (document.getElementById(id)) {
        loadThree().then(function () { return loadScene(sceneMap[id]); }).catch(function () {});
      }
    });
  }

  // ---------- COOKIE BANNER ----------
  var cookieBanner = document.getElementById('cookieBanner');
  var cookieAccept = document.getElementById('cookieAccept');
  var cookieDecline = document.getElementById('cookieDecline');

  if (cookieBanner) {
    var consent = null;
    try { consent = localStorage.getItem(COOKIE_KEY); } catch (e) {}
    if (!consent) {
      setTimeout(function () { cookieBanner.classList.add('visible'); }, COOKIE_DELAY_MS);
    }
    function persistConsent(value) {
      try { localStorage.setItem(COOKIE_KEY, value); } catch (e) {}
      cookieBanner.classList.remove('visible');
    }
    if (cookieAccept) cookieAccept.addEventListener('click', function () { persistConsent('accepted'); });
    if (cookieDecline) cookieDecline.addEventListener('click', function () { persistConsent('declined'); });
  }

  // ---------- CONTACT FORM ----------
  var contactForm = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (formStatus) { formStatus.className = 'form-status'; formStatus.textContent = ''; }

      var honeypot = contactForm.querySelector('[name="website"]');
      if (honeypot && honeypot.value) return;

      var fields = {
        firstName: 'Vorname',
        lastName: 'Nachname',
        email: 'E-Mail',
        subject: 'Betreff',
        message: 'Nachricht'
      };
      var errors = [];
      Object.keys(fields).forEach(function (id) {
        var el = contactForm.querySelector('#' + id);
        if (!el || !el.value.trim()) errors.push(fields[id]);
      });
      var emailEl = contactForm.querySelector('#email');
      if (emailEl && emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
        errors.push('gültige E-Mail-Adresse');
      }
      var consentEl = contactForm.querySelector('#consent');
      if (!consentEl || !consentEl.checked) errors.push('Datenschutz-Einwilligung');

      if (errors.length) {
        if (formStatus) {
          formStatus.className = 'form-status error';
          formStatus.textContent = 'Bitte füllen Sie folgende Felder korrekt aus: ' + errors.join(', ') + '.';
        }
        return;
      }

      var submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.classList.add('is-loading');

      // Simulate submit (replace with fetch() to a real endpoint in production)
      setTimeout(function () {
        if (submitBtn) submitBtn.classList.remove('is-loading');
        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.textContent = 'Vielen Dank für Ihre Nachricht! Wir melden uns zeitnah bei Ihnen zurück.';
        }
        contactForm.reset();
      }, 700);
    });
  }
})();
/* ============================================
   FUCHS MESSEBAU – Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // --- Header Scroll Effect ---
  const header = document.getElementById('siteHeader');
  if (header) {
    let lastScroll = 0;
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var currentScroll = window.pageYOffset;
          if (currentScroll > 40) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
          // Hide header on scroll down, show on scroll up
          if (currentScroll > 300 && currentScroll > lastScroll) {
            header.style.transform = 'translateY(-100%)';
          } else {
            header.style.transform = 'translateY(0)';
          }
          lastScroll = currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // --- Mobile Navigation ---
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');
  const navOverlay = document.getElementById('navOverlay');

  function openNav() {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Menü schließen');
    mainNav.classList.add('open');
    navOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Menü öffnen');
    mainNav.classList.remove('open');
    navOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', function () {
      if (mainNav.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', closeNav);
    }

    // Close nav on link click (mobile)
    var navLinks = mainNav.querySelectorAll('.nav-list a');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (mainNav.classList.contains('open')) {
          closeNav();
        }
      });
    });

    // Close nav on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('open')) {
        closeNav();
        hamburger.focus();
      }
    });
  }

  // --- FAQ Accordion ---
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');

    if (btn && answer) {
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('active');

        // Close all
        faqItems.forEach(function (other) {
          var otherAnswer = other.querySelector('.faq-answer');
          other.classList.remove('active');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
          var otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });

        // Open clicked if was closed
        if (!isOpen) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // --- Scroll Fade-In Animation ---
  var fadeElements = document.querySelectorAll('.fade-in');
  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show everything
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // --- Cookie Banner ---
  var cookieBanner = document.getElementById('cookieBanner');
  var cookieAccept = document.getElementById('cookieAccept');
  var cookieDecline = document.getElementById('cookieDecline');

  function getCookieConsent() {
    try {
      return localStorage.getItem('fm_cookie_consent');
    } catch (e) {
      return null;
    }
  }

  function setCookieConsent(value) {
    try {
      localStorage.setItem('fm_cookie_consent', value);
    } catch (e) {
      // localStorage not available
    }
  }

  if (cookieBanner) {
    var consent = getCookieConsent();
    if (!consent) {
      setTimeout(function () {
        cookieBanner.classList.add('visible');
      }, 1000);
    }

    if (cookieAccept) {
      cookieAccept.addEventListener('click', function () {
        setCookieConsent('accepted');
        cookieBanner.classList.remove('visible');
      });
    }

    if (cookieDecline) {
      cookieDecline.addEventListener('click', function () {
        setCookieConsent('declined');
        cookieBanner.classList.remove('visible');
      });
    }
  }

  // --- Contact Form (Client-side validation) ---
  var contactForm = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Reset status
      if (formStatus) {
        formStatus.className = 'form-status';
        formStatus.textContent = '';
      }

      // Honeypot check
      var honeypot = contactForm.querySelector('[name="website"]');
      if (honeypot && honeypot.value) {
        return; // Bot detected
      }

      // Validate required fields
      var firstName = contactForm.querySelector('#firstName');
      var lastName = contactForm.querySelector('#lastName');
      var email = contactForm.querySelector('#email');
      var subject = contactForm.querySelector('#subject');
      var message = contactForm.querySelector('#message');
      var consent = contactForm.querySelector('#consent');

      var errors = [];

      if (!firstName || !firstName.value.trim()) errors.push('Vorname');
      if (!lastName || !lastName.value.trim()) errors.push('Nachname');
      if (!email || !email.value.trim()) {
        errors.push('E-Mail');
      } else {
        // Basic email validation
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value.trim())) {
          errors.push('gültige E-Mail-Adresse');
        }
      }
      if (!subject || !subject.value) errors.push('Betreff');
      if (!message || !message.value.trim()) errors.push('Nachricht');
      if (!consent || !consent.checked) errors.push('Datenschutz-Einwilligung');

      if (errors.length > 0) {
        if (formStatus) {
          formStatus.className = 'form-status error';
          formStatus.textContent = 'Bitte füllen Sie folgende Felder korrekt aus: ' + errors.join(', ') + '.';
        }
        return;
      }

      // Form is valid — show success message
      // In production this would submit to a server endpoint
      if (formStatus) {
        formStatus.className = 'form-status success';
        formStatus.textContent = 'Vielen Dank für Ihre Nachricht! Wir melden uns zeitnah bei Ihnen zurück.';
      }

      contactForm.reset();
    });
  }

})();
