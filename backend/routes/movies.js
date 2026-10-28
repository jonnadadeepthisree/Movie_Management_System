const express = require("express");
const supabase = require("../supabase");
const router = express.Router();

const allowedGenres = new Set([
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Fantasy", "Horror", "Romance", "Science Fiction", "Thriller", "Other"
]);

function validateMovie(body) {
  const errors = [];
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const genre = typeof body.genre === "string" ? body.genre.trim() : "";
  if (!title || title.length > 150) errors.push("Title is required and must be at most 150 characters.");
  if (!allowedGenres.has(genre)) errors.push("Choose a valid genre.");
  if (body.director != null && (typeof body.director !== "string" || body.director.trim().length > 120)) errors.push("Director must be at most 120 characters.");
  if (body.release_year != null && (!Number.isInteger(Number(body.release_year)) || Number(body.release_year) < 1888 || Number(body.release_year) > 2100)) errors.push("Release year must be between 1888 and 2100.");
  if (body.rating != null && (typeof body.rating === "boolean" || !Number.isFinite(Number(body.rating)) || Number(body.rating) < 0 || Number(body.rating) > 10)) errors.push("Rating must be between 0 and 10.");
  if (body.poster_url != null) {
    if (typeof body.poster_url !== "string" || body.poster_url.length > 1000) errors.push("Poster URL must be at most 1000 characters.");
    else if (body.poster_url && !["http:", "https:"].includes(parseUrl(body.poster_url)?.protocol)) errors.push("Poster URL must start with http:// or https://.");
  }
  if (body.notes != null && (typeof body.notes !== "string" || body.notes.length > 1000)) errors.push("Notes must be at most 1000 characters.");
  if (errors.length) return { errors };
  return { value: {
    title, genre,
    director: body.director?.trim() || null,
    release_year: body.release_year == null || body.release_year === "" ? null : Number(body.release_year),
    rating: body.rating == null || body.rating === "" ? null : Number(body.rating),
    poster_url: body.poster_url?.trim() || null,
    notes: body.notes?.trim() || null
  }};
}
function parseUrl(value) { try { return new URL(value); } catch { return null; } }
function dbReady(res) {
  if (!supabase) {
    res.status(503).json({ error: "Database is not configured. Add valid Supabase credentials to backend/.env." });
    return false;
  }
  return true;
}
function handleDbError(res, error) {
  console.error("Database operation failed:", error.message);
  return res.status(500).json({ error: "A database operation failed. Check the table setup and server logs." });
}

router.get("/", async (req, res) => {
  if (!dbReady(res)) return;
  const { data, error } = await supabase.from("movies").select("*").order("created_at", { ascending: false });
  if (error) return handleDbError(res, error);
  return res.json({ data });
});
router.post("/", async (req, res) => {
  if (!dbReady(res)) return;
  const parsed = validateMovie(req.body || {});
  if (parsed.errors) return res.status(400).json({ error: parsed.errors.join(" ") });
  const { data, error } = await supabase.from("movies").insert(parsed.value).select("*").single();
  if (error) return handleDbError(res, error);
  return res.status(201).json({ data });
});
router.put("/:id", async (req, res) => {
  if (!dbReady(res)) return;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.id)) return res.status(400).json({ error: "Invalid movie ID." });
  const parsed = validateMovie(req.body || {});
  if (parsed.errors) return res.status(400).json({ error: parsed.errors.join(" ") });
  const { data, error } = await supabase.from("movies").update(parsed.value).eq("id", req.params.id).select("*").maybeSingle();
  if (error) return handleDbError(res, error);
  if (!data) return res.status(404).json({ error: "Movie not found." });
  return res.json({ data });
});
router.delete("/:id", async (req, res) => {
  if (!dbReady(res)) return;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.id)) return res.status(400).json({ error: "Invalid movie ID." });
  const { data, error } = await supabase.from("movies").delete().eq("id", req.params.id).select("id").maybeSingle();
  if (error) return handleDbError(res, error);
  if (!data) return res.status(404).json({ error: "Movie not found." });
  return res.json({ message: "Movie deleted successfully." });
});
module.exports = router;
