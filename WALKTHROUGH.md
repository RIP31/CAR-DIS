# CAR-DIS Premium Dealership Upgrades — Walkthrough

We successfully implemented a complete, persistent purchase management system, advanced search, filters, EMI calculators, wishlist context, vehicle comparison system, callbacks forms, and PDF invoice downloads.

## 1. Backend Upgrades & persistent DB schemas

*   **Database Models**:
    *   `Purchase` model ([purchase.py](backend/app/models/purchase.py)) tracks transaction identifiers (`invoice_number`), quantities, purchase price, dates, status tracking, and details (`customer_name`, `customer_email`, `manufacturer`, `model`, `variant`).
    *   `WishlistItem` model ([wishlist.py](backend/app/models/wishlist.py)) stores wishlisted vehicle IDs with unique constraints.
    *   `CallbackRequest` model ([callback.py](backend/app/models/callback.py)) registers dealership callbacks.
*   **API Routers**:
    *   `POST /api/purchases` — reserves stock and creates database row.
    *   `GET /api/purchases/my-purchases` — returns current user's purchase history.
    *   `GET /api/purchases/{purchaseId}` — fetches individual purchase details (owner/admin only).
    *   `GET /api/admin/purchases` — displays global transaction logs for admins.
    *   `PATCH /api/admin/purchases/{purchaseId}/status` — updates status tracking (e.g. `Pending` -> `Confirmed` -> ... -> `Delivered`).
    *   `POST /api/wishlist/{vehicle_id}` / `GET /api/wishlist` — manages wishlist.
    *   `POST /api/callbacks` — public lead requests submission.

---

## 2. Frontend Components & Dashboards

*   **Dashboards**:
    *   **My Purchases Page** ([MyPurchases.tsx](frontend/src/pages/MyPurchases.tsx)): Displays active and past user orders with images, status badges, details view modals, and a visual step pipeline tracker.
    *   **Sales Admin Board** ([AdminPurchases.tsx](frontend/src/pages/AdminPurchases.tsx)): Enables administration of all customer orders, displaying stats (total sales volume, active orders) and search/filter tools with status drop-downs.
*   **Key Controls**:
    *   **Confirmation Modal Portal** ([ConfirmationModal.tsx](frontend/src/components/ConfirmationModal.tsx)): Asks for purchase confirmation, displaying specs, cost, and stock checks. Wrapped in a React Portal (`createPortal`) targeting `document.body` to override parent CSS transforms and position correctly on the screen.
    *   **EMI Calculator** ([EmiCalculator.tsx](frontend/src/components/EmiCalculator.tsx)): Redesigned as a single-column card with a prominent Monthly EMI callout to fit sidebar columns cleanly.
    *   **E-Invoice printable layout** ([Invoice.tsx](frontend/src/pages/Invoice.tsx)): Prints invoices with `invoice_number` directly using local print style parameters.

---

## 3. Verification & passing tests

*   **Backend Pytest Suite**: `.venv\Scripts\python.exe -m pytest` -> **37 tests passed (100% green)**
*   **Frontend Vitest Suite**: `npm run test` -> **23 tests passed (100% green)**
