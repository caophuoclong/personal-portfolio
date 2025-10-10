# Cloudflare Email Worker Configuration

## Overview

The `worker.js` file implements a Cloudflare Worker that processes incoming emails and forwards them to your main portfolio server's webhook endpoint for storage and notification.

## Features

- ✅ Processes incoming emails sent to your custom domain
- ✅ Extracts email metadata (from, to, subject, headers)
- ✅ Forwards email data to your main server via webhook
- ✅ Includes authentication with Bearer token
- ✅ Comprehensive error handling and logging
- ✅ Preserves email content in both text and HTML formats

## Setup Instructions

### 1. Prerequisites

- Cloudflare account with Email Routing enabled
- Custom domain configured in Cloudflare
- Main portfolio server deployed (e.g., on Deno Deploy)

### 2. Environment Variables

Configure these environment variables in your Cloudflare Worker:

```bash
# Required: The URL of your main portfolio server
WEBHOOK_URL=https://your-portfolio-domain.com

# Optional: Authentication token for secure webhook communication
WEBHOOK_TOKEN=your-secure-webhook-token-here
```

**To set environment variables in Cloudflare Workers:**

1. Go to Cloudflare Dashboard > Workers & Pages
2. Select your worker
3. Go to Settings > Environment Variables
4. Add the variables above

### 3. Cloudflare Email Routing Setup

1. **Enable Email Routing**:

   - Go to Cloudflare Dashboard > Email > Email Routing
   - Enable Email Routing for your domain

2. **Configure Catch-All Rule**:

   - Create a catch-all rule: `*@yourdomain.com`
   - Action: "Send to Worker"
   - Select your deployed worker

3. **Deploy the Worker**:

   ```bash
   # If using Wrangler CLI
   npx wrangler deploy worker.js
   ```

### 4. DNS Configuration

Ensure your domain has the required MX records (Cloudflare adds these automatically when Email Routing is enabled):

```text
Priority 10: isaac.mx.cloudflare.net
Priority 20: linda.mx.cloudflare.net
Priority 30: amir.mx.cloudflare.net
```

### 5. Testing

Test your email setup:

1. Send an email to `test@yourdomain.com`
2. Check Cloudflare Worker logs
3. Verify the email appears in your portfolio server logs
4. Check if Telegram notification is sent (if configured)

## Webhook Payload Format

The worker sends the following JSON payload to your webhook endpoint:

```json
{
  "from": "sender@example.com",
  "to": "contact@yourdomain.com",
  "subject": "Email Subject",
  "body": "Plain text email content",
  "html": "HTML email content (if available)",
  "headers": {
    "message-id": "<unique-message-id>",
    "date": "Wed, 10 Oct 2025 12:00:00 GMT",
    "content-type": "text/plain; charset=utf-8"
  },
  "timestamp": 1728561600000,
  "messageId": "unique-message-identifier"
}
```

## Security Considerations

1. **Authentication**: Use the `WEBHOOK_AUTH_TOKEN` to secure webhook communication
2. **Domain Verification**: Only process emails for your verified domains
3. **Rate Limiting**: Consider implementing rate limiting in your main server
4. **Content Filtering**: Add spam filtering if needed

## Troubleshooting

### Common Issues

1. **Worker Not Receiving Emails**:

   - Verify Email Routing is enabled
   - Check MX records are properly configured
   - Ensure catch-all rule is pointing to your worker

2. **Webhook Failures**:

   - Check `WEBHOOK_URL` is correct and accessible
   - Verify `WEBHOOK_AUTH_TOKEN` matches your server configuration
   - Review Cloudflare Worker logs for specific errors

3. **Missing Email Content**:
   - Some email clients send multipart messages
   - The worker handles both text and HTML content
   - Check server logs for parsing issues

### Debug Commands

```bash
# View worker logs
npx wrangler tail

# Test webhook endpoint
curl -X POST https://your-domain.com/webhooks/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"from":"test@example.com","to":"contact@yourdomain.com","subject":"Test","body":"Test message"}'
```

## Worker Endpoints

The worker provides these HTTP endpoints for monitoring:

- `GET /health` - Returns "OK" for health checks
- `GET /status` - Returns JSON with worker status and capabilities
- All other requests return basic worker information

## Integration with Portfolio Server

The worker integrates with your Deno-based portfolio server:

- Emails are stored in KV database via `WebhookController.ts`
- Telegram notifications are sent automatically
- Email data is accessible through admin APIs
- Contact form and email messages are unified in the same system

## Performance Notes

- Worker processes emails near-instantly
- Webhook calls typically complete in < 200ms
- Failed webhook calls are logged but don't block email processing
- Consider implementing retry logic for critical notifications
