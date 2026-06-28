# TaskFlow AI Pro

TaskFlow AI Pro is a MERN task manager I built for managing boards, tasks, deadlines, and basic project activity in one place. It has login/register, private boards per user, drag-and-drop task movement, analytics, activity history, dark mode, and a small AI suggestion feature for effort and due dates.

The idea is simple: create a board, add tasks, move them through the workflow, and use the dashboard/analytics pages to see what is pending, completed, overdue, or high priority.

## Features

- User registration and login with JWT authentication
- Password hashing with bcrypt
- Boards and tasks are scoped to the logged-in user
- Task CRUD with status, priority, due date, and estimated effort
- Drag-and-drop task movement between columns
- Search, filtering, overdue task detection, and pagination
- Dashboard and analytics charts
- Activity log for important actions
- Gemini-based AI suggestions with a local fallback
- Light/dark theme
- Responsive layout for desktop and mobile

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS, Recharts, Lucide React
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth/Security: JWT, bcryptjs, Helmet, CORS, rate limiting
- Validation: express-validator
- Testing: Node test runner, Supertest, mongodb-memory-server
- AI: Google Gemini API, with fallback logic when no key is available

## Folder Structure

```text
client/                 React frontend
server/                 Express backend
server/controllers/     API controller logic
server/models/          Mongoose models
server/routes/          API routes
server/middleware/      Auth, validation, and error handling
server/services/        Token, activity, and AI helper services
server/tests/           Backend API tests
screenshots/            Project screenshots
```

## Local Setup

Install dependencies:

```bash
npm install
npm run install:all
```

Create env files:

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

Server `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow_ai_pro
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-1.5-flash
```

Client `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start both frontend and backend:

```bash
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Demo Data

After setting up `server/.env`, run:

```bash
npm run seed:demo --prefix server
```

Demo login:

- Email: `ankit@taskflow.local`
- Password: `Ankit@12345`

The seed command creates one demo user, a board, a few tasks in different statuses, and one activity log entry.

## Tests

Run backend API tests:

```bash
npm test --prefix server
```

The tests use an in-memory MongoDB instance, so they do not touch the local development database.

Other useful checks:

```bash
npm run check --prefix server
npm run build --prefix client
```

## AI Suggestion Feature

The AI feature is available at:

```text
POST /api/ai/suggest
```

It accepts a task title and description, then returns an estimated effort, difficulty, suggested due date, and a short reason. The Gemini API key stays on the backend only. If the key is missing or the request fails, the server returns a local estimate instead, so the app still works during demo/review.

## API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Boards:

- `GET /api/boards`
- `POST /api/boards`
- `GET /api/boards/:id`
- `PUT /api/boards/:id`
- `DELETE /api/boards/:id`

Tasks:

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/move`

Other:

- `GET /api/analytics/summary`
- `GET /api/activity`
- `POST /api/ai/suggest`
- `GET /api/health`

## Screenshots

Login page:

![Login page](screenshots/login.png)

Dashboard:

![Dashboard](screenshots/dashboard.png)

Board view:

![Board view](screenshots/board.png)

Mobile view:

![Mobile view](screenshots/mobile.png)

## Deployment Notes

Planned deployment setup:

- Frontend: Vercel or Netlify
- Backend: Render
- Database: MongoDB Atlas

Files already included:

- `render.yaml` for Render backend deployment
- `client/vercel.json` for Vercel SPA routing
- `client/public/_redirects` for Netlify SPA routing

Before deploying, update these values:

- Backend `CLIENT_URL`
- Frontend `VITE_API_URL`
- MongoDB Atlas connection string
- `JWT_SECRET`
- Optional `GEMINI_API_KEY`

Live links will be added after deployment:

- Frontend: `pending`
- Backend health: `pending`

## What Can Be Improved Later

- Confirmation modal before deleting boards/tasks
- Toast notifications after create/update/delete actions
- Persistent task ordering inside each column
- Subtasks or checklists inside a task
- User profile/settings page
- Board sharing for multiple users
- Pagination on activity logs for larger datasets
