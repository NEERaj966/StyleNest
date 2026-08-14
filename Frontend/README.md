# Canteen Frontend

React + Vite frontend for the Canteen Ordering System. Users browse the menu, add to cart, place orders, manage favorites, and download invoices. Admins have their own dashboard routes.

## Setup
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

Build:
```
npm run build
```

Preview:
```
npm run preview
```

## Routes
- `/` Home
- `/breakfast`, `/lunch`, `/dinner` Menu categories
- `/orders` Checkout + order tracking
- `/favorites` Saved items
- `/admin` Admin dashboard
- `/admin/orders` Admin orders + ETA
- `/admin/reports` Reports + analytics
- `/admin/stock-logs` Stock audit logs

## Notes
- Set `VITE_BASE_URL` to your backend URL in production.
- Set `VITE_GOOGLE_CLIENT_ID` for Google sign-in.
- Razorpay payment requires backend keys; otherwise comment out the Razorpay flow in `Frontend/src/Pages/OrderPage.jsx`.
