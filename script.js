let products = [];
const catalogue = document.getElementById("catalogue");
const adminPanel = document.getElementById("adminPanel");
const adminList = document.getElementById("adminList");
const searchInput = document.getElementById("search");

// Charger produits depuis localStorage ou products.json
async function loadProducts() {
  const local = localStorage.getItem("products");
  if (local) {
    products = JSON.parse(local);
  } else {
    const res = await fetch("products.json");
    products = await res.json();
  }
  renderCatalogue();
  renderAdmin();
}

function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

function renderCatalogue() {
  catalogue.innerHTML = "";
  const q = searchInput.value.toLowerCase();
  products
    .filter(p => p.name.toLowerCase().includes(q))
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.price} Ar</p>
        <small>${p.category || ""}</small>
      `;
      catalogue.appendChild(card);
    });
}

function renderAdmin() {
  adminList.innerHTML = "";
  products.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "admin-item";
    div.innerHTML = `
      <input value="${p.name}" data-field="name" data-idx="${i}"/>
      <input value="${p.price}" data-field="price" data-idx="${i}" type="number"/>
      <input value="${p.category || ""}" data-field="category" data-idx="${i}"/>
      <button data-action="delete" data-idx="${i}">Supprimer</button>
    `;
    adminList.appendChild(div);
  });
}

searchInput.addEventListener("input", renderCatalogue);

document.getElementById("toggleAdmin").onclick = () => {
  adminPanel.classList.toggle("hidden");
};

adminList.addEventListener("input", e => {
  const idx = e.target.dataset.idx;
  const field = e.target.dataset.field;
  if (idx !== undefined && field) {
    products[idx][field] = e.target.value;
    saveProducts();
    renderCatalogue();
  }
});

adminList.addEventListener("click", e => {
  if (e.target.dataset.action === "delete") {
    products.splice(e.target.dataset.idx, 1);
    saveProducts();
    renderAdmin();
    renderCatalogue();
  }
});

document.getElementById("addProduct").onclick = () => {
  products.push({
    name: "Nouveau produit",
    price: 0,
    category: "",
    image: "assets/default.jpg"
  });
  saveProducts();
  renderAdmin();
  renderCatalogue();
};

document.getElementById("exportProducts").onclick = () => {
  const blob = new Blob([JSON.stringify(products, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products.json";
  a.click();
};

document.getElementById("importProducts").onchange = e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    products = JSON.parse(reader.result);
    saveProducts();
    renderAdmin();
    renderCatalogue();
  };
  reader.readAsText(file);
};

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

loadProducts();
