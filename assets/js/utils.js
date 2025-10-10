/**
 * Utility Functions Module
 * Common utility functions used across the portfolio website
 */

/**
 * Toggle active class on an element
 * @param {Element} elem - The element to toggle
 */
export const elementToggleFunc = function (elem) {
  elem.classList.toggle("active");
};

/**
 * Show notification to user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 */
export function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    font-family: inherit;
    max-width: 400px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  notification.textContent = message;

  // Add to page
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

/**
 * Download CV function
 */
export function downloadCV() {
  const link = document.createElement("a");
  link.href = "./assets/statics/FullstackDeveloper_LongTran.pdf";
  link.download = "LongTran-FullStackDeveloper-CV.pdf";
  link.target = "_blank";

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
