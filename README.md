# Canteen Ordering System

A full-stack canteen ordering app with a React + Vite frontend and an Express + MongoDB backend. Users browse the menu, add items to a cart, place paid orders, and track order status. Admins manage menu items, monitor orders, and view sales reports.

## Features
- User signup/login with JWT auth
- Google sign-in (OAuth)
- Admin signup/login with JWT auth
- Menu browsing by category (breakfast, lunch, dinner)
- Cart with quantity updates and localStorage persistence
- Online payment form (UPI/Card) with client-side validation
- Order placement with tax calculation (5%)
- Order tracking for users (Placed, Preparing, Ready, Delivered, Cancelled)
- Order timeline and ETA updates
- Invoice PDF download
- Admin order management and status updates
- Inventory tracking per menu item
- Stock decreases on order placement and restores on cancellation
- Stock movement audit logs (inventory history)
- Favorites with one-click re-order
- Ratings & reviews on delivered items
- Admin dashboard with low-stock alerts and recent orders
- Admin reports: total sales, total orders, average order value, top items, sales by category, daily sales
- Admin analytics: peak hours, top customers
- Feedback submission endpoint
- Image upload for menu items (Cloudinary)

## Tech Stack
- Frontend: React, Vite, React Router, Axios, Tailwind CSS, jsPDF
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Multer, Cloudinary

## Project Structure
```
Backend/
  src/
    Controllers/
    DB/
    Middleware/
    Models/
    routes/
    utills/
    app.js
    index.js
Frontend/
  src/
    Componants/
    Context/
    Pages/
    assets/
    App.jsx
    main.jsx
```

## Setup

### 1) Backend
```
cd Backend
npm install
```

Create `Backend/.env`:
```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
REFRESH_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_EXPIRY=1d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GOOGLE_CLIENT_ID=your_google_client_id
```
Razorpay keys are required for the payment flow. If you do not have them yet, comment the Razorpay block in `Frontend/src/Pages/OrderPage.jsx` and use `POST /api/v1/orders` for direct order placement.

Run:
```
npm run dev
```

### 2) Frontend
```
cd Frontend
npm install
```

Create `Frontend/.env`:
```
VITE_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Run:
```
npm run dev
```

## Key Flows

### Order + Inventory Flow
- When a user places an order, the backend validates stock and decreases item quantity.
- If an admin cancels an order, the backend restores item quantities and marks items available.
- If a cancelled order is moved back to another status, stock is re-validated and reduced again.

### Auth Flow
- Users and admins receive JWT tokens on login.
- Tokens are stored in localStorage as `token` (user) and `adminToken` (admin).
- Protected backend routes require `Authorization: Bearer <token>`.
- Google sign-in uses the Google ID token and `/api/v1/users/google`.

### Razorpay Payment Flow
- Frontend requests a Razorpay order from `POST /api/v1/orders/razorpay/order`.
- User completes payment in Razorpay Checkout.
- Frontend sends `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` to `POST /api/v1/orders/razorpay/verify`.
- Backend verifies signature, creates the order, and updates stock.

### Favorites Flow
- User saves a menu item as a favorite.
- Favorites can be viewed on `/favorites`.
- Re-order any favorite in one click.

### Reviews Flow
- Users can submit reviews only for delivered orders.
- Review submission updates average rating and review count.

### Timeline + ETA Flow
- Admin updates status and ETA in the admin orders page.
- Users see the full status timeline and ETA on their orders.

## API Endpoints (Backend)

### Users
- `POST /api/v1/users/register` - Register user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/google` - Login/signup with Google
- `GET /api/v1/users/logout` - Logout user
- `GET /api/v1/users/userProfile` - Get user profile (auth)
- `GET /api/v1/users/favorites` - Get favorites (auth)
- `POST /api/v1/users/favorites/:foodCardId` - Add favorite (auth)
- `DELETE /api/v1/users/favorites/:foodCardId` - Remove favorite (auth)

### Admins
- `POST /api/v1/admins/register` - Register admin
- `POST /api/v1/admins/login` - Login admin
- `GET /api/v1/admins/logout` - Logout admin (auth)
- `GET /api/v1/admins/profile` - Admin profile (auth)
- `GET /api/v1/admins/public` - Public admin list

### Food Cards (Menu)
- `GET /api/v1/foodcards` - Public menu list
- `POST /api/v1/foodcards` - Create menu item (admin, multipart `image`)
- `GET /api/v1/foodcards/my` - Admin menu items
- `PUT /api/v1/foodcards/:id` - Update menu item (admin)
- `DELETE /api/v1/foodcards/:id` - Delete menu item (admin)
- `PATCH /api/v1/foodcards/:id/rating` - Update rating
- `GET /api/v1/foodcards/:id/reviews` - Get reviews
- `POST /api/v1/foodcards/:id/reviews` - Add/update review (auth)

### Orders
- `POST /api/v1/orders` - Create order (user)
- `POST /api/v1/orders/razorpay/order` - Create Razorpay order (user)
- `POST /api/v1/orders/razorpay/verify` - Verify Razorpay payment (user)
- `GET /api/v1/orders/my` - My orders (user)
- `GET /api/v1/orders/admin` - All orders (admin)
- `PATCH /api/v1/orders/admin/:id/status` - Update order status (admin)
- `GET /api/v1/orders/admin/reports` - Aggregated reports (admin)
- `GET /api/v1/orders/admin/analytics` - Analytics (admin)

### Stock
- `GET /api/v1/stock/logs` - Stock movement logs (admin)

### Feedback
- `POST /api/v1/feedback` - Submit feedback

## Model Structure (MongoDB)

### User
- `fullname` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `favorites` (ObjectId[] ref: FoodCard)
- `timestamps` (createdAt, updatedAt)

### Admin
- `fullname` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `location` (String, required)
- `timestamps` (createdAt, updatedAt)

### FoodCard (Menu Item)
- `name` (String, required)
- `price` (Number, required)
- `quantity` (Number, required, default 0)
- `category` (Enum: Breakfast, Lunch, Dinner, Snacks, Beverages, Other)
- `description` (String)
- `imageUrl` (String)
- `rating` (Number, 0-5)
- `reviewCount` (Number)
- `reviews` (Array: user, name, rating, comment, createdAt)
- `isAvailable` (Boolean)
- `admin` (ObjectId ref: Admin)
- `timestamps` (createdAt, updatedAt)

### Order
- `user` (ObjectId ref: User)
- `customerName` (String)
- `customerPhone` (String)
- `items` (Array):
- `items.foodCard` (ObjectId ref: FoodCard)
- `items.name` (String)
- `items.category` (String)
- `items.unitPrice` (Number)
- `items.quantity` (Number)
- `items.lineTotal` (Number)
- `paymentMethod` (Enum: online)
- `onlineMode` (Enum: upi, card, '')
- `paidOnline` (Boolean)
- `paymentProvider` (Enum: manual, razorpay)
- `paymentStatus` (Enum: pending, paid, failed, refunded)
- `razorpayOrderId` (String)
- `razorpayPaymentId` (String)
- `razorpaySignature` (String)
- `subtotal` (Number)
- `tax` (Number)
- `total` (Number)
- `status` (Enum: Placed, Preparing, Ready, Delivered, Cancelled)
- `statusTimeline` (Array: status, at, note, by)
- `etaMinutes` (Number)
- `etaAt` (Date)
- `timestamps` (createdAt, updatedAt)

### Feedback
- `name` (String)
- `email` (String)
- `message` (String)
- `timestamps` (createdAt, updatedAt)

### BlackListToken
- `token` (String, unique)
- `createdAt` (Date, expires in 24 hours)

### StockLog
- `foodCard` (ObjectId ref: FoodCard)
- `delta` (Number)
- `quantityBefore` (Number)
- `quantityAfter` (Number)
- `changeType` (Enum: order_place, order_cancel, manual_update, admin_create)
- `reason` (String)
- `order` (ObjectId ref: Order)
- `admin` (ObjectId ref: Admin)
- `user` (ObjectId ref: User)
- `timestamps` (createdAt, updatedAt)

## Notes
- Order statuses: `Placed`, `Preparing`, `Ready`, `Delivered`, `Cancelled`.
- All money values are calculated server-side and returned in the order response.

## Common Scripts
- Backend: `npm run dev`, `npm run start`
- Frontend: `npm run dev`, `npm run build`, `npm run preview`

## Deployment

For a step-by-step deployment checklist, see `DEPLOYMENT.md`.

### Backend
1. Set production environment variables in `Backend/.env`.
1. Set `CORS_ORIGIN` to your frontend domain (e.g., `https://your-frontend.com`).
1. Install dependencies and start the server:
```
cd Backend
npm install --omit=dev
npm run start
```

### Frontend
1. Set `VITE_BASE_URL` to your backend URL in `Frontend/.env`.
1. Build the app:
```
cd Frontend
npm install
npm run build
```
1. Deploy the generated `Frontend/dist` folder to any static hosting provider.
