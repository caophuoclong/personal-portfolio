/**
 * Portfolio Filter Module
 * Handles portfolio filtering and custom select functionality
 */

import { elementToggleFunc } from "./utils.js";

/**
 * Initialize portfolio filtering functionality
 */
export function initPortfolioFilter() {
  // custom select variables
  const select = document.querySelector("[data-select]");
  const selectItems = document.querySelectorAll("[data-select-item]");
  const selectValue = document.querySelector("[data-selecct-value]");
  const filterBtn = document.querySelectorAll("[data-filter-btn]");

  if (!select || !selectValue) {
    console.warn("Portfolio filter elements not found");
    return;
  }

  // filter variables
  const filterItems = document.querySelectorAll("[data-filter-item]");

  // Filter function
  const filterFunc = function (selectedValue) {
    for (let i = 0; i < filterItems.length; i++) {
      if (selectedValue === "all") {
        filterItems[i].classList.add("active");
      } else if (selectedValue === filterItems[i].dataset.category) {
        filterItems[i].classList.add("active");
      } else {
        filterItems[i].classList.remove("active");
      }
    }
  };

  // Custom select functionality
  select.addEventListener("click", function () {
    elementToggleFunc(this);
  });

  // Add event to all select items
  for (let i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener("click", function () {
      const selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);
    });
  }

  // Add event to all filter button items for large screen
  let lastClickedBtn = filterBtn[0];

  for (let i = 0; i < filterBtn.length; i++) {
    filterBtn[i].addEventListener("click", function () {
      const selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      filterFunc(selectedValue);

      if (lastClickedBtn) {
        lastClickedBtn.classList.remove("active");
      }
      this.classList.add("active");
      lastClickedBtn = this;
    });
  }

  // Return filter function for external use
  return { filterFunc };
}
