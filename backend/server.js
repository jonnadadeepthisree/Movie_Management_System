require("dotenv").config();
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const moviesRouter = require("./routes/movies");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "30kb" }));
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) res.setHeader("Cache-Control", "no-store");
  next();
});
app.get("/api/health", (req, res) => res.json({ status: "ok", application: "Movie Management System" }));
app.use("/api/movies", moviesRouter);
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use("/api", (req, res) => res.status(404).json({ error: "API endpoint not found." }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) return res.status(400).json({ error: "Invalid JSON request body." });
  console.error("Unexpected server error:", err.message);
  return res.status(500).json({ error: "Unexpected server error." });
});
app.listen(port, () => console.log(`Movie Management System running at http://localhost:${port}`));
