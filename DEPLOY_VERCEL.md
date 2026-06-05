# Deploy frontend to Vercel

This repo is split into `frontend` and `backend`. Deploy the Next.js app from the `frontend` folder on Vercel.

## Vercel project settings

- Framework Preset: Next.js
- Root Directory: `frontend`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: leave default

## Environment variables

Set this in Vercel Project Settings -> Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

Do not use `localhost` in production. The frontend calls restaurants, dishes, and categories from this API URL.

## Backend note

The NestJS backend uses MySQL and should be deployed to a server platform such as Render, Railway, Fly.io, or a VPS. After backend deployment, set its CORS variable to your Vercel frontend domain:

```bash
FRONTEND_URL=https://your-vercel-app.vercel.app
```

Then seed production data if needed:

```bash
cd backend
npm run seed
```
