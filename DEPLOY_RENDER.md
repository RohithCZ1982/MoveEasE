# Deploying MoveEasE on Render

## Prerequisites

- GitHub account with this repo pushed to it
- [Neon](https://neon.tech) account (your existing database)
- [Render](https://render.com) account (free tier works)

---

## Step 1 — Push your code to GitHub

If not already done:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/moveease.git
git push -u origin main
```

---

## Step 2 — Create a Web Service on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **New → Web Service**
3. Connect your GitHub account and select the `moveease` repository
4. Fill in the settings:

| Field | Value |
|---|---|
| **Name** | `moveease` (or any name you like) |
| **Region** | Singapore (closest to your Neon DB in ap-southeast-1) |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | Free (or Starter for always-on) |

---

## Step 3 — Add Environment Variables

In Render → your service → **Environment**, add these variables:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon **pooled** connection string (from Neon console → Connection Details → Pooled connection) |
| `DIRECT_URL` | Your Neon **direct** connection string (non-pooled, used by Prisma migrations) |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://YOUR-APP-NAME.onrender.com` (your Render URL) |
| `NEXT_PUBLIC_APP_NAME` | `MoveEasE` |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-APP-NAME.onrender.com` |
| `NODE_VERSION` | `20` |

> **Where to find your Neon connection strings:**
> Neon Console → Your Project → Connection Details → toggle between "Pooled" and "Direct"

---

## Step 4 — Deploy

Click **Create Web Service**. Render will:
1. Pull your code from GitHub
2. Run `npm install && npx prisma generate && npm run build`
3. Start the app with `npm run start`

First deploy takes ~3–5 minutes. You can watch logs in real time on the Render dashboard.

---

## Step 5 — Verify

Once deployed, open `https://YOUR-APP-NAME.onrender.com` and:

- [ ] Login page loads
- [ ] Admin dashboard works
- [ ] Quotations / Invoices load
- [ ] PDF download works

---

## Updating the app

Every `git push` to `main` will automatically trigger a new deploy on Render (auto-deploy is on by default).

```bash
git add .
git commit -m "your changes"
git push
```

---

## Troubleshooting

**Build fails with Prisma error**
- Make sure `DIRECT_URL` is set and points to the non-pooled Neon connection string
- Check that `prisma/schema.prisma` has `directUrl = env("DIRECT_URL")` in the datasource block

**App crashes on start**
- Check Render logs (Dashboard → your service → Logs)
- Verify all environment variables are set correctly

**NEXTAUTH_URL mismatch**
- `NEXTAUTH_URL` must exactly match your Render URL including `https://`
- No trailing slash

**Free tier sleeps after inactivity**
- Render's free tier spins down after 15 minutes of no traffic; first request after sleep takes ~30 seconds
- Upgrade to **Starter ($7/mo)** for always-on service

---

## Notes

- Your Neon database is already hosted — no changes needed there
- Render free tier: 750 hours/month, sleeps after inactivity
- Custom domain: Render Dashboard → your service → Settings → Custom Domains
