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

// Notification function
function showNotification(message, type = "info") {
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
    populateSkills(data.skills);
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
    <li class="timeline-item education-item">
      <h4 class="h4 timeline-item-title education-university">${edu.institution}</h4>
      <div class="education-details">
        <h5 class="education-major">${edu.major}</h5>
        <span class="education-gpa-plain">GPA: ${edu.gpa}</span>
      </div>
      <span class="education-period">${edu.period}</span>
      <div class="education-learnings">
        <h6 class="learnings-title">What I Learned:</h6>
        <ul class="learnings-list">
          ${edu.learnings.map((learning) => `<li class="learning-item">${learning}</li>`).join("")}
        </ul>
      </div>
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
      ${exp.company ? `<h5 class="timeline-company">${exp.company}</h5>` : ""}
      <span>${exp.period}</span>
      <div class="timeline-text">${exp.description.replace(/\n/g, "<br>")}</div>
    </li>
  `
    )
    .join("");
}

// Populate skills
function populateSkills(skillsData) {
  const skillsList = document.querySelector("[data-skills-list]");
  if (!skillsList || !skillsData) return;

  // Convert skills object to array with categories
  const categories = Object.keys(skillsData);
  const categoryNames = {
    frontend: "Frontend",
    backend: "Backend",
    database: "Database",
    devops: "DevOps & Cloud",
    tools: "Development Tools",
    messaging: "Messaging & Real-time",
    other: "Other Technologies",
  };

  let skillsHTML = "";

  categories.forEach((categoryKey) => {
    const skills = skillsData[categoryKey];
    if (skills && skills.length > 0) {
      skillsHTML += `
        <li class="skills-category">
          <h4 class="skills-category-title">${categoryNames[categoryKey] || categoryKey}</h4>
          <div class="skills-grid">
            ${skills
              .map(
                (skill) => `
              <div class="skills-item">
                <div class="skill-icon-wrapper">
                  <img src="${skill.icon}" alt="${skill.name}" class="skill-icon" onerror="this.style.display='none'">
                </div>
                <h5 class="skill-name">${skill.name}</h5>
              </div>
            `
              )
              .join("")}
          </div>
        </li>
      `;
    }
  });

  skillsList.innerHTML = skillsHTML;
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

// Download CV function
function downloadCV() {
  const link = document.createElement("a");
  link.href = "./assets/statics/FullstackDeveloper_LongTran.pdf";
  link.download = "LongTran-FullStackDeveloper-CV.pdf";
  link.target = "_blank";

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
