const grid = document.getElementById("vehiclesGrid");
const brandFilter = document.getElementById("brandFilter");
const yearFilter = document.getElementById("yearFilter");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const searchInput = document.getElementById("searchInput");
const sortFilter = document.getElementById("sortFilter");
const count = document.getElementById("vehicleCount");

const API = "http://localhost:3000/vehicles";

let vehicles = [];

/* ===============================
   LOAD
================================ */
document.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    const res = await fetch(API);
    vehicles = await res.json();

    populateFilters();
    applyUrlFilters(); // 👈 pega marca da URL
    applyFilters();
  } catch (err) {
    console.error("Erro ao carregar veículos:", err);
  }
}

/* ===============================
   PEGAR FILTROS DA URL
================================ */
function applyUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const brandFromUrl = params.get("brand");

  if (brandFromUrl) {
    brandFilter.value = brandFromUrl;
  }
}

/* ===============================
   POPULAR FILTROS
================================ */
function populateFilters() {
  const brands = [...new Set(vehicles.map(v => v.brand).filter(Boolean))].sort();
  const years = [...new Set(vehicles.map(v => v.year).filter(Boolean))].sort((a, b) => b - a);
  const categories = [...new Set(vehicles.map(v => v.category).filter(Boolean))].sort();

  brandFilter.innerHTML = `<option value="">Todas as marcas</option>`;
  yearFilter.innerHTML = `<option value="">Todos os anos</option>`;
  categoryFilter.innerHTML = `<option value="">Todas categorias</option>`;

  brands.forEach(b => brandFilter.innerHTML += `<option value="${b}">${b}</option>`);
  years.forEach(y => yearFilter.innerHTML += `<option value="${y}">${y}</option>`);
  categories.forEach(c => categoryFilter.innerHTML += `<option value="${c}">${c}</option>`);
}

/* ===============================
   EVENTOS
================================ */
[
  brandFilter,
  yearFilter,
  categoryFilter,
  priceFilter,
  sortFilter
].forEach(el => el.addEventListener("change", applyFilters));

searchInput.addEventListener("keyup", applyFilters);

/* ===============================
   APLICAR FILTROS
================================ */
function applyFilters() {
  let result = vehicles.filter(v => v.status === "disponivel");

  const search = searchInput.value.toLowerCase();
  const brand = brandFilter.value;
  const year = yearFilter.value;
  const category = categoryFilter.value;
  const price = priceFilter.value;
  const sort = sortFilter.value;

  if (search) {
    result = result.filter(v =>
      v.brand?.toLowerCase().includes(search) ||
      v.model?.toLowerCase().includes(search)
    );
  }

  if (brand) result = result.filter(v => v.brand === brand);
  if (year) result = result.filter(v => String(v.year) === year);
  if (category) result = result.filter(v => v.category === category);

  if (price) {
    if (price.includes("-")) {
      const [min, max] = price.split("-").map(Number);
      result = result.filter(v => v.price >= min && v.price <= max);
    } else {
      result = result.filter(v => v.price >= Number(price));
    }
  }

  if (sort === "price_asc") result.sort((a, b) => a.price - b.price);
  if (sort === "price_desc") result.sort((a, b) => b.price - a.price);
  if (sort === "newest") result.sort((a, b) => b.id - a.id);

  renderVehicles(result);
}

/* ===============================
   LIMPAR FILTROS
================================ */
function clearFilters() {
  searchInput.value = "";
  brandFilter.value = "";
  yearFilter.value = "";
  categoryFilter.value = "";
  priceFilter.value = "";
  sortFilter.value = "newest";

  window.history.replaceState({}, "", "vehicles.html"); // limpa URL
  applyFilters();
}

/* ===============================
   RENDERIZAR CARDS
================================ */
function renderVehicles(list) {
  grid.innerHTML = "";
  count.innerText = `${list.length} veículos disponíveis`;

  list.forEach(vehicle => {
    const image =
      vehicle.photos?.[0] ||
      vehicle.image ||
      "img/no-image.png";

    const card = document.createElement("div");
    card.className = "vehicle-card";

    card.innerHTML = `
      <div class="image">
        <img src="${image}" alt="${vehicle.brand} ${vehicle.model}">
      </div>

      <div class="info">
        <span class="brand">${vehicle.brand}</span>
        <h3>${vehicle.model}</h3>

        <div class="specs">
          <span>📅 ${vehicle.year || "-"}</span>
          <span>⚡ ${vehicle.power || "-"}</span>
        </div>

        <strong class="price">
          R$ ${Number(vehicle.price).toLocaleString("pt-BR")}
        </strong>
      </div>
    `;

    card.addEventListener("click", () => {
      window.location.href = `vehicle-details.html?id=${vehicle.id}`;
    });

    grid.appendChild(card);
  });
}
