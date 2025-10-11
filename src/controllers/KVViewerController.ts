import { BaseController } from "./BaseController.ts";
import { getKVStore } from "../db/kvStore.ts";

export class KVViewerController extends BaseController {
  /**
   * Check if we're running locally (dev mode)
   */
  private isLocalEnvironment(): boolean {
    // Check for development indicators
    return (
      Deno.env.get("NODE_ENV") === "development" ||
      Deno.env.get("DENO_ENV") === "development" ||
      Deno.args.includes("--dev") ||
      !Deno.env.get("DENO_DEPLOYMENT_ID")
    ); // Deno Deploy sets this
  }

  /**
   * Browse all KV entries with optional prefix filtering
   */
  async browseKV(req: Request): Promise<Response> {
    if (!this.isLocalEnvironment()) {
      return this.sendError("This endpoint is only available in local development", 403);
    }

    try {
      const url = new URL(req.url);
      const prefix = url.searchParams.get("prefix") || "";
      const limit = parseInt(url.searchParams.get("limit") || "100");
      const cursor = url.searchParams.get("cursor") || undefined;

      const kvStore = await getKVStore();

      // Access the internal KV store
      let kv: Deno.Kv;
      try {
        kv = kvStore.getKV();
      } catch (_error) {
        // Handle mock store case
        return this.sendError("KV browsing is not available with mock store. Please use real Deno KV.", 503);
      }

      if (!kv) {
        return this.sendError("KV store not available", 500);
      }

      const entries: Array<{
        key: Deno.KvKey;
        value: unknown;
        versionstamp: string;
      }> = [];

      const listOptions: Deno.KvListOptions = { limit };
      if (cursor) {
        listOptions.cursor = cursor;
      }

      let listSelector: Deno.KvListSelector;
      if (prefix) {
        // Parse the prefix - handle both string and array formats
        let parsedPrefix: Deno.KvKey;
        try {
          // Try to parse as JSON array first
          parsedPrefix = JSON.parse(prefix);
          if (!Array.isArray(parsedPrefix)) {
            parsedPrefix = [prefix];
          }
        } catch {
          // If not valid JSON, treat as string
          parsedPrefix = prefix.split("/").filter((p) => p.length > 0);
        }
        listSelector = { prefix: parsedPrefix };
      } else {
        listSelector = { prefix: [] };
      }

      const iter = kv.list(listSelector, listOptions);

      for await (const entry of iter) {
        entries.push({
          key: entry.key,
          value: entry.value,
          versionstamp: entry.versionstamp,
        });
      }

      return this.sendSuccess({
        entries,
        cursor: iter.cursor,
        count: entries.length,
        hasMore: entries.length === limit,
        prefix: prefix || "root",
      });
    } catch (error) {
      console.error("Error browsing KV store:", error);
      return this.sendError(`Failed to browse KV store: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }

  /**
   * Get a specific KV entry by key
   */
  async getKVEntry(req: Request): Promise<Response> {
    if (!this.isLocalEnvironment()) {
      return this.sendError("This endpoint is only available in local development", 403);
    }

    try {
      const url = new URL(req.url);
      const keyParam = url.searchParams.get("key");

      if (!keyParam) {
        return this.sendError("Key parameter is required", 400);
      }

      // Parse the key - handle both string and array formats
      let parsedKey: Deno.KvKey;
      try {
        // Try to parse as JSON array first
        parsedKey = JSON.parse(keyParam);
        if (!Array.isArray(parsedKey)) {
          parsedKey = [keyParam];
        }
      } catch {
        // If not valid JSON, treat as string path
        parsedKey = keyParam.split("/").filter((p) => p.length > 0);
      }

      const kvStore = await getKVStore();
      let kv: Deno.Kv;
      try {
        kv = kvStore.getKV();
      } catch (_error) {
        return this.sendError("KV entry access is not available with mock store. Please use real Deno KV.", 503);
      }

      if (!kv) {
        return this.sendError("KV store not available", 500);
      }

      const result = await kv.get(parsedKey);

      if (result.value === null) {
        return this.sendError("Key not found", 404);
      }

      return this.sendSuccess({
        key: result.key,
        value: result.value,
        versionstamp: result.versionstamp,
      });
    } catch (error) {
      console.error("Error getting KV entry:", error);
      return this.sendError(`Failed to get KV entry: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }

  /**
   * Set a KV entry (for testing purposes in local dev)
   */
  async setKVEntry(req: Request): Promise<Response> {
    if (!this.isLocalEnvironment()) {
      return this.sendError("This endpoint is only available in local development", 403);
    }

    try {
      const body = await req.json();
      const { key, value } = body;

      if (!key) {
        return this.sendError("Key is required", 400);
      }

      // Parse the key
      let parsedKey: Deno.KvKey;
      if (Array.isArray(key)) {
        parsedKey = key;
      } else if (typeof key === "string") {
        try {
          parsedKey = JSON.parse(key);
          if (!Array.isArray(parsedKey)) {
            parsedKey = [key];
          }
        } catch {
          parsedKey = key.split("/").filter((p) => p.length > 0);
        }
      } else {
        return this.sendError("Key must be a string or array", 400);
      }

      const kvStore = await getKVStore();
      let kv: Deno.Kv;
      try {
        kv = kvStore.getKV();
      } catch (_error) {
        return this.sendError("KV entry modification is not available with mock store. Please use real Deno KV.", 503);
      }

      if (!kv) {
        return this.sendError("KV store not available", 500);
      }

      const result = await kv.set(parsedKey, value);

      return this.sendSuccess({
        key: parsedKey,
        value: value,
        versionstamp: result.versionstamp,
        ok: result.ok,
      });
    } catch (error) {
      console.error("Error setting KV entry:", error);
      return this.sendError(`Failed to set KV entry: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }

  /**
   * Delete a KV entry (for testing purposes in local dev)
   */
  async deleteKVEntry(req: Request): Promise<Response> {
    if (!this.isLocalEnvironment()) {
      return this.sendError("This endpoint is only available in local development", 403);
    }

    try {
      const url = new URL(req.url);
      const keyParam = url.searchParams.get("key");

      if (!keyParam) {
        return this.sendError("Key parameter is required", 400);
      }

      // Parse the key
      let parsedKey: Deno.KvKey;
      try {
        parsedKey = JSON.parse(keyParam);
        if (!Array.isArray(parsedKey)) {
          parsedKey = [keyParam];
        }
      } catch {
        parsedKey = keyParam.split("/").filter((p) => p.length > 0);
      }

      const kvStore = await getKVStore();
      let kv: Deno.Kv;
      try {
        kv = kvStore.getKV();
      } catch (_error) {
        return this.sendError("KV entry deletion is not available with mock store. Please use real Deno KV.", 503);
      }

      if (!kv) {
        return this.sendError("KV store not available", 500);
      }

      await kv.delete(parsedKey);

      return this.sendSuccess({
        key: parsedKey,
        deleted: true,
      });
    } catch (error) {
      console.error("Error deleting KV entry:", error);
      return this.sendError(`Failed to delete KV entry: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }

  /**
   * Get KV store statistics and available prefixes
   */
  async getKVStats(_req: Request): Promise<Response> {
    if (!this.isLocalEnvironment()) {
      return this.sendError("This endpoint is only available in local development", 403);
    }

    try {
      const kvStore = await getKVStore();
      let kv: Deno.Kv;
      try {
        kv = kvStore.getKV();
      } catch (_error) {
        return this.sendError("KV statistics are not available with mock store. Please use real Deno KV.", 503);
      }

      if (!kv) {
        return this.sendError("KV store not available", 500);
      }

      // Collect statistics
      const prefixes = new Set<string>();
      let totalEntries = 0;

      const iter = kv.list({ prefix: [] }, { limit: 1000 });

      for await (const entry of iter) {
        totalEntries++;
        const keyParts = entry.key;
        if (keyParts.length > 0) {
          prefixes.add(String(keyParts[0]));
        }
      }

      // Get application-specific stats
      const appStats = await kvStore.getStats();

      return this.sendSuccess({
        totalEntries,
        availablePrefixes: Array.from(prefixes).sort(),
        applicationStats: appStats,
        environment: "development",
        kvType: "Deno KV",
      });
    } catch (error) {
      console.error("Error getting KV stats:", error);
      return this.sendError(`Failed to get KV stats: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
  }

  /**
   * Get the KV viewer HTML interface
   */
  getKVViewer(_req: Request): Response {
    if (!this.isLocalEnvironment()) {
      return this.sendError("This endpoint is only available in local development", 403);
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KV Store Viewer - Local Development</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f7;
            color: #1d1d1f;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        input, select, button {
            padding: 8px 12px;
            border: 1px solid #d2d2d7;
            border-radius: 6px;
            font-size: 14px;
        }
        button {
            background: #007aff;
            color: white;
            border: none;
            cursor: pointer;
            transition: background 0.2s;
        }
        button:hover {
            background: #0056b3;
        }
        button.secondary {
            background: #8e8e93;
        }
        button.danger {
            background: #ff3b30;
        }
        .results {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stats {
            padding: 15px;
            background: #f8f9fa;
            border-bottom: 1px solid #e5e5ea;
        }
        .entries {
            max-height: 600px;
            overflow-y: auto;
        }
        .entry {
            padding: 15px;
            border-bottom: 1px solid #e5e5ea;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 13px;
        }
        .entry:last-child {
            border-bottom: none;
        }
        .key {
            color: #007aff;
            font-weight: 600;
            margin-bottom: 8px;
            word-break: break-all;
        }
        .value {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 6px;
            white-space: pre-wrap;
            max-height: 200px;
            overflow-y: auto;
        }
        .meta {
            color: #8e8e93;
            font-size: 11px;
            margin-top: 5px;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: #8e8e93;
        }
        .error {
            background: #ffebee;
            color: #c62828;
            padding: 15px;
            border-radius: 6px;
            margin: 10px 0;
        }
        .success {
            background: #e8f5e8;
            color: #2e7d32;
            padding: 15px;
            border-radius: 6px;
            margin: 10px 0;
        }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
        }
        .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
        }
        textarea {
            width: 100%;
            height: 100px;
            padding: 8px;
            border: 1px solid #d2d2d7;
            border-radius: 6px;
            resize: vertical;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗄️ KV Store Viewer</h1>
            <p>Local Development Environment Only</p>
        </div>

        <div class="controls">
            <div class="control-group">
                <label>Prefix Filter:</label>
                <input type="text" id="prefixInput" placeholder='e.g., emails or ["emails"] or emails/123'>
            </div>
            <div class="control-group">
                <label>Limit:</label>
                <select id="limitSelect">
                    <option value="50">50</option>
                    <option value="100" selected>100</option>
                    <option value="200">200</option>
                    <option value="500">500</option>
                </select>
            </div>
            <div class="control-group">
                <label>&nbsp;</label>
                <button onclick="loadEntries()">🔍 Browse Entries</button>
            </div>
            <div class="control-group">
                <label>&nbsp;</label>
                <button onclick="loadStats()" class="secondary">📊 Get Stats</button>
            </div>
            <div class="control-group">
                <label>&nbsp;</label>
                <button onclick="showGetEntryModal()" class="secondary">🔑 Get by Key</button>
            </div>
            <div class="control-group">
                <label>&nbsp;</label>
                <button onclick="showSetEntryModal()" class="secondary">➕ Set Entry</button>
            </div>
        </div>

        <div class="results" id="results">
            <div class="loading">Click "Browse Entries" to start exploring your KV store</div>
        </div>
    </div>

    <!-- Get Entry Modal -->
    <div id="getEntryModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Get Entry by Key</h3>
                <button class="close" onclick="closeModal('getEntryModal')">&times;</button>
            </div>
            <div class="control-group">
                <label>Key (string or JSON array):</label>
                <input type="text" id="getKeyInput" placeholder='e.g., emails/123 or ["emails", "123"]'>
            </div>
            <button onclick="getEntry()">Get Entry</button>
        </div>
    </div>

    <!-- Set Entry Modal -->
    <div id="setEntryModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Set Entry</h3>
                <button class="close" onclick="closeModal('setEntryModal')">&times;</button>
            </div>
            <div class="control-group">
                <label>Key (string or JSON array):</label>
                <input type="text" id="setKeyInput" placeholder='e.g., test/data or ["test", "data"]'>
            </div>
            <div class="control-group">
                <label>Value (JSON):</label>
                <textarea id="setValueInput" placeholder='{"example": "data"}'></textarea>
            </div>
            <button onclick="setEntry()">Set Entry</button>
        </div>
    </div>

    <script>
        let currentCursor = null;

        async function makeRequest(url, options = {}) {
            try {
                const response = await fetch(url, options);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Request failed');
                }
                
                return data;
            } catch (error) {
                showError('Request failed: ' + error.message);
                throw error;
            }
        }

        async function loadEntries(cursor = null) {
            const prefix = document.getElementById('prefixInput').value;
            const limit = document.getElementById('limitSelect').value;
            
            const params = new URLSearchParams({
                limit: limit
            });
            
            if (prefix) params.append('prefix', prefix);
            if (cursor) params.append('cursor', cursor);
            
            showLoading();
            
            try {
                const data = await makeRequest('/dev/kv/browse?' + params.toString());
                displayEntries(data);
                currentCursor = data.cursor;
            } catch (error) {
                console.error('Failed to load entries:', error);
            }
        }

        async function loadStats() {
            showLoading();
            
            try {
                const data = await makeRequest('/dev/kv/stats');
                displayStats(data);
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        }

        async function getEntry() {
            const key = document.getElementById('getKeyInput').value;
            if (!key) {
                showError('Key is required');
                return;
            }
            
            try {
                const data = await makeRequest('/dev/kv/entry?' + new URLSearchParams({ key }));
                displaySingleEntry(data);
                closeModal('getEntryModal');
            } catch (error) {
                console.error('Failed to get entry:', error);
            }
        }

        async function setEntry() {
            const key = document.getElementById('setKeyInput').value;
            const valueText = document.getElementById('setValueInput').value;
            
            if (!key) {
                showError('Key is required');
                return;
            }
            
            let value;
            try {
                value = JSON.parse(valueText || '{}');
            } catch (error) {
                showError('Value must be valid JSON');
                return;
            }
            
            try {
                const data = await makeRequest('/dev/kv/entry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, value })
                });
                
                showSuccess('Entry set successfully');
                closeModal('setEntryModal');
                
                // Clear form
                document.getElementById('setKeyInput').value = '';
                document.getElementById('setValueInput').value = '';
            } catch (error) {
                console.error('Failed to set entry:', error);
            }
        }

        async function deleteEntry(key) {
            if (!confirm('Are you sure you want to delete this entry?')) {
                return;
            }
            
            try {
                await makeRequest('/dev/kv/entry?' + new URLSearchParams({ 
                    key: JSON.stringify(key) 
                }), { method: 'DELETE' });
                
                showSuccess('Entry deleted successfully');
                loadEntries(); // Refresh the list
            } catch (error) {
                console.error('Failed to delete entry:', error);
            }
        }

        function displayEntries(data) {
            const results = document.getElementById('results');
            
            let html = '<div class="stats">';
            html += '<strong>Results:</strong> ' + data.count + ' entries';
            html += ' | <strong>Prefix:</strong> ' + (data.prefix || 'root');
            if (data.hasMore) {
                html += ' | <button onclick="loadEntries(\\''+data.cursor+'\\')">Load More</button>';
            }
            html += '</div>';
            
            if (data.entries.length === 0) {
                html += '<div class="loading">No entries found</div>';
            } else {
                html += '<div class="entries">';
                data.entries.forEach(entry => {
                    html += '<div class="entry">';
                    html += '<div class="key">Key: ' + JSON.stringify(entry.key) + '</div>';
                    html += '<div class="value">' + JSON.stringify(entry.value, null, 2) + '</div>';
                    html += '<div class="meta">';
                    html += 'Version: ' + entry.versionstamp;
                    html += ' | <button onclick="deleteEntry(' + JSON.stringify(entry.key) + ')" class="danger" style="font-size: 11px; padding: 2px 6px;">Delete</button>';
                    html += '</div>';
                    html += '</div>';
                });
                html += '</div>';
            }
            
            results.innerHTML = html;
        }

        function displayStats(data) {
            const results = document.getElementById('results');
            
            let html = '<div class="stats">';
            html += '<h3>📊 KV Store Statistics</h3>';
            html += '<p><strong>Total Entries:</strong> ' + data.totalEntries + '</p>';
            html += '<p><strong>Available Prefixes:</strong> ' + data.availablePrefixes.join(', ') + '</p>';
            html += '<p><strong>Environment:</strong> ' + data.environment + '</p>';
            html += '<p><strong>KV Type:</strong> ' + data.kvType + '</p>';
            
            if (data.applicationStats) {
                html += '<h4>Application Data:</h4>';
                html += '<p><strong>Emails:</strong> ' + data.applicationStats.emailCount + '</p>';
                html += '<p><strong>Contacts:</strong> ' + data.applicationStats.contactCount + '</p>';
            }
            html += '</div>';
            
            results.innerHTML = html;
        }

        function displaySingleEntry(data) {
            const results = document.getElementById('results');
            
            let html = '<div class="stats"><h3>🔑 Single Entry</h3></div>';
            html += '<div class="entries">';
            html += '<div class="entry">';
            html += '<div class="key">Key: ' + JSON.stringify(data.key) + '</div>';
            html += '<div class="value">' + JSON.stringify(data.value, null, 2) + '</div>';
            html += '<div class="meta">Version: ' + data.versionstamp + '</div>';
            html += '</div>';
            html += '</div>';
            
            results.innerHTML = html;
        }

        function showLoading() {
            document.getElementById('results').innerHTML = '<div class="loading">Loading...</div>';
        }

        function showError(message) {
            const errorDiv = '<div class="error">' + message + '</div>';
            document.getElementById('results').innerHTML = errorDiv;
        }

        function showSuccess(message) {
            const successDiv = document.createElement('div');
            successDiv.className = 'success';
            successDiv.textContent = message;
            document.body.insertBefore(successDiv, document.querySelector('.container'));
            
            setTimeout(() => {
                successDiv.remove();
            }, 3000);
        }

        function showGetEntryModal() {
            document.getElementById('getEntryModal').style.display = 'block';
        }

        function showSetEntryModal() {
            document.getElementById('setEntryModal').style.display = 'block';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        // Close modals when clicking outside
        window.onclick = function(event) {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // Load initial stats
        loadStats();
    </script>
</body>
</html>
    `;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }
}
