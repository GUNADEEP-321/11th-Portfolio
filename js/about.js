(function () {
  "use strict";

  var about = document.getElementById("about");
  if (!about) return;

  /* ─── 1. Scroll reveal ─── */
  if (window.PortfolioReveal) {
    PortfolioReveal.observe(".about__header");
    PortfolioReveal.observe(".about__left");
    PortfolioReveal.observe(".about__right");
  }

  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ─── 2. Profile card shine (mousemove → CSS custom props) ─── */
  var profileCard = about.querySelector(".about__profile-card");

  if (profileCard && finePointer && !reducedMotion) {
    profileCard.addEventListener(
      "mousemove",
      function (e) {
        var rect = profileCard.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        profileCard.style.setProperty("--shine-x", x + "%");
        profileCard.style.setProperty("--shine-y", y + "%");
      },
      { passive: true },
    );

    profileCard.addEventListener("mouseleave", function () {
      profileCard.style.removeProperty("--shine-x");
      profileCard.style.removeProperty("--shine-y");
    });
  }

  /* ─── 3. Profile image fallback ─── */
  var profileImg = about.querySelector(".about__profile-img");
  var profileAvatar = about.querySelector(".about__profile-avatar");

  if (profileImg && profileAvatar) {
    var src = profileImg.getAttribute("src");
    if (!src || src === "") {
      profileImg.style.display = "none";
      profileAvatar.classList.add("is-shown");
    } else {
      profileImg.addEventListener("error", function () {
        profileImg.style.display = "none";
        profileAvatar.classList.add("is-shown");
      });
    }
  }

  /* ─── 4. Calculate dynamic stats ─── */
  var totalProjects = document.querySelectorAll(".projects__card").length;
  var technologiesSet = new Set();

  // Add skills from Skills section
  var skillCards = document.querySelectorAll(".skills__card .skills__name");
  skillCards.forEach(function (el) {
    technologiesSet.add(el.textContent.trim());
  });

  // Add tech tags from Projects section
  var techTags = document.querySelectorAll(".projects__tech-tag");
  techTags.forEach(function (el) {
    technologiesSet.add(el.textContent.trim());
  });

  var totalTechnologies = technologiesSet.size;

  // Update data-count attributes
  var statProjects = document.getElementById("stat-projects");
  var statTechnologies = document.getElementById("stat-technologies");
  if (statProjects) {
    statProjects.setAttribute("data-count", totalProjects);
  }
  if (statTechnologies) {
    statTechnologies.setAttribute("data-count", totalTechnologies);
  }

  /* ─── 5. Fetch total visitors from API ─── */
  var statVisitors = document.getElementById("stat-visitors");
  var totalVisitors = 0;

  async function fetchVisitorCount() {
    try {
      var response = await fetch("/api/stats");
      if (response.ok) {
        var data = await response.json();
        totalVisitors = data.data.totalVisitors || 0;
        if (statVisitors) {
          statVisitors.setAttribute("data-count", totalVisitors);
        }
      }
    } catch (err) {
      console.error("Failed to fetch visitor count:", err);
      totalVisitors = 0;
    }
  }

  fetchVisitorCount();

  /* ─── 6. Stat counter animation ─── */
  var statsWrap = about.querySelector(".about__stats");
  if (!statsWrap) return;

  var countersRun = false;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el, target, suffix, duration) {
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutCubic(progress);
      var current = Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  function runCounters() {
    if (countersRun) return;
    countersRun = true;

    var statValues = statsWrap.querySelectorAll(
      ".about__stat-value[data-count]",
    );

    statValues.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      if (isNaN(target)) return;

      if (reducedMotion) {
        el.textContent = target + suffix;
        return;
      }

      el.textContent = "0" + suffix;
      animateCounter(el, target, suffix, 1200);
    });
  }

  if ("IntersectionObserver" in window) {
    var statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounters();
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.25 },
    );
    statsObserver.observe(statsWrap);
  } else {
    runCounters(); /* Fallback: run immediately */
  }
})();
