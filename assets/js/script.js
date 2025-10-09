"use strict";

// element toggle function
const elementToggleFunc = function (elem) {
  elem.classList.toggle("active");
};

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () {
  elementToggleFunc(sidebar);
});

// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
};

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {
  testimonialsItem[i].addEventListener("click", function () {
    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();
  });
}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () {
  elementToggleFunc(this);
});

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);
  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

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

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
}

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

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

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }
  });
}

// ==============================================
// DATA LOADER - Populate portfolio from JSON
// ==============================================

// Load and populate data from JSON
async function loadPortfolioData() {
  try {
    // Try API endpoint first (for Deno server), fallback to direct file access
    let response;
    try {
      response = await fetch("/api/data");
    } catch {
      // Fallback to direct file access for local development
      response = await fetch("./data.json");
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    populatePersonalInfo(data.personal);
    populateSocialLinks(data.social);
    populateAboutText(data.personal.aboutText);
    populateServices(data.services);
    populateTestimonials(data.testimonials);
    populateClients(data.clients);
    populateEducation(data.education);
    populateExperience(data.experience);
    populateSkills(data.skills.technical);
    populateProjects(data.projects);
    populateBlog(data.blog);
  } catch (error) {
    console.error("Error loading portfolio data:", error);
  }
}

// Populate personal information
function populatePersonalInfo(personal) {
  // Avatar
  const avatar = document.querySelector("[data-avatar]");
  if (avatar) {
    avatar.src = personal.avatar;
    avatar.alt = personal.name;
  }

  // Name
  const nameElement = document.querySelector("[data-name]");
  if (nameElement) {
    nameElement.textContent = personal.name;
    nameElement.title = personal.name;
  }

  // Title
  const titleElement = document.querySelector("[data-title]");
  if (titleElement) {
    titleElement.textContent = personal.title;
  }

  // Contact information
  const emailElement = document.querySelector("[data-email]");
  if (emailElement) {
    emailElement.textContent = personal.email;
    emailElement.href = `mailto:${personal.email}`;
  }

  const phoneElement = document.querySelector("[data-phone]");
  if (phoneElement) {
    phoneElement.textContent = personal.phone;
    phoneElement.href = `tel:${personal.phone.replace(/\s/g, "")}`;
  }

  const birthdayElement = document.querySelector("[data-birthday]");
  if (birthdayElement) {
    const date = new Date(personal.birthday);
    birthdayElement.textContent = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    birthdayElement.dateTime = personal.birthday;
  }

  const locationElement = document.querySelector("[data-location]");
  if (locationElement) {
    locationElement.textContent = personal.location;
  }
}

// Populate social links
function populateSocialLinks(social) {
  const facebookLink = document.querySelector("[data-social-facebook]");
  if (facebookLink) facebookLink.href = social.facebook;

  const twitterLink = document.querySelector("[data-social-twitter]");
  if (twitterLink) twitterLink.href = social.twitter;

  const instagramLink = document.querySelector("[data-social-instagram]");
  if (instagramLink) instagramLink.href = social.instagram;
}

// Populate about text
function populateAboutText(aboutText) {
  const aboutSection = document.querySelector("[data-about-text]");
  if (aboutSection && aboutText) {
    aboutSection.innerHTML = aboutText.map((paragraph) => `<p>${paragraph}</p>`).join("");
  }
}

// Populate services
function populateServices(services) {
  const servicesList = document.querySelector("[data-service-list]");
  if (!servicesList || !services) return;

  servicesList.innerHTML = services
    .map(
      (service) => `
    <li class="service-item">
      <div class="service-icon-box">
        <img src="${service.icon}" alt="${service.title} icon" width="40">
      </div>
      <div class="service-content-box">
        <h4 class="h4 service-item-title">${service.title}</h4>
        <p class="service-item-text">${service.description}</p>
      </div>
    </li>
  `
    )
    .join("");
}

// Populate testimonials
function populateTestimonials(testimonials) {
  const testimonialsList = document.querySelector("[data-testimonials-list]");
  if (!testimonialsList || !testimonials) return;

  testimonialsList.innerHTML = testimonials
    .map(
      (testimonial) => `
    <li class="testimonials-item">
      <div class="content-card" data-testimonials-item>
        <figure class="testimonials-avatar-box">
          <img src="${testimonial.avatar}" alt="${testimonial.name}" width="60" data-testimonials-avatar>
        </figure>
        <h4 class="h4 testimonials-item-title" data-testimonials-title>${testimonial.name}</h4>
        <div class="testimonials-text" data-testimonials-text>
          <p>${testimonial.text}</p>
        </div>
      </div>
    </li>
  `
    )
    .join("");

  // Re-initialize testimonial modal functionality
  initializeTestimonialModals();
}

// Re-initialize testimonial modals after dynamic content loading
function initializeTestimonialModals() {
  const newTestimonialsItems = document.querySelectorAll("[data-testimonials-item]");
  const modalImg = document.querySelector("[data-modal-img]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalText = document.querySelector("[data-modal-text]");

  for (let i = 0; i < newTestimonialsItems.length; i++) {
    newTestimonialsItems[i].addEventListener("click", function () {
      modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
      modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
      modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
      modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;
      testimonialsModalFunc();
    });
  }
}

// Populate clients
function populateClients(clients) {
  const clientsList = document.querySelector("[data-clients-list]");
  if (!clientsList || !clients) return;

  clientsList.innerHTML = clients
    .map(
      (client) => `
    <li class="clients-item">
      <a href="${client.url}">
        <img src="${client.logo}" alt="${client.alt}">
      </a>
    </li>
  `
    )
    .join("");
}

// Populate education
function populateEducation(education) {
  const educationList = document.querySelector("[data-education-list]");
  if (!educationList || !education) return;

  educationList.innerHTML = education
    .map(
      (edu) => `
    <li class="timeline-item">
      <h4 class="h4 timeline-item-title">${edu.institution}</h4>
      <span>${edu.period}</span>
      <p class="timeline-text">${edu.description}</p>
    </li>
  `
    )
    .join("");
}

// Populate experience
function populateExperience(experience) {
  const experienceList = document.querySelector("[data-experience-list]");
  if (!experienceList || !experience) return;

  experienceList.innerHTML = experience
    .map(
      (exp) => `
    <li class="timeline-item">
      <h4 class="h4 timeline-item-title">${exp.position}</h4>
      <span>${exp.period}</span>
      <p class="timeline-text">${exp.description}</p>
    </li>
  `
    )
    .join("");
}

// Populate skills
function populateSkills(skills) {
  const skillsList = document.querySelector("[data-skills-list]");
  if (!skillsList || !skills) return;

  skillsList.innerHTML = skills
    .map(
      (skill) => `
    <li class="skills-item">
      <div class="title-wrapper">
        <h5 class="h5">${skill.name}</h5>
        <data value="${skill.level}">${skill.level}%</data>
      </div>
      <div class="skill-progress-bg">
        <div class="skill-progress-fill" style="width: ${skill.level}%;"></div>
      </div>
    </li>
  `
    )
    .join("");
}

// Populate projects
function populateProjects(projects) {
  const projectsList = document.querySelector("[data-project-list]");
  if (!projectsList || !projects) return;

  projectsList.innerHTML = projects
    .map((project) => {
      const categorySlug = project.category.toLowerCase().replace(/\s+/g, " ");
      return `
      <li class="project-item active" data-filter-item data-category="${categorySlug}">
        <a href="${project.url}">
          <figure class="project-img">
            <div class="project-item-icon-box">
              <ion-icon name="eye-outline"></ion-icon>
            </div>
            <img src="${project.image}" alt="${project.title}" loading="lazy">
          </figure>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-category">${project.category}</p>
        </a>
      </li>
    `;
    })
    .join("");
}

// Populate blog
function populateBlog(blog) {
  const blogList = document.querySelector("[data-blog-list]");
  if (!blogList || !blog) return;

  blogList.innerHTML = blog
    .map((post) => {
      const date = new Date(post.date);
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      return `
      <li class="blog-post-item">
        <a href="${post.url}">
          <figure class="blog-banner-box">
            <img src="${post.image}" alt="${post.title}" loading="lazy">
          </figure>
          <div class="blog-content">
            <div class="blog-meta">
              <p class="blog-category">${post.category}</p>
              <span class="dot"></span>
              <time datetime="${post.date}">${formattedDate}</time>
            </div>
            <h3 class="h3 blog-item-title">${post.title}</h3>
            <p class="blog-text">${post.excerpt}</p>
          </div>
        </a>
      </li>
    `;
    })
    .join("");
}

// Initialize data loading when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  loadPortfolioData();
});
