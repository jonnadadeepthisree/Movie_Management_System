# Movie Management System

A beginner-friendly full-stack movie library built with HTML, CSS, Vanilla JavaScript, Node.js, Express.js, and Supabase PostgreSQL.

## 1. Overview

Movie Management System (CineShelf) helps a user maintain a movie collection in one place. Users can add, browse, search, filter, sort, edit, and delete movie records. The dashboard shows the number of movies, average rating, and number of genres.

### Problem statement
Movie details and personal ratings are often scattered across notes and apps. This project provides one organized collection backed by a PostgreSQL database.

### Target users
A student or movie enthusiast managing a personal collection. This MVP is a single shared collection and does not implement login or multiple user accounts.

## 2. Features

- Add movies with title, director, year, genre, rating, optional poster URL, and notes.
- List and view movies in responsive cards.
- Search by title, director, genre, or release year.
- Filter by genre and sort by recently added, title, rating, or release year.
- Edit and delete records, with confirmation before deletion.
- Dashboard statistics and server-side input validation.
- Persistent storage in Supabase PostgreSQL.

## 3. Technology stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js and Express.js
- Database: Supabase PostgreSQL
- Small server packages: `@supabase/supabase-js`, `dotenv`, `express`, `helmet`

## 4. Folder structure

```text
movie-management-system/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── routes/movies.js
│   ├── server.js
│   ├── supabase.js
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   └── .gitignore
├── database/
│   └── schema.sql
├── .gitignore
└── README.md
```

## 5. Prerequisites

Install:
- Node.js LTS and npm: https://nodejs.org/
- Visual Studio Code: https://code.visualstudio.com/
- Git: https://git-scm.com/
- A free Supabase account: https://supabase.com/

Check installations in a terminal:
```bash
node --version
npm --version
git --version
```

## 6. Supabase setup

1. Sign in at https://supabase.com/ and create a new project.
2. Choose a project name and database password; keep the password private.
3. Wait until the database is ready.
4. Open **SQL Editor** in the Supabase dashboard.
5. Open `database/schema.sql` in VS Code, copy all SQL, paste it into the SQL Editor, and run it.
6. Open **Table Editor** and confirm that the `movies` table exists.
7. In Supabase project settings, find the project URL and the server-side secret/service-role key in the API keys section. Supabase dashboard labels may vary. Use the key intended for trusted server-side use.

The server-side service-role key bypasses Row Level Security. This project has no public RLS policy and uses the key only inside Express. Never paste it into frontend code, screenshots, GitHub, or a public report.

## 7. Environment configuration

Open `backend/.env` and replace the placeholders:

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_real_server_side_secret_key
```

- `PORT`: local web server port.
- `NODE_ENV`: environment label.
- `SUPABASE_URL`: URL of your Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY`: privileged server-only key.

`.env` contains your private local credentials and is ignored by Git. `.env.example` documents variable names with placeholders and is safe to commit. Never use the service-role key in `frontend/app.js`.

## 8. Install and run (Windows)

1. Extract the ZIP.
2. Open the `movie-management-system` folder in VS Code.
3. Select **Terminal → New Terminal**.
4. Change into the backend directory:
   ```bash
   cd backend
   ```
5. Install packages:
   ```bash
   npm install
   ```
6. Confirm `backend/.env` contains your real Supabase URL and server-side key.
7. Start the app:
   ```bash
   npm start
   ```
8. Open http://localhost:3000 in your browser. Keep the terminal open while using the app.

For automatic restart while developing, use `npm run dev`.

## 9. Architecture

Browser HTML/CSS/JavaScript → Express REST API → Supabase PostgreSQL.

The frontend uses `fetch()` to call `/api/movies`. Express validates each request and uses the Supabase client to read or change the database. Movie data persists in PostgreSQL rather than browser storage.

## 10. API reference

All endpoints are served by the Express server. No authentication is implemented in this classroom MVP, so **do not deploy it publicly with the service-role key enabled**. Add authentication and authorization before any public deployment.

| Method | Path | Purpose | Body / result |
|---|---|---|---|
| GET | `/api/health` | Server health | Returns status |
| GET | `/api/movies` | List movies | Returns `{ "data": [...] }` |
| POST | `/api/movies` | Add a movie | JSON fields: `title`, `genre`, optional `director`, `release_year`, `rating`, `poster_url`, `notes`; returns 201 |
| PUT | `/api/movies/:id` | Update a movie | Same fields as POST; requires UUID; returns updated movie |
| DELETE | `/api/movies/:id` | Delete a movie | Requires UUID; returns confirmation |

Typical errors: `400` for invalid data/ID, `404` for missing movie, `500` for database failure, `503` when database credentials are not configured.

## 11. Manual testing checklist

- Open the home page: the collection should load.
- Add a movie with a title and genre: it should appear after saving.
- Refresh the page: the movie should remain, demonstrating database persistence.
- Search a title or director: cards should filter.
- Select a genre and sort order: results should update.
- Edit a movie and save: the updated details should appear.
- Delete a movie and confirm: it should disappear from the collection.
- Submit an empty title, invalid rating, or invalid year: validation should prevent saving.
- Visit http://localhost:3000/api/health: JSON should show `"status":"ok"`.
- With placeholder Supabase credentials, the app should show a clear configuration/database error; replace them with valid values to use the database.

## 12. Troubleshooting

- **`node` is not recognized:** install Node.js LTS and reopen VS Code.
- **`npm install` fails:** check your internet connection and run it from `backend/`.
- **Database is not configured:** verify `backend/.env` exists and values have no surrounding quotes or extra spaces; restart the server after changes.
- **Table not found:** run `database/schema.sql` in the Supabase SQL Editor and confirm the `movies` table exists.
- **Invalid API key / database errors:** check the project URL and server-side key in Supabase; do not share them publicly.
- **Port in use:** change `PORT=3001` in `.env`, restart, and visit `http://localhost:3001`.
- **Page not loading:** ensure the server terminal says it is running and open the same port.

## 13. GitHub upload

From the project root (not the backend folder):

```bash
git init
git status
git add .
git status
git commit -m "Build Movie Management System"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Create an empty repository at https://github.com/new and replace `YOUR_GITHUB_REPOSITORY_URL` with its actual URL. Before `git add .`, verify `backend/.env` is ignored and `node_modules/` is not included. `.env.example` should be included. If a real key was committed, rotate it immediately; `.gitignore` does not remove secrets from existing Git history.

## 14. Limitations and future improvements

- Single shared collection; no accounts, roles, or personal ownership.
- Poster images use optional URLs supplied by the user.
- Future work: Supabase Auth, per-user records, pagination, movie detail page, import/export, and automated integration tests.

## 15. Security notes

This is an educational local/demo MVP. Because the Express server uses a privileged Supabase key and there is no authentication, anyone who can reach the running server may be able to change the collection. Run locally for coursework only. Before deployment, implement authentication, authorization, rate limiting, and appropriate request protections; keep the privileged key server-side.
