function parseEmailBody(rawContent) {
  try {
    console.log(`📧 Parsing email body (${rawContent.length} chars)...`);

    // First, try to find MIME boundaries in headers or content
    const boundaryMatch = rawContent.match(/boundary[=:][\s]*["']?([^"'\s;]+)/i);

    if (boundaryMatch) {
      const boundary = boundaryMatch[1];
      console.log(`📧 Found MIME boundary: ${boundary}`);

      // Split by boundary and find text/plain parts
      const parts = rawContent.split(`--${boundary}`);

      for (const part of parts) {
        // Look for text/plain content type
        if (part.includes("Content-Type: text/plain")) {
          // Find the actual content after headers (double line break)
          const contentMatch = part.match(/\r?\n\r?\n([\s\S]*?)$/);
          if (contentMatch) {
            let content = contentMatch[1].trim();
            // Remove any trailing boundary markers or -- endings
            content = content.replace(/\r?\n--.*$/, "").trim();
            if (content) {
              console.log(`✅ Extracted plain text content: "${content}"`);
              return content;
            }
          }
        }
      }
    }

    // Try to detect boundary from the content itself (like your example)
    const inlineBoundaryMatch = rawContent.match(/^--([a-zA-Z0-9]+)/);
    if (inlineBoundaryMatch) {
      const boundary = inlineBoundaryMatch[1];
      console.log(`📧 Found inline boundary: ${boundary}`);

      // Look for text/plain section
      const textPlainMatch = rawContent.match(/Content-Type:\s*text\/plain[^\r\n]*\r?\n(?:[^\r\n]*\r?\n)*\r?\n([\s\S]*?)(?=\r?\n--|\r?\n\.\r?\n|$)/i);
      if (textPlainMatch) {
        const content = textPlainMatch[1].trim();
        console.log(`✅ Extracted inline plain text: "${content}"`);
        return content;
      }
    }

    // Fallback: try to extract content after first double line break
    const simpleMatch = rawContent.match(/\r?\n\r?\n([\s\S]*?)(?=\r?\n--|\r?\n\.\r?\n|$)/);
    if (simpleMatch) {
      let content = simpleMatch[1].trim();
      // Clean up common email artifacts
      content = content
        .replace(/--[a-zA-Z0-9]+.*$/gm, "") // Remove boundary lines
        .replace(/Content-Type:.*$/gm, "") // Remove content-type lines
        .replace(/Content-Transfer-Encoding:.*$/gm, "") // Remove encoding lines
        .replace(/^\s*\r?\n/gm, "") // Remove empty lines at start
        .trim();

      if (content) {
        console.log(`✅ Extracted content (fallback): "${content}"`);
        return content;
      }
    }

    // Last resort: return raw content with some cleanup
    console.warn("⚠️ Could not parse email body properly, returning cleaned raw content");
    const cleanedContent = rawContent
      .replace(/--[a-zA-Z0-9]+.*$/gm, "")
      .replace(/Content-Type:.*$/gm, "")
      .replace(/Content-Transfer-Encoding:.*$/gm, "")
      .replace(/^\s*\r?\n/gm, "")
      .trim();

    console.log(`⚠️ Returning cleaned content: "${cleanedContent}"`);
    return cleanedContent;
  } catch (error) {
    console.error("❌ Error parsing email body:", error);
    return rawContent; // Return raw content as fallback
  }
}

export default {
  async email(message, _env, _ctx) {
    try {
      console.log("📧 Processing incoming email...");

      // Validate required message properties
      if (!message.from || !message.to) {
        message.setReject("Missing required From or To address");
        return;
      }

      // Read the raw email stream
      let rawContent = "";
      let emailBody = "";

      try {
        // Read the raw stream
        if (message.raw) {
          const reader = message.raw.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            rawContent += decoder.decode(value, { stream: true });
          }

          // Parse email content from MIME format
          emailBody = parseEmailBody(rawContent);
        }
      } catch (error) {
        console.warn("⚠️ Error reading raw email content:", error);
      }

      // Extract email content and metadata
      const emailData = {
        from: message.from,
        to: message.to,
        subject: message.headers.get("subject") || "No Subject",
        body: emailBody,
        rawContent: rawContent,
        rawSize: message.rawSize || 0,
        headers: Object.fromEntries(message.headers.entries()),
        timestamp: Date.now(),
        messageId: message.headers.get("message-id") || `worker-${Date.now()}`,
      };

      // Forward to the main server's webhook endpoint
      const webhookUrl = "https://portfolio.leondev.me";
      const webhookToken = "2uL3xHdc7bBzDN9FQgCbQTDC8aH6vixRKMffUnDDLXBd29oBssFckgtbx";
      const _forwardToEmail = "caophuoclong.se@gmail.com"; // Optional: forward to a specific email address

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
        console.error(`❌ Webhook failed: ${response.status} - ${errorText}`);

        // Reject the email with a proper SMTP error
        message.setReject(`Server error: Unable to process email (${response.status})`);
        return;
      }

      const result = await response.json();
      console.log("✅ Email processed successfully:", result);

      // Email was processed successfully - no response needed for email handler
    } catch (error) {
      console.error("❌ Error processing email:", error);

      // Reject the email with proper error message
      try {
        message.setReject(`Processing error: ${error.message}`);
      } catch (rejectError) {
        console.error("❌ Failed to reject email:", rejectError);
      }
    }
  },
};
