(function () {
    "use strict";

    const projects = document.getElementById("projects");
    if (!projects || !projects.classList.contains("projects")) return;

    const grid = projects.querySelector(".projects__grid");
    const cards = projects.querySelectorAll(".projects__card");
    const filters = projects.querySelectorAll(".projects__filter");
    const statNum = projects.querySelector(".projects__stat-num");
    const emptyState = projects.querySelector(".projects__empty");
    const searchInput = projects.querySelector("#projects-search");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    const TOTAL_PROJECTS = cards.length;
    let currentCategory = "all";
    let currentSearch = "";

    /* ─── Scroll reveal ─── */
    if (window.PortfolioReveal) {
        PortfolioReveal.observe(".projects__header");
        PortfolioReveal.observe(".projects__toolbar");
        PortfolioReveal.observe(".projects__card");
    }

    /* ─── Animated counter ─── */
    function animateCounter(el, target, duration) {
        if (!el || reducedMotion) {
            if (el) el.textContent = String(target);
            return;
        }

        const start = performance.now();
        const from = 0;

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = String(Math.round(from + (target - from) * eased));
            if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }

    if (statNum && window.PortfolioReveal) {
        const counterObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    animateCounter(statNum, TOTAL_PROJECTS, 1200);
                    counterObserver.unobserve(entry.target);
                });
            },
            { threshold: 0.5 }
        );
        counterObserver.observe(statNum);
    } else if (statNum) {
        statNum.textContent = String(TOTAL_PROJECTS);
    }

    /* ─── Check if card matches search query ─── */
    function matchesSearch(card, query) {
        if (!query) return true;
        const searchQuery = query.toLowerCase().trim();

        const title = card.querySelector(".projects__card-title")?.textContent?.toLowerCase() || "";
        const desc = card.querySelector(".projects__card-desc")?.textContent?.toLowerCase() || "";
        const techTags = Array.from(card.querySelectorAll(".projects__tech-tag"))
            .map(tag => tag.textContent?.toLowerCase() || "")
            .join(" ");

        return title.includes(searchQuery) || desc.includes(searchQuery) || techTags.includes(searchQuery);
    }

    /* ─── Check if card matches category filter ─── */
    function matchesCategory(card, category) {
        if (category === "all") return true;
        return card.getAttribute("data-category") === category;
    }

    /* ─── Set active filter button ─── */
    function setActiveFilter(btn) {
        filters.forEach((f) => {
            f.classList.toggle("projects__filter--active", f === btn);
            f.setAttribute("aria-pressed", f === btn ? "true" : "false");
        });
    }

    /* ─── Apply both search and category filters ─── */
    function applyFilters() {
        if (!grid) return;

        let visibleCount = 0;

        grid.classList.add("is-filtering");

        cards.forEach((card) => {
            const categoryMatch = matchesCategory(card, currentCategory);
            const searchMatch = matchesSearch(card, currentSearch);
            const isVisible = categoryMatch && searchMatch;

            card.classList.toggle("is-filtered-out", !isVisible);
            if (isVisible) visibleCount += 1;
        });

        if (emptyState) {
            emptyState.textContent = visibleCount === 0 ? "No projects found." : "No projects in this category yet.";
            emptyState.classList.toggle("is-visible", visibleCount === 0);
        }

        setTimeout(() => grid.classList.remove("is-filtering"), 450);
    }

    /* ─── Filter button click handler ─── */
    filters.forEach((btn) => {
        btn.addEventListener("click", () => {
            const category = btn.getAttribute("data-filter");
            if (!category || btn.classList.contains("projects__filter--active")) return;
            currentCategory = category;
            setActiveFilter(btn);
            applyFilters();
        });
    });

    /* ─── Search input handler (real-time) ─── */
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            currentSearch = e.target.value;
            applyFilters();
        });
    }

    /* ─── Spotlight hover ─── */
    if (finePointer && !reducedMotion) {
        cards.forEach((card) => {
            card.addEventListener(
                "mousemove",
                (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    card.style.setProperty("--spot-x", `${x}%`);
                    card.style.setProperty("--spot-y", `${y}%`);
                },
                { passive: true }
            );
        });
    }

    /* ─── Placeholder demo/code links ─── */
    projects.querySelectorAll(".projects__btn[href='#']").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            btn.classList.add("projects__btn--pulse");
            setTimeout(() => btn.classList.remove("projects__btn--pulse"), 400);
        });
    });
})();
