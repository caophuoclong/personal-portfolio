/**
 * Sidebar Module
 * Handles mobile sidebar functionality
 */

import { elementToggleFunc } from "./utils.js";

/**
 * Initialize sidebar functionality
 */
export function initSidebar() {
  // sidebar variables
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");

  if (!sidebar || !sidebarBtn) {
    console.warn("Sidebar elements not found");
    return;
  }

  // sidebar toggle functionality for mobile
  sidebarBtn.addEventListener("click", function () {
    elementToggleFunc(sidebar);
  });
}
