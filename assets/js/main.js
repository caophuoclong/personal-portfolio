/**
 * Main Script File
 * Imports and initializes all modular components of the portfolio website
 */

import { initSidebar } from "./sidebar.js";
import { initTestimonials } from "./testimonials.js";
import { initPortfolioFilter } from "./portfolio-filter.js";
import { initContactForm } from "./contact-form.js";
import { initNavigation } from "./navigation.js";
import { loadPortfolioData } from "./data-loader.js";

/**
 * Initialize all components when DOM is ready
 */
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all modules
  initSidebar();
  initTestimonials();
  initPortfolioFilter();
  initContactForm();
  initNavigation();

  // Load portfolio data from JSON
  loadPortfolioData();
});
