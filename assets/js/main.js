const skills = {
  frontend: [
    "HTML",
    "CSS",
    "Javascript",
    "Vue.js",
    "React",
    "React Native",
    "Bootstrap",
    "Materialize",
    "Tailwind",
    "Bulma",
  ],
  backend: ["Python", "FastAPI", "Node.js", "Express.js", "Php"],
  database: ["MongoDB", "MySQL", "Redis"],
  cloud: [
    "Linux",
    "Docker",
    "Vagrant",
    "Apache",
    "Nginx",
    "AWS",
    "Azure",
    "Kubernetes",
    "Rancher",
    "Cloud Foundry",
    "Jenkins",
  ],
  tools: [
    "Git",
    "Github",
    "Postman",
    "MongoDB Compass",
    "MySQL Workbench",
    "Jira",
    "VS Code",
    "FFMPEG",
    "Google",
    "ChatGPT",
    "Burpsuite",
    "Wireshark",
    "nmap",
  ],
};

const setFooter = () => {
  const footer = document.getElementById("copyright-year");
  footer.innerHTML = `${new Date().getFullYear()}`;
};

const setExperienceYear = () => {
  const experienceElement = document.getElementById("experience-year");
  experienceElement.textContent = getExperience();
};
const getExperience = () => {
  const startYear = 2019;
  return new Date().getFullYear() - startYear;
};

const getSkill = (skill) => {
  return skills[skill];
};

const getRandomIndex = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const buildSkills = (skill) => {
  const container = document.getElementById(skill);
  const unorderedList = document.createElement("ul");
  unorderedList.classList.add("padding-left-0");
  unorderedList.classList.add("mt-3");
  const badgeMap = {
    "bg-primary": false,
    "bg-secondary": false,
    "bg-info": false,
    "bg-dark": false,
    "bg-success": false,
    "bg-danger": false,
    "bg-light": false,
  };
  for (const skill_text of skills[skill]) {
    const listItem = document.createElement("li");
    listItem.textContent = skill_text;
    listItem.classList.add("badge");
    const maxBadgeLength = Object.keys(badgeMap).length;
    const randomBadgeIndex = getRandomIndex(0, maxBadgeLength);
    const randomBadgeKey = Object.keys(badgeMap)[randomBadgeIndex];
    listItem.classList.add(randomBadgeKey);
    unorderedList.appendChild(listItem);
  }
  container.innerHTML = "";
  container.appendChild(unorderedList);
};

// Callback function to handle intersection changes
const handleIntersection = (entries, observer) => {
  entries.forEach((entry) => {
    // If target element is intersecting with the viewport
    if (entry.isIntersecting) {
      // Add your event trigger or action here
      document
        .getElementById(entry.target.id)
        .classList.add(...entry.target.classes);
    }
  });
};

const getAboutContent = () => {
  const aboutText = `Result-oriented software engineer with
  ${getExperience()} years of experience
  specializing in JavaScript, Vue.js, Python, FastAPI and having a
  track record of delivering high-quality, scalable web applications
  and APIs. Possess strong debugging skills and a passion for
  staying updated with the latest technologies.`;
  return aboutText;
};

window.onload = () => {
  setFooter();
  buildSkills("frontend");
  buildSkills("backend");
  buildSkills("database");
  buildSkills("cloud");
  buildSkills("tools");

  // Options for the intersection observer
  const options = {
    root: null, // Use the viewport as the root
    rootMargin: "0px", // No margin around the viewport
    threshold: 0.4, // Trigger when 50% of the target element is in view
  };

  // Create a new intersection observer
  const observer = new IntersectionObserver(handleIntersection, options);

  // Target element to observe
  const aboutElement = document.getElementById("about");
  aboutElement.classes = ["card", "border-primary"];
  observer.observe(aboutElement);

  const typed = new Typed("#about-paragraph", {
    strings: [getAboutContent()],
    typeSpeed: 1,
  });

  new WOW().init();
};
