(function () {
  "use strict";

  const hero = document.getElementById("home");
  if (!hero || !hero.classList.contains("hero")) return;

  const frameWrapper = hero.querySelector(".hero__frame-wrapper");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ─── Entrance reveal ─── */
  function revealHero() {
    hero.classList.add("hero--revealed");
  }

  function scheduleReveal() {
    requestAnimationFrame(() => {
      setTimeout(revealHero, 80);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleReveal);
  } else {
    scheduleReveal();
  }

  /* ─── Parallax on portrait (desktop only) ─── */
  if (frameWrapper && !prefersReducedMotion && finePointer) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    const maxTilt = 8;
    const maxFloat = 6;
    const epsilon = 0.002;

    function lerp(start, end, factor) {
      return start + (end - start) * factor;
    }

    function applyTransform() {
      const rotateX = currentY * -maxTilt;
      const rotateY = currentX * maxTilt;
      const translateX = currentX * maxFloat;
      const translateY = currentY * maxFloat;

      frameWrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${translateX}px, ${translateY}px, 0)`;
    }

    function animate() {
      currentX = lerp(currentX, targetX, 0.08);
      currentY = lerp(currentY, targetY, 0.08);

      applyTransform();

      const settled =
        Math.abs(currentX - targetX) < epsilon &&
        Math.abs(currentY - targetY) < epsilon;

      if (settled && targetX === 0 && targetY === 0) {
        rafId = null;
        frameWrapper.style.transform = "";
        return;
      }

      rafId = requestAnimationFrame(animate);
    }

    function startAnimation() {
      if (!rafId) rafId = requestAnimationFrame(animate);
    }

    hero.addEventListener(
      "mousemove",
      (e) => {
        const rect = frameWrapper.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        targetX = (e.clientX - centerX) / (rect.width / 2);
        targetY = (e.clientY - centerY) / (rect.height / 2);
        targetX = Math.max(-1, Math.min(1, targetX));
        targetY = Math.max(-1, Math.min(1, targetY));
        startAnimation();
      },
      { passive: true }
    );

    frameWrapper.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
      startAnimation();
    });
  }

  /* ─── Button ripple micro-interaction ─── */
  const buttons = hero.querySelectorAll(".hero__btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      if (prefersReducedMotion) return;

      const ripple = document.createElement("span");
      ripple.className = "hero__btn-ripple";
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      this.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  });
})();
