/// <reference lib="deno.unstable" />

// KV Store utilities for managing emails and contact messages

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  html?: string;
  timestamp: number;
  source: "cloudflare-worker" | "direct";
  metadata?: Record<string, unknown>;
}

export interface ContactMessage {
  id: string;
  fullname: string;
  email: string;
  message: string;
  timestamp: number;
  source: "contact-form";
  ipAddress?: string;
  userAgent?: string;
}

export class KVStore {
  private kv: Deno.Kv;

  constructor(kv: Deno.Kv) {
    this.kv = kv;
  }

  // Expose the underlying KV store for advanced operations (dev only)
  public getKV(): Deno.Kv {
    return this.kv;
  }

  // Email storage methods
  async storeEmail(email: Omit<EmailMessage, "id" | "timestamp">): Promise<string> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();

    const emailMessage: EmailMessage = {
      id,
      timestamp,
      ...email,
    };

    // Store email with a key pattern: ["emails", timestamp, id]
    await this.kv.set(["emails", timestamp, id], emailMessage);

    // Store in a lookup index by id
    await this.kv.set(["emails_by_id", id], emailMessage);

    console.log(`📧 Stored email with ID: ${id}`);
    return id;
  }

  async getEmail(id: string): Promise<EmailMessage | null> {
    const result = await this.kv.get<EmailMessage>(["emails_by_id", id]);
    return result.value;
  }

  async listEmails(limit = 50, cursor?: string): Promise<{ emails: EmailMessage[]; cursor?: string }> {
    const emails: EmailMessage[] = [];

    const iter = this.kv.list<EmailMessage>(
      { prefix: ["emails"] },
      {
        limit,
        cursor,
        reverse: true, // Latest first
      }
    );

    for await (const entry of iter) {
      emails.push(entry.value);
    }

    return {
      emails,
      cursor: iter.cursor,
    };
  }

  // Contact message storage methods
  async storeContactMessage(contact: Omit<ContactMessage, "id" | "timestamp">): Promise<string> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();

    const contactMessage: ContactMessage = {
      id,
      timestamp,
      ...contact,
    };

    // Store contact message with a key pattern: ["contacts", timestamp, id]
    await this.kv.set(["contacts", timestamp, id], contactMessage);

    // Store in a lookup index by id
    await this.kv.set(["contacts_by_id", id], contactMessage);

    console.log(`💬 Stored contact message with ID: ${id}`);
    return id;
  }

  async getContactMessage(id: string): Promise<ContactMessage | null> {
    const result = await this.kv.get<ContactMessage>(["contacts_by_id", id]);
    return result.value;
  }

  async listContactMessages(limit = 50, cursor?: string): Promise<{ contacts: ContactMessage[]; cursor?: string }> {
    const contacts: ContactMessage[] = [];

    const iter = this.kv.list<ContactMessage>(
      { prefix: ["contacts"] },
      {
        limit,
        cursor,
        reverse: true, // Latest first
      }
    );

    for await (const entry of iter) {
      contacts.push(entry.value);
    }

    return {
      contacts,
      cursor: iter.cursor,
    };
  }

  // Search methods
  async searchEmails(query: string, limit = 20): Promise<EmailMessage[]> {
    const emails: EmailMessage[] = [];
    const lowerQuery = query.toLowerCase();

    const iter = this.kv.list<EmailMessage>(
      { prefix: ["emails"] },
      {
        limit: 200, // Search through more items
        reverse: true,
      }
    );

    for await (const entry of iter) {
      const email = entry.value;
      if (
        email.subject.toLowerCase().includes(lowerQuery) ||
        email.from.toLowerCase().includes(lowerQuery) ||
        email.body.toLowerCase().includes(lowerQuery)
      ) {
        emails.push(email);
        if (emails.length >= limit) break;
      }
    }

    return emails;
  }

  async searchContactMessages(query: string, limit = 20): Promise<ContactMessage[]> {
    const contacts: ContactMessage[] = [];
    const lowerQuery = query.toLowerCase();

    const iter = this.kv.list<ContactMessage>(
      { prefix: ["contacts"] },
      {
        limit: 200, // Search through more items
        reverse: true,
      }
    );

    for await (const entry of iter) {
      const contact = entry.value;
      if (
        contact.fullname.toLowerCase().includes(lowerQuery) ||
        contact.email.toLowerCase().includes(lowerQuery) ||
        contact.message.toLowerCase().includes(lowerQuery)
      ) {
        contacts.push(contact);
        if (contacts.length >= limit) break;
      }
    }

    return contacts;
  }

  // Statistics methods
  async getStats(): Promise<{ emailCount: number; contactCount: number }> {
    let emailCount = 0;
    let contactCount = 0;

    // Count emails
    const emailIter = this.kv.list({ prefix: ["emails"] });
    for await (const _ of emailIter) {
      emailCount++;
    }

    // Count contacts
    const contactIter = this.kv.list({ prefix: ["contacts"] });
    for await (const _ of contactIter) {
      contactCount++;
    }

    return { emailCount, contactCount };
  }
}

// Global KV store instance
let kvStoreInstance: KVStore | null = null;

export async function getKVStore(): Promise<KVStore> {
  if (!kvStoreInstance) {
    try {
      // Try to open KV store
      const kv = await Deno.openKv();
      kvStoreInstance = new KVStore(kv);
      console.log("✅ KV store initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize KV store:", error);
      console.log("💡 Make sure to run with --unstable-kv flag");

      // For development, create a mock KV store
      if (Deno.env.get("NODE_ENV") === "development") {
        console.warn("🔄 Using in-memory store for development");
        kvStoreInstance = new MockKVStore() as unknown as KVStore;
      } else {
        throw new Error("KV store is required for production. Please ensure Deno KV is available.");
      }
    }
  }
  return kvStoreInstance;
}

// Simple in-memory mock for development
class MockKVStore {
  private emails: Map<string, EmailMessage> = new Map();
  private contacts: Map<string, ContactMessage> = new Map();
  private mockEntries: Map<string, unknown> = new Map();

  // Mock KV interface for development - limited implementation
  getKV(): Deno.Kv {
    // For mock store, we'll throw an error since it's not a real KV store
    // The KV viewer controller will handle this gracefully
    throw new Error("Mock KV store does not support direct KV access. Use real Deno KV for development.");
  }

  storeEmail(email: Omit<EmailMessage, "id" | "timestamp">): Promise<string> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();

    const emailMessage: EmailMessage = {
      id,
      timestamp,
      ...email,
    };

    this.emails.set(id, emailMessage);
    console.log(`📧 [MOCK] Stored email with ID: ${id}`);
    return Promise.resolve(id);
  }

  getEmail(id: string): Promise<EmailMessage | null> {
    return Promise.resolve(this.emails.get(id) || null);
  }

  listEmails(limit = 50): Promise<{ emails: EmailMessage[]; cursor?: string }> {
    const emails = Array.from(this.emails.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    return Promise.resolve({ emails });
  }

  storeContactMessage(contact: Omit<ContactMessage, "id" | "timestamp">): Promise<string> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();

    const contactMessage: ContactMessage = {
      id,
      timestamp,
      ...contact,
    };

    this.contacts.set(id, contactMessage);
    console.log(`💬 [MOCK] Stored contact message with ID: ${id}`);
    return Promise.resolve(id);
  }

  getContactMessage(id: string): Promise<ContactMessage | null> {
    return Promise.resolve(this.contacts.get(id) || null);
  }

  listContactMessages(limit = 50): Promise<{ contacts: ContactMessage[]; cursor?: string }> {
    const contacts = Array.from(this.contacts.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    return Promise.resolve({ contacts });
  }

  searchEmails(query: string, limit = 20): Promise<EmailMessage[]> {
    const lowerQuery = query.toLowerCase();
    const results = Array.from(this.emails.values())
      .filter(
        (email) =>
          email.subject.toLowerCase().includes(lowerQuery) ||
          email.from.toLowerCase().includes(lowerQuery) ||
          email.body.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    return Promise.resolve(results);
  }

  searchContactMessages(query: string, limit = 20): Promise<ContactMessage[]> {
    const lowerQuery = query.toLowerCase();
    const results = Array.from(this.contacts.values())
      .filter(
        (contact) =>
          contact.fullname.toLowerCase().includes(lowerQuery) ||
          contact.email.toLowerCase().includes(lowerQuery) ||
          contact.message.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    return Promise.resolve(results);
  }

  getStats(): Promise<{ emailCount: number; contactCount: number }> {
    return Promise.resolve({
      emailCount: this.emails.size,
      contactCount: this.contacts.size,
    });
  }
}
