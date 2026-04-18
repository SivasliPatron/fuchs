/* FUCHS MESSEBAU - Main JS 2026 */
(function () {
  'use strict';
  var SCROLL_THRESHOLD = 40;
  var COOKIE_DELAY_MS = 1000;
  var THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var COOKIE_KEY = 'fm_cookie_consent';
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
  var hamburger = document.getElementById('hamburger');
  var mainNav = document.getElementById('mainNav');
  var navOverlay = document.getElementById('navOverlay');
  function openNav() {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    mainNav.classList.add('open');
    if (navOverlay) navOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
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
      if (e.key === 'Escape' && mainNav.classList.contains('open')) { closeNav(); hamburger.focus(); }
    });
  }
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;
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
  var fadeElements = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window && fadeElements.length) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); fadeObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    fadeElements.forEach(function (el) { fadeObserver.observe(el); });
  } else {
    fadeElements.forEach(function (el) { el.classList.add('visible'); });
  }
  var threeLoader = null;
  function loadThree() {
    if (window.THREE) return Promise.resolve();
    if (threeLoader) return threeLoader;
    threeLoader = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = THREE_CDN; s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { threeLoader = null; reject(new Error('Three.js failed')); };
      document.head.appendChild(s);
    });
    return threeLoader;
  }
  function loadScene(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Scene failed: ' + src)); };
      document.body.appendChild(s);
    });
  }
  var sceneMap = { heroCanvas: 'js/hero3d.js', aboutCanvas: 'js/about3d.js', leistungenCanvas: 'js/leistungen3d.js' };
  if ('IntersectionObserver' in window) {
    var canvasObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id; var src = sceneMap[id];
        if (!src) return;
        obs.unobserve(entry.target);
        loadThree().then(function () { return loadScene(src); }).catch(function (err) { console.warn(err); });
      });
    }, { rootMargin: '200px 0px' });
    Object.keys(sceneMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) canvasObserver.observe(el);
    });
  }
  var cookieBanner = document.getElementById('cookieBanner');
  var cookieAccept = document.getElementById('cookieAccept');
  var cookieDecline = document.getElementById('cookieDecline');
  if (cookieBanner) {
    var c = null; try { c = localStorage.getItem(COOKIE_KEY); } catch (e) {}
    if (!c) setTimeout(function () { cookieBanner.classList.add('visible'); }, COOKIE_DELAY_MS);
    var persistConsent = function (v) { try { localStorage.setItem(COOKIE_KEY, v); } catch (e) {} cookieBanner.classList.remove('visible'); };
    if (cookieAccept) cookieAccept.addEventListener('click', function () { persistConsent('accepted'); });
    if (cookieDecline) cookieDecline.addEventListener('click', function () { persistConsent('declined'); });
  }
  var contactForm = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (formStatus) { formStatus.className = 'form-status'; formStatus.textContent = ''; }
      var honeypot = contactForm.querySelector('[name="website"]');
      if (honeypot && honeypot.value) return;
      var fields = { firstName: 'Vorname', lastName: 'Nachname', email: 'E-Mail', subject: 'Betreff', message: 'Nachricht' };
      var errors = [];
      Object.keys(fields).forEach(function (id) {
        var el = contactForm.querySelector('#' + id);
        if (!el || !el.value.trim()) errors.push(fields[id]);
      });
      var emailEl = contactForm.querySelector('#email');
      if (emailEl && emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) errors.push('gueltige E-Mail-Adresse');
      var consentEl = contactForm.querySelector('#consent');
      if (!consentEl || !consentEl.checked) errors.push('Datenschutz-Einwilligung');
      if (errors.length) {
        if (formStatus) { formStatus.className = 'form-status error'; formStatus.textContent = 'Bitte fuellen Sie folgende Felder aus: ' + errors.join(', ') + '.'; }
        return;
      }
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.classList.add('is-loading');
      setTimeout(function () {
        if (submitBtn) submitBtn.classList.remove('is-loading');
        if (formStatus) { formStatus.className = 'form-status success'; formStatus.textContent = 'Vielen Dank fuer Ihre Nachricht!'; }
        contactForm.reset();
      }, 700);
    });
  }

  // LIGHTBOX (Projektgalerie)
  var lightbox = document.getElementById('lightbox');
  var galleryCards = document.querySelectorAll('[data-gallery]');
  if (lightbox && galleryCards.length) {
    var lbImage = document.getElementById('lightboxImage');
    var lbCaption = document.getElementById('lightboxCaption');
    var lbCounter = document.getElementById('lightboxCounter');
    var lbClose = document.getElementById('lightboxClose');
    var lbPrev = document.getElementById('lightboxPrev');
    var lbNext = document.getElementById('lightboxNext');
    var currentImages = [];
    var currentTitle = '';
    var currentIndex = 0;
    var lastFocused = null;

    function buildUrl(folder, file) {
      var parts = folder.split('/').map(encodeURIComponent).join('/');
      return parts + '/' + encodeURIComponent(file);
    }
    function render() {
      if (!currentImages.length) return;
      var file = currentImages[currentIndex];
      lbImage.src = buildUrl(currentFolder, file);
      lbImage.alt = currentTitle + ' – Bild ' + (currentIndex + 1);
      lbCaption.textContent = currentTitle;
      lbCounter.textContent = (currentIndex + 1) + ' / ' + currentImages.length;
      var multi = currentImages.length > 1;
      lbPrev.style.display = multi ? '' : 'none';
      lbNext.style.display = multi ? '' : 'none';
    }
    var currentFolder = '';
    function open(card) {
      currentFolder = card.getAttribute('data-folder') || '';
      currentTitle = card.getAttribute('data-title') || '';
      currentImages = (card.getAttribute('data-images') || '').split('|').filter(Boolean);
      if (!currentImages.length) return;
      currentIndex = 0;
      lastFocused = document.activeElement;
      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');
      render();
      requestAnimationFrame(function () { lightbox.classList.add('is-visible'); });
      lbClose.focus();
    }
    function close() {
      lightbox.classList.remove('is-visible');
      document.body.classList.remove('lightbox-open');
      setTimeout(function () {
        lightbox.hidden = true;
        lbImage.src = '';
      }, 200);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }
    function next() {
      if (!currentImages.length) return;
      currentIndex = (currentIndex + 1) % currentImages.length;
      render();
    }
    function prev() {
      if (!currentImages.length) return;
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      render();
    }
    galleryCards.forEach(function (card) {
      card.addEventListener('click', function () { open(card); });
    });
    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click', prev);
    lbNext.addEventListener('click', next);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });
  }
})();