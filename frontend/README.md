# Car Dealership Inventory System - Frontend

## Environment

```text
Current time: 2026-07-11T11:41:04+05:30
Working directory: D:\ridham\DDU\Incubyte\Project\CAR-DIS\frontend
Workspace root folder: D:\ridham\DDU\Incubyte\Project
AI / Editor: Kilo (kilo.ai)
```

## Frontend Development

The frontend was initially scaffolded using **Antigravity AI**. I customized, tested, and integrated it with the backend, while **Kilo Code** assisted in fixing API mismatches, runtime issues, and refining the implementation.

## Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS v4
- React Router v7
- Axios
- Lucide React

## Setup

1. Install dependencies:
   - `npm install`
2. Run dev server:
   - `npm run dev`
3. Build:
   - `npm run build`
4. Lint:
   - `npm run lint`

## Scripts

- `dev` — start Vite dev server on `http://localhost:3000`
- `build` — TypeScript check + Vite build
- `lint` — run Oxlint
- `preview` — preview production build

## Proxy

Dev server proxies `/api` to `http://127.0.0.1:8000`.

## Pages

- `/` — Home catalog with search, featured vehicles, latest arrivals
- `/login` — User login
- `/register` — User registration with role selection
- `/vehicles` — Vehicle listing with filters, search, sort, pagination
- `/vehicles/:id` — Vehicle details with purchase option
- `/profile` — User profile and purchase history (protected)
- `/admin` — Admin dashboard with stats and fleet registry (admin only)
- `/admin/add-vehicle` — Add new vehicle (admin only)
- `/admin/edit-vehicle/:id` — Edit vehicle (admin only)
- `*` — 404 Not Found

## Role Permissions

- **Guest**: browse vehicles, search/filter, redirect to login for purchase
- **User**: register/login, browse, search, purchase, view profile
- **Admin**: full dashboard access, add/edit/delete/restock inventory
