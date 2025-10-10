#!/usr/bin/env -S deno run --allow-net --allow-env

/**
 * Simple test script to verify webhook functionality
 * Run this script to test the email webhook endpoint
 */

const WEBHOOK_URL = Deno.env.get("WEBHOOK_URL") || "http://localhost:8000";
const WEBHOOK_TOKEN = Deno.env.get("WEBHOOK_AUTH_TOKEN");

async function testWebhookPing() {
  console.log("🏓 Testing webhook ping...");

  try {
    const response = await fetch(`${WEBHOOK_URL}/webhooks/ping`);
    const data = await response.json();

    if (response.ok) {
      console.log("✅ Ping test passed:", data);
    } else {
      console.error("❌ Ping test failed:", data);
    }
  } catch (error) {
    console.error("❌ Ping test error:", error instanceof Error ? error.message : String(error));
  }
}

async function testEmailWebhook() {
  console.log("📧 Testing email webhook...");

  const testEmail = {
    from: "test@example.com",
    to: "recipient@example.com",
    subject: "Test Email from Webhook",
    body: "This is a test email sent to verify the webhook functionality.",
    html: "<p>This is a <strong>test email</strong> sent to verify the webhook functionality.</p>",
    timestamp: Date.now(),
    messageId: `test-${Date.now()}`,
  };

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (WEBHOOK_TOKEN) {
      headers["Authorization"] = `Bearer ${WEBHOOK_TOKEN}`;
    }

    const response = await fetch(`${WEBHOOK_URL}/webhooks/email`, {
      method: "POST",
      headers,
      body: JSON.stringify(testEmail),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Email webhook test passed:", data);
    } else {
      console.error("❌ Email webhook test failed:", data);
    }
  } catch (error) {
    console.error("❌ Email webhook test error:", error instanceof Error ? error.message : String(error));
  }
}

async function testWebhookStatus() {
  console.log("📊 Testing webhook status...");

  try {
    const response = await fetch(`${WEBHOOK_URL}/webhooks/status`);
    const data = await response.json();

    if (response.ok) {
      console.log("✅ Status test passed:", data);
    } else {
      console.error("❌ Status test failed:", data);
    }
  } catch (error) {
    console.error("❌ Status test error:", error instanceof Error ? error.message : String(error));
  }
}

async function testContactForm() {
  console.log("💬 Testing contact form...");

  const testContact = {
    fullname: "Test User",
    email: "test.user@example.com",
    message: "This is a test message from the automated test script.",
  };

  try {
    const response = await fetch(`${WEBHOOK_URL}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testContact),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Contact form test passed:", data);
    } else {
      console.error("❌ Contact form test failed:", data);
    }
  } catch (error) {
    console.error("❌ Contact form test error:", error instanceof Error ? error.message : String(error));
  }
}

// Main test runner
async function runTests() {
  console.log(`🚀 Starting webhook tests against: ${WEBHOOK_URL}`);
  console.log(`🔐 Auth token configured: ${WEBHOOK_TOKEN ? "Yes" : "No"}`);
  console.log("=".repeat(50));

  await testWebhookPing();
  console.log();

  await testEmailWebhook();
  console.log();

  await testWebhookStatus();
  console.log();

  await testContactForm();

  console.log("=".repeat(50));
  console.log("🎉 Test run completed!");
}

if (import.meta.main) {
  await runTests();
}
