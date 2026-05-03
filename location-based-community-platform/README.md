# Location-Based Community Platform

A production-oriented MERN application for location-based community posts, OTP-verified authentication, admin moderation, and super-admin role control.

## Folder Structure

```text
location-based-community-platform/
  backend/
    src/
      config/          Environment and database setup
      controllers/     HTTP request handlers
      middleware/      Auth, roles, upload, errors
      models/          Mongoose schemas
      routes/          REST API routes
      services/        OTP, admin logging, socket-safe notifications
      utils/           Token helpers and async wrappers
      app.js           Express app composition
      server.js        HTTP + optional Socket.io bootstrap
    uploads/           Local uploaded images in development
    .env.example       Backend environment template
    package.json
  frontend/
    src/
      api/             Axios client with JWT refresh support
      components/      Navbar, forms, post card, guards
      context/         Auth state provider
      pages/           Home, Login, Signup, dashboards
      App.jsx          Routes
      main.jsx         React bootstrap
    .env.example       Frontend environment template
    package.json
```

## System Design

The backend follows MVC with a small service layer. Controllers validate inputs and orchestrate model/service calls. Routes stay thin. Middleware handles authentication, role authorization, uploads, and centralized errors. MongoDB stores users, posts, refresh tokens, and admin audit logs.

Authentication uses password hashing with bcrypt, JWT access tokens, refresh tokens stored server-side, and OTP verification. OTP delivery is intentionally fallback-safe: if no provider is configured, or delivery fails, the app logs a development OTP and continues in dev OTP mode when enabled.

Realtime notifications use Socket.io if available. The app does not depend on sockets for core workflows; socket failures are caught and logged, and REST APIs continue normally.

## Key API Routes

```text
POST   /api/auth/register
POST   /api/auth/verify-otp
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/logout
GET    /api/users/me
PATCH  /api/users/me
GET    /api/posts
GET    /api/posts/mine
POST   /api/posts
PATCH  /api/posts/:id
DELETE /api/posts/:id
GET    /api/admin/users
PATCH  /api/admin/users/:id/verify
DELETE /api/admin/users/:id
GET    /api/admin/posts
DELETE /api/admin/posts/:id
GET    /api/super-admin/admins
POST   /api/super-admin/admins
PATCH  /api/super-admin/users/:id/role
DELETE /api/super-admin/admins/:id
```

## Local Setup

1. Install backend dependencies:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

3. Configure MongoDB in `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/location-community
```

4. Open the frontend at the Vite URL, usually:

```text
http://localhost:5173
```

## Deployment

Backend on Render:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add all backend environment variables from `.env.example`

Frontend on Vercel:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to the deployed backend URL, for example `https://your-api.onrender.com/api`

## Super Admin Seeding

Set these variables before starting the backend:

```env
SUPER_ADMIN_NAME=Root Admin
SUPER_ADMIN_EMAIL=root@example.com
SUPER_ADMIN_PASSWORD=ChangeMe123!
```

On boot, the backend creates the super-admin if the email does not already exist.

## Fault Tolerance

- OTP provider missing or failing: falls back to dev OTP logging when `DEV_OTP_MODE=true`.
- Socket.io unavailable: REST API continues and notification calls become no-ops.
- Uploads: local `uploads/` storage works without Cloudinary. Cloudinary variables are left in `.env.example` for future extension.

## File Guide

- `backend/src/config/env.js`: central environment parsing and defaults.
- `backend/src/config/db.js`: MongoDB connection.
- `backend/src/models/*.js`: database schemas for users, posts, refresh tokens, and admin logs.
- `backend/src/controllers/*.js`: route handlers for auth, posts, user profile, admin, and super-admin.
- `backend/src/middleware/auth.js`: JWT verification and role guard.
- `backend/src/middleware/errorHandler.js`: centralized API error responses.
- `backend/src/services/otp.service.js`: OTP generation, hashing, verification, and fallback-safe sending.
- `backend/src/services/socket.service.js`: optional notification wrapper.
- `frontend/src/api/client.js`: Axios instance with access-token refresh.
- `frontend/src/context/AuthContext.jsx`: frontend auth state and actions.
- `frontend/src/pages/*.jsx`: route-level UI.
- `frontend/src/components/*.jsx`: reusable UI building blocks.
