/**
 * Testimonials Module
 * Handles testimonial modal functionality
 */

/**
 * Initialize testimonials modal functionality
 */
export function initTestimonials() {
  // testimonials variables (will be handled by initializeTestimonialItems)
  const modalContainer = document.querySelector("[data-modal-container]");
  const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
  const overlay = document.querySelector("[data-overlay]");

  // modal variable
  const modalImg = document.querySelector("[data-modal-img]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalText = document.querySelector("[data-modal-text]");

  if (!modalContainer || !modalCloseBtn || !overlay || !modalImg || !modalTitle || !modalText) {
    console.warn("Testimonial modal elements not found");
    return;
  }

  // modal toggle function
  const testimonialsModalFunc = function () {
    modalContainer.classList.toggle("active");
    overlay.classList.toggle("active");
  };

  // add click event to all modal items
  initializeTestimonialItems(testimonialsModalFunc, modalImg, modalTitle, modalText);

  // add click event to modal close button
  modalCloseBtn.addEventListener("click", testimonialsModalFunc);
  overlay.addEventListener("click", testimonialsModalFunc);

  // Return the modal function for external use (e.g., when re-initializing after dynamic content)
  return { testimonialsModalFunc, initializeTestimonialItems };
}

/**
 * Initialize testimonial modal functionality for dynamically loaded content
 * @param {Function} testimonialsModalFunc - The modal toggle function
 * @param {Element} modalImg - Modal image element
 * @param {Element} modalTitle - Modal title element
 * @param {Element} modalText - Modal text element
 */
export function initializeTestimonialItems(testimonialsModalFunc, modalImg, modalTitle, modalText) {
  const testimonialsItems = document.querySelectorAll("[data-testimonials-item]");

  for (let i = 0; i < testimonialsItems.length; i++) {
    testimonialsItems[i].addEventListener("click", function () {
      const avatar = this.querySelector("[data-testimonials-avatar]");
      const title = this.querySelector("[data-testimonials-title]");
      const text = this.querySelector("[data-testimonials-text]");

      if (avatar && title && text) {
        modalImg.src = avatar.src;
        modalImg.alt = avatar.alt;
        modalTitle.innerHTML = title.innerHTML;
        modalText.innerHTML = text.innerHTML;

        testimonialsModalFunc();
      }
    });
  }
}
