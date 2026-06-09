(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (reducedMotion || !finePointer) {
    return;
  }

  let isRunning = false;
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let smoothCursorX = cursorX;
  let smoothCursorY = cursorY;
  let glowX = cursorX;
  let glowY = cursorY;

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  /* ------------------------------- */
  /* 1. Premium Custom Cursor Glow */
  /* ------------------------------- */
  let cursor, cursorGlow;

  function initCursor() {
    cursor = document.createElement("div");
    cursor.className = "cursor cursor-dot";
    document.body.appendChild(cursor);

    cursorGlow = document.createElement("div");
    cursorGlow.className = "cursor cursor-glow";
    document.body.appendChild(cursorGlow);

    document.body.style.cursor = "none";

    // Use passive event listener for better performance
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
  }

  function handleMouseMove(e) {
    cursorX = e.clientX;
    cursorY = e.clientY;
  }

  function updateCursor() {
    smoothCursorX = lerp(smoothCursorX, cursorX, 0.18);
    smoothCursorY = lerp(smoothCursorY, cursorY, 0.18);
    glowX = lerp(glowX, cursorX, 0.08);
    glowY = lerp(glowY, cursorY, 0.08);

    // Use transform for GPU acceleration instead of top/left
    cursor.style.transform = `translate3d(${smoothCursorX}px, ${smoothCursorY}px, 0)`;
    cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
  }

  /* ------------------------------- */
  /* 2. Magnetic Buttons */
  /* ------------------------------- */
  const magneticSelectors = [
    ".hero__btn",
    ".contact__submit",
    ".resume__download",
    ".navbar__link--cta",
    ".projects__btn",
  ];

  function initMagneticButtons() {
    const magneticButtons = document.querySelectorAll(magneticSelectors.join(","));

    magneticButtons.forEach((button) => {
      let buttonRect = null;

      button.addEventListener("mouseenter", () => {
        cursor.classList.add("cursor-hoverable");
        cursorGlow.classList.add("cursor-glow-hoverable");
        // Cache button rect on enter
        buttonRect = button.getBoundingClientRect();
      });

      button.addEventListener("mouseleave", () => {
        cursor.classList.remove("cursor-hoverable");
        cursorGlow.classList.remove("cursor-glow-hoverable");
        button.style.transform = "translate3d(0, 0, 0)";
        buttonRect = null;
      });

      button.addEventListener("mousemove", (e) => {
        if (!buttonRect) return;
        const centerX = buttonRect.left + buttonRect.width / 2;
        const centerY = buttonRect.top + buttonRect.height / 2;
        const deltaX = (e.clientX - centerX) / 4;
        const deltaY = (e.clientY - centerY) / 4;
        button.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
      }, { passive: true });
    });
  }

  /* ------------------------------- */
  /* 3. Mouse Spotlight Effect */
  /* ------------------------------- */
  const spotlightSelectors = [
    ".about__profile-card",
    ".skills__card",
    ".projects__card",
    ".articles__card",
  ];

  function initSpotlight() {
    const spotlightCards = document.querySelectorAll(spotlightSelectors.join(","));

    spotlightCards.forEach((card) => {
      let cardRect = null;

      card.addEventListener("mouseenter", () => {
        cardRect = card.getBoundingClientRect();
      });

      card.addEventListener("mouseleave", () => {
        cardRect = null;
      });

      card.addEventListener("mousemove", (e) => {
        if (!cardRect) return;
        const x = ((e.clientX - cardRect.left) / cardRect.width) * 100;
        const y = ((e.clientY - cardRect.top) / cardRect.height) * 100;
        card.style.setProperty("--spot-x", `${x}%`);
        card.style.setProperty("--spot-y", `${y}%`);
      }, { passive: true });
    });
  }

  /* ------------------------------- */
  /* 4. 3D Tilt Effects */
  /* ------------------------------- */
  const tiltSelectors = [
    ".about__profile-card",
    ".projects__card",
    ".articles__card--featured",
  ];

  function initTilt() {
    const tiltElements = document.querySelectorAll(tiltSelectors.join(","));

    tiltElements.forEach((el) => {
      let elRect = null;

      el.addEventListener("mouseenter", () => {
        elRect = el.getBoundingClientRect();
      });

      el.addEventListener("mouseleave", () => {
        elRect = null;
        el.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
        el.style.transition = "transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)";
      });

      el.addEventListener("mousemove", (e) => {
        if (!elRect) return;
        const x = e.clientX - elRect.left;
        const y = e.clientY - elRect.top;
        const centerX = elRect.width / 2;
        const centerY = elRect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        el.style.transition = "transform 0.1s ease-out";
      }, { passive: true });
    });
  }

  /* ------------------------------- */
  /* Animation Loop */
  /* ------------------------------- */
  let lastTime = performance.now();
  function animateLoop() {
    if (!isRunning) return;

    const now = performance.now();
    const delta = now - lastTime;

    updateCursor();
    lastTime = now;
    requestAnimationFrame(animateLoop);
  }

  /* ------------------------------- */
  /* Initialize All */
  /* ------------------------------- */
  function init() {
    isRunning = true;
    initCursor();
    initMagneticButtons();
    initSpotlight();
    initTilt();
    animateLoop();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
