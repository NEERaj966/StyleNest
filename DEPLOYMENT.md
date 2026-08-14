# Deployment Guide

## Architecture

- Deploy `Backend` as a Node web service.
- Deploy `Frontend` as a static site.
- Point `Frontend/VITE_BASE_URL` to the deployed backend URL.
- Allow the frontend origin in `Backend/CORS_ORIGIN`.

## Backend

### Required environment variables

Copy `Backend/.env.example` and set real values for:

- `PORT`
- `MONGODB_URI`
- `CORS_ORIGIN`
- `REFRESH_TOKEN_SECRET`
- `REFRESH_TOKEN_EXPIRY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `GOOGLE_CLIENT_ID`

### Commands

```bash
cd Backend
npm install
npm run start
```

### Notes

- `npm run start` now preloads `.env`, so production starts and local starts behave the same way.
- `CORS_ORIGIN` accepts a comma-separated list, which is useful for preview + production frontend URLs.
- Health check endpoint: `/api/v1/health`

## Frontend

### Required environment variables

Copy `Frontend/.env.example` and set:

- `VITE_BASE_URL`
- `VITE_GOOGLE_CLIENT_ID`

### Commands

```bash
cd Frontend
npm install
npm run build
```

### Notes

- Client-side routing needs a rewrite to `index.html`.
- Netlify-style rewrite file is included at `Frontend/public/_redirects`.
- Vercel rewrite config is included at `Frontend/vercel.json`.

## Deploy Order

1. Deploy the backend first.
2. Copy the backend public URL.
3. Set `Frontend/VITE_BASE_URL` to that URL.
4. Deploy the frontend.
5. Add the final frontend URL to `Backend/CORS_ORIGIN`.
6. Re-deploy the backend if you changed `CORS_ORIGIN`.

## Smoke Test

After deploy, verify:

- `GET /api/v1/health` returns success.
- Home page loads without console errors.
- User signup/login works.
- Admin signup/login works.
- Food cards load from the deployed API.
- Checkout works with Razorpay only if keys are configured.
