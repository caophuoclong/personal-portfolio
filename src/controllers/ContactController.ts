import { BaseController } from "./BaseController.ts";
import { getKVStore, ContactMessage } from "../db/kvStore.ts";

interface ContactFormData {
  fullname: string;
  email: string;
  message: string;
}

export class ContactController extends BaseController {
  async submitContact(req: Request): Promise<Response> {
    try {
      const body = (await req.json()) as ContactFormData;
      const { fullname, email, message } = body;

      console.log("Received contact form submission:", body);

      // Validate required fields
      if (!fullname || !email || !message) {
        return this.sendError("All fields are required", 400);
      }

      // Store in KV database first
      const kvStore = await getKVStore();

      const contactData: Omit<ContactMessage, "id" | "timestamp"> = {
        fullname,
        email,
        message,
        source: "contact-form",
        ipAddress: this.getClientIP(req),
        userAgent: req.headers.get("User-Agent") || undefined,
      };

      const contactId = await kvStore.storeContactMessage(contactData);
      console.log(`💬 Stored contact message with ID: ${contactId}`);

      // Get Telegram bot token from environment
      const telegramToken = Deno.env.get("TELEGRAM_BOT_MESSAGE_TOKEN");
      if (!telegramToken) {
        console.error("Telegram bot token not found in environment variables");
        return this.sendError("Server configuration error", 500);
      }

      // Format message for Telegram (include contact ID)
      const telegramMessage = `🔔 New Contact Form Submission\n\n👤 Name: ${fullname}\n📧 Email: ${email}\n🆔 ID: ${contactId}\n💬 Message:\n${message}`;

      // Get chat ID from environment
      const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
      if (!chatId) {
        console.error("Telegram chat ID not found in environment variables");
        return this.sendError("Server configuration error", 500);
      }

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
        console.error("Failed to send Telegram message:", await telegramResponse.text());
        return this.sendError("Failed to send message", 500);
      }

      return this.sendSuccess({ contactId }, "Message sent successfully!");
    } catch (error) {
      console.error("Error processing contact form:", error);
      return this.sendError("Internal server error", 500);
    }
  }

  /**
   * Get client IP address from request headers
   */
  private getClientIP(req: Request): string | undefined {
    // Check common headers used by proxies and load balancers
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }

    const realIP = req.headers.get("x-real-ip");
    if (realIP) {
      return realIP;
    }

    const cfConnectingIP = req.headers.get("cf-connecting-ip");
    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    // Note: In Deno Deploy, the actual remote address is not directly accessible
    return undefined;
  }
}
