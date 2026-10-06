
const products = window.MMG_PRODUCTS || [];
const whatsappNumber = "5561999923919";
let selected = new Set();
let activeCategory = "Todos";

const grid = document.getElementById("catalogGrid");
const search = document.getElementById("searchInput");
const selectedCount = document.getElementById("selectedCount");
const quoteList = document.getElementById("quoteList");
const emptyState = document.getElementById("emptyState");
const modal = document.getElementById("productModal");

function wa(message) {
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
}
document.querySelectorAll("[data-whatsapp]").forEach(a => a.addEventListener("click", e => {
  e.preventDefault(); wa(a.dataset.whatsapp);
}));

function filteredProducts() {
  const term = (search.value || "").toLowerCase().trim();
  return products.filter(p => {
    const catOk = activeCategory === "Todos" || p.category === activeCategory;
    const termOk = !term || `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(term);
    return catOk && termOk;
  });
}

function render() {
  const list = filteredProducts();
  grid.innerHTML = list.map(p => `
    <article class="product">
      <div class="product-img">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="product-tag">${p.category}</span>
        <button class="heart ${selected.has(p.id) ? "selected" : ""}" data-action="select" data-id="${p.id}" aria-label="Selecionar ${
p.name}">${selected.has(p.id) ? "♥" : "♡"}</button>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="product-actions">
          <button data-action="details" data-id="${p.id}">Ver detalhes</button>
          <button class="select ${selected.has(p.id) ? "selected" : ""}" data-action="select" data-id="${p.id}">${selected.has(p.id) ? "Selecionado" : "Selecionar"}</button>
        </div>
      </div>
    </article>`).join("");
  emptyState.hidden = list.length !== 0;
  selectedCount.textContent = selected.size;
  updateQuote();
}

grid.addEventListener("click", e => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const p = products.find(x => x.id === Number(btn.dataset.id));
  if (btn.dataset.action === "select") {
    selected.has(p.id) ? selected.delete(p.id) : selected.add(p.id);
    render();
  } else if (btn.dataset.action === "details") openModal(p);
});

document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
  btn.classList.add("active"); activeCategory = btn.dataset.category; render();
}));
search.addEventListener("input", render);

document.querySelectorAll(".color-guide button").forEach(btn => btn.addEventListener("click", () => {
  const c = btn.dataset.color;
  const terms = {escuro:"preto grafite", verde:"verde", claro:"branco bege", neutro:"cinza marfim"};
  search.value = terms[c] || ""; activeCategory = "Todos";
  document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b.dataset.category==="Todos"));
  document.getElementById("modelos").scrollIntoView({behavior:"smooth"}); render();
}));

function updateQuote() {
  const items = [...selected].map(id => products.find(p => p.id === id));
  if (!items.length) { quoteList.innerHTML = "<p>Nenhum modelo selecionado ainda.</p>"; return; }
  quoteList.innerHTML = items.map(p => `<div class="quote-item"><span>${p.name}</span><button data-remove="${p.id}">Remover</button></div>`).join("");
}
quoteList.addEventListener("click", e => {
  const btn=e.target.closest("[data-remove]"); if(!btn)return;
  selected.delete(Number(btn.dataset.remove)); render();
});
document.getElementById("clearSelection").addEventListener("click",()=>{selected.clear();render()});
document.getElementById("sendQuote").addEventListener("click",()=>{
  const items=[...selected].map(id=>products.find(p=>p.id===id));
  if(!items.length) return wa("Olá! Vim pelo catálogo da MMG Marmoraria e gostaria de solicitar um orçamento.");
  const names=items.map(p=>`• ${p.name} (${p.category})`).join("\n");
  wa(`Olá! Vim pelo catálogo da MMG Marmoraria e gostaria de solicitar um orçamento.\n\nModelos selecionados:\n${names}\n\nGostaria de receber atendimento e informações sobre disponibilidade e valores.`);
});

function openModal(p) {
  document.getElementById("modalImage").src=p.image;
  document.getElementById("modalImage").alt=p.name;
  document.getElementById("modalCategory").textContent=p.category;
  document.getElementById("modalName").textContent=p.name;
  document.getElementById("modalDescription").textContent=p.description;
  const b=document.getElementById("modalSelect"); b.textContent=selected.has(p.id)?"Remover da seleção":"Selecionar este modelo";
  b.onclick=()=>{selected.has(p.id)?selected.delete(p.id):selected.add(p.id); render(); openModal(p)};
  modal.classList.add("open"); modal.setAttribute("aria-hidden","false");
}
document.querySelectorAll("[data-close]").forEach(x=>x.addEventListener("click",()=>{modal.classList.remove("open");modal.setAttribute("aria-hidden","true")}));
document.addEventListener("keydown",e=>{if(e.key==="Escape")modal.classList.remove("open")});
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("nav").classList.toggle("open"));
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>document.getElementById("nav").classList.remove("open")));
render();
