/* ============================================================
   Elliott Luftman — Portfolio Script
   Vanilla JS: fade-in, active nav, hamburger, smooth scroll,
   logo fallback, load more, sliding filter bar.
   ============================================================ */

'use strict';


/* ============================================================
   SCROLL-TRIGGERED FADE-IN  (IntersectionObserver)
   ============================================================ */
(function initFadeIn() {
  var els = document.querySelectorAll('.fade-in');
  if (!els.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.07, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(function (el) { observer.observe(el); });
})();


/* ============================================================
   ACTIVE NAV LINK HIGHLIGHTING
   ============================================================ */
(function initActiveNav() {
  var navLinks = document.querySelectorAll('.nav-link');
  var sections = document.querySelectorAll('section[id]');
  if (!navLinks.length || !sections.length) return;

  var navH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '60',
    10
  );

  function setActive(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { threshold: 0, rootMargin: '-' + navH + 'px 0px -40% 0px' }
  );

  sections.forEach(function (s) { observer.observe(s); });
})();


/* ============================================================
   NAVBAR — .scrolled class on scroll
   ============================================================ */
(function initNavbarScroll() {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ============================================================
   HAMBURGER MENU
   ============================================================ */
(function initHamburger() {
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    var opening = !hamburger.classList.contains('open');
    if (opening) {
      hamburger.classList.add('open');
      navLinks.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      closeMenu();
    }
  });

  navLinks.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ============================================================
   SMOOTH SCROLL WITH NAV OFFSET
   ============================================================ */
(function initSmoothScroll() {
  var navbar = document.getElementById('navbar');

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;

      var target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();

      var navHeight = navbar ? navbar.offsetHeight : 0;
      var targetY   = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
})();


/* ============================================================
   HEADSHOT FALLBACK
   ============================================================ */
(function initHeadshotFallback() {
  var img         = document.getElementById('headshot-img');
  var placeholder = document.getElementById('headshot-placeholder');
  if (!img || !placeholder) return;

  function showPlaceholder() {
    img.style.display = 'none';
    placeholder.style.display = 'flex';
  }

  img.addEventListener('error', showPlaceholder);
  if (img.complete && img.naturalWidth === 0) showPlaceholder();
})();


/* ============================================================
   CANVAS LOGO FALLBACK
   Called via onerror="setLogoFallback(this, 'A', '#1a1a2e')"
   ============================================================ */
function setLogoFallback(img, letter, bgColor) {
  var size = 88;
  var canvas = document.createElement('canvas');
  canvas.width  = size;
  canvas.height = size;
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor || '#27272a';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, size * 0.22);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, size, size);
  }

  ctx.fillStyle = '#a1a1aa';
  ctx.font = 'bold ' + Math.round(size * 0.44) + 'px "Instrument Sans", system-ui, sans-serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter.toUpperCase(), size / 2, size / 2 + 1);

  img.src = canvas.toDataURL();
  img.onerror = null;
}


/* ============================================================
   SLIDING FILTER BAR
   moveGlider positions the purple pill under the active btn.
   initFilterBar wires buttons + glider for one bar.
   ============================================================ */
function moveGlider(glider, btn) {
  glider.style.left  = btn.offsetLeft + 'px';
  glider.style.width = btn.offsetWidth + 'px';
}

function initFilterBar(barId, gliderId, onFilter) {
  var bar    = document.getElementById(barId);
  var glider = document.getElementById(gliderId);
  if (!bar || !glider) return;

  var buttons = bar.querySelectorAll('.filter-btn');

  // Position glider on the initially-active button
  var activeBtn = bar.querySelector('.filter-btn.active');
  if (activeBtn) {
    // Wait one frame so layout is stable
    requestAnimationFrame(function () { moveGlider(glider, activeBtn); });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      moveGlider(glider, btn);
      if (onFilter) onFilter(btn.dataset.filter);
    });
  });

  // Reposition on resize (text reflow can change button widths)
  window.addEventListener('resize', function () {
    var current = bar.querySelector('.filter-btn.active');
    if (current) moveGlider(glider, current);
  });
}


/* ============================================================
   PROJECTS FILTER
   ============================================================ */
(function initProjFilter() {
  var cards = document.querySelectorAll('.project-card[data-category]');
  if (!cards.length) return;

  function filterProjects(value) {
    cards.forEach(function (card) {
      var cats = card.dataset.category.split(' ');
      if (value === 'all' || cats.indexOf(value) !== -1) {
        card.removeAttribute('hidden');
      } else {
        card.setAttribute('hidden', '');
      }
    });
  }

  initFilterBar('proj-filter-bar', 'proj-glider', filterProjects);
})();


/* ============================================================
   EXPERIENCE ACCORDION
   Click the header row to expand / collapse the description.
   JS appends a chevron element and wraps it with the date.
   ============================================================ */
(function initExpAccordion() {
  var items = document.querySelectorAll('.exp-item');
  if (!items.length) return;

  var chevronSVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" ' +
    'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="6 9 12 15 18 9"/></svg>';

  items.forEach(function (item) {
    var header = item.querySelector('.exp-top');
    var desc   = item.querySelector('.exp-desc');
    if (!header || !desc) return;

    /* Wrap the date span + chevron inside a .exp-date-group div */
    var dateEl = header.querySelector('.exp-date');
    if (dateEl) {
      var group = document.createElement('div');
      group.className = 'exp-date-group';
      dateEl.parentNode.insertBefore(group, dateEl);
      group.appendChild(dateEl);

      var chevronEl = document.createElement('span');
      chevronEl.className = 'exp-chevron';
      chevronEl.innerHTML = chevronSVG;
      group.appendChild(chevronEl);
    }

    /* Toggle on header click; skip if a link was clicked */
    header.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      item.classList.toggle('open');
    });

    /* Keyboard: Enter/Space on header */
    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'button');
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.classList.toggle('open');
      }
    });
  });
})();


/* ============================================================
   LOAD MORE BUTTON
   ============================================================ */
(function initLoadMore() {
  var btn = document.getElementById('load-more-btn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    btn.textContent = 'More projects coming soon!';
    btn.disabled    = true;
    btn.style.opacity = '0.5';
    btn.style.cursor  = 'default';
  });
})();


/* ============================================================
   CONTACT DOCK — fixed pill hides when contact section is
   visible; embedded pill fades in inside the section.
   Never two pills visible at once.
   ============================================================ */
(function initContactDock() {
  var fixedDock     = document.getElementById('dock');
  var contactDock   = document.getElementById('contact-dock');
  var contactSection = document.getElementById('contact');
  if (!fixedDock || !contactDock || !contactSection) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          /* Contact section in view: hide fixed dock, show embedded */
          fixedDock.classList.add('dock--hidden');
          contactDock.classList.add('visible');
          contactDock.removeAttribute('aria-hidden');
        } else {
          /* Contact section out of view: show fixed dock, hide embedded */
          fixedDock.classList.remove('dock--hidden');
          contactDock.classList.remove('visible');
          contactDock.setAttribute('aria-hidden', 'true');
        }
      });
    },
    /* Trigger when ~15% of the contact section is visible */
    { threshold: 0.15 }
  );

  observer.observe(contactSection);
})();
