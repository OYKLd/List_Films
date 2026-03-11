let films = JSON.parse(localStorage.getItem('cine28') || '[]');
let activeFilter = 'all';
let searchQuery = '';
let sortDir = 'desc'; 

function save() {
  localStorage.setItem('cine28', JSON.stringify(films));
}

function openModal() {
  document.getElementById('modalBackdrop').classList.add('open');
  setTimeout(() => document.getElementById('f-title').focus(), 250);
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
  ['f-title', 'f-genre', 'f-year', 'f-poster', 'f-note'].forEach(id => {
    const el = document.getElementById(id);
    el.tagName === 'SELECT' ? (el.selectedIndex = 0) : (el.value = '');
  });
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modalBackdrop')) closeModal();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

function addFilm() {
  const title = document.getElementById('f-title').value.trim();
  if (!title) {
    document.getElementById('f-title').focus();
    return;
  }

  const film = {
    id: Date.now(),
    title,
    genre: document.getElementById('f-genre').value,
    year: document.getElementById('f-year').value || '',
    poster: document.getElementById('f-poster').value.trim(),
    note: document.getElementById('f-note').value.trim(),
    seen: false,
    fav: false,
    rating: 0,
    added: Date.now()
  };

  films.unshift(film);
  save();
  render();
  closeModal();
}

function toggleSeen(id) {
  const f = films.find(f => f.id === id);
  if (f) { f.seen = !f.seen; save(); render(); }
}

function toggleFav(id) {
  const f = films.find(f => f.id === id);
  if (f) { f.fav = !f.fav; save(); render(); }
}

function setRating(id, r) {
  const f = films.find(f => f.id === id);
  if (f) { f.rating = f.rating === r ? 0 : r; save(); render(); }
}

function deleteFilm(id) {
  films = films.filter(f => f.id !== id);
  save();
  render();
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    render();
  });
});

document.getElementById('search').addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase();
  render();
});

const sortModes = ['desc', 'asc', 'alpha'];
const sortLabels = { desc: 'Récent', asc: 'Ancien', alpha: 'A–Z' };
let sortIdx = 0;

function toggleSort() {
  sortIdx = (sortIdx + 1) % sortModes.length;
  sortDir = sortModes[sortIdx];
  document.getElementById('sortLabel').textContent = sortLabels[sortDir];
  render();
}

function getSorted(list) {
  const arr = [...list];
  if (sortDir === 'desc')  return arr.sort((a, b) => b.added - a.added);
  if (sortDir === 'asc')   return arr.sort((a, b) => a.added - b.added);
  if (sortDir === 'alpha') return arr.sort((a, b) => a.title.localeCompare(b.title));
  return arr;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function placeholderHTML() {
  return `<div class="poster-placeholder">
    <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="3"/>
      <path d="M7 2v20M17 2v20M2 12h20"/>
    </svg>
    <span>Erreur image</span>
  </div>`;
}

function buildStars(filmId, rating) {
  let html = '';
  for (let s = 1; s <= 5; s++) {
    html += `<span class="star${s <= rating ? ' lit' : ''}" onclick="setRating(${filmId}, ${s})">★</span>`;
  }
  return html;
}

function render() {
  let list = [...films];

  if (activeFilter === 'seen')   list = list.filter(f => f.seen);
  if (activeFilter === 'unseen') list = list.filter(f => !f.seen);
  if (activeFilter === 'fav')    list = list.filter(f => f.fav);

  if (searchQuery) {
    list = list.filter(f =>
      f.title.toLowerCase().includes(searchQuery) ||
      (f.genre && f.genre.toLowerCase().includes(searchQuery)) ||
      (f.year && f.year.toString().includes(searchQuery))
    );
  }

  list = getSorted(list);

  document.getElementById('stat-total').textContent  = films.length;
  document.getElementById('stat-seen').textContent   = films.filter(f => f.seen).length;
  document.getElementById('stat-unseen').textContent = films.filter(f => !f.seen).length;
  document.getElementById('stat-fav').textContent    = films.filter(f => f.fav).length;

  const grid  = document.getElementById('grid');
  const empty = document.getElementById('empty');

  grid.querySelectorAll('.card').forEach(c => c.remove());

  if (list.length === 0) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  list.forEach((f, i) => {
    const card = document.createElement('div');
    card.className = 'card' + (f.seen ? ' seen' : '');
    card.style.animationDelay = (i * 0.04) + 's';

    const posterContent = f.poster
      ? `<img src="${escHtml(f.poster)}" alt="${escHtml(f.title)}" onerror="this.parentElement.innerHTML=placeholderHTML()">`
      : `<div class="poster-placeholder">
           <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
             <rect x="2" y="2" width="20" height="20" rx="3"/>
             <path d="M7 2v20M17 2v20M2 12h20"/>
           </svg>
           <span>Sans affiche</span>
         </div>`;

    const seenToggleIcon = f.seen
      ? `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
           <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
           <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
           <line x1="1" y1="1" x2="23" y2="23"/>
         </svg> Marquer à voir`
      : `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
           <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
           <circle cx="12" cy="12" r="3"/>
         </svg> Marquer vu`;

    card.innerHTML = `
      <div class="card-poster">
        ${posterContent}
        <div class="badge-seen">Vu ✓</div>
        <button class="badge-fav${f.fav ? ' active' : ''}" onclick="toggleFav(${f.id})" title="Favori">★</button>
      </div>
      <div class="card-body">
        <div class="card-meta">
          ${f.genre ? `<span class="card-genre">${escHtml(f.genre)}</span>` : ''}
          ${f.year  ? `<span>${escHtml(f.year)}</span>` : ''}
        </div>
        <div class="card-title">${escHtml(f.title)}</div>
        ${f.seen ? `<div class="card-rating">${buildStars(f.id, f.rating)}</div>` : ''}
        ${f.note ? `<div class="card-note">${escHtml(f.note)}</div>` : ''}
      </div>
      <div class="card-actions">
        <button class="btn-toggle" onclick="toggleSeen(${f.id})">
          ${seenToggleIcon}
        </button>
        <button class="btn-delete" onclick="deleteFilm(${f.id})" title="Supprimer">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    `;

    grid.appendChild(card);
  });
}

render();