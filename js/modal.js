(function () {
  "use strict";

  /* ══════════════════════════════════════════
     PROJECT DATA STORE
     Add / edit entries here to update modals.
     Keys must match the data-modal-id on each card.
  ══════════════════════════════════════════ */
  var DATA = {

    techblog: {
      title:      "TechBlog Website",
      typeTag:    "Web App",
      category:   "Frontend",
      badge:      "frontend",
      image:      "assets/images/projects/techblog.svg",
      imageAlt:   "TechBlog Website — full page preview",
      previewNum: "1",
      description:
        "A fully responsive blog-style website built with vanilla HTML, CSS and " +
        "JavaScript. Every section — from the hero banner to article cards — is " +
        "hand-crafted for readability, performance and visual polish. No frameworks, " +
        "just clean, semantic code.",
      features: [
        "Responsive layout that adapts seamlessly from mobile to widescreen",
        "Article listing grid with live category filtering",
        "Clean, spacious typography optimised for long-form reading",
        "Smooth hover animations on cards, buttons and navigation links",
        "Semantic HTML5 with full keyboard and screen-reader accessibility",
        "Optimised images and minimal DOM for fast load times"
      ],
      tech:      ["HTML", "CSS", "JavaScript", "Responsive Design"],
      demoUrl:   "#",
      githubUrl: "#"
    },

    navbar: {
      title:      "Responsive Navbar",
      typeTag:    "Component",
      category:   "UI Design",
      badge:      "ui-design",
      image:      "assets/images/projects/navbar.svg",
      imageAlt:   "Responsive Navbar — component preview",
      previewNum: "2",
      description:
        "A production-ready navigation component built from scratch — no libraries. " +
        "Handles the full scroll lifecycle: transparent on load, frosted glass on " +
        "scroll, animated hamburger menu on mobile, and active-section highlighting " +
        "via IntersectionObserver.",
      features: [
        "Smooth animated hamburger menu that morphs into a close icon",
        "Active link highlighting updates automatically as you scroll",
        "Backdrop-blur frosted glass style kicks in on page scroll",
        "Full keyboard navigation and ARIA roles for accessibility",
        "Smooth scroll-to-section on nav link click",
        "Zero external dependencies — pure HTML, CSS, JS"
      ],
      tech:      ["HTML", "CSS", "JavaScript"],
      demoUrl:   "#",
      githubUrl: "#"
    },

    portfolio: {
      title:      "Portfolio Website",
      typeTag:    "Portfolio",
      category:   "Frontend",
      badge:      "frontend",
      image:      "assets/images/projects/portfolio.svg",
      imageAlt:   "Portfolio Website — full page preview",
      previewNum: "3",
      description:
        "This very portfolio — a premium personal site with glassmorphism design, " +
        "scroll-triggered animations, a working contact form (Node.js backend) and a " +
        "modular CSS architecture. Every micro-interaction is hand-tuned for feel and " +
        "performance.",
      features: [
        "Glassmorphism cards with backdrop-blur and inset ring shadows",
        "Scroll-triggered fade-up and slide animations via IntersectionObserver",
        "Typing-effect role display in the hero with pause-on-hover",
        "Toast notification system for contact form feedback",
        "Project filter system with smooth card re-flow animation",
        "Fully accessible — keyboard nav, ARIA labels, reduced-motion support"
      ],
      tech:      ["HTML", "CSS", "JavaScript", "Bootstrap", "Node.js"],
      demoUrl:   "#",
      githubUrl: "#"
    },

    vidtube: {
      title:      "Vidtube Clone",
      typeTag:    "UI Clone",
      category:   "UI Design",
      badge:      "ui-design",
      image:      "assets/images/projects/vidtube.svg",
      imageAlt:   "Vidtube Clone — full page preview",
      previewNum: "4",
      description:
        "A pixel-accurate recreation of a video streaming platform UI built to " +
        "master CSS Grid and Flexbox layout. Includes a collapsible sidebar, a " +
        "responsive video card grid, category chip filters, and a fully styled " +
        "search bar — all without JavaScript frameworks.",
      features: [
        "Responsive video card grid built entirely with CSS Grid",
        "Collapsible sidebar navigation with icon-only compact mode",
        "Category filter chip row with active state styling",
        "Thumbnail hover overlay with play-button and view count",
        "Dark-mode stylesheet ready for quick toggle",
        "Accurate channel avatar, metadata and timestamp layout"
      ],
      tech:      ["HTML", "CSS", "JavaScript", "Responsive Design"],
      demoUrl:   "#",
      githubUrl: "#"
    }

  };

  /* ══════════════════════════════════════════
     DOM REFS
  ══════════════════════════════════════════ */
  var modal     = document.getElementById("project-modal");
  if (!modal) return;

  var backdrop     = modal.querySelector(".modal__backdrop");
  var container    = modal.querySelector(".modal__container");
  var closeBtn     = modal.querySelector(".modal__close");
  var imageWrap    = modal.querySelector(".modal__image-wrap");
  var imgEl        = modal.querySelector(".modal__image");
  var badgeEl      = modal.querySelector(".modal__badge");
  var typeTagEl    = modal.querySelector(".modal__type-tag");
  var titleEl      = modal.querySelector(".modal__title");
  var descEl       = modal.querySelector(".modal__desc");
  var featuresList = modal.querySelector(".modal__features");
  var techWrap     = modal.querySelector(".modal__tech");
  var demoBtn      = modal.querySelector(".modal__btn--primary");
  var githubBtn    = modal.querySelector(".modal__btn--outline");

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lastFocused   = null;
  var closeTimer    = null;

  /* ══════════════════════════════════════════
     POPULATE
  ══════════════════════════════════════════ */
  function populate(id) {
    var d = DATA[id];
    if (!d) return false;

    /* Image */
    imgEl.src = d.image;
    imgEl.alt = d.imageAlt;
    if (imageWrap) imageWrap.setAttribute("data-preview", d.previewNum);

    /* Badge */
    badgeEl.className  = "modal__badge modal__badge--" + d.badge;
    badgeEl.textContent = d.category;

    /* Type tag + title + description */
    typeTagEl.textContent = d.typeTag;
    titleEl.textContent   = d.title;
    descEl.textContent    = d.description;

    /* Features */
    featuresList.innerHTML = "";
    d.features.forEach(function (feat) {
      var li   = document.createElement("li");
      li.className = "modal__feature-item";
      var dot  = document.createElement("span");
      dot.className  = "modal__feature-dot";
      dot.setAttribute("aria-hidden", "true");
      var txt  = document.createTextNode(feat);
      li.appendChild(dot);
      li.appendChild(txt);
      featuresList.appendChild(li);
    });

    /* Tech tags */
    techWrap.innerHTML = "";
    d.tech.forEach(function (tag) {
      var span = document.createElement("span");
      span.className   = "modal__tech-tag";
      span.textContent = tag;
      techWrap.appendChild(span);
    });

    /* CTA buttons */
    demoBtn.href   = d.demoUrl;
    githubBtn.href = d.githubUrl;
    demoBtn.setAttribute("aria-label",   "View " + d.title + " live demo");
    githubBtn.setAttribute("aria-label", "View " + d.title + " on GitHub");

    /* Update dialog label */
    modal.setAttribute("aria-label", d.title + " — project details");

    return true;
  }

  /* ══════════════════════════════════════════
     OPEN / CLOSE
  ══════════════════════════════════════════ */
  function openModal(id) {
    if (!populate(id)) return;

    lastFocused = document.activeElement;

    /* Reset scroll position of the content pane */
    var content = modal.querySelector(".modal__content");
    if (content) content.scrollTop = 0;
    var inner = modal.querySelector(".modal__inner");
    if (inner) inner.scrollTop = 0;

    document.body.classList.add("modal-open");
    modal.removeAttribute("aria-hidden");
    modal.classList.remove("is-closing");
    modal.classList.add("is-open");

    /* Move focus into the dialog */
    requestAnimationFrame(function () {
      if (closeBtn) closeBtn.focus();
    });
  }

  function closeModal() {
    if (!modal.classList.contains("is-open")) return;

    modal.classList.add("is-closing");
    clearTimeout(closeTimer);

    var delay = reducedMotion ? 50 : 300;

    closeTimer = setTimeout(function () {
      modal.classList.remove("is-open", "is-closing");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");

      /* Restore focus to the card that triggered the modal */
      if (lastFocused) {
        try { lastFocused.focus(); } catch (e) { /* ignore */ }
      }
    }, delay);
  }

  /* ══════════════════════════════════════════
     FOCUS TRAP
  ══════════════════════════════════════════ */
  function getFocusable() {
    return Array.from(
      container.querySelectorAll(
        "a[href]:not([disabled])," +
        "button:not([disabled])," +
        "[tabindex]:not([tabindex='-1'])"
      )
    ).filter(function (el) {
      return el.offsetParent !== null;
    });
  }

  function trapFocus(e) {
    if (!modal.classList.contains("is-open")) return;
    if (e.key !== "Tab") return;

    var focusable = getFocusable();
    if (focusable.length < 2) return;

    var first = focusable[0];
    var last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /* ══════════════════════════════════════════
     EVENT WIRING
  ══════════════════════════════════════════ */

  /* Close button */
  closeBtn && closeBtn.addEventListener("click", closeModal);

  /* Backdrop click */
  backdrop && backdrop.addEventListener("click", closeModal);

  /* ESC key + focus trap */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeModal(); return; }
    trapFocus(e);
  });

  /* Project cards */
  document.querySelectorAll(".projects__card[data-modal-id]").forEach(function (card) {

    /* ARIA semantics so assistive tech knows the card opens a dialog */
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-haspopup", "dialog");

    var id = card.getAttribute("data-modal-id");

    /* Pre-fill aria-label from DATA */
    if (DATA[id]) {
      card.setAttribute(
        "aria-label",
        DATA[id].title + " — click to view project details"
      );
    }

    function tryOpen(e) {
      /* Don't trigger if the user clicked an action button/link */
      if (e.target.closest(".projects__actions")) return;
      if (id) openModal(id);
    }

    card.addEventListener("click", tryOpen);

    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        tryOpen(e);
      }
    });
  });

  /* Expose API for any outside callers */
  window.ProjectModal = { open: openModal, close: closeModal };

})();
