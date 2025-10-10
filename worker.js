export default {
  fetch(request, _env, _ctx) {
    const url = new URL(request.url);
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response('OK', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Status endpoint
    if (url.pathname === '/status') {
      return new Response(JSON.stringify({
        status: 'active',
        timestamp: new Date().toISOString(),
        handlers: ['email', 'fetch']
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Default response for other requests
    return new Response('Cloudflare Email Worker', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  },

  async email(message, env, _ctx) {
    try {
      console.log("📧 Processing incoming email...");
      console.log("📧 Message from:", message.from);
      console.log("📧 Message to:", message.to);

      // Extract email content and metadata
      let body = "";
      let html = null;
      
      try {
        body = await message.text() || "";
        console.log("📧 Email body extracted, length:", body.length);
      } catch (e) {
        console.error("❌ Failed to extract email text:", e);
      }
      
      try {
        html = await message.raw();
        console.log("📧 Email HTML extracted");
      } catch (e) {
        console.log("📧 No HTML content or failed to extract HTML:", e.message);
        html = null;
      }

      const emailData = {
        from: message.from,
        to: message.to,
        subject: message.headers.get("subject") || "No Subject",
        body: body,
        html: html,
        headers: Object.fromEntries(message.headers.entries()),
        timestamp: Date.now(),
        messageId: message.headers.get("message-id") || `worker-${Date.now()}`,
      };

      console.log("📧 Extracted email data:", JSON.stringify({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        bodyLength: emailData.body.length,
        timestamp: emailData.timestamp
      }));

      // Get configuration from environment variables
      const webhookUrl = env.WEBHOOK_URL || "https://portfolio.leondev.me";
      const webhookToken = env.WEBHOOK_TOKEN;

      console.log("🔧 Using webhook URL:", webhookUrl);
      console.log("🔧 Token configured:", !!webhookToken);

      if (!webhookUrl) {
        throw new Error("WEBHOOK_URL environment variable is required");
      }

      const webhookEndpoint = `${webhookUrl}/webhooks/email`;
      const headers = {
        "Content-Type": "application/json",
      };

      // Add authentication if token is provided
      if (webhookToken) {
        headers["Authorization"] = `Bearer ${webhookToken}`;
      }

      console.log(`📤 Forwarding email to webhook: ${webhookEndpoint}`);

      const response = await fetch(webhookEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webhook failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Email processed successfully:", result);

      return new Response("Email processed successfully", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    } catch (error) {
      console.error("❌ Error processing email:", error);

      // Return error response but don't fail the email delivery
      return new Response(`Error processing email: ${error.message}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  },
};
