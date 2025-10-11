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
import { downloadCV, openPDFViewer, closePDFViewer, initPDFViewer } from "./utils.js";

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

  // Initialize PDF viewer
  initPDFViewer();

  // Make CV functions globally available
  globalThis.downloadCV = downloadCV;
  globalThis.openPDFViewer = openPDFViewer;
  globalThis.closePDFViewer = closePDFViewer;
});
