/**
 * Contact Form Module
 * Handles contact form validation and submission
 */

import { showNotification } from "./utils.js";

/**
 * Initialize contact form functionality
 */
export function initContactForm() {
  // contact form variables
  const form = document.querySelector("[data-form]");
  const formInputs = document.querySelectorAll("[data-form-input]");
  const formBtn = document.querySelector("[data-form-btn]");

  if (!form || !formBtn) {
    console.warn("Contact form elements not found");
    return;
  }

  // add event to all form input field
  for (let i = 0; i < formInputs.length; i++) {
    formInputs[i].addEventListener("input", function () {
      // check form validation
      if (form.checkValidity()) {
        formBtn.removeAttribute("disabled");
      } else {
        formBtn.setAttribute("disabled", "");
      }
    });
  }

  // handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(form);
    const data = {
      fullname: formData.get("fullname"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    // Update button to show loading state
    const originalText = formBtn.innerHTML;
    formBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon><span>Sending...</span>';
    formBtn.disabled = true;

    try {
      // Send data to server
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success - show success message and reset form
        formBtn.innerHTML = '<ion-icon name="checkmark-outline"></ion-icon><span>Message Sent!</span>';
        form.reset();

        // Show success notification
        showNotification("Message sent successfully! I'll get back to you soon.", "success");

        // Reset button after 3 seconds
        setTimeout(() => {
          formBtn.innerHTML = originalText;
          formBtn.disabled = true; // Keep disabled until form is filled again
        }, 3000);
      } else {
        // Error - show error message
        formBtn.innerHTML = '<ion-icon name="close-outline"></ion-icon><span>Failed to Send</span>';
        showNotification(result.error || "Failed to send message. Please try again.", "error");

        // Reset button after 3 seconds
        setTimeout(() => {
          formBtn.innerHTML = originalText;
          formBtn.disabled = false;
        }, 3000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      formBtn.innerHTML = '<ion-icon name="close-outline"></ion-icon><span>Network Error</span>';
      showNotification("Network error. Please check your connection and try again.", "error");

      // Reset button after 3 seconds
      setTimeout(() => {
        formBtn.innerHTML = originalText;
        formBtn.disabled = false;
      }, 3000);
    }
  });
}
