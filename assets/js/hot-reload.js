// Hot Reload Client
// This script automatically reloads the page when files change during development

(function () {
  // Only run in development (check if WebSocket endpoint exists)
  if (window.location.hostname !== "localhost") return;

  const wsUrl = `ws://${window.location.host}/ws`;
  let ws;
  let reconnectInterval = 1000;
  let maxReconnectInterval = 30000;
  let reconnectDecay = 1.5;
  let timeoutId;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = function () {
      console.log("🔥 Hot reload connected");
      reconnectInterval = 1000; // Reset reconnect interval on successful connection
    };

    ws.onmessage = function (event) {
      if (event.data === "reload") {
        console.log("🔄 Hot reload triggered - reloading page...");
        window.location.reload();
      }
    };

    ws.onclose = function () {
      console.log("🔌 Hot reload disconnected - attempting to reconnect...");

      // Clear any existing timeout
      clearTimeout(timeoutId);

      // Attempt to reconnect with exponential backoff
      timeoutId = setTimeout(function () {
        reconnectInterval = Math.min(reconnectInterval * reconnectDecay, maxReconnectInterval);
        connect();
      }, reconnectInterval);
    };

    ws.onerror = function (error) {
      console.log("🚫 Hot reload connection error:", error);
    };
  }

  // Start connection
  connect();

  // Cleanup on page unload
  window.addEventListener("beforeunload", function () {
    if (ws) {
      ws.close();
    }
    clearTimeout(timeoutId);
  });
})();
