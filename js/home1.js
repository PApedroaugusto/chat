const API = window.API_VEHICLES;

let vehicles = [];

/* ===============================
   LOAD
================================ */
document.addEventListener("DOMContentLoaded", async () => {
  loadBrands();
  await loadVehicles();
  loadBrandsFromStock();
  renderFeatured();
  setupSearch();
});

/* ===============================
   MARCAS
================================ */
const BRANDS = [
{ name: "Chevrolet", logo: "assets/brands/chevrolet.png" },
    { name: "Fiat", logo: "assets/brands/fiat.png" },
    { name: "Ford", logo: "assets/brands/ford.png" },
    { name: "Honda", logo: "assets/brands/honda.png" },
    { name: "Hyundai", logo: "assets/brands/hyundai.png" },
    { name: "Jeep", logo: "assets/brands/jeep.png" },
    { name: "Toyota", logo: "assets/brands/toyota.png" },
    { name: "Volkswagen", logo: "assets/brands/volkswagen.png" },

];

function loadBrands() {
  const grid = document.getElementById("brandsGrid");
  const select = document.getElementById("brandSelect");
  if (!grid || !select) return;

  BRANDS.forEach(b => {
    grid.innerHTML += `
      <a href="vehicles.html?brand=${encodeURIComponent(b.name)}" class="brand">
        <img src="${b.logo}" alt="${b.name}" loading="lazy">
        <span class="brand-name">${b.name}</span>
      </a>
    `;

    select.innerHTML += `<option value="${b.name}">${b.name}</option>`;
  });
}

/* ===============================
   BUSCA (MARCA REAL DO ESTOQUE)
================================ */
function loadBrandsFromStock() {
  const select = document.getElementById("brandSelect");
  if (!select) return;

  // limpa select
  select.innerHTML = `<option value="">Todas as marcas</option>`;

  // apenas veículos disponíveis
  const availableVehicles = vehicles.filter(
    v => v.status === "disponivel"
  );

  // marcas únicas
  const brandsInStock = [
    ...new Set(availableVehicles.map(v => v.brand))
  ];

  // ordena
  brandsInStock.sort();

  brandsInStock.forEach(brand => {
    select.innerHTML += `<option value="${brand}">${brand}</option>`;
  });
}



/* ===============================
   BUSCA (VAI PRO ESTOQUE)
================================ */
function setupSearch() {
  const button = document.getElementById("searchBtn");
  const brandSelect = document.getElementById("brandSelect");

  if (!button || !brandSelect) return;

  button.addEventListener("click", () => {
    const brand = brandSelect.value;

    let url = "vehicles.html";
    if (brand) {
      url += `?brand=${encodeURIComponent(brand)}`;
    }

    window.location.href = url;
  });
}

/* ===============================
   VEÍCULOS
================================ */
async function loadVehicles() {
  const res = await fetch(API);
  vehicles = await res.json();
}

/* ===============================
   DESTAQUES
================================ */
function renderFeatured() {
  const container = document.getElementById("featuredVehicles");
  if (!container) return;

  const featured = vehicles.filter(
    v => v.status === "disponivel" && v.featured === true
  );

  container.innerHTML = "";

  featured.slice(0, 6).forEach(v => {
    const image = v.photos?.[0] || v.image || "img/no-image.png";

    container.innerHTML += `
      <div class="card">
        <img src="${image}" alt="${v.brand} ${v.model}" loading="lazy">
        <h3>${v.brand} ${v.model}</h3>

        <div class="card-specs">
          <span>📅 ${v.year || "-"}</span>
          <span>⚡ ${v.power || "-"}</span>
        </div>

        <strong>R$ ${Number(v.price).toLocaleString("pt-BR")}</strong>

        <a href="vehicle-details.html?id=${v.id}" class="details-btn">
          Ver detalhes
        </a>
      </div>
    `;
  });
}



