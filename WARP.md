# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project layout and high-level architecture

- Root-level docs:
  - `API_DOCUMENTATION.md` describes the publicly exposed HTTP API (auth + resume management) for the backend.
  - `TODO.md` tracks planned product features (resume versioning UX, sharing, analytics, export, bulk admin tools, etc.).
- Applications:
  - `backend_ai/`: Node.js + Express + MongoDB API and AI integration.
  - `mern_ai/`: React + Vite single-page app that consumes the API.

### Backend (`backend_ai`)

- Entry point: `backend_ai/index.js`.
  - Loads environment via `dotenv`, connects to MongoDB through `./conn` (Mongoose).
  - Configures JSON/body parsing and CORS with a strict `allowedOrigins` list, including local Vite dev URLs and deployed frontends.
  - Ensures an `uploads/` directory exists and serves it at `/uploads`.
  - Mounts routes:
    - `/api/user` → `Routes/auth.js` (auth & current-user endpoints).
    - `/api/resume` → `Routes/resume.js` (resume upload, listing, admin queries, versioning, comparison).
  - Optionally serves a built frontend from a `dist` or `build` folder in `backend_ai/` (controlled by `FRONTEND_BUILD_DIR` or by detecting which folder exists).
  - Adds an API-only 404 handler (`/api/*`) and a final error handler that normalizes errors to `{ error, message }` JSON.

- Auth & users:
  - `Models/user.js` defines the `user` collection with fields `name`, `email`, `password`, `photoUrl`, and `role` (`ADMIN`, `RECRUITER`, `CANDIDATE`), plus timestamps.
  - Passwords are hashed via a `pre('save')` hook with bcrypt.
  - Instance method `comparePassword(candidate)` is used by the login flow.
  - `middleware/auth.js`:
    - Reads a JWT from the `Authorization: Bearer <token>` header.
    - Verifies it with `JWT_SECRET` and looks up the user; attaches the full user (including password field selected) to `req.user`.
  - `middleware/roles.js` exposes `authorize(...allowedRoles)` and re-exports the static `User.ROLES` map.

- Auth endpoints (`Routes/auth.js` + `Controllers/authController.js`):
  - `POST /api/user/register`
    - If a user with the given email exists: returns 200 + JWT and existing user.
    - Otherwise creates a new user (optionally with an explicit `role`), returns 201 + JWT and created user.
  - `POST /api/user/login`
    - Looks up the user including the password, checks it, and returns 200 + JWT and a password-stripped user.
  - `GET /api/user/me`
    - Requires `auth` middleware; returns the hydrated `req.user`.

- Resume model & AI analysis:
  - `Models/resume.js` defines the `resume` collection:
    - Core fields: `user` (ref `user`), `resume_name`, `job_desc`, `score` (0–100), `feedback`, `resume_text`.
    - Versioning fields: `version` (number), `parentResume` (self-ref), `isLatest` (boolean), with timestamps.
  - `utils/multer.js` configures file upload:
    - Uses in-memory storage.
    - Accepts `application/pdf`, `image/jpeg`, `image/png`, `image/jpg`.
    - Rejects others with a 415 error and a clear message.
    - Enforces a 15 MB limit.
  - `Controllers/resumeController.js` implements the pipeline:
    - `addResume`:
      - Enforces that candidates can only upload for themselves; admins/recruiters may target another `user` id.
      - Reads the uploaded `file` from Multer memory storage and extracts text via `pdf-parse` (truncated to ~20k chars for prompt safety).
      - Implements resume versioning: finds the latest resume for `(user, resume_name)`, increments `version`, links `parentResume`, and clears `isLatest` on the previous record.
      - Calls Cohere (`cohere-ai`, `command` model) with a fixed prompt to get a `Score: XX` and `Reason: …` string.
      - `parseCohereResult` pulls out a clamped numeric score (0–100) and normalized feedback.
      - Persists the resume with score, feedback, extracted text, version fields, and returns `{ message, data, ai_raw }`.
    - `getAllResumesForUser`:
      - Returns all resumes for `req.user._id`, sorted by `createdAt` desc.
    - `getResumesForAdmin`:
      - For `ADMIN` / `RECRUITER` only (via `authorize` middleware).
      - Supports query params: `page`, `limit`, `user`, `minScore`, `maxScore`.
      - Returns paginated results plus `total`, `page`, `pages` and populates `user` details.
    - `getResumeById`:
      - Loads a resume by id, populates the `user`, enforces candidate ownership (candidates can only see their own resumes), and returns `{ data }` or `404`/`403`.
    - `getResumeVersions`:
      - Given a resume id, finds that resume and all related versions (by id, `parentResume`, or parent id) for the same user, sorted by `version`.
    - `compareResumes`:
      - Accepts a body `{ ids: [...] }` with at least two resume ids.
      - Enforces that candidates can only include their own resumes.
      - Returns `{ data: resumes }` with populated user details.

### Frontend (`mern_ai`)

- Build tooling:
  - Vite-based React SPA (`package.json` scripts: `dev`, `build`, `preview`, `lint`).
  - Uses React Router, Tailwind CSS, Material UI, `react-hot-toast`, Axios, and Firebase.

- App composition:
  - `src/main.jsx`:
    - Wraps the app in `<BrowserRouter>` and a custom `<AuthProvider>` context and mounts `App` into `#root`.
    - Attaches a global `<Toaster>` for toast notifications.
  - `src/App.jsx` defines routing and page layout:
    - Public:
      - `/login` → `Login`
      - `/register` → `Register`
    - Authenticated-only (wrapped by `ProtectedRoute`):
      - `/upload` → `UploadResume`
      - `/resumes/mine` → `MyResumes`
      - `/resumes/:id` → `ResumeDetail`
      - Nested inside `RoleGuard` for `ADMIN` / `RECRUITER`:
        - `/admin/resumes` → `AdminResumes`
    - Root `/` redirects to `/resumes/mine`.

- Auth & global state:
  - `src/state/AuthContext.jsx`:
    - Holds `user`, `token`, `authLoading` and exposes `login`, `logout`, and `setUser`.
    - Initializes `token` from `localStorage` and, if present, fetches `/api/user/me` via the Axios instance to hydrate `user`.
    - Clears session on failure and stops loading.
    - `login(token, user)` persists the token, sets `user`, and shows a toast.
    - `logout()` clears state and local storage and shows a toast.
  - `components/ProtectedRoute.jsx`:
    - If `authLoading` is true, shows a `Spinner`.
    - If there is no `user`, renders the `Login` page inline instead of the requested route.
    - Otherwise renders the nested route via `<Outlet />`.
  - `components/RoleGuard.jsx`:
    - Redirects unauthenticated users to `/login`.
    - Redirects authenticated users lacking the required role(s) back to `/resumes/mine`.

- HTTP client and API usage:
  - `src/utils/api.js` wraps Axios:
    - `baseURL` is taken from `import.meta.env.VITE_API_BASE`.
    - Sends `withCredentials: true`.
    - Request interceptor attaches `Authorization: Bearer <token>` from `localStorage` when present.
    - Response interceptor shows error toasts using a standard `err.response?.data?.error || err.message || "Request failed"` pattern.
  - Key page behaviors:
    - `Login` / `Register` POST to `/api/user/login` and `/api/user/register` respectively; on success they call `login(token, user)` and navigate to `/resumes/mine` (or the saved `from` route for login).
    - `UploadResume` builds a `FormData` with `resume_name`, `job_desc`, and `file` and POSTs it to `/api/resume` with `multipart/form-data`. On success it shows the score from `data.data.score` and resets the form.
    - `MyResumes` fetches `/api/resume/mine` and renders cards linking to `/resumes/:id`.
    - `AdminResumes` (guarded by admin/recruiter roles) fetches `/api/resume` with optional `minScore`/`maxScore` query params.
    - `ResumeDetail` fetches `/api/resume/:id` and shows score, feedback, job description, and extracted resume text if present.

- Navigation & layout:
  - `components/Navbar.jsx`:
    - Shows different actions depending on whether a user is logged in.
    - For authenticated users, links to Upload, My Resumes, and (for admin/recruiter roles) Admin Resumes.
    - Shows a greeting (`Welcome, {user.name}`) and a Logout button that calls `logout()` and navigates to `/login`.

## Local development commands

All commands assume you are in the repository root (`resumeai/`). Adjust for your shell as needed.

### Backend API (`backend_ai`)

- Install dependencies:

  ```bash
  cd backend_ai
  npm install
  ```

- Run the development server (nodemon):

  ```bash
  cd backend_ai
  npm run start
  ```

- Environment configuration (required for the server to be fully functional):
  - Create a `.env` file in `backend_ai/` with at least:
    - `JWT_SECRET`
    - `JWT_EXPIRES_IN` (optional, defaults to `7d` in code)
    - `COHERE_API_KEY`
    - `PORT` (optional, defaults to `4000`)
    - `CLIENT_ORIGIN` (used for CORS; defaults in code point at `http://localhost:5173` and deployed URLs)
    - `MONGODB_URI`
  - The `API_DOCUMENTATION.md` file documents expected runtime behavior of the auth and resume endpoints.

- Tests:
  - `backend_ai/package.json` has a placeholder `npm test` script that exits with an error and no test runner is currently configured. There is no way to run a focused test until a real test suite is added.

### Frontend SPA (`mern_ai`)

- Install dependencies:

  ```bash
  cd mern_ai
  npm install
  ```

- Run the Vite dev server:

  ```bash
  cd mern_ai
  npm run dev
  ```

  - Ensure `VITE_API_BASE` points to the backend URL (for local development, typically `http://localhost:4000`). Configure this via Vite environment files (e.g. `.env.local`) or your shell environment.

- Build the frontend for production:

  ```bash
  cd mern_ai
  npm run build
  ```

- Preview the built frontend with a local static server:

  ```bash
  cd mern_ai
  npm run preview
  ```

- Lint the frontend source with ESLint:

  ```bash
  cd mern_ai
  npm run lint
  ```

## Running the full stack locally

- Start MongoDB and ensure `MONGODB_URI` in `backend_ai/.env` points to a running instance.
- In one terminal, start the backend API from `backend_ai/` with `npm run start`.
- In a second terminal, start the Vite dev server from `mern_ai/` with `npm run dev`, making sure `VITE_API_BASE` matches the backend URL.
- For production-style testing, you can build the frontend with `npm run build` and then either:
  - Serve it via `npm run preview` in `mern_ai/`, or
  - Copy/symlink the built assets into a `dist/` or `build/` folder under `backend_ai/` so `index.js` can serve them directly.

## Important cross-cutting details

- Authentication and authorization are enforced both server-side and client-side:
  - Server: JWT auth in `middleware/auth.js` and role checks via `authorize` in `middleware/roles.js`.
  - Client: `AuthContext` manages JWT and user data, while `ProtectedRoute` and `RoleGuard` gate access to pages.
- Resume versioning and comparison are implemented in the backend (model + controller) but not fully documented in `API_DOCUMENTATION.md` yet; consult `Controllers/resumeController.js` and `Models/resume.js` when adding features around history and comparisons.
- File uploads use in-memory storage; if you introduce larger files or heavier processing, consider switching to disk or external storage and updating `utils/multer.js` and the `/api/resume` controller accordingly.
- `TODO.md` describes planned enhancements (e.g., sharing, advanced analytics, exports, admin bulk operations). Align new work with those items when applicable.
