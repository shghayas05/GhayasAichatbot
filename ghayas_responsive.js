/* ghayas_responsive.js
   Small responsive helpers and event listeners.
   - Adjusts iframe height on orientation/resize
   - Moves floating controls if necessary (mobile bottom bar)
   - Ensures popup tool positions correct after resize
   - No change to your existing functions/IDs — only enhances layout
*/

(function () {
  const iframe = document.getElementById('mainFrame');
  const floating = document.querySelector('.floating');
  const tools = Array.from(document.querySelectorAll('.tool'));
  const menuBtn = document.querySelector('.menu-btn');
  const sidebar = document.getElementById('sidebar');

  function sizeIframe() {
    if (!iframe) return;
    // prefer to fill available panel; keep a sensible minHeight
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const headerH = document.querySelector('header') ? document.querySelector('header').offsetHeight : 72;
    const footerFloating = (window.matchMedia('(max-width:900px)').matches) ? 72 : 0;
    const newHeight = Math.max(360, vh - headerH - footerFloating - 32);
    iframe.style.minHeight = newHeight + 'px';
    iframe.style.height = newHeight + 'px';
  }

  function adaptFloatingPosition() {
    if (!floating) return;
    if (window.matchMedia('(max-width:900px)').matches) {
      // move to bottom bar (CSS rules handle appearance)
      floating.classList.add('mobile-bottom');
    } else {
      floating.classList.remove('mobile-bottom');
    }
  }

  function clampToolPositions() {
    tools.forEach(t => {
      t.style.maxHeight = Math.min(window.innerHeight * 0.78, 920) + 'px';
    });
  }

  // If sidebar open on small screen, ensure it gets focus
  function ensureSidebarBehavior() {
    if (!sidebar || !menuBtn) return;
    menuBtn.addEventListener('click', () => {
      // if opening on tiny width, scroll to top so sidebar is visible
      if (window.matchMedia('(max-width:900px)').matches) window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Run on start and on resize/orientation change
  function doLayoutUpdates() {
    sizeIframe();
    adaptFloatingPosition();
    clampToolPositions();
  }

  // debounce helper
  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, arguments), ms);
    };
  }

  window.addEventListener('resize', debounce(doLayoutUpdates, 120));
  window.addEventListener('orientationchange', debounce(doLayoutUpdates, 120));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') doLayoutUpdates();
  });

  // init
  document.addEventListener('DOMContentLoaded', () => {
    doLayoutUpdates();
    ensureSidebarBehavior();
    // ensure tools reposition after any dynamic open
    tools.forEach(t => {
      t.addEventListener('transitionend', () => clampToolPositions());
    });
    // nice touch: when an auth modal opens on small screens, scroll to center
    const authModal = document.getElementById('authModal');
    if (authModal) {
      const obs = new MutationObserver(() => {
        if (authModal.classList.contains('show')) {
          setTimeout(() => authModal.scrollIntoView({ block: 'center', behavior: 'smooth' }), 140);
        }
      });
      obs.observe(authModal, { attributes: true, attributeFilter: ['class'] });
    }
  });

  // Expose for debugging if needed
  window.__ghayas_responsive = {
    sizeIframe,
    adaptFloatingPosition,
    clampToolPositions,
    doLayoutUpdates
  };
})();
