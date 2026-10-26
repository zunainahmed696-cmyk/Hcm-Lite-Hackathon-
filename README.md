#Live link : https://hcm-frontend-seven.vercel.app/
# 🚀 Full-Stack MERN RBAC Hackathon Boilerplate

A production-ready, modular boilerplate tailored for hackathons. Built with **React + TypeScript + Tailwind CSS** on the frontend, and **Node.js + Express + TypeScript + MongoDB (Mongoose)** on the backend, featuring complete **Role-Based Access Control (RBAC)** for `owner` and `user` (normal user).

---

## 📁 Project Architecture

```
Hackathon/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                 # MongoDB connection handler
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts    # Register, Login, GetMe
│   │   │   ├── owner.controller.ts   # Stats, User management, Role updates
│   │   │   └── user.controller.ts    # User profile & Dashboard endpoints
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts    # JWT token verification (req.user)
│   │   │   ├── role.middleware.ts    # authorizeRoles('owner', 'user')
│   │   │   └── error.middleware.ts   # Centralized error & Mongoose handler
│   │   ├── models/
│   │   │   └── User.ts               # User schema with bcrypt hash hook
│   │   ├── routes/
│   │   │   ├── auth.routes.ts        # /api/auth/*
│   │   │   ├── owner.routes.ts       # /api/owner/* (Owner only)
│   │   │   └── user.routes.ts        # /api/user/* (User & Owner)
│   │   ├── types/
│   │   │   └── index.ts              # Express Request & JWT payload types
│   │   └── server.ts                 # Express app, CORS, Seeder, Listener
│   ├── .env                          # Backend environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts              # Axios instance + auto Bearer token
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Responsive header with role badges
│   │   │   └── ProtectedRoute.tsx    # Role-based route gatekeeper
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # Auth state, login, register, logout
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Landing page & RBAC matrix
│   │   │   ├── Login.tsx             # Login with 1-click Demo Fill buttons
│   │   │   ├── Register.tsx          # Register with role selector
│   │   │   ├── UserDashboard.tsx     # Standard user area + profile edit
│   │   │   ├── OwnerDashboard.tsx    # Owner panel (Stats + User controls)
│   │   │   ├── Unauthorized.tsx      # 403 Forbidden page
│   │   │   └── NotFound.tsx          # 404 Page
│   │   ├── App.tsx                   # Routes definition
│   │   ├── main.tsx
│   │   └── index.css                 # Tailwind CSS styles & glassmorphism
│   ├── .env                          # Frontend environment variables
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## ⚡ Quick Start

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```
> The backend runs on `http://localhost:5000` with hot-reloading powered by `tsx watch`.

### 2. Start the Frontend Client

In a separate terminal:
```bash
cd frontend
npm run dev
```
> The frontend runs on `http://localhost:5173`.

---

## 🔑 Pre-Seeded Hackathon Accounts

When the backend starts up, if the MongoDB database has no users, it **automatically seeds two demo accounts** so you can immediately test RBAC without registering manually:

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| **Owner** | `owner@demo.com` | `Password123!` | `/dashboard`, `/owner` (full access, user management) |
| **Normal User** | `user@demo.com` | `Password123!` | `/dashboard` (cannot access `/owner`) |

*Tip: On the Login screen, click **"Demo Owner"** or **"Demo Normal User"** to auto-fill credentials instantly during presentation/judging.*

---

## 🛡️ How RBAC Works

### Backend RBAC Middleware
1. **Authentication (`authenticate`)**: Verifies the JWT Bearer token from the `Authorization` header and attaches the user payload (`userId`, `email`, `role`) to `req.user`.
2. **Authorization (`authorizeRoles(...)`)**: Checks `req.user.role`:
   ```typescript
   // Accessible only to owners
   router.use(authenticate, authorizeRoles('owner'));

   // Accessible to both regular users and owners
   router.use(authenticate, authorizeRoles('user', 'owner'));
   ```

### Frontend RBAC Route Protection
In `frontend/src/App.tsx`, routes are wrapped using `<ProtectedRoute>`:
```tsx
{/* Normal user route */}
<Route
  path="/dashboard"
  element={
    <ProtectedRoute allowedRoles={['user', 'owner']}>
      <UserDashboard />
    </ProtectedRoute>
  }
/>

{/* Owner-only route */}
<Route
  path="/owner"
  element={
    <ProtectedRoute requiredRole="owner">
      <OwnerDashboard />
    </ProtectedRoute>
  }
/>
```
If a standard user attempts to visit `/owner`, they are automatically routed to the **`/unauthorized` (403)** screen.

---

## 📡 API Reference

### Auth (`/api/auth`)
- `POST /api/auth/register` - Create account (`name`, `email`, `password`, `role?: 'owner' | 'user'`)
- `POST /api/auth/login` - Sign in (`email`, `password`) -> Returns JWT token & user
- `GET /api/auth/me` - Authenticated user details (Requires Bearer token)

### User (`/api/user`)
- `GET /api/user/dashboard` - Normal user feed and announcements
- `PATCH /api/user/profile` - Update current user profile name

### Owner (`/api/owner`) - *Requires 'owner' Role*
- `GET /api/owner/stats` - Total users, owner count, user count
- `GET /api/owner/users` - List all registered users
- `PATCH /api/owner/users/:id/role` - Change user role (`owner` <-> `user`)
- `DELETE /api/owner/users/:id` - Delete user account

---

## 🛠️ Adding New Features During the Hackathon

1. **Add a new Mongoose Model**:
   - Create `backend/src/models/YourModel.ts`
2. **Add Controllers & Routes**:
   - Create `backend/src/controllers/yourModel.controller.ts`
   - Create `backend/src/routes/yourModel.routes.ts`
   - Apply `authenticate` or `authorizeRoles(...)` as needed
   - Register route in `backend/src/server.ts` with `app.use('/api/your-feature', yourRoutes);`
3. **Add Frontend Page / Component**:
   - Create page in `frontend/src/pages/YourPage.tsx`
   - Register the route in `frontend/src/App.tsx` with or without `<ProtectedRoute>`
   - Use `api.get('/your-feature')` or `api.post('/your-feature', data)` directly.
