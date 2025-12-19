## CampusMarket

Your one-stop **campus marketplace** — browse, buy, sell, and connect with fellow students in one modern web app.

This repo contains a **full-stack TypeScript app**: a React + Vite frontend and an Express + Drizzle + PostgreSQL backend, wired together into a single server.

---

### ✨ Features

- **Modern marketplace UI**
  - Home feed with featured and recent listings
  - Product detail pages with photos, descriptions, and seller info
  - Powerful search and filters (category, price, more)
  - Saved items, reviews, and rich product cards

- **Student-focused flows**
  - Sell items with a dedicated **Sell Item** flow
  - Manage your **My Listings**, **Orders**, **Cart**, and **Checkout**
  - Profile and **Dashboard** pages to track your campus activity

- **AI-powered assistant**
  - In-app **AI Chatbot** to help with product discovery and common questions

- **Great UX**
  - Responsive layout for desktop & mobile
  - Smooth navigation with **Wouter**
  - Toast notifications, tooltips, skeleton loaders, and polished micro‑interactions

---

### 🧱 Tech Stack

- **Frontend**
  - React 18 + TypeScript
  - Vite as the build tool/dev server
  - Tailwind CSS + `tailwindcss-animate`
  - Radix UI–style component system (buttons, dialogs, tooltips, dropdowns, etc.)
  - `@tanstack/react-query` for data fetching and caching
  - `wouter` for routing
  - Framer Motion for animations
  - Charts via `recharts`, carousels via `embla-carousel-react`

- **Backend**
  - Express HTTP server
  - Drizzle ORM with a shared schema in `shared/schema.ts`
  - PostgreSQL via `@neondatabase/serverless` (WebSocket driver)
  - Sessions: `express-session` + `connect-pg-simple` / `memorystore`
  - Realtime/WebSocket support via `ws`

- **Tooling**
  - TypeScript
  - Tailwind + PostCSS + Autoprefixer
  - `tsx` for TypeScript entrypoints
  - Vite React plugin for fast dev experience

---

### 📁 Project Structure

High-level layout of the repo:

- `client/` – React + Vite frontend
  - `src/App.tsx` – main app shell & routing
  - `src/pages/` – all top-level pages (Home, Products, Cart, Checkout, Dashboard, Auth, etc.)
  - `src/components/` – shared components (Navbar, Footer, ProductCard, AIChatbot, SellerRating, SkeletonLoader, UI primitives)
  - `src/lib/` – store, query client, utilities, mock data
  - `src/hooks/` – custom hooks (products, orders, toast, etc.)
- `server/` – Express backend
  - `index.ts` – app entrypoint, middleware, logging, Vite integration in dev
  - `routes.ts` – API routes registration
  - `db.ts` – Drizzle + Neon/postgres setup
  - `static.ts`, `vite.ts`, `storage.ts` – static serving, dev integration, and storage helpers
- `shared/`
  - `schema.ts` – shared Drizzle schema
  - `routes.ts` – shared route/constants between client & server
- Root config
  - `package.json` – scripts & dependencies
  - `vite.config.ts` – Vite config (React plugin, aliases, build output)
  - `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`, `drizzle.config.ts`

---

### 🚀 Getting Started

#### 1. Prerequisites

- Node.js ≥ 18 (Node 20 recommended)
- npm (bundled with Node)
- Optional but recommended: a PostgreSQL database (or Neon/Postgres URL)

#### 2. Clone the repo

```bash
git clone https://github.com/Abhishek371222/CampusMarket.git
cd CampusMarket
```

#### 3. Install dependencies

```bash
npm install
```

#### 4. Configure environment

The backend uses `DATABASE_URL` for the database connection.

- By default (no env set), it falls back to a **mock DB URL** (`postgres://mock:mock@localhost/mock`) and can still serve mock data.
- For a real database:

Create a `.env` file in the project root (or set env vars in your shell):

```bash
# Example Neon/Postgres connection string
DATABASE_URL=postgres://user:password@host:5432/dbname
```

You can also set `PORT` if you want to override the default `5000`:

```bash
PORT=5000
```

#### 5. Run in development

This starts the Express server and mounts Vite in dev mode:

```bash
npm run dev
```

Then open:

- `http://localhost:5000`

The server will:

- Serve API routes under `/api`
- Serve the React app via Vite in development

#### 6. Build for production

```bash
npm run build
```

This will:

- Bundle the client into `dist/public`
- Build the server output into `dist`

#### 7. Start in production mode

After a build:

```bash
npm run start
```

The server will run with `NODE_ENV=production` and serve the built client from `dist/public`.

---

### 🧪 Database Migrations (Drizzle)

If you’re using a real Postgres database, you can push schema changes:

```bash
npm run db:push
```

This uses `drizzle-kit` and `drizzle.config.ts` to sync the schema.

---

### 🧭 Key Routes & Pages

Frontend routes (via Wouter, see `client/src/App.tsx`):

- `/` – Home
- `/products` – All products
- `/products/:id` – Product details
- `/search` – Search
- `/sell` – Sell an item
- `/cart` – Cart
- `/checkout` – Checkout
- `/orders` – Orders
- `/my-listings` – My listings
- `/saved-items` – Saved items
- `/reviews` – Reviews
- `/people` & `/people/:id` – People & profile pages
- `/dashboard` – Dashboard
- `/about`, `/contact`, `/terms` – Static info pages
- `/login`, `/signup` – Auth pages
- Fallback `not-found` page for unknown routes

---

### 🛠️ Scripts

Defined in `package.json`:

- `npm run dev` – Start Express + Vite in development mode
- `npm run build` – Build server and client
- `npm run start` – Start the built production server
- `npm run check` – Type-check with TypeScript
- `npm run db:push` – Push Drizzle schema to the database

---

### 🤝 Contributing

Feel free to fork the project, open issues, or submit pull requests:

1. Fork the repo and create a new branch.
2. Make your changes and keep the UI consistent with the existing design system.
3. Run `npm run dev` or `npm run build` to ensure everything works.
4. Open a PR against `main`.

---

### 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file if/when added.

---

### 🔗 Links

- GitHub repo: https://github.com/Abhishek371222/CampusMarket

---

### 🧩 Real-World Marketplace Features (Concepts & Roadmap)

CampusMarket is designed to be close to a **real production marketplace**. Here’s how typical real‑world pieces map to this project and what you can extend next:

- **Authentication System (Login / Signup)**
  - Email/password auth with secure password hashing (e.g. `bcrypt`) and session/JWT-based identity.
  - Login, signup, logout, token/session expiry, and hooks for email verification / forgot-password flows.

- **User Roles & Permissions**
  - Roles like `user`, `seller`, and `admin` stored in the database.
  - Backend checks role before sensitive actions (e.g., only sellers can list items, only admins can moderate).

- **Product Listing System**
  - Strongly-typed product model (title, price, category, condition, images, sellerId, status).
  - Create, update, and delete listings with ownership checks and moderation hooks.

- **Real-Time Listing Visibility**
  - New or updated products can be broadcast via WebSockets/`ws` so users see changes without refreshing.

- **Search, Filter & Ranking**
  - Backend-driven search with filtering (price, category, condition) and sorting (newest, cheapest, etc.).
  - Can be powered by Postgres full-text search now and upgraded to ElasticSearch in the future.

- **Likes, Saves & Wishlist**
  - Tables to track which user saved which product, with deduplication and per-user saved views.

- **Reviews & Ratings**
  - One review per completed order, average rating computed server-side, and moderation hooks to prevent abuse.

- **Orders & Checkout**
  - Order creation, quantity locking, status lifecycle (Created → Paid → Shipped → Delivered).
  - Calculation of totals, fees, and discounts handled on the backend.

- **Payments Integration**
  - Integration points for providers like Stripe, Razorpay, or PayPal via secure backend callbacks/webhooks.
  - Backend verifies payment success; the frontend never blindly trusts client-side payment state.

- **Invoices & Receipts**
  - Server-side generation of invoice IDs, tax details, and downloadable PDFs for completed orders.

- **Notifications**
  - Email (e.g., SendGrid), in-app toasts, and real-time WebSocket notifications for order and message events.

- **Security**
  - Rate limiting, input validation, CSRF/XSS protection, and safe file uploads are first-class concerns.

- **Admin Panel**
  - Admin-only views and routes for moderating products, banning users, resolving disputes, and viewing analytics.

These concepts are a natural next step for evolving CampusMarket from a feature-rich prototype into a **production-grade marketplace**.


