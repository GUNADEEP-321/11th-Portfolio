(function () {
  "use strict";

  const journey = document.getElementById("journey");
  if (!journey || !journey.classList.contains("journey")) return;

  if (window.PortfolioReveal) {
    PortfolioReveal.observe(".journey__header");
    PortfolioReveal.observe(".journey__intro");
    PortfolioReveal.observe(".journey__item");
  }

  /* ─── Timeline progress line on scroll ─── */
  const timeline = journey.querySelector(".journey__track");
  const lineProgress = journey.querySelector(".journey__line-progress");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateLineProgress() {
    if (!timeline || !lineProgress) return;

    const rect = timeline.getBoundingClientRect();
    const windowH = window.innerHeight;
    const start = windowH * 0.85;
    const end = windowH * 0.15;
    const total = rect.height + start - end;
    const scrolled = start - rect.top;
    const progress = Math.max(0, Math.min(100, (scrolled / total) * 100));

    lineProgress.style.height = `${progress}%`;
  }

  if (!reducedMotion && lineProgress) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(() => {
            updateLineProgress();
            ticking = false;
          });
        }
      },
      { passive: true }
    );
    updateLineProgress();
  } else if (lineProgress) {
    lineProgress.style.height = "100%";
  }

  /* ─── Card shine on hover ─── */
  const cards = journey.querySelectorAll(".journey__card");
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (finePointer && !reducedMotion) {
    cards.forEach((card) => {
      card.addEventListener(
        "mousemove",
        (e) => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty("--shine-x", `${x}%`);
          card.style.setProperty("--shine-y", `${y}%`);
        },
        { passive: true }
      );

      card.addEventListener("mouseleave", () => {
        card.style.removeProperty("--shine-x");
        card.style.removeProperty("--shine-y");
      });
    });
  }
})();
