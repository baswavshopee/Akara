# 🛍️ Custom Merch E-Commerce Platform (Full Stack Spec)

## 🧠 Project Overview
Build a modern, high-performance e-commerce platform for selling customizable merchandise including:
- Badges
- T-Shirts
- Stickers
- Spotify Plaques
- Posters
- Magnets
- Keychains
- Figurines
- Charms
- Bookmarks

Users should be able to **customize products before purchasing**.

---

## 🏗️ Tech Stack

### Frontend
- React (with Vite or Next.js)
- Tailwind CSS
- Framer Motion (animations)
- ShadCN UI (components)

### Backend
- Node.js (Express.js)

### Database
- Supabase (PostgreSQL)

### Storage
- Cloudinary (for product images & user uploads)

### Auth
- Supabase Auth (JWT based)

---

## 👥 User Roles

### 1. Admin
- Full access to dashboard
- Manage products
- Manage events
- View applications

### 2. User
- Browse products
- Customize items
- Add to cart
- Apply for events
- Cannot access admin features

---

## 🔐 Authentication & Authorization

- Use Supabase Auth
- Role-based access:
  - `admin`
  - `user`

### Rules:
- Only admins can:
  - Add/edit/delete products
  - Manage events
- Users cannot access admin routes

---

## 📦 Core Features

---

### 🛒 1. Product System

#### Product Fields:
- id
- name
- description
- price
- category
- customizable (boolean)
- images (Cloudinary URLs)
- stock

#### Admin Capabilities:
- Add new product
- Edit product
- Delete product (also remove from DB)
- Update pricing
- Upload images (Cloudinary)

---

### 🎨 2. Customization Feature

For customizable products:
- Text input (user text)
- Image upload (Cloudinary)
- Color selection
- Live preview (optional but preferred)

---

### 🛍️ 3. Cart System

- Add to cart
- Remove from cart
- Update quantity
- View total price
- Store cart (localStorage or DB)

---

### 📄 4. Product Page

Each product should have:
- Image carousel
- Description
- Customization options (if enabled)
- Add to cart button

---

### 🎉 5. Events System

#### Admin:
- Create event
- Edit event
- Delete event

#### Event Fields:
- id
- name
- description
- location
- date
- application_link OR internal apply system

#### User:
- View events
- Apply for events

#### Tracking:
- Store all applications in DB

---

### 📊 6. Admin Dashboard

#### Sections:
- Products
- Events
- Orders (optional future)
- Applications

#### Features:
- CRUD operations
- Analytics (basic count stats)

---

## 🧭 Navigation Structure

### Header Menu:
- Home
- Shop
- Collections
- Events
- Contact

---

## 🎨 UI/UX Requirements

### Design Style:
- Modern
- Dark + Gradient theme
- Glassmorphism
- Smooth animations

### Components:
- Hero section with animation
- Product carousel
- Category sections
- Smooth transitions

### Animations:
- Framer Motion
- Hover effects
- Scroll-based animations

---

## 📁 Folder Structure
/client
/components
/pages
/hooks
/utils

/server
/controllers
/routes
/middleware
/services

/config


---

## ☁️ Cloudinary Integration

- Upload images via backend
- Store returned URLs in DB
- Optimize images (auto format, compression)

---

## 🧩 API Endpoints (Sample)

### Products
- GET /products
- POST /products (admin)
- PUT /products/:id (admin)
- DELETE /products/:id (admin)

### Events
- GET /events
- POST /events (admin)
- PUT /events/:id (admin)
- DELETE /events/:id (admin)

### Applications
- POST /events/:id/apply
- GET /applications (admin)

---

## 🚀 Future Enhancements

- Payment Gateway (Stripe/Razorpay)
- Order tracking
- Wishlist
- Reviews & ratings
- AI-based customization preview

---

## ⚡ Performance Requirements

- Lazy loading images
- CDN (Cloudinary)
- Code splitting (React)
- Optimized API calls

---

## 🔒 Security

- JWT validation
- Role-based middleware
- Input validation
- Rate limiting (optional)

---

## 🎯 Goal

Build a **scalable, visually stunning, and production-ready merch platform** that supports customization and admin management with clean architecture.
