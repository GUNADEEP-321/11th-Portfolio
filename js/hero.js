(function () {
  "use strict";

  var hero = document.getElementById("home");
  if (!hero || !hero.classList.contains("hero")) return;

  var frameWrapper = hero.querySelector(".hero__frame-wrapper");
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ─── Entrance reveal ─── */
  function revealHero() {
    hero.classList.add("hero--revealed");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      requestAnimationFrame(function () {
        setTimeout(revealHero, 80);
      });
    });
  } else {
    requestAnimationFrame(function () {
      setTimeout(revealHero, 80);
    });
  }

  /* ─── Parallax tilt on portrait (desktop only) ─── */
  if (frameWrapper && !prefersReducedMotion && finePointer) {
    var targetX = 0,
      targetY = 0;
    var currentX = 0,
      currentY = 0;
    var rafId = null;
    var maxTilt = 8,
      maxFloat = 6,
      epsilon = 0.002;

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function applyTransform() {
      var rx = currentY * -maxTilt;
      var ry = currentX * maxTilt;
      var tx = currentX * maxFloat;
      var ty = currentY * maxFloat;
      frameWrapper.style.transform =
        "rotateX(" +
        rx +
        "deg) rotateY(" +
        ry +
        "deg) translate3d(" +
        tx +
        "px," +
        ty +
        "px,0)";
    }

    function animate() {
      currentX = lerp(currentX, targetX, 0.08);
      currentY = lerp(currentY, targetY, 0.08);
      applyTransform();
      var settled =
        Math.abs(currentX - targetX) < epsilon &&
        Math.abs(currentY - targetY) < epsilon;
      if (settled && targetX === 0 && targetY === 0) {
        rafId = null;
        frameWrapper.style.transform = "";
        return;
      }
      rafId = requestAnimationFrame(animate);
    }

    hero.addEventListener(
      "mousemove",
      function (e) {
        var rect = frameWrapper.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        targetX = Math.max(
          -1,
          Math.min(1, (e.clientX - cx) / (rect.width / 2)),
        );
        targetY = Math.max(
          -1,
          Math.min(1, (e.clientY - cy) / (rect.height / 2)),
        );
        if (!rafId) rafId = requestAnimationFrame(animate);
      },
      { passive: true },
    );

    frameWrapper.addEventListener("mouseleave", function () {
      targetX = 0;
      targetY = 0;
      if (!rafId) rafId = requestAnimationFrame(animate);
    });
  }

  /* ─── Typing effect ─── */
  var typingEl = hero.querySelector("#hero-typing");
  var cursorEl = hero.querySelector(".hero__typing-cursor");

  if (typingEl) {
    var roles = ["Front-End Developer", "Web Designer", "Student Developer"];
    var roleIdx = 0;
    var charIdx = 0;
    var deleting = false;
    var timer = null;

    var TYPE_MS = 80;
    var DELETE_MS = 42;
    var PAUSE_TYPED = 2200;
    var PAUSE_DEL = 380;

    function tick() {
      var word = roles[roleIdx];

      if (!deleting) {
        charIdx++;
        typingEl.textContent = word.slice(0, charIdx);
        if (charIdx === word.length) {
          timer = setTimeout(function () {
            deleting = true;
            tick();
          }, PAUSE_TYPED);
          return;
        }
        timer = setTimeout(tick, TYPE_MS);
      } else {
        charIdx--;
        typingEl.textContent = word.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
          timer = setTimeout(tick, PAUSE_DEL);
          return;
        }
        timer = setTimeout(tick, DELETE_MS);
      }
    }

    if (prefersReducedMotion) {
      /* Static fallback — just show the first role */
      typingEl.textContent = roles[0];
      if (cursorEl) cursorEl.style.display = "none";
    } else {
      /* Begin after the entrance animations settle */
      setTimeout(tick, 1300);
    }
  }

  /* ─── Button ripple ─── */
  var buttons = hero.querySelectorAll(".hero__btn");

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (prefersReducedMotion) return;
      var ripple = document.createElement("span");
      ripple.className = "hero__btn-ripple";
      var rect = btn.getBoundingClientRect();
      var sz = Math.max(rect.width, rect.height);
      ripple.style.width = sz + "px";
      ripple.style.height = sz + "px";
      ripple.style.left = e.clientX - rect.left - sz / 2 + "px";
      ripple.style.top = e.clientY - rect.top - sz / 2 + "px";
      btn.appendChild(ripple);
      ripple.addEventListener(
        "animationend",
        function () {
          ripple.remove();
        },
        { once: true },
      );
    });
  });
})();
