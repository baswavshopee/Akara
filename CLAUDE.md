# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BadgeCraft** — a full-stack e-commerce platform for customizable merchandise (Badges, Magnets, Posters, Plaques, Bookmarks). The `claude.md` at the repo root is a product requirements spec, not this file.

## Commands

### Backend (`/backend`)
```bash
npm run dev      # Start with nodemon (hot reload)
npm start        # Start with node
npm run seed     # Wipe products table and insert 20 sample products
```

### Frontend (`/frontend`)
```bash
npm run dev      # Vite dev server on port 3000
npm run build    # Production build
npm run preview  # Preview production build
```

Both servers must run concurrently for local development. The frontend Vite dev server proxies `/api/*` to `http://localhost:5000`.

## Supabase Setup

Before running the backend, create the following tables in your Supabase project (SQL editor):

```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  rating NUMERIC(3,2) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  application_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Backend `.env` requires: `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

Get `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from **Supabase Dashboard → Project Settings → API**.

## Architecture

This is a monorepo with two independent packages — no shared code or root-level `package.json`.

### Backend (Node.js / Express / Supabase)
- `server.js` — entry point; starts Express on `PORT` (no DB connection step — Supabase is HTTP-based)
- `config/supabase.js` — single Supabase client instance using `SUPABASE_SERVICE_ROLE_KEY`
- `routes/productRoutes.js` — full CRUD; maps snake_case DB columns → camelCase for frontend; supports `?category=` and `?search=` filters
- `routes/categoryRoutes.js` — fetches all product categories, counts in JS, merges with display metadata (icon, color, gradient defined inline)
- `routes/eventRoutes.js` — full event CRUD + `POST /:id/apply` + `GET /applications`; joins applications → events via Supabase `select("*, events(...)")`
- `routes/uploadRoutes.js` — unchanged; `POST /api/upload` accepts `multipart/form-data`, streams to Cloudinary, returns `{ imageUrl }`

**DB column naming:** Supabase tables use `snake_case` (`in_stock`, `original_price`, `application_link`). All routes map these to `camelCase` and expose MongoDB-style `_id` (mapped from `id`) so the frontend needs no changes.

### Frontend (React 18 / Vite / React Router v6)
- `main.jsx` — mounts `<BrowserRouter>` wrapping `<CartProvider>` and `<ToastProvider>`
- `App.jsx` — layout shell; routes: `/`, `/category/:categoryName`, `/product/:id`, `/cart`, `/events`, `/admin`
- `context/CartContext.jsx` — cart via `useReducer`; persisted to `localStorage`; exposes `addToCart`, `removeFromCart`, `updateQty`, `clearCart`, `totalItems`, `totalPrice`
- `context/ToastContext.jsx` — global toast via `showToast(message)`
- `hooks/useFetch.js` — generic axios GET hook with cancellation

All API calls use relative paths (e.g. `/api/products`) — resolved via the Vite proxy.

## Key Constraints

- **No auth yet** — all routes are public. The spec calls for Supabase Auth with `admin`/`user` roles; middleware is not yet wired.
- **Cart is localStorage-only** — no server-side cart persistence.
- **Admin page is unprotected** — `/admin` is accessible to anyone until auth is added.
