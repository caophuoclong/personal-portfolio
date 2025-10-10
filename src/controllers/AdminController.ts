import { BaseController } from "./BaseController.ts";
import { getKVStore } from "../db/kvStore.ts";

export class AdminController extends BaseController {
  /**
   * Get all stored emails with pagination
   */
  async getEmails(req: Request): Promise<Response> {
    try {
      // Check for authentication
      if (!this.isAuthenticated(req)) {
        return this.sendError("Unauthorized", 401);
      }

      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const cursor = url.searchParams.get("cursor") || undefined;
      const search = url.searchParams.get("search") || undefined;

      const kvStore = await getKVStore();

      let result;
      if (search) {
        const emails = await kvStore.searchEmails(search, limit);
        result = { emails, cursor: undefined };
      } else {
        result = await kvStore.listEmails(limit, cursor);
      }

      return this.sendSuccess(result);
    } catch (error) {
      console.error("Error fetching emails:", error);
      return this.sendError("Internal server error", 500);
    }
  }

  /**
   * Get a specific email by ID
   */
  async getEmail(req: Request): Promise<Response> {
    try {
      // Check for authentication
      if (!this.isAuthenticated(req)) {
        return this.sendError("Unauthorized", 401);
      }

      const url = new URL(req.url);
      const pathParts = url.pathname.split("/");
      const emailId = pathParts[pathParts.length - 1];

      if (!emailId) {
        return this.sendError("Email ID is required", 400);
      }

      const kvStore = await getKVStore();
      const email = await kvStore.getEmail(emailId);

      if (!email) {
        return this.sendError("Email not found", 404);
      }

      return this.sendSuccess({ email });
    } catch (error) {
      console.error("Error fetching email:", error);
      return this.sendError("Internal server error", 500);
    }
  }

  /**
   * Get all stored contact messages with pagination
   */
  async getContactMessages(req: Request): Promise<Response> {
    try {
      // Check for authentication
      if (!this.isAuthenticated(req)) {
        return this.sendError("Unauthorized", 401);
      }

      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const cursor = url.searchParams.get("cursor") || undefined;
      const search = url.searchParams.get("search") || undefined;

      const kvStore = await getKVStore();

      let result;
      if (search) {
        const contacts = await kvStore.searchContactMessages(search, limit);
        result = { contacts, cursor: undefined };
      } else {
        result = await kvStore.listContactMessages(limit, cursor);
      }

      return this.sendSuccess(result);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      return this.sendError("Internal server error", 500);
    }
  }

  /**
   * Get a specific contact message by ID
   */
  async getContactMessage(req: Request): Promise<Response> {
    try {
      // Check for authentication
      if (!this.isAuthenticated(req)) {
        return this.sendError("Unauthorized", 401);
      }

      const url = new URL(req.url);
      const pathParts = url.pathname.split("/");
      const contactId = pathParts[pathParts.length - 1];

      if (!contactId) {
        return this.sendError("Contact ID is required", 400);
      }

      const kvStore = await getKVStore();
      const contact = await kvStore.getContactMessage(contactId);

      if (!contact) {
        return this.sendError("Contact message not found", 404);
      }

      return this.sendSuccess({ contact });
    } catch (error) {
      console.error("Error fetching contact message:", error);
      return this.sendError("Internal server error", 500);
    }
  }

  /**
   * Get statistics about stored data
   */
  async getStats(req: Request): Promise<Response> {
    try {
      // Check for authentication
      if (!this.isAuthenticated(req)) {
        return this.sendError("Unauthorized", 401);
      }

      const kvStore = await getKVStore();
      const stats = await kvStore.getStats();

      return this.sendSuccess({
        ...stats,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return this.sendError("Internal server error", 500);
    }
  }

  /**
   * Export all data as JSON (for backup purposes)
   */
  async exportData(req: Request): Promise<Response> {
    try {
      // Check for authentication
      if (!this.isAuthenticated(req)) {
        return this.sendError("Unauthorized", 401);
      }

      const kvStore = await getKVStore();
      
      // Get all emails and contacts (with higher limit for export)
      const emailResult = await kvStore.listEmails(1000);
      const contactResult = await kvStore.listContactMessages(1000);

      const exportData = {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        data: {
          emails: emailResult.emails,
          contacts: contactResult.contacts
        },
        statistics: await kvStore.getStats()
      };

      return new Response(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="portfolio-data-${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      return this.sendError("Internal server error", 500);
    }
  }

  /**
   * Simple authentication check using API key
   */
  private isAuthenticated(req: Request): boolean {
    const authHeader = req.headers.get("Authorization");
    const apiKey = Deno.env.get("ADMIN_API_KEY");

    // If no API key is set, require authentication header
    if (!apiKey) {
      console.warn("No ADMIN_API_KEY set in environment variables");
      return false;
    }

    // Check if the authorization header matches
    const expectedAuth = `Bearer ${apiKey}`;
    return authHeader === expectedAuth;
  }
}