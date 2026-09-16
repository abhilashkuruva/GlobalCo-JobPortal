# TODO — Master Frontend Recovery (GlobalCo-JobBoard)

## Phase A — Foundation & Build Verification
- [x] Install/match Tailwind/PostCSS dependencies to unblock build
- [x] Verify: `frontend` production build passes

## Phase B — Architecture & Flow Rebuild
- [x] Read entire frontend tree recursively and inventory modules
- [x] Read all non-empty frontend modules found under `frontend/src`

### Planned rebuild steps (executed & verified)
- [x] 1) Delete duplicate/conflicting JobCard: `frontend/src/components/JobCard.jsx`
- [x] 1.1) Verify duplicate JobCard root deleted
- [x] 2) Rewrite & standardize JobCard: `frontend/src/components/JobCard/JobCard.jsx` and purge orphan clutter
- [x] 3) Reconcile Tailwind tokens with actual UI classNames (`frontend/tailwind.config.js`)
- [x] 4) Implement global CSS tokens, buttons, and badges in `frontend/src/index.css`
- [x] 5) Fix routing/navigation contract (`frontend/src/routes/AppRoutes.jsx`)
- [x] 6) Fix Navbar navigation links to match real routes (`frontend/src/components/Navbar/Navbar.jsx`)
- [x] 7) Fix ProfilePage navigation targets & simulator (`frontend/src/pages/Profile/ProfilePage.jsx`)
- [x] 8) Centralize navigation via `frontend/src/routes/routeMap.js`
- [x] 9) Unify ApplicationsPage API usage (`frontend/src/services/applicationApi.js`)
- [x] 10) Standardize loading/error/empty states across rebuilt pages

## Phase C — Verification
- [x] 11) Run `cd frontend && npm run build` (Verified: 0 errors)
- [x] 12) Run `npm run dev` smoke test: route navigation + protected routes + applications flow
- [x] 13) Final recursive audit for unresolved imports/routes/style tokens
