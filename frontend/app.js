const API = "/api/movies";
const grid = document.querySelector("#movie-grid");
const statusMessage = document.querySelector("#status-message");
const emptyState = document.querySelector("#empty-state");
const form = document.querySelector("#movie-form");
const formMessage = document.querySelector("#form-message");
let movies = [];

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
function safeImageUrl(value) {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; }
  catch { return ""; }
}
function showFormMessage(message, error = false) {
  formMessage.textContent = message;
  formMessage.classList.toggle("error", error);
}
async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Request failed. Please try again.");
  return payload;
}
async function loadMovies() {
  statusMessage.textContent = "Loading movies…";
  try {
    const payload = await request(API);
    movies = payload.data || [];
    renderMovies();
    statusMessage.textContent = movies.length ? `${movies.length} movie${movies.length === 1 ? "" : "s"} in your collection` : "";
  } catch (error) {
    movies = [];
    renderMovies();
    statusMessage.textContent = `${error.message} Check that the server and Supabase are configured.`;
  }
}
function renderMovies() {
  const search = document.querySelector("#search-input").value.trim().toLowerCase();
  const genre = document.querySelector("#genre-filter").value;
  const sort = document.querySelector("#sort-select").value;
  const filtered = movies.filter(movie => {
    const text = `${movie.title} ${movie.director || ""} ${movie.genre} ${movie.release_year || ""}`.toLowerCase();
    return text.includes(search) && (!genre || movie.genre === genre);
  });
  filtered.sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
    if (sort === "year") return Number(b.release_year || 0) - Number(a.release_year || 0);
    return new Date(b.created_at) - new Date(a.created_at);
  });
  grid.innerHTML = filtered.map(movie => {
    const image = safeImageUrl(movie.poster_url || "");
    const poster = image
      ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(movie.title)} poster" loading="lazy" onerror="this.parentElement.textContent='▶'">`
      : "▶";
    return `<article class="movie-card">
      <div class="poster">${poster}</div>
      <div class="movie-info">
        <h3 class="movie-title">${escapeHtml(movie.title)}</h3>
        <div class="movie-meta">${movie.release_year ? escapeHtml(movie.release_year) + " · " : ""}${escapeHtml(movie.director || "Director not added")}</div>
        <span class="genre-pill">${escapeHtml(movie.genre)}</span>
        <div class="rating">${movie.rating !== null && movie.rating !== undefined ? "★ " + Number(movie.rating).toFixed(1) + " / 10" : "Not rated yet"}</div>
        ${movie.notes ? `<p class="notes">${escapeHtml(movie.notes)}</p>` : ""}
        <div class="card-actions"><button class="edit-button" data-action="edit" data-id="${escapeHtml(movie.id)}">Edit</button><button class="delete-button" data-action="delete" data-id="${escapeHtml(movie.id)}">Delete</button></div>
      </div></article>`;
  }).join("");
  emptyState.classList.toggle("hidden", filtered.length !== 0);
  document.querySelector("#total-count").textContent = movies.length;
  const rated = movies.filter(movie => movie.rating !== null && movie.rating !== undefined);
  document.querySelector("#average-rating").textContent = rated.length ? (rated.reduce((sum, m) => sum + Number(m.rating), 0) / rated.length).toFixed(1) : "—";
  document.querySelector("#genre-count").textContent = new Set(movies.map(movie => movie.genre)).size;
  const selected = document.querySelector("#genre-filter").value;
  const genres = [...new Set(movies.map(movie => movie.genre))].sort();
  document.querySelector("#genre-filter").innerHTML = '<option value="">All genres</option>' + genres.map(g => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`).join("");
  document.querySelector("#genre-filter").value = genres.includes(selected) ? selected : "";
}
function resetForm() {
  form.reset();
  document.querySelector("#movie-id").value = "";
  document.querySelector("#form-heading").textContent = "Add a movie";
  document.querySelector("#submit-button").textContent = "Save movie";
  document.querySelector("#cancel-edit").classList.add("hidden");
  showFormMessage("");
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  showFormMessage("Saving…");
  const id = document.querySelector("#movie-id").value;
  const yearValue = document.querySelector("#release-year").value;
  const ratingValue = document.querySelector("#rating").value;
  const body = {
    title: document.querySelector("#title").value.trim(),
    director: document.querySelector("#director").value.trim() || null,
    release_year: yearValue ? Number(yearValue) : null,
    genre: document.querySelector("#genre").value,
    rating: ratingValue ? Number(ratingValue) : null,
    poster_url: document.querySelector("#poster-url").value.trim() || null,
    notes: document.querySelector("#notes").value.trim() || null
  };
  try {
    if (id) await request(`${API}/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) });
    else await request(API, { method: "POST", body: JSON.stringify(body) });
    resetForm();
    await loadMovies();
    showFormMessage(id ? "Movie updated successfully." : "Movie added successfully.");
    document.querySelector("#collection").scrollIntoView({ behavior: "smooth" });
  } catch (error) { showFormMessage(error.message, true); }
});
grid.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const movie = movies.find(item => item.id === button.dataset.id);
  if (!movie) return;
  if (button.dataset.action === "edit") {
    document.querySelector("#movie-id").value = movie.id;
    document.querySelector("#title").value = movie.title;
    document.querySelector("#director").value = movie.director || "";
    document.querySelector("#release-year").value = movie.release_year || "";
    document.querySelector("#genre").value = movie.genre;
    document.querySelector("#rating").value = movie.rating ?? "";
    document.querySelector("#poster-url").value = movie.poster_url || "";
    document.querySelector("#notes").value = movie.notes || "";
    document.querySelector("#form-heading").textContent = "Edit movie";
    document.querySelector("#submit-button").textContent = "Update movie";
    document.querySelector("#cancel-edit").classList.remove("hidden");
    showFormMessage("");
    document.querySelector("#add-movie").scrollIntoView({ behavior: "smooth" });
    return;
  }
  if (!confirm(`Delete "${movie.title}" from your collection? This cannot be undone.`)) return;
  try {
    await request(`${API}/${encodeURIComponent(movie.id)}`, { method: "DELETE" });
    await loadMovies();
  } catch (error) { statusMessage.textContent = error.message; }
});
document.querySelector("#cancel-edit").addEventListener("click", resetForm);
document.querySelector("#refresh-button").addEventListener("click", loadMovies);
document.querySelector("#search-input").addEventListener("input", renderMovies);
document.querySelector("#genre-filter").addEventListener("change", renderMovies);
document.querySelector("#sort-select").addEventListener("change", renderMovies);
loadMovies();
