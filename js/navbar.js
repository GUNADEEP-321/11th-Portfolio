(function () {
  "use strict";

  const navbar = document.getElementById("navbar");
  const nav = document.getElementById("navbar-nav");
  const toggle = document.getElementById("navbar-toggle");
  const backdrop = document.getElementById("navbar-backdrop");
  const links = document.querySelectorAll(".navbar__link[data-section]");

  if (!navbar || !nav || !toggle || !backdrop) return;

  const SCROLL_THRESHOLD = 24;
  let menuOpen = false;
  let scrollTicking = false;

  /* ─── Scroll: dynamic background ─── */
  function updateScrollState() {
    navbar.classList.toggle("navbar--scrolled", window.scrollY > SCROLL_THRESHOLD);
    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(updateScrollState);
      }
    },
    { passive: true }
  );
  updateScrollState();

  /* ─── Mobile menu ─── */
  function setMenuOpen(open) {
    menuOpen = open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("navbar__nav--open", open);
    backdrop.classList.toggle("navbar__backdrop--visible", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  toggle.addEventListener("click", () => setMenuOpen(!menuOpen));
  backdrop.addEventListener("click", () => setMenuOpen(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });

  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    },
    { passive: true }
  );

  /* ─── Active link highlighting ─── */
  function setActiveLink(activeLink) {
    links.forEach((link) => {
      link.classList.toggle("navbar__link--active", link === activeLink);
    });
  }

  function linkForSection(id) {
    return document.querySelector(`.navbar__link[data-section="${id}"]`);
  }

  function updateActiveOnScroll() {
    const sections = document.querySelectorAll("main section[id]");
    if (!sections.length) return;

    const offset = navbar.offsetHeight + 64;
    let activeSection = sections[0];

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= offset && rect.bottom > offset) {
        activeSection = section;
      }
    });

    /* At page top, always highlight Home */
    if (window.scrollY < 80) {
      activeSection = document.getElementById("home") || activeSection;
    }

    const link = linkForSection(activeSection.id);
    if (link) setActiveLink(link);
  }

  let activeTicking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (!activeTicking) {
        activeTicking = true;
        requestAnimationFrame(() => {
          updateActiveOnScroll();
          activeTicking = false;
        });
      }
    },
    { passive: true }
  );

  /* Close menu + set active when any scroll-link navigates */
  document.addEventListener("portfolio:navigate", (e) => {
    setMenuOpen(false);

    const hash = e.detail && e.detail.hash;
    const id = hash ? hash.replace("#", "") : "";
    const navLink = linkForSection(id);
    if (navLink) setActiveLink(navLink);
  });

  /* Initial state */
  const homeLink = linkForSection("home");
  if (homeLink) setActiveLink(homeLink);

  updateActiveOnScroll();
})();
