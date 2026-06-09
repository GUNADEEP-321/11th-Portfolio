(function () {
  "use strict";

  const loader = document.getElementById("loader");
  const loaderProgress = document.getElementById("loader-progress");
  const loaderPercentage = document.getElementById("loader-percentage");
  const mainContent = document.querySelector(".main-content");
  const navbar = document.getElementById("navbar");
  const hero = document.getElementById("home");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Exit early if reduced motion is enabled
  if (reducedMotion) {
    if (loader) loader.remove();
    if (mainContent) mainContent.classList.add("is-visible");
    if (navbar) navbar.classList.add("is-visible");
    if (hero) hero.classList.add("is-visible");
    return;
  }

  // Lock scroll during loading
  document.body.classList.add("is-loading");

  // Simulate loading progress (uses real DOM content loading as fallback)
  let progress = 0;
  const totalDuration = 3000; // 3 seconds total
  const intervalDuration = 50; // Update every 50ms
  const totalSteps = totalDuration / intervalDuration;
  let currentStep = 0;

  function updateProgress() {
    currentStep++;
    const easeOutQuart = 1 - Math.pow(1 - currentStep / totalSteps, 4);
    progress = Math.floor(easeOutQuart * 100);

    if (loaderProgress) loaderProgress.style.width = `${progress}%`;
    if (loaderPercentage) loaderPercentage.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(progressInterval);
      setTimeout(exitLoader, 400); // Small pause at 100%
    }
  }

  function exitLoader() {
    // Hide loader
    if (loader) loader.classList.add("is-hidden");

    // Unlock scroll
    document.body.classList.remove("is-loading");

    // Animate in main content, navbar, hero
    if (mainContent) mainContent.classList.add("is-visible");
    if (navbar) navbar.classList.add("is-visible");
    if (hero) hero.classList.add("is-visible");

    // Remove loader from DOM after animation
    setTimeout(() => {
      if (loader && loader.parentNode) {
        loader.remove();
      }
    }, 1000);
  }

  // Start progress animation only if loader exists
  if (loader) {
    const progressInterval = setInterval(updateProgress, intervalDuration);

    // Also use real DOMContentLoaded as a trigger in case simulation is too slow
    window.addEventListener("DOMContentLoaded", () => {
      if (progress < 80) {
        progress = 80;
      }
    });

    // Always complete loading when window is fully loaded
    window.addEventListener("load", () => {
      if (progress < 100) {
        progress = 100;
        updateProgress();
      }
    });
  }
})();
