/**
 * PDP — Technogym style product page
 * Combines:
 *  1. Sidebar accordion open/close
 *  2. Floating audio button toggle state
 *  3. Dark feature-carousel prev/next arrow scrolling
 *  4. Mobile main/thumbnail gallery carousel sync (snap-proof)
 *  5. Sticky bottom bar: hide while scrolling, reveal once scroll stops
 */
(function () {
  'use strict';
 
  /* -------------------- Accordions -------------------- */
 
  function initAccordions(root) {
    var triggers = root.querySelectorAll('[data-pdp-accordion-trigger]');
 
    triggers.forEach(function (trigger) {
      var panel = trigger.nextElementSibling;
      if (!panel) return;
 
      trigger.addEventListener('click', function () {
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        setPanelState(trigger, panel, !isOpen);
      });
    });
  }
 
  function setPanelState(trigger, panel, open) {
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
 
    if (open) {
      var inner = panel.querySelector('.pdp__accordion-panel-inner');
      var height = inner ? inner.offsetHeight : panel.scrollHeight;
      panel.style.height = height + 'px';
 
      window.setTimeout(function () {
        if (trigger.getAttribute('aria-expanded') === 'true') {
          panel.style.height = 'auto';
        }
      }, 260);
    } else {
      if (panel.style.height === 'auto' || panel.style.height === '') {
        panel.style.height = panel.scrollHeight + 'px';
        panel.offsetHeight; // force reflow
      }
      requestAnimationFrame(function () {
        panel.style.height = '0px';
      });
    }
  }
 
  /* -------------------- Audio buttons -------------------- */
 
  function initAudioButtons(root) {
    var buttons = root.querySelectorAll('[data-pdp-audio-toggle], .pfc__audio-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var isActive = btn.classList.toggle('is-active');
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        // Hook your audio-guide playback logic here.
      });
    });
  }
 
  /* -------------------- Feature carousel -------------------- */
 
  function initCarousel(wrap) {
    var track = wrap.querySelector('[data-pfc-track]');
    var prev = wrap.querySelector('[data-pfc-prev]');
    var next = wrap.querySelector('[data-pfc-next]');
    if (!track) return;
 
    function scrollByAmount(direction) {
      var slide = track.querySelector('.pfc__slide');
      var amount = slide ? slide.getBoundingClientRect().width + 4 : track.clientWidth * 0.8;
      track.scrollBy({ left: amount * direction, behavior: 'smooth' });
    }
 
    if (prev) prev.addEventListener('click', function () { scrollByAmount(-1); });
    if (next) next.addEventListener('click', function () { scrollByAmount(1); });
  }
 
  /* -------------------- Mobile main/thumbnail gallery -------------------- */
 
  function initMobileGallery(root) {
    var galleries = root.querySelectorAll('.pdp__m-gallery');
 
    galleries.forEach(function (gallery) {
      var main = gallery.querySelector('[data-pdp-m-main]');
      var thumbs = gallery.querySelectorAll('[data-pdp-m-thumb]');
      if (!main || !thumbs.length) return;
 
      var isAnimating = false;
 
      function setActiveThumb(index) {
        thumbs.forEach(function (t, i) {
          t.classList.toggle('pdp__m-thumb--active', i === index);
        });
      }
 
      /**
       * Manual scroll animation. Native smooth scrolling gets cancelled by
       * `scroll-snap-type: x mandatory` on mobile browsers, so we drive the
       * animation ourselves with snapping temporarily disabled.
       */
      function animateScrollTo(targetLeft) {
        var startLeft = main.scrollLeft;
        var distance = targetLeft - startLeft;
        if (Math.abs(distance) < 1) return;
 
        var duration = 300;
        var startTime = null;
 
        isAnimating = true;
        main.style.scrollSnapType = 'none';
        main.style.scrollBehavior = 'auto';
 
        function easeOutCubic(t) {
          return 1 - Math.pow(1 - t, 3);
        }
 
        function step(timestamp) {
          if (startTime === null) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          main.scrollLeft = startLeft + distance * easeOutCubic(progress);
 
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            main.scrollLeft = targetLeft; // land exactly on the snap point
            main.style.scrollSnapType = '';
            main.style.scrollBehavior = '';
            isAnimating = false;
          }
        }
 
        requestAnimationFrame(step);
      }
 
      // Tap a thumbnail -> main carousel scrolls to that slide.
      thumbs.forEach(function (thumb, index) {
        thumb.addEventListener('click', function () {
          setActiveThumb(index);
          animateScrollTo(index * main.clientWidth);
        });
      });
 
      // Swipe the main carousel -> active thumbnail follows.
      var scrollTimeout;
      main.addEventListener('scroll', function () {
        if (isAnimating) return; // don't fight our own animation
        window.clearTimeout(scrollTimeout);
        scrollTimeout = window.setTimeout(function () {
          setActiveThumb(Math.round(main.scrollLeft / main.clientWidth));
        }, 100);
      }, { passive: true });
    });
  }
 
  /* -------------------- Sticky bottom bar: hide on scroll -------------------- */
 
  function initScrollHideBar(root) {
    var bars = root.querySelectorAll('.pdp-bar');
    if (!bars.length) return;
 
    var HIDE_DELAY = 200; // ms of no scrolling before the bar reappears
    var scrollTimer;
    var handlerAttached = false;
 
    function onScroll() {
      bars.forEach(function (bar) {
        bar.classList.add('pdp-bar--hidden');
      });
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(function () {
        bars.forEach(function (bar) {
          bar.classList.remove('pdp-bar--hidden');
        });
      }, HIDE_DELAY);
    }
 
    bars.forEach(function (bar) {
      if (bar.dataset.scrollInit) {
        handlerAttached = true;
      }
      bar.dataset.scrollInit = 'true';
    });
 
    if (!handlerAttached) {
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }
 
  /* -------------------- Init -------------------- */
 
  function init(root) {
    root = root || document;
    root.querySelectorAll('.pdp').forEach(function (section) {
      initAccordions(section);
      initAudioButtons(section);
      initMobileGallery(section);
    });
    root.querySelectorAll('.pfc').forEach(initAudioButtons);
    root.querySelectorAll('.pfc__track-wrap').forEach(initCarousel);
    initScrollHideBar(root === document ? document : root);
  }
 
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(document); });
  } else {
    init(document);
  }
 
  // Re-init when a new section instance is loaded in the theme editor.
  document.addEventListener('shopify:section:load', function (event) {
    init(event.target);
  });
})();