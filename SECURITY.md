# Feat Trader — Security Summary

Last updated after production hardening pass.

## Required environment variables (production)

| Variable | Server-only? | Notes |
|----------|--------------|-------|
| `MONGODB_URI` | Yes | Never use `NEXT_PUBLIC_` |
| `JWT_SECRET` | Yes | Min 32 chars; app fails in prod if missing |
| `RAZORPAY_KEY_SECRET` | Yes | |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | |
| `TELEGRAM_BOT_TOKEN` | Yes | |
| `TELEGRAM_CHAT_ID` | Yes | |
| `TELEGRAM_WEBHOOK_SECRET` | Yes | Set when registering Telegram webhook |
| `CRON_SECRET` | Yes | Vercel cron `Authorization: Bearer` |
| `ADMIN_EMAILS` | Yes | Comma-separated allowlist |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **Exposed to browser** | Expected (Razorpay public key) |
| `NEXT_PUBLIC_APP_URL` | **Exposed** | Expected |

## Telegram webhook setup (with secret)

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://YOUR_DOMAIN/api/webhooks/telegram",
    "secret_token": "YOUR_TELEGRAM_WEBHOOK_SECRET",
    "allowed_updates": ["chat_member"]
  }'
```

## Implemented controls

- Razorpay: HMAC signature + server fetch + `captured` status + amount/order/currency match
- Webhook replay: `WebhookEvent` collection deduplicates Razorpay event IDs
- Fulfillment lock: atomic `fulfillmentState` prevents duplicate invites/subscriptions
- Telegram webhook: `X-Telegram-Bot-Api-Secret-Token` + chat ID validation
- Auth: httpOnly cookie, no JWT secret fallback in production
- CSRF: Origin/Referer check on cookie-authenticated POST/PATCH in production
- Admin: `requireAdmin()` on all admin APIs + ObjectId validation
- Headers: global security headers via `next.config.ts`
- API responses: `Cache-Control: no-store` on sensitive endpoints
