/**
 * Navigation Module
 * Handles page navigation functionality
 */

/**
 * Initialize page navigation functionality
 */
export function initNavigation() {
  // page navigation variables
  const navigationLinks = document.querySelectorAll("[data-nav-link]");
  const pages = document.querySelectorAll("[data-page]");

  if (!navigationLinks.length || !pages.length) {
    console.warn("Navigation elements not found");
    return;
  }

  // add event to all nav link
  for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener("click", function () {
      const selectedPageName = this.innerHTML.toLowerCase();

      // Remove active class from all navigation links first
      for (let k = 0; k < navigationLinks.length; k++) {
        navigationLinks[k].classList.remove("active");
      }

      // Remove active class from all pages and add to selected page
      for (let j = 0; j < pages.length; j++) {
        if (selectedPageName === pages[j].dataset.page) {
          pages[j].classList.add("active");
          navigationLinks[i].classList.add("active");
          globalThis.scrollTo(0, 0);
        } else {
          pages[j].classList.remove("active");
        }
      }
    });
  }
}
