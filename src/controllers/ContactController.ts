import { BaseController } from "./BaseController.ts";

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

      // Get Telegram bot token from environment
      const telegramToken = Deno.env.get("TELEGRAM_BOT_MESSAGE_TOKEN");
      if (!telegramToken) {
        console.error("Telegram bot token not found in environment variables");
        return this.sendError("Server configuration error", 500);
      }

      // Format message for Telegram
      const telegramMessage = `🔔 New Contact Form Submission\n\n👤 Name: ${fullname}\n📧 Email: ${email}\n💬 Message:\n${message}`;

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

      return this.sendSuccess({}, "Message sent successfully!");
    } catch (error) {
      console.error("Error processing contact form:", error);
      return this.sendError("Internal server error", 500);
    }
  }
}
