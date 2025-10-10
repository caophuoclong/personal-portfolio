import { BaseController } from "./BaseController.ts";
import { getKVStore, EmailMessage } from "../db/kvStore.ts";

interface CloudflareEmailWebhook {
  from: string;
  to: string;
  subject: string;
  body: string;
  html?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    name: string;
    content: string;
    contentType: string;
  }>;
  timestamp?: number;
  messageId?: string;
}

export class WebhookController extends BaseController {
  /**
   * Handle incoming email webhook from Cloudflare Worker
   */
  async handleEmailWebhook(req: Request): Promise<Response> {
    try {
      // Verify the request method
      if (req.method !== "POST") {
        return this.sendError("Method not allowed", 405);
      }

      // Optional: Verify webhook signature/auth token for security
      const authHeader = req.headers.get("Authorization");
      const expectedToken = Deno.env.get("WEBHOOK_AUTH_TOKEN");

      if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
        console.warn("Unauthorized webhook attempt");
        return this.sendError("Unauthorized", 401);
      }

      // Parse the webhook payload
      const payload = (await req.json()) as CloudflareEmailWebhook;

      // Validate required fields
      if (!payload.from || !payload.to || !payload.subject) {
        return this.sendError("Missing required fields: from, to, subject", 400);
      }

      console.log("📧 Received email webhook:", {
        from: payload.from,
        to: payload.to,
        subject: payload.subject,
        timestamp: payload.timestamp,
      });

      // Store the email in KV database
      const kvStore = await getKVStore();

      const emailData: Omit<EmailMessage, "id" | "timestamp"> = {
        from: payload.from,
        to: payload.to,
        subject: payload.subject,
        body: payload.body || "",
        html: payload.html,
        source: "cloudflare-worker",
        metadata: {
          headers: payload.headers,
          attachments: payload.attachments,
          messageId: payload.messageId,
          originalTimestamp: payload.timestamp,
        },
      };

      const emailId = await kvStore.storeEmail(emailData);

      // Optional: Send notification to Telegram (similar to contact form)
      if (Deno.env.get("TELEGRAM_BOT_MESSAGE_TOKEN") && Deno.env.get("TELEGRAM_CHAT_ID")) {
        await this.sendTelegramNotification(payload, emailId);
      }

      return this.sendSuccess({ emailId }, "Email processed and stored successfully");
    } catch (error) {
      console.error("Error processing email webhook:", error);
      return this.sendError("Internal server error", 500);
    }
  }

  /**
   * Test endpoint to verify webhook is working
   */
  pingWebhook(req: Request): Response {
    return this.sendSuccess({
      message: "Webhook endpoint is working",
      timestamp: new Date().toISOString(),
      method: req.method,
      userAgent: req.headers.get("User-Agent"),
    });
  }

  /**
   * Get webhook status and statistics
   */
  async getWebhookStatus(_req: Request): Promise<Response> {
    try {
      const kvStore = await getKVStore();
      const stats = await kvStore.getStats();

      return this.sendSuccess({
        status: "healthy",
        statistics: stats,
        lastChecked: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error getting webhook status:", error);
      return this.sendError("Failed to get webhook status", 500);
    }
  }

  /**
   * Send Telegram notification for incoming emails
   */
  private async sendTelegramNotification(email: CloudflareEmailWebhook, emailId: string): Promise<void> {
    try {
      const telegramToken = Deno.env.get("TELEGRAM_BOT_MESSAGE_TOKEN");
      const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

      if (!telegramToken || !chatId) {
        console.warn("Telegram configuration missing, skipping notification");
        return;
      }

      const telegramMessage =
        `📧 New Email Received\n\n` +
        `📨 From: ${email.from}\n` +
        `📧 To: ${email.to}\n` +
        `📋 Subject: ${email.subject}\n` +
        `🆔 ID: ${emailId}\n` +
        `⏰ Time: ${new Date().toLocaleString()}\n\n` +
        `💬 Preview: ${email.body?.substring(0, 200)}${email.body && email.body.length > 200 ? "..." : ""}`;

      const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

      const telegramResponse = await fetch(telegramUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: "HTML",
        }),
      });

      if (!telegramResponse.ok) {
        console.error("Failed to send Telegram notification:", await telegramResponse.text());
      } else {
        console.log("✅ Telegram notification sent for email:", emailId);
      }
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
    }
  }
}
