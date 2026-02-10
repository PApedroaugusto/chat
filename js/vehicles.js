const grid = document.getElementById("vehiclesGrid");
const brandFilter = document.getElementById("brandFilter");
const yearFilter = document.getElementById("yearFilter");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const searchInput = document.getElementById("searchInput");
const sortFilter = document.getElementById("sortFilter");
const count = document.getElementById("vehicleCount");

const API = window.API_VEHICLES;

// Start fetching immediately
const fetchPromise = fetch(API).then(res => res.json()).catch(err => {
  console.error("Erro ao carregar veículos:", err);
  return [];
});

let vehicles = [];
let displayed = 0;        // Quantos veículos já foram mostrados
const BATCH_SIZE = 6;     // Quantos veículos carregar por vez
let currentFiltered = []; // Lista filtrada atual

/* ===============================
   LOAD
================================ */
// Call init as soon as possible
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

async function init() {
  try {
    vehicles = await fetchPromise;

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

  brandFilter.innerHTML = `<option value="">Todas as marcas</option>` +
    brands.map(b => `<option value="${b}">${b}</option>`).join('');

  yearFilter.innerHTML = `<option value="">Todos os anos</option>` +
    years.map(y => `<option value="${y}">${y}</option>`).join('');

  categoryFilter.innerHTML = `<option value="">Todas categorias</option>` +
    categories.map(c => `<option value="${c}">${c}</option>`).join('');
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

// Click nos cards (Event Delegation)
grid.addEventListener("click", (e) => {
  const card = e.target.closest(".vehicle-card");
  if (card) {
    const id = card.dataset.id;
    window.location.href = `vehicle-details.html?id=${id}`;
  }
});

// Scroll infinito
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    if (displayed < currentFiltered.length) {
      renderVehicles(currentFiltered, false);
    }
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
function renderVehicles(list, reset = true) {
  if (reset) {
    grid.innerHTML = "";
    displayed = 0;
    currentFiltered = list;
  }

  const nextBatch = currentFiltered.slice(displayed, displayed + BATCH_SIZE);

  const html = nextBatch.map(vehicle => {
    const image = vehicle.photos?.[0] || vehicle.image || "img/no-image.png";
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

  grid.insertAdjacentHTML('beforeend', html);
  displayed += nextBatch.length;
  count.innerText = `${currentFiltered.length} veículos disponíveis`;
}


function toggleFilters() {
  const filters = document.getElementById("filtersHidden");
  filters.classList.toggle("active");
}

