# Feat Trader — ICT+ Mentorship Platform

Professional trading mentorship platform for the **ICT+ Mentorship Program**, built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **MongoDB Atlas**, **Razorpay**, and community delivery via Telegram.

## Features

- JWT authentication (signup, login, protected Feat Trader Dashboard)
- Razorpay checkout for ICT+ Mentorship access (UPI, cards, net banking, wallets)
- Server-side payment verification + webhook signature validation
- Private community invite after successful payment
- 6-month mentorship access with automatic expiry handling
- Daily cron jobs (expiry, invite cleanup, stale payments)
- Feat Trader Admin panel with analytics, invites, and member management
- Premium black / dark green trading mentorship UI

## Folder Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # signup, login, logout, me
│   │   │   ├── payments/      # create-order, verify
│   │   │   ├── webhooks/      # razorpay, telegram
│   │   │   ├── cron/          # expire-subscriptions, clean-invites, check-payments
│   │   │   ├── admin/         # users, payments, analytics, etc.
│   │   │   └── user/          # profile
│   │   ├── dashboard/         # Feat Trader Dashboard
│   │   ├── admin/             # Feat Trader Admin
│   │   ├── login, signup, pricing, mentorship
│   │   └── page.tsx           # landing
│   ├── components/
│   ├── content/               # brand + ICT+ curriculum content
│   ├── lib/                   # auth, db, razorpay, telegram, fulfillment
│   ├── models/
│   └── middleware.ts
├── .env.example
├── vercel.json
└── package.json
```

## Quick Start

> **Note:** If your project folder path contains special characters (e.g. `+`), local `npm run build` may fail due to a webpack CSS loader quirk. Use a simple path or deploy directly to Vercel.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` (see [Environment Variables](#environment-variables)).

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Min 32 characters for JWT signing |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signing secret from Razorpay dashboard |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather (community delivery) |
| `TELEGRAM_CHAT_ID` | Private mentorship channel ID |
| `TELEGRAM_WEBHOOK_SECRET` | Secret token for webhook validation |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g. `https://yourapp.vercel.app`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as RAZORPAY_KEY_ID (client-side) |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `CRON_SECRET` | Secret for Vercel cron authorization |
| `SUBSCRIPTION_AMOUNT_PAISE` | Price in paise (99900 = ₹999) |

---

## Community Channel Setup (Telegram)

Technical setup for delivering private mentorship community access after payment.

### 1. Create a Telegram Bot (BotFather)

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Choose a display name (e.g. `Feat Trader Community Bot`)
4. Choose a username ending in `bot`
5. Copy the **bot token** to `TELEGRAM_BOT_TOKEN`

### 2. Create a Private Mentorship Channel

1. In Telegram: **New Channel** → set name → set to **Private**
2. This is your Feat Trader Community mentorship channel

### 3. Add Bot as Channel Admin

Grant: Invite users via link, Ban users.

### 4. Get Chat ID

Forward a channel message to @getidsbot or use `getUpdates` API. Set `TELEGRAM_CHAT_ID`.

### 5. Configure Telegram Webhook

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://YOUR_DOMAIN/api/webhooks/telegram",
    "secret_token": "YOUR_TELEGRAM_WEBHOOK_SECRET",
    "allowed_updates": ["chat_member", "message"]
  }'
```

### 6. MongoDB, Razorpay, Vercel

See previous sections in this README for Atlas, Razorpay webhooks, and Vercel deployment.

---

## Payment Flow

```
User → Create Order → Razorpay Checkout → Payment Success
  → Server verify + Webhook
  → fulfillPayment() → community invite
  → Dashboard shows invite link
```

---

## Cron Jobs

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/cron/expire-subscriptions` | Daily | Expire mentorship access |
| `/api/cron/clean-invites` | Every 6 hours | Revoke expired invites |
| `/api/cron/check-payments` | Every 4 hours | Reconcile pending payments |

---

## Admin Access

Set `ADMIN_EMAILS=you@example.com` and sign in to access **Feat Trader Admin** at `/admin`.

---

## License

MIT
