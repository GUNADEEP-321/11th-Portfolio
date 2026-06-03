(function () {

  "use strict";

  var section = document.getElementById("resume");
  if (!section) return;

  /* ─── Scroll-triggered reveal ─── */
  if (window.PortfolioReveal) {
    PortfolioReveal.observe(".resume__header");
    PortfolioReveal.observe(".resume__card-wrap");
  }

  /* ─── Download button ─── */
  var btn = section.querySelector(".resume__download");
  if (!btn) return;

  var textEl     = btn.querySelector(".resume__download-text");
  var iconEl     = btn.querySelector(".resume__download-icon");
  var ORIG_TEXT  = textEl ? textEl.textContent : "Download Resume";
  var ORIG_TITLE = btn.getAttribute("aria-label") || ORIG_TEXT;

  btn.addEventListener("click", function (e) {
    /* Guard — ignore if a download is already in progress */
    if (btn.classList.contains("is-downloading")) {
      e.preventDefault();
      return;
    }

    var href     = btn.getAttribute("href");
    var filename = btn.getAttribute("data-filename") || "Resume.pdf";

    /* --- Verify the file exists before triggering the download --- */
    e.preventDefault();

    btn.classList.add("is-downloading");
    btn.setAttribute("aria-label", "Downloading…");
    if (textEl) textEl.textContent = "Downloading…";

    fetch(href, { method: "HEAD" })
      .then(function (res) {
        if (!res.ok) throw new Error("not-found");

        /* File exists — trigger download via a temporary <a> */
        var link = document.createElement("a");
        link.href = href;
        link.setAttribute("download", filename);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        /* Success toast */
        if (window.showToast) {
          showToast("Resume download started!", "success");
        }

        /* Reset button after a beat */
        setTimeout(function () {
          restoreBtn();
        }, 1800);
      })
      .catch(function () {
        restoreBtn();

        /* Friendly error via toast */
        if (window.showToast) {
          showToast(
            "Resume PDF not found. Please check back soon!",
            "error"
          );
        } else {
          /* Absolute fallback if toast module is absent */
          console.warn(
            "[Resume] resume.pdf is missing. " +
            "Place it at: assets/resume.pdf inside the project root."
          );
        }
      });
  });

  function restoreBtn() {
    btn.classList.remove("is-downloading");
    btn.setAttribute("aria-label", ORIG_TITLE);
    if (textEl) textEl.textContent = ORIG_TEXT;
  }

})();
