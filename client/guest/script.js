let menuItems = [];
let categories = [];

async function loadMenuItems() {
  const res = await fetch("mockMenu.json");
  const data = await res.json();
  menuItems = data.menuItems;
  categories = [...new Set(menuItems.map(item => item.category))];
  renderSidebar();
  renderGroupedMenu();
  activateScrollSpy();
  startHeroSlideshow();
  handleCategoryNavVisibility();
}

function renderSidebar() {
  const sidebar = document.getElementById("category-nav");
  sidebar.innerHTML = '<div class="line-track"></div>';
  categories.forEach(cat => {
    const anchor = document.createElement("a");
    anchor.className = "station";
    anchor.href = `#${cat.toLowerCase()}`;
    anchor.innerHTML = `<span class="circle"></span><span class="label">${cat}</span>`;
    anchor.addEventListener("click", e => {
      e.preventDefault();
      document.getElementById(cat.toLowerCase()).scrollIntoView({ behavior: "smooth" });
    });
    sidebar.appendChild(anchor);
  });
}

function renderGroupedMenu() {
  const grid = document.getElementById("menu-grid");
  grid.innerHTML = "";

  categories.forEach(cat => {
    const section = document.createElement("div");
    section.className = "menu-category";
    section.id = cat.toLowerCase();

    const title = document.createElement("h3");
    title.className = "category-title";
    title.textContent = cat;
    section.appendChild(title);

    const list = document.createElement("div");
    list.className = "menu-list";

    menuItems.filter(item => item.category === cat && item.available).forEach(item => {
      const div = document.createElement("div");
      div.className = "menu-item";
      div.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="menu-img" />
        <div class="menu-info">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <p><strong>₪${item.price}</strong></p>
        </div>
      `;
      list.appendChild(div);
    });

    section.appendChild(list);
    grid.appendChild(section);
  });
}

function activateScrollSpy() {
  const sections = document.querySelectorAll(".menu-category");
  const stations = document.querySelectorAll(".station");

  function updateActiveStation() {
    let current = "";
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop - 140) {
        current = sec.id;
      }
    });

    stations.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", updateActiveStation);
  updateActiveStation();
}

function scrollToMenu() {
  document.getElementById("menu-section").scrollIntoView({ behavior: "smooth" });
}

function slideGallery(dir) {
  const track = document.getElementById("gallery-track");
  const imageWidth = track.querySelector(".gallery-image").offsetWidth + 12;
  track.scrollBy({ left: dir * imageWidth * 3, behavior: "smooth" });
}

function startHeroSlideshow() {
  let index = 0;
  const slides = document.querySelectorAll(".hero-slide");
  slides[0].classList.add("active");

  setInterval(() => {
    slides.forEach(s => s.classList.remove("active"));
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }, 5000);
}

function handleCategoryNavVisibility() {
  const sideNav = document.getElementById("sideNav");
  const menu = document.getElementById("menu-section");

  function checkVisibility() {
    const y = window.scrollY;
    const top = menu.offsetTop - 200;
    const bottom = menu.offsetTop + menu.offsetHeight;

    sideNav.style.display = (y >= top && y <= bottom) ? "block" : "none";
  }

  window.addEventListener("scroll", checkVisibility);
  checkVisibility();
}

window.onload = loadMenuItems;
