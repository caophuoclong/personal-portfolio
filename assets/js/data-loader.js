/**
 * Data Loader Module
 * Handles loading and populating portfolio data from JSON
 */

import { initializeTestimonialItems } from "./testimonials.js";

/**
 * Load and populate data from JSON
 */
export async function loadPortfolioData() {
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

/**
 * Populate personal information
 * @param {Object} personal - Personal information data
 */
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

/**
 * Populate social links
 * @param {Object} social - Social links data
 */
function populateSocialLinks(social) {
  const facebookLink = document.querySelector("[data-social-facebook]");
  if (facebookLink) facebookLink.href = social.facebook;

  const twitterLink = document.querySelector("[data-social-twitter]");
  if (twitterLink) twitterLink.href = social.twitter;

  const instagramLink = document.querySelector("[data-social-instagram]");
  if (instagramLink) instagramLink.href = social.instagram;
}

/**
 * Populate about text
 * @param {Array} aboutText - Array of about paragraphs
 */
function populateAboutText(aboutText) {
  const aboutSection = document.querySelector("[data-about-text]");
  if (aboutSection && aboutText) {
    aboutSection.innerHTML = aboutText.map((paragraph) => `<p>${paragraph}</p>`).join("");
  }
}

/**
 * Populate services
 * @param {Array} services - Services data array
 */
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

/**
 * Populate testimonials
 * @param {Array} testimonials - Testimonials data array
 */
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
  reinitializeTestimonialModals();
}

/**
 * Re-initialize testimonial modals after dynamic content loading
 */
function reinitializeTestimonialModals() {
  const modalImg = document.querySelector("[data-modal-img]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalText = document.querySelector("[data-modal-text]");
  const modalContainer = document.querySelector("[data-modal-container]");
  const overlay = document.querySelector("[data-overlay]");

  if (!modalImg || !modalTitle || !modalText || !modalContainer || !overlay) return;

  const testimonialsModalFunc = function () {
    modalContainer.classList.toggle("active");
    overlay.classList.toggle("active");
  };

  initializeTestimonialItems(testimonialsModalFunc, modalImg, modalTitle, modalText);
}

/**
 * Populate clients
 * @param {Array} clients - Clients data array
 */
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

/**
 * Populate education
 * @param {Array} education - Education data array
 */
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

/**
 * Populate experience
 * @param {Array} experience - Experience data array
 */
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

/**
 * Populate skills
 * @param {Object} skillsData - Skills data object with categories
 */
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

/**
 * Populate projects
 * @param {Array} projects - Projects data array
 */
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

/**
 * Populate blog
 * @param {Array} blog - Blog data array
 */
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
