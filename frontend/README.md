# Car Dealership Inventory System - Frontend

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
- `test` — run Vitest test runner

## Proxy

Dev server proxies `/api` to `http://127.0.0.1:8000`.

## Pages & Routes

- `/` — Home catalog with search, 16 popular brand shortcuts, and 9 category cards (3x3 grid)
- `/login` — User login
- `/register` — User registration with role selection
- `/vehicles` — Showroom catalog with sidebar filtering, search, sorting, and grid/list view toggle
- `/vehicles/:id` — Vehicle specification details page, with EMI calculator, callback request form, and purchase checkout wizard
- `/profile` — User profile summary page
- `/wishlist` — Saved vehicles comparison panel
- `/compare` — Side-by-side spec sheet vehicle comparison page
- `/purchases` — "My Reservations" customer tracking dashboard with invoice link and reservation status timeline
- `/invoice/:purchaseId` — Print-optimized invoice page with PDF generation option
- `/admin` — Fleet statistics and database registry management dashboard (Admin only)
- `/admin/purchases` — Global sales registry dashboard (Admin only)
- `/admin/add-vehicle` — Add vehicle inventory specifications (Admin only)
- `/admin/edit-vehicle/:id` — Edit vehicle inventory properties (Admin only)
- `*` — 404 Not Found page

## Role Permissions

- **Guest**: Browse vehicles, search/filter, request callbacks, compare vehicles.
- **User**: Register/login, browse, search, purchase, wishlist vehicles, track reservation timeline, download invoice.
- **Admin**: Access global sales logs, transition reservation statuses, add/edit/delete/restock vehicle fleets.
