# E-Commerce Website

A full-stack **single-seller e-commerce platform** built with React, Vite, Express, and MongoDB. Users can browse products, search and filter products, manage their cart and wishlist, add delivery addresses, place online orders, make payments through Razorpay, track orders, download invoices, and submit product reviews.

Administrators can manage products, inventory, orders, customers, stock movements, and sales analytics through a dedicated admin dashboard.

---

## Features

### User Features

* User registration and login with JWT authentication
* Google Sign-In / OAuth authentication
* User profile management
* Browse products by category
* Product search
* Product filtering

  * Category
  * Price range
  * Rating
  * Stock availability
* Product sorting

  * Newest
  * Price: Low to High
  * Price: High to Low
  * Rating
  * Name
* Product detail page
* Multiple product images
* Product stock availability
* Shopping cart
* Increase/decrease product quantity
* Remove products from cart
* Cart persistence using localStorage
* Wishlist / Favorites
* One-click add to cart from favorites
* Delivery address management
* Add, update, delete addresses
* Set default delivery address
* Checkout
* Order summary
* Automatic 5% tax calculation
* Online payment using Razorpay
* UPI and Card payment support
* Payment verification on backend
* Order confirmation
* Order history
* Order details
* Order tracking
* Order status timeline
* Estimated delivery time
* Invoice PDF download
* Product ratings and reviews
* Reviews restricted to delivered orders
* Responsive mobile and desktop UI

---

## Admin Features

### Admin Authentication

* Admin registration
* Admin login
* JWT-based admin authentication
* Protected admin routes
* Admin profile
* Admin logout

### Product Management

* Create products
* Update products
* Delete products
* View product details
* Upload product images using Cloudinary
* Manage product categories
* Manage product price
* Manage product quantity
* Manage product description
* Manage product availability
* Manage product ratings and reviews

### Inventory Management

* Live inventory tracking
* Stock quantity monitoring
* Low-stock alerts
* Out-of-stock detection
* Automatic stock deduction after successful order
* Automatic stock restoration after order cancellation
* Stock movement history
* Inventory audit logs
* Manual stock updates

### Order Management

* View all customer orders
* View order details
* Search orders
* Filter orders
* Update order status
* Update estimated delivery time
* Order status flow:

```text
Placed
   ↓
Preparing
   ↓
Ready
   ↓
Delivered
```

Orders can also be:

```text
Placed / Preparing / Ready → Cancelled
```

When an order is cancelled, the purchased stock is automatically restored.

### Dashboard

* Total sales
* Total orders
* Average order value
* Recent orders
* Low-stock products
* Out-of-stock products
* Top-selling products
* Sales by category
* Daily sales
* Peak ordering hours
* Top customers

### Reports & Analytics

* Total revenue
* Total orders
* Average order value
* Daily revenue
* Category-wise sales
* Product-wise sales
* Top-selling products
* Top customers
* Peak order hours
* Inventory movement reports

---

# Tech Stack

## Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS
* jsPDF
* JavaScript

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Multer
* Cloudinary
* Razorpay

## Authentication

* JWT authentication
* Google OAuth
* Separate user and admin authentication

## Payment

* Razorpay
* UPI
* Card
* Server-side payment verification

---

# Project Structure

```text
E-Commerce/
│
├── Backend/
│   ├── src/
│   │   ├── Controllers/
│   │   ├── DB/
│   │   ├── Middleware/
│   │   ├── Models/
│   │   ├── routes/
│   │   ├── utills/
│   │   ├── app.js
│   │   └── index.js
│   │
│   ├── .env
│   ├── package.json
│   └── ...
│
├── Frontend/
│   ├── src/
│   │   ├── Componants/
│   │   ├── Context/
│   │   ├── Pages/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── package.json
│   └── ...
│
├── .gitignore
├── README.md
└── DEPLOYMENT.md
```

---

# Setup

## 1. Clone the Repository

```bash
git clone <your-repository-url>

cd E-Commerce
```

---

# Backend Setup

```bash
cd Backend
npm install
```

Create:

```text
Backend/.env
```

Add:

```env
PORT=8000

MONGODB_URI=your_mongodb_connection_string

CORS_ORIGIN=http://localhost:5173

REFRESH_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_EXPIRY=1d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

GOOGLE_CLIENT_ID=your_google_client_id
```

Start the backend:

```bash
npm run dev
```

Production:

```bash
npm run start
```

---

# Frontend Setup

Open another terminal:

```bash
cd Frontend
npm install
```

Create:

```text
Frontend/.env
```

Add:

```env
VITE_BASE_URL=http://localhost:8000

VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the frontend:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

# Authentication Flow

The application uses JWT-based authentication.

## User

After successful login:

```text
User Login
    ↓
Backend validates credentials
    ↓
JWT generated
    ↓
Frontend stores token
    ↓
Protected API requests
```

The user token is stored as:

```text
localStorage.token
```

Protected requests use:

```http
Authorization: Bearer <token>
```

## Admin

Admin authentication is separated from normal users.

The admin token is stored as:

```text
localStorage.adminToken
```

Admin requests use:

```http
Authorization: Bearer <adminToken>
```

---

# Google Authentication

Users can authenticate using Google.

Flow:

```text
Google Sign-In
      ↓
Google ID Token
      ↓
POST /api/v1/users/google
      ↓
Backend validates Google identity
      ↓
User created/found
      ↓
JWT generated
      ↓
User authenticated
```

---

# Shopping Flow

The normal customer flow is:

```text
Home
  ↓
Products
  ↓
Product Details
  ↓
Add to Cart
  ↓
Cart
  ↓
Checkout
  ↓
Select Address
  ↓
Order Summary
  ↓
Payment
  ↓
Razorpay
  ↓
Payment Verification
  ↓
Order Created
  ↓
Order Tracking
```

---

# Cart Flow

The cart supports:

* Add product
* Remove product
* Increase quantity
* Decrease quantity
* Clear cart
* Persistent cart data

Cart data is persisted using:

```text
localStorage
```

The backend remains responsible for validating:

* Product existence
* Current price
* Available stock
* Requested quantity

The client-side cart should never be treated as the source of truth for payment or stock.

---

# Checkout & Order Flow

When the customer checks out:

1. Backend receives the order request.
2. Product availability is verified.
3. Current product prices are fetched from MongoDB.
4. Requested quantities are validated.
5. Subtotal is calculated.
6. 5% tax is calculated.
7. Final total is calculated server-side.
8. Payment is initiated.
9. Razorpay processes the payment.
10. Backend verifies the Razorpay signature.
11. Order is created.
12. Product stock is decreased.
13. Stock movement logs are created.
14. Customer receives the order response.

---

# Tax Calculation

The application currently uses a 5% tax rate.

```text
Subtotal = Sum of item totals

Tax = Subtotal × 0.05

Total = Subtotal + Tax
```

All final monetary calculations should be performed on the backend.

---

# Razorpay Payment Flow

The payment architecture is:

```text
Frontend
   ↓
POST /api/v1/orders/razorpay/order
   ↓
Backend
   ↓
Razorpay Order
   ↓
Razorpay Checkout
   ↓
Customer Payment
   ↓
Razorpay Response
   ↓
Frontend
   ↓
POST /api/v1/orders/razorpay/verify
   ↓
Backend Signature Verification
   ↓
Payment Verified
   ↓
Order Created
   ↓
Inventory Updated
```

The following information is verified on the backend:

```text
razorpay_order_id
razorpay_payment_id
razorpay_signature
```

The Razorpay secret must never be exposed to the frontend.

---

# Order Status

Orders support the following statuses:

```text
Placed
Preparing
Ready
Delivered
Cancelled
```

Example timeline:

```text
Placed
  │
  ├── Preparing
  │
  ├── Ready
  │
  └── Delivered
```

Cancellation can occur according to the application's cancellation rules.

Each status change is recorded in the order timeline.

---

# Inventory Flow

Inventory is automatically synchronized with orders.

## Successful Order

```text
Available Stock
      ↓
Order Placed
      ↓
Stock Validated
      ↓
Stock Decreased
      ↓
Stock Log Created
```

Example:

```text
Before: 20
Ordered: 3
After: 17
```

## Order Cancellation

```text
Order Cancelled
      ↓
Stock Restored
      ↓
Stock Log Created
```

Example:

```text
Before: 17
Restored: 3
After: 20
```

The backend validates stock before changing inventory.

---

# Favorites / Wishlist

Users can save products to their favorites.

Available operations:

```text
Add Favorite
Remove Favorite
View Favorites
Add Favorite Product to Cart
```

API requests require user authentication.

---

# Reviews & Ratings

Customers can review products after completing an order.

Review rules:

* User must be authenticated.
* User must have purchased the product.
* The relevant order must be delivered.
* Rating must be between 1 and 5.
* Users can update their review where supported.

Product rating information includes:

```text
Average Rating
Review Count
Reviews
```

---

# Address Management

Customers can maintain multiple delivery addresses.

Supported operations include:

* Add address
* View addresses
* Update address
* Delete address
* Set default address
* Get default address

The address is selected during checkout.

Addresses are stored separately from the User model.

---

# Invoice

After an order is successfully placed, customers can download an invoice PDF.

The invoice contains information such as:

```text
Order ID
Customer Information
Delivery Address
Products
Quantity
Unit Price
Subtotal
Tax
Total
Payment Information
Order Date
Order Status
```

Invoice generation is handled on the frontend using:

```text
jsPDF
```

---

# API Endpoints

## Users

| Method | Endpoint                              | Description           |
| ------ | ------------------------------------- | --------------------- |
| POST   | `/api/v1/users/register`              | Register user         |
| POST   | `/api/v1/users/login`                 | Login user            |
| POST   | `/api/v1/users/google`                | Google authentication |
| GET    | `/api/v1/users/logout`                | Logout user           |
| GET    | `/api/v1/users/userProfile`           | Get user profile      |
| GET    | `/api/v1/users/favorites`             | Get favorites         |
| POST   | `/api/v1/users/favorites/:foodCardId` | Add favorite          |
| DELETE | `/api/v1/users/favorites/:foodCardId` | Remove favorite       |

---

# Admin APIs

| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| POST   | `/api/v1/admins/register` | Register admin           |
| POST   | `/api/v1/admins/login`    | Login admin              |
| GET    | `/api/v1/admins/logout`   | Logout admin             |
| GET    | `/api/v1/admins/profile`  | Admin profile            |
| GET    | `/api/v1/admins/public`   | Public admin information |

---

# Product APIs

| Method | Endpoint                        | Description         |
| ------ | ------------------------------- | ------------------- |
| GET    | `/api/v1/foodcards`             | Get products        |
| POST   | `/api/v1/foodcards`             | Create product      |
| GET    | `/api/v1/foodcards/my`          | Get admin products  |
| GET    | `/api/v1/foodcards/:id`         | Get product details |
| PUT    | `/api/v1/foodcards/:id`         | Update product      |
| DELETE | `/api/v1/foodcards/:id`         | Delete product      |
| PATCH  | `/api/v1/foodcards/:id/rating`  | Update rating       |
| GET    | `/api/v1/foodcards/:id/reviews` | Get product reviews |
| POST   | `/api/v1/foodcards/:id/reviews` | Add/update review   |

---

# Address APIs

| Method | Endpoint                        | Description         |
| ------ | ------------------------------- | ------------------- |
| POST   | `/api/v1/addresses`             | Create address      |
| GET    | `/api/v1/addresses`             | Get user addresses  |
| GET    | `/api/v1/addresses/default`     | Get default address |
| PUT    | `/api/v1/addresses/:id`         | Update address      |
| DELETE | `/api/v1/addresses/:id`         | Delete address      |
| PATCH  | `/api/v1/addresses/:id/default` | Set default address |

---

# Order APIs

| Method | Endpoint                          | Description           |
| ------ | --------------------------------- | --------------------- |
| POST   | `/api/v1/orders`                  | Create order          |
| POST   | `/api/v1/orders/razorpay/order`   | Create Razorpay order |
| POST   | `/api/v1/orders/razorpay/verify`  | Verify payment        |
| GET    | `/api/v1/orders/my`               | Get user's orders     |
| GET    | `/api/v1/orders/my/:id`           | Get order details     |
| GET    | `/api/v1/orders/admin`            | Get all orders        |
| PATCH  | `/api/v1/orders/admin/:id/status` | Update order status   |
| GET    | `/api/v1/orders/admin/reports`    | Get sales reports     |
| GET    | `/api/v1/orders/admin/analytics`  | Get analytics         |

---

# Inventory APIs

| Method | Endpoint             | Description                |
| ------ | -------------------- | -------------------------- |
| GET    | `/api/v1/stock/logs` | Get stock movement history |

---

# Feedback

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| POST   | `/api/v1/feedback` | Submit customer feedback |

---

# Database Models

## User

```text
User
├── fullname
├── email
├── password
├── favorites[]
├── createdAt
└── updatedAt
```

---

## Admin

```text
Admin
├── fullname
├── email
├── password
├── location
├── createdAt
└── updatedAt
```

---

## Product / FoodCard

The existing `FoodCard` model represents an e-commerce product.

```text
FoodCard
├── name
├── price
├── quantity
├── category
├── description
├── imageUrl
├── rating
├── reviewCount
├── reviews[]
├── isAvailable
├── admin
├── createdAt
└── updatedAt
```

> The model can be renamed from `FoodCard` to `Product` in a future refactor to better match the e-commerce domain.

---

## Order

```text
Order
├── user
├── customerName
├── customerPhone
├── items[]
│   ├── foodCard
│   ├── name
│   ├── category
│   ├── unitPrice
│   ├── quantity
│   └── lineTotal
├── paymentMethod
├── onlineMode
├── paidOnline
├── paymentProvider
├── paymentStatus
├── razorpayOrderId
├── razorpayPaymentId
├── razorpaySignature
├── subtotal
├── tax
├── total
├── status
├── statusTimeline[]
├── etaMinutes
├── etaAt
├── createdAt
└── updatedAt
```

---

## Address

```text
Address
├── user
├── fullName
├── phone
├── addressLine
├── city
├── state
├── pincode
├── landmark
├── isDefault
├── createdAt
└── updatedAt
```

---

## Feedback

```text
Feedback
├── name
├── email
├── message
├── createdAt
└── updatedAt
```

---

## BlackListToken

Used to invalidate logged-out JWT tokens.

```text
BlackListToken
├── token
└── createdAt
```

The token automatically expires after the configured TTL.

---

## StockLog

Tracks every important inventory movement.

```text
StockLog
├── foodCard
├── delta
├── quantityBefore
├── quantityAfter
├── changeType
├── reason
├── order
├── admin
├── user
├── createdAt
└── updatedAt
```

Possible change types:

```text
order_place
order_cancel
manual_update
admin_create
```

---

# Admin Dashboard

The admin dashboard provides an overview of the store.

Example dashboard sections:

```text
┌──────────────────────────────────────────┐
│              ADMIN DASHBOARD              │
├──────────┬──────────┬──────────┬─────────┤
│ Revenue  │ Orders   │ Products │ Users   │
├──────────┴──────────┴──────────┴─────────┤
│              Sales Overview               │
├───────────────────────┬──────────────────┤
│ Recent Orders         │ Low Stock        │
│                       │ Alerts            │
├───────────────────────┴──────────────────┤
│              Top Products                 │
└──────────────────────────────────────────┘
```

---

# Security

The application should follow these security practices:

* Never expose JWT secrets to the frontend.
* Never expose Razorpay secret keys.
* Store secrets only in environment variables.
* Validate all incoming API data.
* Authenticate protected routes.
* Authorize admin-only routes.
* Validate product IDs.
* Validate order quantities.
* Perform price calculations on the backend.
* Perform stock validation on the backend.
* Verify Razorpay payment signatures on the backend.
* Hash user and admin passwords.
* Configure CORS for trusted frontend origins.
* Add rate limiting to sensitive endpoints.
* Avoid returning sensitive user information in API responses.
* Do not commit `.env` files to Git.
* Validate uploaded image files.
* Restrict administrative operations to authenticated admins.

---

# Environment Variables

Never commit these values to Git:

```text
MONGODB_URI
REFRESH_TOKEN_SECRET
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RAZORPAY_KEY_SECRET
GOOGLE_CLIENT_ID
```

Use:

```text
.env
```

and add it to:

```text
.gitignore
```

Example:

```gitignore
node_modules/
.env
.env.local
.env.production
dist/
build/
*.log
```

---

# Production Build

## Backend

Install production dependencies:

```bash
cd Backend
npm install --omit=dev
```

Set production environment variables.

Start:

```bash
npm run start
```

---

# Frontend

Set:

```env
VITE_BASE_URL=https://your-backend-domain.com
```

Build:

```bash
cd Frontend
npm install
npm run build
```

The production files will be generated inside:

```text
Frontend/dist/
```

Deploy the `dist` directory to your preferred static hosting provider.

---

# Production Architecture

```text
                    ┌─────────────────┐
                    │     Customer    │
                    │ React + Vite    │
                    └────────┬────────┘
                             │
                             │ HTTPS
                             ▼
                    ┌─────────────────┐
                    │ Express Backend │
                    │ REST API        │
                    └───────┬─────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
       ┌──────────┐   ┌───────────┐  ┌───────────┐
       │ MongoDB  │   │ Cloudinary│  │ Razorpay  │
       │ Database │   │ Images    │  │ Payments  │
       └──────────┘   └───────────┘  └───────────┘
                            ▲
                            │
                    ┌───────┴────────┐
                    │ Admin Dashboard│
                    │ React + Vite   │
                    └────────────────┘
```

---

# Application Flow

```text
                    E-COMMERCE PLATFORM
                           │
          ┌────────────────┴────────────────┐
          │                                 │
       CUSTOMER                           ADMIN
          │                                 │
          ▼                                 ▼
       Login                            Login
          │                                 │
          ▼                                 ▼
      Products                         Dashboard
          │                                 │
          ├── Search                        ├── Products
          ├── Filter                        ├── Orders
          ├── Sort                          ├── Inventory
          └── Details                       ├── Reports
          │                                 └── Analytics
          ▼
       Cart
          │
          ▼
      Checkout
          │
          ├── Address
          ├── Tax
          └── Order Summary
          │
          ▼
       Payment
          │
          ▼
      Razorpay
          │
          ▼
   Payment Verification
          │
          ▼
       Order
          │
          ├── Inventory Update
          ├── Stock Log
          └── Order Timeline
          │
          ▼
    Order Tracking
          │
          ▼
      Delivered
          │
          ▼
     Review / Rating
```

---

# Common Scripts

## Backend

Development:

```bash
npm run dev
```

Production:

```bash
npm run start
```

## Frontend

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

# Deployment

For production deployment:

### Backend

1. Create a production MongoDB database.
2. Configure production environment variables.
3. Configure Cloudinary.
4. Configure Razorpay production credentials.
5. Configure Google OAuth production credentials.
6. Set the production frontend URL in `CORS_ORIGIN`.
7. Deploy the Express backend.
8. Enable HTTPS.
9. Verify all API endpoints.

Example:

```env
CORS_ORIGIN=https://your-ecommerce-frontend.com
```

### Frontend

Set:

```env
VITE_BASE_URL=https://your-ecommerce-backend.com
```

Then:

```bash
npm run build
```

Deploy:

```text
Frontend/dist/
```

---

# Production Checklist

Before deploying the application, verify:

* Authentication works
* Admin authentication works
* Google login works
* Product creation works
* Product image upload works
* Product update/delete works
* Search works
* Filters work
* Sorting works
* Cart persistence works
* Address management works
* Checkout works
* Razorpay payment works
* Payment signature verification works
* Orders are created only after successful payment
* Stock decreases correctly
* Stock restores correctly after cancellation
* Stock logs are generated
* Order status updates work
* ETA updates work
* Invoice generation works
* Reviews work only for eligible customers
* Favorites work
* Admin reports work
* Admin analytics work
* Low-stock alerts work
* CORS is configured correctly
* Production environment variables are configured
* `.env` is not committed
* API error handling is implemented
* Rate limiting is enabled
* HTTPS is enabled
* Frontend production build succeeds
* Backend production server starts successfully

---

# Future Improvements

Potential improvements for future versions include:

* Product pagination
* Advanced product filtering
* Coupon and discount system
* Promotional offers
* Multiple payment methods
* Refund management
* Email order notifications
* SMS notifications
* Push notifications
* Product variants such as size/color
* Product brands
* Category management
* Customer management
* Sales export to CSV/Excel
* Advanced admin charts
* Real-time order updates using WebSockets
* Redis caching
* Automated email invoices
* Delivery partner integration
* Product recommendations
* Recently viewed products
* Abandoned cart tracking
* Advanced search
* Elasticsearch integration for large catalogs

---

# License

This project is intended for educational and commercial development purposes. Add the appropriate license before distributing the source code publicly.
