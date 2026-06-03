(function () {
  "use strict";

  const form = document.querySelector(".contact__form");
  const submitBtn = document.querySelector(".contact__submit");
  const submitText = submitBtn?.querySelector(".contact__submit-text");

  if (!form) return;

  let isSubmitting = false;
  const ORIGINAL_TEXT = "Send Message";

  /* ── Button state machine ── */
  function setButtonState(state) {
    if (!submitBtn) return;

    submitBtn.classList.remove("is-loading", "is-sent");

    switch (state) {
      case "loading":
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-busy", "true");
        submitBtn.classList.add("is-loading");
        if (submitText) submitText.textContent = "Sending...";
        break;

      case "sent":
        submitBtn.disabled = true;
        submitBtn.removeAttribute("aria-busy");
        submitBtn.classList.add("is-sent");
        if (submitText) submitText.textContent = "Message Sent \u2713";
        break;

      case "error":
      case "idle":
      default:
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
        if (submitText) submitText.textContent = ORIGINAL_TEXT;
        break;
    }
  }

  /* ── Submit handler ── */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // guard against duplicate submissions
    isSubmitting = true;

    setButtonState("loading");

    const data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
    };

    try {
      const response = await fetch("/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }

      await response.json();

      window.showToast("Message sent successfully!", "success");

      setButtonState("sent");
      form.reset();

      // Restore button after 2 s, then allow new submissions
      setTimeout(function () {
        setButtonState("idle");
        isSubmitting = false;
      }, 2000);
    } catch (err) {
      console.error(err);

      window.showToast("Failed to send message.", "error");

      setButtonState("error");
      isSubmitting = false;
    }
  });
})();
