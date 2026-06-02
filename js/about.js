(function () {
  "use strict";

  const about = document.getElementById("about");
  if (!about || !about.classList.contains("about")) return;

  /* ─── Scroll reveal ─── */
  if (window.PortfolioReveal) {
    PortfolioReveal.observe(".about__header");
    PortfolioReveal.observe(".about__text");
    PortfolioReveal.observe(".about__profile");
    PortfolioReveal.observe(".about__card");
  }

  /* ─── Card shine micro-interaction (desktop) ─── */
  const cards = about.querySelectorAll(".about__card");
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

  /* ─── Subtle tilt on profile card ─── */
  const profile = about.querySelector(".about__profile");
  if (profile && finePointer && !reducedMotion) {
    let rafId = null;
    let targetRX = 0;
    let targetRY = 0;
    let currentRX = 0;
    let currentRY = 0;

    function animate() {
      currentRX += (targetRX - currentRX) * 0.08;
      currentRY += (targetRY - currentRY) * 0.08;

      profile.style.transform = `perspective(800px) rotateX(${currentRX}deg) rotateY(${currentRY}deg)`;

      if (
        Math.abs(currentRX - targetRX) < 0.01 &&
        Math.abs(currentRY - targetRY) < 0.01 &&
        targetRX === 0 &&
        targetRY === 0
      ) {
        rafId = null;
        profile.style.transform = "";
        return;
      }

      rafId = requestAnimationFrame(animate);
    }

    profile.addEventListener(
      "mousemove",
      (e) => {
        const rect = profile.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        targetRY = x * 4;
        targetRX = y * -4;
        if (!rafId) rafId = requestAnimationFrame(animate);
      },
      { passive: true }
    );

    profile.addEventListener("mouseleave", () => {
      targetRX = 0;
      targetRY = 0;
      if (!rafId) rafId = requestAnimationFrame(animate);
    });
  }
})();
