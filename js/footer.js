(function () {
  "use strict";

  const topBtn = document.getElementById("footer-top");
  if (!topBtn) return;

  const SCROLL_SHOW = 400;
  let ticking = false;

  function updateTopBtn() {
    const show = window.scrollY > SCROLL_SHOW;
    topBtn.classList.toggle("is-visible", show);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateTopBtn);
      }
    },
    { passive: true }
  );

  updateTopBtn();

  topBtn.addEventListener("click", () => {
    if (window.PortfolioScroll) {
      PortfolioScroll.scrollToHash("#home");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
})();
