/**
 * Shared smooth-scroll utility for navbar, hero CTAs, and brand link.
 */
(function () {
  "use strict";

  function getNavbar() {
    return document.getElementById("navbar");
  }

  function getScrollOffset() {
    const navbar = getNavbar();
    return navbar ? navbar.offsetHeight : 68;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function scrollToHash(hash, options) {
    const opts = options || {};
    if (!hash || typeof hash !== "string") return false;

    const id = hash.startsWith("#") ? hash : `#${hash}`;
    const target = document.querySelector(id);
    if (!target) return false;

    const offset = getScrollOffset();
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });

    if (opts.updateHistory !== false) {
      history.pushState(null, "", id);
    }

    return true;
  }

  function initScrollLinks(selector) {
    const links = document.querySelectorAll(selector);
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        scrollToHash(href);

        document.dispatchEvent(
          new CustomEvent("portfolio:navigate", {
            detail: { hash: href, link },
          })
        );
      });
    });
  }

  window.PortfolioScroll = {
    getScrollOffset,
    scrollToHash,
    initScrollLinks,
  };

  initScrollLinks('a.scroll-link[href^="#"]');
})();
