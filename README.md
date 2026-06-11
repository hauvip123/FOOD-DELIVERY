# HungerDash - Food Delivery Web App

HungerDash is a food delivery web application developed by me. The project simulates the workflow of a delivery platform with customers, restaurant owners, and administrators.

Users can browse restaurants, view dishes, add items to cart, place orders, make payments, leave reviews, save favorite restaurants, and chat with restaurants. The system also supports Google login, password reset by email, a restaurant management area, and an admin dashboard.

## Author

This is a personal project built by **Hau**.

## Main Features

- Customer: register, login, Google login, forgot password, browse restaurants and dishes, place orders, pay, review, save favorites, and chat.
- Restaurant owner: manage restaurants, dishes, orders, reviews, and customer messages.
- Admin: view system overview, manage users, update roles, activate/deactivate accounts, and manage restaurants.

## Demo Accounts

### Admin

Create or update the admin account:

```bash
cd backend
npm run seed:admin
```

Default login:

```text
Email: admin@hungerdash.local
Password: Admin@123
Role: admin
```

After login, the admin is redirected to:

```text
/admin
```

### Restaurant Owner

Create or update restaurant owner accounts:

```bash
cd backend
npm run seed:owners
```

Default password for all restaurant owner accounts:

```text
Password: Restaurant@123
Role: restaurant
```

Restaurant owner emails are generated with this format:

```text
<restaurant-name-slug>.<restaurantId>@restaurant.hungerdash.local
```

Example emails if the database is freshly seeded:

```text
bep.nang.sai.gon.1@restaurant.hungerdash.local
mi.lua.cho.lon.2@restaurant.hungerdash.local
green.bowl.lab.3@restaurant.hungerdash.local
tiem.nuoc.mo.4@restaurant.hungerdash.local
k.chicken.station.5@restaurant.hungerdash.local
```

Note: the number at the end is restaurantId, so it may be different depending on your database. Run npm run seed:owners to print the exact email list in the terminal.

After login, restaurant owners are redirected to:

```text
/manage
```

### Customer

Customers can register a new account at:

```text
/register
```

Or login with Google at:

```text
/login
```

## Run Locally

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Configure backend in backend/.env:

```env
MYSQLHOST=your-mysql-host
MYSQLPORT=4000
MYSQLUSER=your-mysql-user
MYSQLPASSWORD=your-mysql-password
MYSQLDATABASE=food
MYSQL_SSL=true
TYPEORM_SYNC=false
JWT_SECRET=your-strong-jwt-secret
FRONTEND_URL=http://localhost:3001
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM=HungerDash <your-gmail-address@gmail.com>
SMTP_TIMEOUT_MS=15000
RESEND_API_KEY=your-resend-api-key
RESEND_FROM=HungerDash <onboarding@resend.dev>
```

Configure frontend in frontend/.env.local:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Sync schema and seed data:

```bash
cd backend
npm run schema:sync
npm run seed
npm run seed:admin
npm run seed:owners
```

Run backend:

```bash
cd backend
npm run start:dev
```

Run frontend:

```bash
cd frontend
npm run dev
```

Frontend URL:

```text
http://localhost:3001
```

Backend URL:

```text
http://localhost:3000
```

## Configuration Notes

- Do not commit .env or .env.local because they contain sensitive values.
- For Google Login, create a Web application OAuth Client and add http://localhost:3001 to Authorized JavaScript origins.
- For password reset with Gmail, SMTP_PASS must be a Google App Password, not your normal Gmail password.
- Gmail SMTP uses port 587 with SMTP_SECURE=false for STARTTLS, or port 465 with SMTP_SECURE=true for SSL. If production logs show ETIMEDOUT at command CONN, the host cannot open an SMTP connection. Set RESEND_API_KEY and RESEND_FROM to send password reset emails through the Resend Email API instead of SMTP.
- In production, use a strong JWT_SECRET and do not enable TYPEORM_SYNC=true.

## Quick Deploy

Backend can be deployed on Render:

```text
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm run start:prod
```

Frontend can be deployed on Vercel:

```text
Root Directory: frontend
Install Command: npm ci
Build Command: npm run build
Output Directory: leave default
```

After deployment, update these variables:

```env
# Backend
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Frontend
NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Project Status

This project is suitable for demo, learning, and portfolio purposes. It can be extended with real-time delivery tracking, promo codes, revenue dashboards, and more detailed permission controls.
