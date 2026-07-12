# CAR-DIS — Premium Dealership Marketplace & Fleet Manager

CAR-DIS (Car Dealership Inventory System) is a state-of-the-art, full-stack automotive marketplace and fleet management web application. It combines a visually stunning, responsive React user interface with a robust, highly secured FastAPI transactional database backend.

---

## 🚀 Key Features

### 1. Showroom Catalog & Visual Navigation
- **16 Premium Popular Brands**: Fast-filtering shortcuts featuring official vector branding logos from CDN. Hover actions trigger custom brand-color highlights.
- **Symmetrical Category Browsing**: A balanced 3x3 layout mapping 9 primary vehicle segments (SUV, Sedan, Coupe, Sports, Convertible, Luxury, Electric, Hatchback, Pickup) with dynamic stock quantities.
- **Advanced Sidebar Filters**: Search and query by brand make, model name, vehicle variant, year, price ranges, fuel type, transmission system, and stock availability.
- **Specification View Modes**: Toggle smoothly between interactive grid cards and detailed list cards.

### 2. Vehicle Specs, Finance & Leads
- **Comparison Panel**: Context-persistent wishlist allowing side-by-side spec sheet comparisons of vehicles.
- **Single-Column EMI Calculator**: Computes monthly installment values based on dynamically adjusted loan terms, interest rates, and down payments.
- **Lead Submission Form**: Request callbacks for specific models, registering leads directly in the admin registry.

### 3. Purchases, Invoicing & Timeline Tracking
- **Inventory Reservation System**: Implements secure database-row transaction locks during checkouts to prevent double-booking or overselling stock.
- **Client Reservation Portal**: "My Reservations" tab displays dynamic timelines illustrating order validation stages (`Pending` ➔ `Confirmed` ➔ `Shipped` ➔ `Delivered`).
- **Print-Optimized E-Invoices**: Generates clean invoice layouts containing customer logs, transaction timestamps, and inventory details, printable directly to PDF.

### 4. Admin Fleet Control Panel
- **Global Sales Dashboard**: Interactive stats panel tracking total sales volume, count, and active orders.
- **Inventory CRUD Panel**: Complete management dashboard allowing administrators to list new vehicles, edit specifications, modify stock levels, or remove listings.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS v4 (Vanilla CSS variables model)
- **Routing**: React Router v7
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL (Supabase cloud host) + SQLAlchemy 2.0 ORM
- **Migration**: Alembic
- **Validation**: Pydantic v2
- **Testing**: Pytest, HTTPX

---

## ⚡ Quick Start

### 1. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Set up virtual environment and activate it:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   ```bash
   copy .env.example .env
   # Edit .env and supply DATABASE_URL and JWT_SECRET_KEY
   ```
5. Apply database migrations:
   ```bash
   python -m alembic upgrade head
   ```
6. Run the dev server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```

### 2. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Launch the Vite dev server (proxies `/api` to port 8000):
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:3000`.

---

## 🧪 Verification & Testing

Verify system stability and run local tests using the following commands:

### Backend Tests
```bash
cd backend
.venv\Scripts\pytest --cov=app app/tests/
```

### Frontend Tests & Typecheck
```bash
cd frontend
# Run Type Checker
npx tsc --noEmit
# Run Vitest test runner
npm run test
```

---

## 📸 Screenshot Gallery

Below is a gallery of the premium CAR-DIS interface screenshots (assets organized under `assets/screenshots/`):

- **Interactive Showroom (Grid Card Catalog)**: [assets/screenshots/image1.png](assets/screenshots/image1.png)
- **Dealership List Card View**: [assets/screenshots/image3.png](assets/screenshots/image3.png)
- **Filters Sidebar & Custom Dropdowns**: [assets/screenshots/image4.png](assets/screenshots/image4.png)
- **Vehicle Specification Details Page**: [assets/screenshots/image8.png](assets/screenshots/image8.png)
- **Sticky Transaction Checkout & EMI Calculator**: [assets/screenshots/image10.png](assets/screenshots/image10.png)
- **Print-Optimized E-Invoice Printable PDF**: [assets/screenshots/image16.png](assets/screenshots/image16.png)
- **Sales Analytics & Orders Admin Dashboard**: [assets/screenshots/image17.png](assets/screenshots/image17.png)

---

## 🤖 AI Development
Developed with assistance from the **Antigravity** (Google DeepMind) AI coding assistant.
