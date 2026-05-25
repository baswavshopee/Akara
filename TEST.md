# BadgeCraft — Full Bug & Test Report
**Tested by:** Claude Code (QA Pass)  
**Date:** 2026-05-25  
**Scope:** All frontend pages, components, contexts, and backend routes

---

## SEVERITY LEGEND
- 🔴 **CRITICAL** — App-breaking, data loss, security hole, or payment failure
- 🟠 **HIGH** — Major feature broken, user cannot complete key flow
- 🟡 **MEDIUM** — Feature partially broken or inconsistent behavior
- 🔵 **LOW** — Minor UX issue, dead code, or cosmetic problem

---

## BUTTON / INTERACTION TEST RESULTS

| # | Button / Action | Page | Status | Notes |
|---|---|---|---|---|
| 1 | Add to Cart | ProductCard | 🟠 BROKEN | No loading state — double-click adds duplicate items |
| 2 | Proceed to Checkout | CartPage | 🟡 PARTIAL | Disabled for free-gift-only carts, but tax/shipping still calculated wrong |
| 3 | Pay & Place Order | CheckoutPage | 🔴 BROKEN | Payment NOT verified before order is saved (line 145-146 commented out) |
| 4 | Apply Coupon | CheckoutPage | 🟡 PARTIAL | Coupon never marked as used — can be reused unlimited times |
| 5 | Apply Spin Coupon | CheckoutPage | 🟡 PARTIAL | Same reuse bug as above |
| 6 | Spin Now | HomePage wheel | 🟡 PARTIAL | Spin result not guaranteed to land correctly (random offset ±20 degrees) |
| 7 | Claim (wheel result) | HomePage wheel | 🟡 PARTIAL | Free gift added to cart but coupon code not reliably saved |
| 8 | Wishlist ♡ button | ProductCard | 🟠 BROKEN | Toggles visual only — not saved anywhere, lost on refresh |
| 9 | Hamburger menu | Header (mobile) | ✅ WORKS | Newly added, working |
| 10 | Theme toggle (🌙/☀️) | Header | ✅ WORKS | Persists to localStorage correctly |
| 11 | Cart icon (header) | Header | ✅ WORKS | Badge count updates correctly |
| 12 | Sign In button | Header | ✅ WORKS | Navigates to /login |
| 13 | Logout | Header | ✅ WORKS | Signs out and shows toast |
| 14 | Remove item | CartPage | ✅ WORKS | Fires toast, removes from state |
| 15 | Qty +/- | CartPage | ✅ WORKS | Updates quantity correctly |
| 16 | Continue Shopping | CartPage (empty) | ✅ WORKS | Navigates to "/" |
| 17 | Filter buttons | ShopPage / CategoryPage | 🟡 PARTIAL | Multiple rapid clicks cause multiple API calls (no debounce) |
| 18 | Apply for event | EventsPage | 🟡 PARTIAL | Email not validated by format — invalid emails accepted |
| 19 | View Application Link | EventsPage | ✅ WORKS | Opens with noopener/noreferrer safely |
| 20 | Explore Store → | HomePage | ✅ WORKS | Navigates to /shop |
| 21 | View Events | HomePage | ✅ WORKS | Scrolls to #events anchor |
| 22 | FAQ accordion | HomePage | ✅ WORKS | Toggles open/close |
| 23 | Mystery Box Continue | HomePage modal | 🔵 LOW | Navigates to /shop but selected options are not passed |
| 24 | Newsletter Join Now | HomePage | 🟡 PARTIAL | Form submits but no API call — data is silently lost |
| 25 | Back button | ProductPage | ✅ WORKS | Navigates back |
| 26 | Breadcrumb links | ProductPage | ✅ WORKS | Category and home links work |
| 27 | Size/Color selectors | ProductPage | ✅ WORKS | Toggles active state correctly |
| 28 | Add to Cart (large) | ProductPage | 🟠 BROKEN | Same double-click issue as ProductCard |
| 29 | Collections dropdown | Header (desktop) | ✅ WORKS | Shows categories on hover |
| 30 | Admin: Save Product | AdminPage | 🟡 PARTIAL | Only validates name & price — image URL not validated |
| 31 | Admin: Delete Product | AdminPage | ✅ WORKS | Deletes with confirmation |
| 32 | Admin: Upload Image | AdminPage | ✅ WORKS | Streams to Cloudinary correctly |
| 33 | Admin: Save Event | AdminPage | ✅ WORKS | Creates/updates event |
| 34 | Scroll progress bar | All pages | ✅ WORKS | Width updates on scroll |
| 35 | Reveal animations | HomePage | ✅ WORKS | IntersectionObserver fires correctly |

---

## CRITICAL BUGS 🔴

### BUG-01 — Payment saved without verification
**File:** [frontend/src/pages/CheckoutPage.jsx](frontend/src/pages/CheckoutPage.jsx#L145)  
**Severity:** 🔴 CRITICAL  
**Description:** The payment signature verification call is commented out. Orders are inserted into the database based solely on Razorpay's `handler` callback firing — which can be spoofed. A user can complete a fake payment and still get their order recorded.

```js
// Line 145-146 in CheckoutPage.jsx:
// Optional: Verify payment signature here using another API call if needed
// await axios.post("/api/payment/verify-payment", response);
```

**Fix:** Uncomment and implement `/api/payment/verify-payment`. Server must verify `razorpay_signature` using HMAC before saving the order.

---

### BUG-02 — Coupon never marked as used
**File:** [frontend/src/pages/CheckoutPage.jsx](frontend/src/pages/CheckoutPage.jsx#L149)  
**Severity:** 🔴 CRITICAL  
**Description:** After a successful order, the coupon code is sent to the backend (`couponUsed`) but the coupon is never deleted or deactivated. Any user can reuse the same spin-wheel coupon code an unlimited number of times.

**Fix:** Add a `DELETE /api/coupons/:code` or `PATCH /api/coupons/:code/use` call after successful payment, and enforce server-side that a coupon can only be used once.

---

### BUG-03 — Razorpay key falls back to placeholder string
**File:** [backend/routes/paymentRoutes.js](backend/routes/paymentRoutes.js#L11)  
**Severity:** 🔴 CRITICAL  
**Description:** If `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET` are missing from `.env`, the code silently falls back to `"YOUR_RAZORPAY_KEY"` and `"YOUR_RAZORPAY_SECRET"`. Payments will fail with a confusing error.

```js
const keyId = process.env.RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY";
```

**Fix:** Throw a startup error if keys are missing rather than silently using placeholders.

---

### BUG-04 — CORS allows all origins
**File:** [backend/server.js](backend/server.js#L18)  
**Severity:** 🔴 CRITICAL (Security)  
**Description:** `app.use(cors())` with no options allows requests from **any** origin. This means any website can call the API on behalf of authenticated users.

**Fix:** Restrict to known origins:
```js
app.use(cors({ origin: ["https://yourdomain.com", "http://localhost:3000"] }));
```

---

### BUG-05 — Admin coupon creation endpoint unprotected
**File:** [backend/routes/couponRoutes.js](backend/routes/couponRoutes.js#L108)  
**Severity:** 🔴 CRITICAL (Security)  
**Description:** `POST /api/coupons` has no `requireAdmin` middleware. Any user who discovers this endpoint can create arbitrary coupon codes with arbitrary discount percentages.

**Fix:** Add `requireAdmin` middleware to the route.

---

### BUG-06 — Event applications endpoint unprotected
**File:** [backend/routes/eventRoutes.js](backend/routes/eventRoutes.js#L33)  
**Severity:** 🔴 CRITICAL (Security)  
**Description:** `GET /api/events/applications` returns all applicant names, emails, and messages with zero authorization. Anyone can harvest user data.

**Fix:** Add `requireAdmin` middleware.

---

## HIGH BUGS 🟠

### BUG-07 — Wishlist button does nothing
**File:** [frontend/src/components/ProductCard.jsx](frontend/src/components/ProductCard.jsx)  
**Severity:** 🟠 HIGH  
**Description:** The ♡ wishlist button toggles a local `liked` CSS state but saves nothing. On page refresh it's gone. No API call, no localStorage.

**Fix:** Either connect to a wishlist API (requires auth) or persist to `localStorage` as a minimum.

---

### BUG-08 — Add to Cart allows rapid double-click
**File:** [frontend/src/components/ProductCard.jsx](frontend/src/components/ProductCard.jsx) and [frontend/src/pages/ProductPage.jsx](frontend/src/pages/ProductPage.jsx)  
**Severity:** 🟠 HIGH  
**Description:** No loading/disabled state while `addToCart` runs. Rapid clicks add duplicate entries.

**Fix:** Disable the button immediately on click, re-enable after the action completes.

---

### BUG-09 — Newsletter form silently drops data
**File:** [frontend/src/pages/HomePage.jsx](frontend/src/pages/HomePage.jsx#L802)  
**Severity:** 🟠 HIGH  
**Description:** The newsletter form has `onSubmit={(e) => e.preventDefault()}` — it never sends data to any API. Email is collected and immediately discarded.

**Fix:** Implement a `POST /api/newsletter` endpoint and wire it up.

---

### BUG-10 — Mystery Box options not passed to checkout
**File:** [frontend/src/pages/HomePage.jsx](frontend/src/pages/HomePage.jsx#L937)  
**Severity:** 🟠 HIGH  
**Description:** The Mystery Box modal collects category preference and price range but the Continue button just navigates to `/shop`. The selections are completely ignored.

**Fix:** Pass selected category and price as query params to the shop, or add a "Add Mystery Box to Cart" flow.

---

## MEDIUM BUGS 🟡

### BUG-11 — Email format not validated at checkout
**File:** [frontend/src/pages/CheckoutPage.jsx](frontend/src/pages/CheckoutPage.jsx#L76)  
**Severity:** 🟡 MEDIUM  
**Description:** The `validate()` function checks phone (10 digits) and pincode (6 digits) with regex, but `email` is marked optional and its format is never validated. Invalid email strings like `"abc"` are accepted.

**Fix:** Add: `if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";`

---

### BUG-12 — Email format not validated on event applications
**File:** [frontend/src/pages/EventsPage.jsx](frontend/src/pages/EventsPage.jsx#L49)  
**Severity:** 🟡 MEDIUM  
**Description:** Only checks `email.trim()` is non-empty. Invalid emails are saved to the database.

**Fix:** Add email regex validation before the API call.

---

### BUG-13 — CategoryPage searchParams mutation bug
**File:** [frontend/src/pages/CategoryPage.jsx](frontend/src/pages/CategoryPage.jsx#L49)  
**Severity:** 🟡 MEDIUM  
**Description:** Filter handler attempts to mutate `searchParams` directly (a read-only URLSearchParams object). URL does not update correctly when switching themes/filters.

**Fix:**
```js
const newParams = new URLSearchParams(searchParams);
newParams.set("theme", theme);
setSearchParams(newParams);
```

---

### BUG-14 — Tax hardcoded at 10% everywhere
**File:** [frontend/src/pages/CartPage.jsx](frontend/src/pages/CartPage.jsx#L10), [frontend/src/pages/CheckoutPage.jsx](frontend/src/pages/CheckoutPage.jsx#L36)  
**Severity:** 🟡 MEDIUM  
**Description:** Tax is hardcoded as `totalPrice * 0.1` in two separate files. They can drift out of sync.

**Fix:** Create a shared `TAX_RATE` constant and import it in both files.

---

### BUG-15 — Shipping shows ₹5.99 but homepage says "Free Delivery"
**File:** [frontend/src/pages/CartPage.jsx](frontend/src/pages/CartPage.jsx#L11)  
**Severity:** 🟡 MEDIUM  
**Description:** Cart and checkout charge ₹5.99 shipping always. But product pages and the benefits bar say "Fast Delivery across all major cities" implying free or conditional free shipping. Inconsistent user expectation.

**Fix:** Implement a shipping tier: free above ₹500, else ₹50–₹99 flat.

---

### BUG-16 — ShopPage API called on every filter change without debounce
**File:** [frontend/src/pages/ShopPage.jsx](frontend/src/pages/ShopPage.jsx#L26)  
**Severity:** 🟡 MEDIUM  
**Description:** Every `searchParams` change immediately fires a new `axios.get()`. Rapidly clicking filters fires 5+ simultaneous requests; last one to resolve wins and may show wrong results.

**Fix:** Debounce the effect by 300ms or cancel in-flight requests with Axios `CancelToken`.

---

### BUG-17 — Spin wheel countdown resets on tab switch
**File:** [frontend/src/pages/HomePage.jsx](frontend/src/pages/HomePage.jsx#L213)  
**Severity:** 🟡 MEDIUM  
**Description:** The countdown `setInterval` continues running even when the tab is backgrounded. When switching tabs, `Date.now()` drift can cause the displayed countdown to jump.

**Fix:** Calculate remaining time from the stored timestamp (`lastSpinTime`) directly on each tick, rather than decrementing a counter. (The code partially does this but not consistently.)

---

### BUG-18 — AdminPage API errors silently swallowed
**File:** [frontend/src/pages/AdminPage.jsx](frontend/src/pages/AdminPage.jsx#L101)  
**Severity:** 🟡 MEDIUM  
**Description:** All `loadProducts`, `loadOrders`, `loadEvents`, `loadApplications` functions have empty `catch` blocks `catch {}`. If any API fails, the admin dashboard shows nothing with no indication of an error.

**Fix:** Show a toast error in each catch block.

---

### BUG-19 — Confetti script appended multiple times
**File:** [frontend/src/pages/HomePage.jsx](frontend/src/pages/HomePage.jsx#L250)  
**Severity:** 🟡 MEDIUM  
**Description:** Every time `showClaimSuccessModal` becomes `true`, a new `<script>` tag for the confetti CDN is appended to `<body>`. If modal is shown 3 times, 3 scripts are appended.

**Fix:** Check `if (document.querySelector('script[src*="canvas-confetti"]')) return;` before appending.

---

### BUG-20 — Promise.allSettled not used in admin summary
**File:** [backend/routes/orderRoutes.js](backend/routes/orderRoutes.js#L52)  
**Severity:** 🟡 MEDIUM  
**Description:** `Promise.all([...4 queries...])` — if any single Supabase query fails, the entire `/api/orders/summary` endpoint returns 500, killing the entire admin dashboard overview.

**Fix:** Use `Promise.allSettled()` and handle each result individually.

---

## LOW / COSMETIC BUGS 🔵

### BUG-21 — console.error left in production code
**File:** [frontend/src/pages/HomePage.jsx](frontend/src/pages/HomePage.jsx#L104)  
**Severity:** 🔵 LOW  
**Description:** `console.error("Failed to load homepage data:", err)` logs API errors to the browser console in production. Exposes internal API structure.

**Fix:** Remove or replace with a proper error tracking solution (Sentry, etc.).

---

### BUG-22 — Founders section image 404s in some environments
**File:** [frontend/src/pages/HomePage.jsx](frontend/src/pages/HomePage.jsx#L784)  
**Severity:** 🔵 LOW  
**Description:** Signed Supabase URL for the founders image has a very long expiry (2642297791 epoch ≈ year 2053) but if the bucket policy changes or the token is revoked, the image silently breaks.

**Fix:** Store image in Cloudinary (like other product images) for consistent availability.

---

### BUG-23 — Scroll-to-top not triggered on same-path navigation
**File:** [frontend/src/components/ScrollToTop.jsx](frontend/src/components/ScrollToTop.jsx)  
**Severity:** 🔵 LOW  
**Description:** `ScrollToTop` fires on `pathname` change. Navigating to `/shop` with different query params (category filter changes) won't scroll to top.

**Fix:** Also listen to `location.search` or `location.key` changes.

---

### BUG-24 — Supabase service role key used for all public endpoints
**File:** [backend/config/supabase.js](backend/config/supabase.js)  
**Severity:** 🔵 LOW (Security Best Practice)  
**Description:** The `SUPABASE_SERVICE_ROLE_KEY` bypasses all Row Level Security (RLS) policies. Currently every public API request — including product listing — uses admin-level credentials.

**Fix:** Use the `anon` key for public read operations; reserve the service role key for admin-only operations.

---

### BUG-25 — Dark mode secondary hero section text invisible
**File:** [frontend/src/index.css](frontend/src/index.css#L57)  
**Severity:** 🔵 LOW  
**Description:** `.page, section, .reveal { background-color: var(--bg) !important; }` forces all sections to the global background. Sections with custom gradient backgrounds (dark hero, mystery box, founders) may look correct but the `!important` can override intentional dark section styles in edge cases.

**Fix:** Remove the `!important` from the global `.page, section` rule and target specific selectors instead.

---

### BUG-26 — Mobile spin notification overlaps spin trigger button
**File:** [frontend/src/pages/HomePage.jsx](frontend/src/pages/HomePage.jsx#L946)  
**Severity:** 🔵 LOW  
**Description:** The spin notification popup (`bottom: 30px, right: 30px`) and the spin trigger button (also `bottom: 30px, right: 30px`) occupy the same position. The notification covers the button.

**Fix:** Position the notification at `bottom: 100px` or above the spin trigger (now fixed in index.css to `bottom: 80px` for the trigger, but notification also needs adjustment).

---

### BUG-27 — No rate limiting on API endpoints
**File:** [backend/server.js](backend/server.js)  
**Severity:** 🔵 LOW (Security)  
**Description:** No rate-limiting middleware (`express-rate-limit`). Endpoints like `/api/orders`, `/api/coupons/claim` can be hammered.

**Fix:** Add `express-rate-limit` with appropriate limits per route.

---

### BUG-28 — Out-of-stock products can still be added to cart
**File:** [frontend/src/components/ProductCard.jsx](frontend/src/components/ProductCard.jsx), [backend/routes/productRoutes.js](backend/routes/productRoutes.js)  
**Severity:** 🔵 LOW  
**Description:** `in_stock = false` disables the "Add to Cart" button in the UI, but there is no server-side validation. A direct API call or a crafted request can add out-of-stock products.

**Fix:** Validate `inStock` server-side in the order creation endpoint.

---

## MISSING FEATURES (Not Bugs, But Gaps)

| # | Feature | Priority | Notes |
|---|---|---|---|
| F-01 | Payment verification (server-side) | 🔴 CRITICAL | Currently commented out |
| F-02 | Coupon single-use enforcement | 🔴 CRITICAL | Coupons reusable indefinitely |
| F-03 | Order tracking for customers | 🟠 HIGH | Footer links to /login, no tracking page |
| F-04 | Email confirmation on order | 🟠 HIGH | No email sent after purchase |
| F-05 | Newsletter subscription API | 🟠 HIGH | Form submits but no backend |
| F-06 | Product search (full-text) | 🟡 MEDIUM | Only filter by category |
| F-07 | Wishlist persistence | 🟡 MEDIUM | UI exists, no data layer |
| F-08 | Product reviews by customers | 🟡 MEDIUM | Rating field exists, no submission |
| F-09 | Stock deduction after order | 🟡 MEDIUM | in_stock never updated |
| F-10 | Mystery Box selection → cart | 🟡 MEDIUM | Modal options ignored |

---

## QUICK STATS

| Severity | Count |
|---|---|
| 🔴 Critical | 6 |
| 🟠 High | 4 |
| 🟡 Medium | 10 |
| 🔵 Low | 8 |
| Missing features | 10 |
| **Total issues** | **38** |

---

## FIX PRIORITY ORDER

1. **BUG-01 + BUG-03** — Payment verification (money at risk)
2. **BUG-02** — Coupon reuse (revenue loss)
3. **BUG-04** — CORS lockdown (security)
4. **BUG-05 + BUG-06** — Unprotected admin endpoints (data breach)
5. **BUG-09** — Newsletter form (user data loss)
6. **BUG-07 + BUG-08** — Wishlist & add-to-cart UX
7. **BUG-13** — Category filter URL bug (broken UX)
8. Everything else in order of severity

---

*Generated by Claude Code QA Pass — 2026-05-25*
