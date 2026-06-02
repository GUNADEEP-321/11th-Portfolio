(function () {
  "use strict";

  const section = document.getElementById("articles");
  if (!section || !section.classList.contains("articles")) return;

  const grid = section.querySelector(".articles__grid");
  const cards = section.querySelectorAll(".articles__card");
  const filters = section.querySelectorAll(".articles__filter");
  const searchInput = section.querySelector(".articles__search");
  const statNum = section.querySelector(".articles__stat-num");
  const emptyState = section.querySelector(".articles__empty");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeCategory = "all";
  let searchQuery = "";
  let counterAnimated = false;

  if (window.PortfolioReveal) {
    PortfolioReveal.observe(".articles__header");
    PortfolioReveal.observe(".articles__toolbar");
    PortfolioReveal.observe(".articles__card");
  }

  function getVisibleCount() {
    let count = 0;
    cards.forEach((card) => {
      if (!card.classList.contains("is-hidden")) count += 1;
    });
    return count;
  }

  function updateStatCount() {
    if (!statNum) return;
    statNum.textContent = String(getVisibleCount());
  }

  function animateCounter(el, target, duration) {
    if (!el || reducedMotion) {
      updateStatCount();
      return;
    }
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    }
    requestAnimationFrame(tick);
  }

  if (statNum) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || counterAnimated) return;
          counterAnimated = true;
          animateCounter(statNum, getVisibleCount(), 1000);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(statNum);
  }

  function cardMatches(card) {
    const category = card.getAttribute("data-category");
    const text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
    const catMatch = activeCategory === "all" || category === activeCategory;
    const searchMatch = !searchQuery || text.includes(searchQuery);
    return catMatch && searchMatch;
  }

  function applyFilters() {
    if (!grid) return;

    let visible = 0;
    grid.classList.add("is-filtering");

    cards.forEach((card) => {
      const show = cardMatches(card);
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }

    if (counterAnimated) {
      updateStatCount();
    }

    setTimeout(() => grid.classList.remove("is-filtering"), 400);
  }

  function setActiveFilter(btn) {
    filters.forEach((f) => {
      f.classList.toggle("articles__filter--active", f === btn);
      f.setAttribute("aria-pressed", f === btn ? "true" : "false");
    });
  }

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-filter");
      if (!cat || cat === activeCategory) return;
      activeCategory = cat;
      setActiveFilter(btn);
      applyFilters();
    });
  });

  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchQuery = searchInput.value.trim().toLowerCase();
        applyFilters();
      }, 200);
    });
  }

  section.querySelectorAll(".articles__read[href='#']").forEach((link) => {
    link.addEventListener("click", (e) => e.preventDefault());
  });

  applyFilters();
})();
