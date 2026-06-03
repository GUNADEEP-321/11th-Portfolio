(function () {

  "use strict";

  /* ── Lazily create / reuse the container ── */
  function getContainer() {
    var el = document.getElementById("toast-container");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast-container";
      el.className = "toast-container";
      el.setAttribute("aria-live", "polite");
      el.setAttribute("aria-atomic", "false");
      document.body.appendChild(el);
    }
    return el;
  }

  /* ── SVG icons ── */
  var ICONS = {
    success: [
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">',
        '<path d="M2.5 8.5 6 12l7.5-8" stroke="currentColor"',
          ' stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>',
      "</svg>",
    ].join(""),

    error: [
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">',
        '<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor"',
          ' stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>',
      "</svg>",
    ].join(""),
  };

  var TITLES = {
    success: "Success",
    error:   "Error",
  };

  /* ── Dismiss a toast ── */
  function dismiss(toast) {
    if (toast.dataset.dismissed) return;
    toast.dataset.dismissed = "true";

    toast.classList.remove("is-visible");
    toast.classList.add("is-hiding");

    // Remove after the CSS transition completes
    toast.addEventListener("transitionend", function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, { once: true });

    // Hard fallback in case transitionend never fires
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 700);
  }

  /* ── Public API ── */
  function showToast(message, type, duration) {
    type     = type     || "success";
    duration = duration || 4000;

    var container = getContainer();

    /* Build the toast element */
    var toast = document.createElement("div");
    toast.className = "toast toast--" + type;
    toast.setAttribute("role", "alert");
    toast.style.setProperty("--toast-duration", duration + "ms");

    var icon  = ICONS[type]  || ICONS.success;
    var title = TITLES[type] || "Notice";

    var closeIcon = [
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">',
        '<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor"',
          ' stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>',
      "</svg>",
    ].join("");

    toast.innerHTML = [
      '<span class="toast__icon" aria-hidden="true">', icon, "</span>",
      '<div class="toast__body">',
        '<p class="toast__title">', title, "</p>",
        '<p class="toast__message">', message, "</p>",
      "</div>",
      '<button class="toast__close" type="button" aria-label="Dismiss notification">',
        closeIcon,
      "</button>",
      '<span class="toast__progress" aria-hidden="true"></span>',
    ].join("");

    container.appendChild(toast);

    /* Trigger enter animation (double-rAF forces a paint between insert & class add) */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add("is-visible");

        var bar = toast.querySelector(".toast__progress");
        if (bar) bar.classList.add("is-running");
      });
    });

    /* ── Auto-dismiss with hover-pause ── */
    var startTime    = Date.now();
    var remaining    = duration;
    var dismissTimer = setTimeout(function () { dismiss(toast); }, remaining);

    toast.addEventListener("mouseenter", function () {
      clearTimeout(dismissTimer);
      remaining -= (Date.now() - startTime);

      var bar = toast.querySelector(".toast__progress");
      if (bar) bar.style.animationPlayState = "paused";
    });

    toast.addEventListener("mouseleave", function () {
      startTime = Date.now();
      dismissTimer = setTimeout(function () { dismiss(toast); }, remaining);

      var bar = toast.querySelector(".toast__progress");
      if (bar) bar.style.animationPlayState = "running";
    });

    /* ── Manual close ── */
    toast.querySelector(".toast__close").addEventListener("click", function () {
      clearTimeout(dismissTimer);
      dismiss(toast);
    });
  }

  /* ── Expose globally so contact.js (and anything else) can call it ── */
  window.showToast = showToast;

})();
