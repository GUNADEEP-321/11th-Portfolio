(function () {

  "use strict";

  const form = document.querySelector(".contact__form");
  const submitBtn = document.querySelector(".contact__submit");
  const feedback = document.querySelector(".contact__feedback");

  if (!form) return;

  function showFeedback(message, type) {
    if (!feedback) return;

    feedback.textContent = message;
    feedback.className =
      `contact__feedback contact__feedback--${type} is-visible`;
  }

  function hideFeedback() {
    if (!feedback) return;

    feedback.classList.remove("is-visible");
  }

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    console.log("FORM SUBMITTED 🚀");

    hideFeedback();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
    }

    const data = {
      name: form.name.value,
      phone: form.phone.value,
      email: form.email.value,
      message: form.message.value
    };

    try {
      console.log("SENDING REQUEST TO SERVER 🚀");
      const response = await fetch(
        "/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }
      );

      const result = await response.json();
      console.log("SERVER RESPONSE:", result);

      showFeedback(
        "Thank you — your message has been sent. I'll get back to you shortly.",
        "success"
      );

      form.reset();

    } catch (error) {

      console.error(error);

      showFeedback(
        "Failed to send message.",
        "error"
      );

    } finally {

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
      }

    }

  });

})();