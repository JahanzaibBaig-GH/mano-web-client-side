# Mano App – Web Client

AI-powered personal health management application built with Next.js (Page Router).

## Tech Stack

| Tool | Purpose |
|------|---------|
| **Next.js** (Page Router) | Framework |
| **TailwindCSS v4** | Styling |
| **Axios** | HTTP client |
| **React 19** | UI library |

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root (already provided):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Mano App
```

Update `NEXT_PUBLIC_API_BASE_URL` to point to your running backend.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── pages/
│   ├── _app.js               # App entry – mounts Toast globally
│   ├── _document.tsx         # HTML document
│   ├── index.js              # Landing page (public)
│   ├── login.js              # Login page
│   ├── signup.js             # Sign-up page
│   ├── verify-email.js       # Email verification
│   ├── forgot-password.js    # Forgot password
│   ├── reset-password.js     # Reset password (requires ?token=)
│   └── dashboard/
│       ├── index.js          # Dashboard overview (protected)
│       ├── medical-history.js
│       ├── health-risk.js
│       ├── diet-plans.js
│       ├── diabetes.js
│       ├── prescriptions.js
│       └── profile.js
├── components/
│   ├── Layout.js             # Public page wrapper (Navbar + Footer)
│   ├── Navbar.js             # Top navigation bar
│   ├── Sidebar.js            # Dashboard sidebar
│   ├── ProtectedRoute.js     # Auth guard + dashboard shell
│   ├── LoadingSpinner.js     # Reusable spinner
│   └── Toast.js              # Global toast notifications
├── services/
│   ├── api.js                # Axios instance + JWT interceptors
│   └── auth.js               # Auth API call wrappers
├── hooks/
│   └── useAuth.js            # Auth state hook (no Context API)
└── styles/
    └── globals.css           # Global styles + Tailwind import
```

---

## Authentication Flow

1. User registers → backend sends verification email
2. User verifies email → can log in
3. On login → JWT `token` and `refreshToken` saved to `localStorage`
4. Every API request includes `Authorization: Bearer <token>`
5. On 401 → interceptor attempts silent token refresh
6. On refresh failure → redirect to `/login`

### `useAuth` Hook

Manages auth state without Context API using a module-level singleton pattern:

```js
const { user, loading, error, login, signup, logout, clearError } = useAuth();
```

- `user` — null or the authenticated user object
- `loading` — true while checking token on app load
- `error` — last auth error string or null
- `login(credentials)` — POSTs to `/auth/login`, stores tokens
- `signup(userData)` — POSTs to `/auth/register`
- `logout()` — clears tokens, redirects to `/login`

### Protected Routes

Wrap any page with `<ProtectedRoute>` to require authentication:

```jsx
export default function MyPage() {
  return (
    <ProtectedRoute>
      <YourContent />
    </ProtectedRoute>
  );
}
```

Unauthenticated users are redirected to `/login` automatically.

---

## Toast Notifications

Call `showToast` from anywhere:

```js
import { showToast } from '../components/Toast';

showToast('Saved!', 'success');
showToast('Something went wrong', 'error');
showToast('Please check your input', 'warning');
showToast('Did you know?', 'info');
```

---

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Authenticate |
| GET | `/auth/profile` | Get current user |
| POST | `/auth/logout` | Invalidate session |
| POST | `/auth/verify-email` | Verify email token |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Set new password |
| GET | `/auth/refresh-token` | Refresh JWT |

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server (hot reload) |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | Lint code |
