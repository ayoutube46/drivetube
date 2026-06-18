let videos = [];
let mode = "all";
let currentCategory = null;

const grid = document.getElementById("grid");
const search = document.getElementById("search");
const player = document.getElementById("player");
const frame = document.getElementById("frame");
const title = document.getElementById("title");
const categoriesBox = document.getElementById("categories");

let favorites = JSON.parse(localStorage.getItem("dt_fav") || "[]");
let history = JSON.parse(localStorage.getItem("dt_hist") || "[]");

async function init() {
    try {
        const res = await fetch("./videos.json");
        videos = await res.json();
        renderCategories();
        render();
    } catch (err) {
        grid.innerHTML = `<div style="padding:20px; color:var(--accent-amber);">Error loading videos.json data payload.</div>`;
    }
}

function renderCategories() {
    const cats = [...new Set(videos.map(v => v.category))];
    categoriesBox.innerHTML = "";

    let allBtn = document.createElement("button");
    allBtn.innerHTML = `<span>All Deployed</span>`;
    if (!currentCategory) allBtn.className = "active";
    allBtn.onclick = () => { currentCategory = null; renderCategories(); render(); };
    categoriesBox.appendChild(allBtn);

    cats.forEach(c => {
        let btn = document.createElement("button");
        btn.innerHTML = `<span>${c}</span>`;
        if (currentCategory === c) btn.className = "active";
        btn.onclick = () => { currentCategory = c; renderCategories(); render(); };
        categoriesBox.appendChild(btn);
    });
}

function setMode(m) {
    mode = m;
    document.querySelectorAll("[data-mode]").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-mode") === m);
    });
    render();
}

function toggleFav(id) {
    favorites = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
    localStorage.setItem("dt_fav", JSON.stringify(favorites));
    render();
}

function openVideo(v) {
    title.innerText = v.title;
    frame.src = `https://drive.google.com/file/d/${v.id}/preview`;
    player.classList.remove("hidden");

    history = [v.id, ...history.filter(x => x !== v.id)];
    localStorage.setItem("dt_hist", JSON.stringify(history));
}

document.getElementById("close").onclick = () => {
    player.classList.add("hidden");
    frame.src = "";
    render();
};

function render() {
    let list = [...videos];

    let q = search.value.toLowerCase().trim();
    if (q) list = list.filter(v => v.title.toLowerCase().includes(q));

    if (currentCategory) list = list.filter(v => v.category === currentCategory);

    if (mode === "favorites") {
        list = list.filter(v => favorites.includes(v.id));
    } else if (mode === "history") {
        list = list.filter(v => history.includes(v.id));
        list.sort((a, b) => history.indexOf(a.id) - history.indexOf(b.id));
    }

    grid.innerHTML = "";

    if (list.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:40px 0;">Directory Empty.</div>`;
        return;
    }

    list.forEach(v => {
        let card = document.createElement("div");
        card.className = "card";
        let isFav = favorites.includes(v.id);
        let icon = v.category.toLowerCase() === 'audio' ? '🎵' : '🎞️';

        card.innerHTML = `
            <div class="card-thumb">${icon}</div>
            <div class="card-body">
                <h3>${v.title}</h3>
                <div class="card-meta">
                    <span class="tag">${v.category}</span>
                    <span class="fav-indicator">${isFav ? "★" : "☆"}</span>
                </div>
            </div>
        `;

        card.onclick = () => openVideo(v);
        card.oncontextmenu = (e) => { e.preventDefault(); toggleFav(v.id); };
        grid.appendChild(card);
    });
}

search.oninput = render;
init();