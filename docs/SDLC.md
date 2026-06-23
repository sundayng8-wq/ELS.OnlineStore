# ELS ONLINE STORE — FULL PROJECT SDLC + FRONTEND GUIDE

**Date:** May 24, 2026  
**Project:** ELS Online Store  
**Team:** Sunday (Founder), Zohan (Frontend/Backend), You (Backend Lead)  
**Stack:** Node.js, Express.js, MongoDB, Vanilla HTML/CSS/JS, JWT, Multer, Paystack/Flutterwave

---

# PROJECT OVERVIEW

ELS Online Store is a multi-vendor e-commerce marketplace where:
- Sellers create stores
- Sellers upload products
- Buyers add products to cart
- Checkout splits orders per seller
- Payments are processed through Paystack/Flutterwave
- Sellers manage orders and earnings
- Buyers track deliveries and communicate with sellers

Architecture:
- Frontend: Vanilla HTML/CSS/JS
- Backend: Node.js + Express
- Database: MongoDB
- Auth: JWT
- Uploads: Multer
- Payments: Paystack or Flutterwave

---

# PHASE 1 — FOUNDATION ✅ COMPLETE (May 12–22, 2026)

## COMPLETED SYSTEMS

| Component | Files | Status |
|---|---|---|
| User Authentication | `server/routes/auth.js`, `server/models/User.js` | ✅ |
| Product CRUD | `server/routes/products.js`, `server/models/Product.js` | ✅ |
| JWT Auth Middleware | `server/middleware/auth.js` | ✅ |
| Image Upload | `server/server.js` | ✅ |
| Frontend UI | `index.html`, `js/*` | ✅ |
| MongoDB Config | `.env` | ✅ |

---

## AUTHENTICATION FEATURES

### Built Features
- User registration
- User login
- JWT token authentication
- OTP verification
- Password reset
- Protected routes
- Profile management

### Frontend Auth Storage

```javascript
localStorage.setItem('els_token', token);
localStorage.setItem('els_user', JSON.stringify(user));
```

---

## PRODUCT SYSTEM

### Features
- Create products
- Read products
- Update products
- Delete products
- Seller ownership protection
- Image upload support

### Current Product Routes

```javascript
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/products/seller/mine
```

---

## FRONTEND STRUCTURE

```text
ELS.OnlineStore/
├── index.html
├── style.css
├── js/
│   ├── ui.js
│   ├── dataSdk.js
│   ├── products.js
│   ├── cart.js
│   ├── register.js
│   ├── chat.js
│   ├── logistics.js
│   ├── profile.js
│   └── message.js
├── images/
├── server/
└── docs/
```

---

## HOW FRONTEND NAVIGATION WORKS

All pages are `<section>` blocks inside `index.html`.

Example:
```html
<section id="page-shop"></section>
<section id="page-cart"></section>
<section id="page-create-store"></section>
```

Navigation:
```javascript
goTo('shop');
goTo('cart');
goTo('create-store');
```

---

## WHAT WAS FIXED

- Added OTP verification routes
- Added password reset system
- Connected frontend to backend
- Fixed product route protection
- Fixed image upload issues
- Synced JWT token between frontend and backend
- Removed dependency on localStorage-only products

---

# PHASE 2 — MARKETPLACE CORE 🔴 IN PROGRESS (May 24–June 7)

# OBJECTIVE

Transform the project from:
> Simple product listing app

Into:
> Full multi-vendor marketplace

---

# 2.1 STORE SYSTEM

## PURPOSE

Each seller needs:
- Public store page
- Payment receiving account
- Seller dashboard
- Seller identity

---

## BACKEND TASKS

### Create Store Model

File:
```text
server/models/Store.js
```

Fields:
```javascript
{
  owner,
  store_name,
  description,
  logo,
  banner,
  bank_account_name,
  bank_account_number,
  bank_name,
  paystack_subaccount,
  status
}
```

---

### Create Store Routes

File:
```text
server/routes/stores.js
```

Routes:
```javascript
POST /api/stores
GET /api/stores/:id
PUT /api/stores/:id
GET /api/stores/seller/mine
```

---

## FRONTEND TASKS

# CREATE STORE PAGE

New section:
```html
<section id="page-create-store"></section>
```

Form requirements:

```text
Store Name
Store Description
Store Logo
Store Banner
Bank Account Name
Bank Account Number
Bank Name Dropdown
Submit Button
```

---

## API REQUEST

```javascript
POST /api/stores
Authorization: Bearer TOKEN
```

Body:
```javascript
{
  store_name,
  description,
  bank_account_name,
  bank_account_number,
  bank_name
}
```

---

## STORE STATES

| State | UI |
|---|---|
| No Store | Show Create Store |
| Pending Review | Show review message |
| Active | Open dashboard |
| Loading | Spinner |

---

# 2.2 MY STORE DASHBOARD

## PURPOSE

Central seller management area.

New section:
```html
<section id="page-my-store"></section>
```

---

## DASHBOARD TABS

| Tab | Purpose |
|---|---|
| Products | Seller product management |
| Orders | Incoming orders |
| Earnings | Revenue tracking |
| Settings | Store editing |

---

## PRODUCTS TAB

Features:
- Product image
- Product info
- Edit button
- Delete button
- Publish toggle

Routes:
```javascript
GET /api/products/seller/mine
PUT /api/products/:id
DELETE /api/products/:id
```

---

## ORDERS TAB

Features:
- Buyer name
- Ordered products
- Status tracking
- Tracking number
- Seller earnings
- Chat buyer

Status flow:
```text
Pending → Confirmed → Processing → Shipped → Delivered
```

Routes:
```javascript
GET /api/orders/seller
PUT /api/orders/:id/status
```

---

## EARNINGS TAB

Features:
- Total earnings
- Monthly earnings
- Pending payouts
- Transaction history

Route:
```javascript
GET /api/earnings/seller
```

---

## SETTINGS TAB

Features:
- Edit store details
- Update bank info
- Change store branding

Route:
```javascript
PUT /api/stores/:id
```

---

# 2.3 CART SYSTEM MIGRATION

## PURPOSE

Current cart:
```text
localStorage only
```

New cart:
```text
MongoDB persistent cart
```

---

## BACKEND TASKS

Create:
```text
server/models/Cart.js
server/routes/cart.js
```

Routes:
```javascript
GET /api/cart
POST /api/cart/add
PUT /api/cart/item/:id
DELETE /api/cart/item/:id
```

---

## NEW CART STRUCTURE

Cart grouped by seller:

```text
From Seller A
- Product 1
- Product 2

From Seller B
- Product 3
```

---

# 2.4 CHECKOUT SYSTEM

## PURPOSE

Split buyer payment across sellers.

---

## CHECKOUT FLOW

```text
Buyer clicks Checkout
→ Backend validates cart
→ Group items by seller
→ Calculate commission
→ Create transaction
→ Redirect to Paystack/Flutterwave
```

---

## BACKEND ROUTE

```javascript
POST /api/checkout
```

Body:
```javascript
{
  shipping_address
}
```

Response:
```javascript
{
  authorization_url,
  reference
}
```

---

# 2.5 ORDER SYSTEM

## PURPOSE

One checkout creates:
- One parent transaction
- Multiple seller orders

---

## DATABASE MODELS

### Order Model
```text
server/models/Order.js
```

### Transaction Model
```text
server/models/Transaction.js
```

---

## ORDER STATUS FLOW

```text
Pending
Paid
Processing
Shipped
Delivered
```

---

# 2.6 PAYMENT CALLBACK SYSTEM

## PURPOSE

Payment gateways notify backend after payment.

---

## ROUTE

```javascript
POST /api/payment/callback
```

Responsibilities:
- Verify payment
- Create orders
- Update inventory
- Clear cart
- Send notifications

---

# 2.7 RECONCILIATION SYSTEM

## PURPOSE

Recover failed or delayed payment confirmations.

Cron job:
```text
Every 30 minutes
```

Tasks:
- Check pending transactions
- Query payment gateway
- Resolve inconsistencies
- Flag failed payments

---

# PHASE 3 — SELLER EXPERIENCE 🟡 NEXT (June 8–14)

| Feature | Description |
|---|---|
| Seller Dashboard | Central seller management |
| Order Management | Seller order workflow |
| Earnings Page | Revenue and payouts |
| Notifications | Alerts and updates |
| Buyer-Seller Messaging | Chat system |
| Logistics Tracking | Shipment visibility |

---

# PHASE 4 — POLISH & LAUNCH 🟢 FUTURE (June 15–21)

| Feature | Description |
|---|---|
| Search & Filters | Product search |
| Product Reviews | Buyer ratings |
| Admin Panel | Store moderation |
| Mobile Responsiveness | Responsive UI |
| Legal Pages | Terms and privacy |
| Deployment | Production release |

---

# STORE PROFILE PAGE

## PURPOSE

Allow buyers to:
- View seller information
- Browse seller-only products

New section:
```html
<section id="page-store"></section>
```

---

## FEATURES

```text
Store Banner
Store Logo
Store Description
Member Since
Store Products
```

Routes:
```javascript
GET /api/stores/:id
GET /api/products?store_id=:id
```

---

# UPDATED SHOP PAGE

## CHANGES REQUIRED

Before:
```text
Mixed products
```

After:
```text
Products grouped with visible store identity
```

Add:
- Store name
- Clickable seller profile
- Optional store filtering

Remove:
- Seller management controls from public shop

---

# UPDATED CART PAGE

## NEW STRUCTURE

```text
From: Seller A
- Product A
- Product B
Subtotal

From: Seller B
- Product C
Subtotal
```

---

# UPDATED CHECKOUT PAGE

## FEATURES

- Shipping address form
- Seller grouping
- Delivery estimate
- Payment summary

Fields:
```text
Street
City
State
Country
Phone
```

---

# DATABASE COLLECTIONS

| Collection | Purpose | Status |
|---|---|---|
| users | Authentication | ✅ |
| products | Product listings | ✅ |
| stores | Seller stores | 🔴 |
| carts | Buyer carts | 🔴 |
| orders | Seller orders | 🔴 |
| transactions | Payment tracking | 🔴 |
| messages | Buyer-seller chat | 🟡 |
| notifications | Alerts system | 🟡 |

---

# CURRENT GIT BRANCHES

| Branch | Purpose |
|---|---|
| master | Stable production |
| zohan-work | Frontend work |
| backend-api | Backend expansion |

---

# DESIGN RULES

1. Keep everything inside `index.html`
2. Use `<section>` pages
3. Reuse existing components
4. Always show loading states
5. Always show error states
6. Use JWT auth everywhere
7. Protect seller routes
8. Use MongoDB persistence
9. Group cart/order logic by seller
10. Separate buyer and seller experiences

---

# AUTH HEADER FORMAT

```javascript
Authorization: Bearer ${token}
```

---

# NEXT ACTIONS — MAY 24

## GROUP DECISIONS
1. Choose Paystack or Flutterwave
2. Finalize platform commission percentage

---

## BACKEND PRIORITIES

1. Build Store model
2. Build Store routes
3. Build Cart system
4. Build Checkout system
5. Build Payment callback
6. Build Order system

---

## FRONTEND PRIORITIES

1. Create Store page
2. My Store dashboard
3. Store profile page
4. Seller-grouped cart
5. Seller-grouped checkout
6. Shop page updates

