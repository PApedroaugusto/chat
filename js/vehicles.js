const grid = document.getElementById("vehiclesGrid");
const brandFilter = document.getElementById("brandFilter");
const yearFilter = document.getElementById("yearFilter");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const searchInput = document.getElementById("searchInput");
const sortFilter = document.getElementById("sortFilter");
const count = document.getElementById("vehicleCount");

const API = window.API_VEHICLES;

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
  const brandsSet = new Set();
  const yearsSet = new Set();
  const categoriesSet = new Set();

  vehicles.forEach(v => {
    if (v.brand) brandsSet.add(v.brand);
    if (v.year) yearsSet.add(v.year);
    if (v.category) categoriesSet.add(v.category);
  });

  const brands = [...brandsSet].sort();
  const years = [...yearsSet].sort((a, b) => b - a);
  const categories = [...categoriesSet].sort();

  let brandsHtml = '<option value="">Todas as marcas</option>';
  brands.forEach(b => brandsHtml += `<option value="${b}">${b}</option>`);
  brandFilter.innerHTML = brandsHtml;

  let yearsHtml = '<option value="">Todos os anos</option>';
  years.forEach(y => yearsHtml += `<option value="${y}">${y}</option>`);
  yearFilter.innerHTML = yearsHtml;

  let catsHtml = '<option value="">Todas categorias</option>';
  categories.forEach(c => catsHtml += `<option value="${c}">${c}</option>`);
  categoryFilter.innerHTML = catsHtml;
}

/* ===============================
   EVENTOS
================================ */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

[
  brandFilter,
  yearFilter,
  categoryFilter,
  priceFilter,
  sortFilter
].forEach(el => el.addEventListener("change", applyFilters));

searchInput.addEventListener("input", debounce(applyFilters, 300));

grid.addEventListener("click", (e) => {
  const card = e.target.closest(".vehicle-card");
  if (card) {
    const id = card.dataset.id;
    window.location.href = `vehicle-details.html?id=${id}`;
  }
});

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
  count.innerText = `${list.length} veículos disponíveis`;

  const html = list.map(vehicle => {
    const image =
      vehicle.photos?.[0] ||
      vehicle.image ||
      "img/no-image.png";

    return `
      <div class="vehicle-card" data-id="${vehicle.id}">
        <div class="image">
          <img src="${image}" alt="${vehicle.brand} ${vehicle.model}" loading="lazy">
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
      </div>
    `;
  }).join('');

  grid.innerHTML = html;
}


function toggleFilters() {
  const filters = document.getElementById("filtersHidden");
  filters.classList.toggle("active");
}

