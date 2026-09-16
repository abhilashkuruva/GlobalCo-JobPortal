# GlobalCo JobBoard — Frontend Web Application

Modern, high-performance React 18 single-page recruitment application built with Vite 7 and Tailwind CSS.

---

## 🛠️ Tech Stack

- **Framework**: React 18 (SPA)
- **Tooling**: Vite 7
- **Styling**: Tailwind CSS (Curated Red & White identity)
- **Icons**: Lucide React
- **Routing**: React Router v6 with Role-Based Route Guards (`RequireAuth`)
- **HTTP Client**: Axios with JWT Bearer Interceptors
- **State Management**: React Context (`AuthContext`)

---

## 📂 Source Structure

```text
src/
├── App.jsx              # Root application component
├── main.jsx             # React DOM entry point
├── index.css            # Tailwind directives, component tokens, responsive rules
├── components/          # Reusable UI components (Navbar, Footer, JobCard, SearchBar, Toast, etc.)
├── contexts/            # Application state contexts (AuthContext)
├── pages/               # Routed pages
│   ├── Admin/           # Admin Dashboard & Job Seeker management
│   ├── Applications/    # Candidate application tracker
│   ├── Auth/            # Sign In & Sign Up pages (with 1-click persona autofill)
│   ├── Candidate/       # Candidate Dashboard & Saved Jobs
│   ├── Home/            # Landing page
│   ├── Jobs/            # Job Search, Job Details, Companies
│   ├── Profile/         # Profile management & resume parsing simulator
│   └── Recruiter/       # Recruiter ATS Cockpit, Post Job, Pipeline
├── routes/              # Route definitions (`AppRoutes.jsx`, `RequireAuth.jsx`, `routeMap.js`)
└── services/            # Axios API clients for backend endpoints
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ and npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app opens at `http://localhost:5173`.
Vite is pre-configured to proxy `/api` requests to `http://localhost:8080`.

### 3. Build for Production
```bash
npm run build
```
Build output is generated in `dist/`.
