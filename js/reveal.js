/**
 * Scroll-triggered reveal animations for portfolio sections.
 */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function observe(selector, options) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    if (prefersReducedMotion) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const opts = Object.assign(
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12,
      },
      options
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, opts);

    elements.forEach((el) => observer.observe(el));
  }

  window.PortfolioReveal = { observe };
})();
