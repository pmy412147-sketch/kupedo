# Stripe Setup Guide - Coin Purchase System

This guide will help you configure Stripe payments for the coin purchase functionality in your Kupado application.

## Overview

The coin purchase system is fully implemented and ready to use. You only need to configure Stripe API keys to enable payments. Once configured, users will be able to:

- Purchase coin packages through Stripe Checkout
- Pay securely with credit/debit cards
- Receive coins automatically after successful payment
- View transaction history

## Prerequisites

1. A Stripe account (create one at [stripe.com](https://stripe.com))
2. Access to your Supabase project dashboard
3. Access to your `.env` file

## Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" or "Sign up"
3. Complete the registration process
4. Verify your email address

## Step 2: Get Your Stripe API Keys

### For Testing (Development Mode)

1. Log in to your Stripe Dashboard
2. Make sure you're in **Test mode** (toggle in the top right)
3. Navigate to **Developers > API keys**
4. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### For Production (Live Mode)

1. Complete your Stripe account activation
2. Switch to **Live mode** (toggle in the top right)
3. Navigate to **Developers > API keys**
4. Copy the following keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

## Step 3: Configure Webhook

The webhook is already deployed as a Supabase Edge Function. You just need to register it with Stripe.

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://pgktuyehfwwsjqbvndjs.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen to:
   - `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

## Step 4: Add Environment Variables

Add the following variables to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Important Notes:

- For **development**: Use test keys (pk_test_ and sk_test_)
- For **production**: Use live keys (pk_live_ and sk_live_)
- Never commit your `.env` file to version control
- Replace `http://localhost:3000` with your actual production URL when deploying

## Step 5: Configure Supabase Edge Function Environment Variables

The webhook Edge Function needs access to Stripe keys:

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions**
3. Click on **stripe-webhook**
4. Go to **Environment Variables** section
5. Add these variables:
   ```
   STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
   ```

Note: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically provided.

## Step 6: Test the Integration

### Using Test Cards

Stripe provides test card numbers for testing:

| Card Number         | Description           |
|--------------------|-----------------------|
| 4242 4242 4242 4242 | Successful payment    |
| 4000 0000 0000 0002 | Card declined         |
| 4000 0000 0000 9995 | Payment requires auth |

**Test card details:**
- Use any future expiration date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any postal code (e.g., 12345)

### Testing Steps

1. Start your development server: `npm run dev`
2. Log in to your application
3. Navigate to the Coins page (`/mince`)
4. Click "Kúpiť teraz" on any package
5. You should be redirected to Stripe Checkout
6. Enter test card details
7. Complete the payment
8. You should be redirected back with a success message
9. Your coin balance should update within a few seconds

## Step 7: Verify Webhook Delivery

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click on your webhook endpoint
3. Check the **Recent deliveries** section
4. You should see successful `checkout.session.completed` events

## Troubleshooting

### "Stripe platby" notification appears

This means the Stripe publishable key is not configured. Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to your `.env` file.

### Coins not credited after payment

1. Check Supabase logs for the stripe-webhook function
2. Verify webhook secret is correct
3. Ensure webhook endpoint is registered in Stripe
4. Check that `checkout.session.completed` event is selected

### Webhook signature verification failed

The `STRIPE_WEBHOOK_SECRET` is incorrect. Get the correct signing secret from Stripe Dashboard > Webhooks > Your endpoint > Signing secret.

### Payment succeeds but webhook not called

1. Verify webhook URL is correct
2. Check that webhook endpoint is registered in Stripe
3. Ensure Supabase Edge Function is deployed (it already is)

## Going to Production

When you're ready to accept real payments:

1. Complete your Stripe account activation
2. Update environment variables with live keys (pk_live_ and sk_live_)
3. Update webhook endpoint if your domain changed
4. Set `NEXT_PUBLIC_SITE_URL` to your production URL
5. Test with a small real transaction
6. Monitor webhook deliveries in Stripe Dashboard

## Support

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: Available in Stripe Dashboard
- **Test Cards**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

## Security Notes

- Never expose your secret key (`STRIPE_SECRET_KEY`) in client-side code
- Always use environment variables for sensitive data
- Verify webhook signatures to prevent fraudulent requests
- Use HTTPS in production
- Keep your Stripe keys secure and rotate them if compromised
