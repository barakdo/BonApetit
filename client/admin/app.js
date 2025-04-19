// פונקציות ניווט
function showSection(id) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function logout() {
  alert("התנתקת מהמערכת");
}

// טעינת נתונים
Promise.all([
  fetch("data/orders.json").then((res) => res.json()),
  fetch("data/menuitems.json").then((res) => res.json()),
  fetch("data/couriers.json").then((res) => res.json()),
]).then(([orders, menuitems, couriers]) => {
  renderOrders(orders, couriers);
  renderMenu(menuitems);
  renderCouriers(couriers);
});

function renderOrders(orders, couriers) {
  const deliveryContainer = document.getElementById("deliveryOrdersContainer");
  const pickupContainer = document.getElementById("pickupOrdersContainer");

  orders.forEach((order) => {
    const div = document.createElement("div");
    div.className = "order";
    const itemsStr = order.items
      .map((i) => `${i.name} x${i.quantity}`)
      .join(", ");
    div.innerHTML = `
      <h3>${order.PK}</h3>
      <p>פריטים: ${itemsStr}</p>
      <p>סטטוס: ${order.orderStatus}</p>
    `;

    if (order.orderType === "delivery") {
      if (!order.assignedCourierId && order.orderStatus === "in-preparation") {
        const select = document.createElement("select");
        couriers.forEach((c) => {
          if (c.available) {
            const opt = document.createElement("option");
            opt.value = c.PK;
            opt.textContent = `${c.name} (${c.phone})`;
            select.appendChild(opt);
          }
        });
        const assignBtn = document.createElement("button");
        assignBtn.textContent = "🚚 יציאה למשלוח";
        assignBtn.onclick = () => {
          order.assignedCourierId = select.value;
          order.courierDepartureTime = new Date().toISOString();
          order.estimatedArrivalTime = new Date(
            Date.now() + 20 * 60000
          ).toISOString();
          order.orderStatus = "in-transit";
          div.innerHTML = "";
          deliveryContainer.removeChild(div);
          renderOrders([order], couriers);
        };
        div.appendChild(select);
        div.appendChild(assignBtn);
      } else if (order.orderStatus === "in-transit") {
        const eta = new Date(order.estimatedArrivalTime).toLocaleTimeString(
          [],
          { hour: "2-digit", minute: "2-digit" }
        );
        div.innerHTML += `<p>זמן הגעה משוער: ${eta}</p>`;
        div.innerHTML += `
          <div class="progress-bar">
            <div class="progress" style="width: 80%"></div>
          </div>
        `;
        const completeBtn = document.createElement("button");
        completeBtn.textContent = "✔️ סמן כהושלם";
        completeBtn.onclick = () => {
          order.orderStatus = "completed";
          div.innerHTML = `<p>המשלוח הושלם ✅</p>`;
        };
        div.appendChild(completeBtn);
      }
      deliveryContainer.appendChild(div);
    } else {
      const readyBtn = document.createElement("button");
      readyBtn.textContent = "✔️ סמן כאסוף";
      readyBtn.onclick = () => {
        order.orderStatus = "completed";
        div.innerHTML = `<p>ההזמנה נאספה ✅</p>`;
      };
      div.appendChild(readyBtn);
      pickupContainer.appendChild(div);
    }
  });
}

function renderMenu(menuitems) {
  const tableBody = document.getElementById("menuTableBody");
  tableBody.innerHTML = "";
  menuitems.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${item.img}" alt="${item.name}" /></td>
      <td>${item.name}</td>
      <td>${item.price} ש"ח</td>
      <td>${item.available ? "זמין" : "חסום"}</td>
      <td>
        <button>חסום</button>
        <button>ערוך</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function renderCouriers(couriers) {
  const container = document.getElementById("courierList");
  container.innerHTML = "";
  couriers.forEach((c) => {
    const div = document.createElement("div");
    div.className = "courier";
    div.innerHTML = `
      <strong>${c.name}</strong><br />
      טלפון: ${c.phone}<br />
      מצב: ${c.available ? "זמין" : "לא זמין"}
    `;
    container.appendChild(div);
  });
}
