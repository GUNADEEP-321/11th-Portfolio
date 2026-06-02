(function () {
  "use strict";

  const skills = document.getElementById("skills");
  if (!skills || !skills.classList.contains("skills")) return;

  if (window.PortfolioReveal) {
    PortfolioReveal.observe(".skills__header");
    PortfolioReveal.observe(".skills__card");
  }

  const cards = skills.querySelectorAll(".skills__card");
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
