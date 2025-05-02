let cart = [];
let categories = [];
let menuItems = [];

async function loadMenuItems() {
  const res = await fetch("mockMenu.json");
  const data = await res.json();
  menuItems = data.menuItems.filter(item => item.available);
  categories = [...new Set(menuItems.map(i => i.category))];
  renderSidebar();
  renderGroupedMenu(menuItems);
  activateScrollSpy();
  loadCartFromStorage();
  updateCart();
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

function renderGroupedMenu(items) {
  const container = document.getElementById("delivery-menu");
  container.innerHTML = "";

  categories.forEach(cat => {
    const section = document.createElement("div");
    section.className = "menu-category";
    section.id = cat.toLowerCase();

    const title = document.createElement("h3");
    title.className = "category-title";
    title.textContent = cat;

    const list = document.createElement("div");
    list.className = "delivery-list";

    items.filter(i => i.category === cat).forEach(item => {
      const div = document.createElement("div");
      div.className = "delivery-item";
      div.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="delivery-img" />
        <div class="delivery-info">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <p><strong>₪${item.price}</strong></p>
          <div class="controls">
            <div class="qty-control">
              <button onclick="changeQty(this, -1)">-</button>
              <span class="qty">1</span>
              <button onclick="changeQty(this, 1)">+</button>
            </div>
            <button class="add-btn" onclick='addToCart("${item.PK}", this)'>Add</button>
          </div>
        </div>
      `;
      list.appendChild(div);
    });

    section.appendChild(title);
    section.appendChild(list);
    container.appendChild(section);
  });
}

function changeQty(btn, delta) {
  const span = btn.parentElement.querySelector(".qty");
  let qty = parseInt(span.textContent);
  qty = Math.max(1, qty + delta);
  span.textContent = qty;
}

function addToCart(pk, btn) {
  const qty = parseInt(btn.parentElement.querySelector(".qty").textContent);
  const existing = cart.find(i => i.PK === pk);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ PK: pk, quantity: qty });
  }
  saveCartToStorage();
  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const cartCount = document.getElementById("cart-count");

  cartItems.innerHTML = "";
  let total = 0;
  let count = 0;

  cart.forEach(entry => {
    const item = menuItems.find(i => i.PK === entry.PK);
    if (item) {
      const subtotal = item.price * entry.quantity;
      total += subtotal;
      count += entry.quantity;

      const row = document.createElement("div");
      row.innerHTML = `${item.name} × ${entry.quantity} — ₪${subtotal}`;
      cartItems.appendChild(row);
    }
  });

  cartTotal.textContent = total.toFixed(2);
  cartCount.textContent = count;
}

function toggleCart() {
  document.getElementById("cart").classList.toggle("open");
}

function saveCartToStorage() {
  localStorage.setItem("bonapetit_cart", JSON.stringify(cart));
}

function loadCartFromStorage() {
  const saved = localStorage.getItem("bonapetit_cart");
  if (saved) {
    try {
      cart = JSON.parse(saved);
    } catch {
      cart = [];
    }
  }
}

function activateScrollSpy() {
  const sections = document.querySelectorAll(".menu-category");
  const stations = document.querySelectorAll(".station");

  function updateActiveStation() {
    let current = "";
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop - 150) {
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

window.onload = loadMenuItems;
