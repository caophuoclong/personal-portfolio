# Hot Reload Setup Guide

## 🔥 Hot Reload Features

Your portfolio now includes a complete hot reload system that automatically refreshes the browser when you make changes to your files during development.

## ✅ What's Included

### Server-Side (server.ts)
- **File Watcher**: Monitors all relevant files for changes
- **WebSocket Server**: Real-time communication with browsers
- **Smart Filtering**: Only reloads on meaningful file changes
- **Development Flag**: Hot reload only active in dev mode

### Client-Side (Browser)
- **Auto-Injection**: Hot reload script automatically added to HTML in dev mode  
- **WebSocket Client**: Connects to server for reload notifications
- **Reconnection**: Automatically reconnects if connection drops
- **Console Logging**: Shows hot reload status in browser console

## 🚀 How to Use

### Start Development Server
```bash
deno task dev
```

This will:
1. Start the server on `http://localhost:8000`
2. Enable file watching
3. Activate WebSocket endpoint at `ws://localhost:8000/ws`  
4. Inject hot reload script into HTML pages

### Supported File Types
The following file changes will trigger automatic browser reload:

| File Type | Extensions | Description |
|-----------|------------|-------------|
| Web Assets | `.html`, `.css`, `.js` | Core website files |
| Data Files | `.json` | Portfolio data and configuration |
| Images | `.png`, `.jpg`, `.jpeg`, `.svg` | All image assets |

### Excluded Files
These files are ignored to prevent unnecessary reloads:
- `.git/*` - Git repository files
- `node_modules/*` - Dependencies
- `.DS_Store` - System files
- Temporary files and backups

## 🔧 Configuration

### Development vs Production

**Development Mode** (`deno task dev`)
- Hot reload enabled ✅
- File watching active ✅
- WebSocket server running ✅
- Extra logging and debugging ✅

**Production Mode** (`deno task start`)
- Hot reload disabled ❌
- Optimized for performance ⚡
- No file watching overhead ⚡
- Clean console output ⚡

### Customizing File Watching

To modify which files trigger reloads, edit the `validExtensions` array in `server.ts`:

```typescript
const validExtensions = [".html", ".css", ".js", ".json", ".png", ".jpg", ".jpeg", ".svg"];
```

## 🐛 Troubleshooting

### Hot Reload Not Working?

1. **Check Console**: Open browser DevTools and look for hot reload messages
2. **Verify Connection**: Should see "🔥 Hot reload enabled" in console
3. **Check Server Logs**: Terminal should show "🔌 Hot reload client connected"
4. **Try Manual Refresh**: Sometimes first connection needs a manual page load

### WebSocket Connection Issues?

1. **Port Conflicts**: Make sure port 8000 is available
2. **Firewall**: Ensure localhost connections are allowed
3. **Browser Support**: Modern browsers required for WebSocket support

### Files Not Triggering Reload?

1. **File Extension**: Check if your file type is in the supported list
2. **File Location**: Ensure file is in the project directory
3. **Timing**: Very rapid changes might be debounced

## 📝 Development Workflow

1. **Start Server**: `deno task dev`
2. **Open Browser**: Navigate to `http://localhost:8000`
3. **Edit Files**: Make changes to any supported file type
4. **Auto Reload**: Browser refreshes automatically
5. **Iterate**: Continue development with instant feedback

## 💡 Tips

- **Keep Console Open**: Watch for hot reload status and error messages
- **Save Frequently**: Changes only trigger on file save, not during typing
- **Multiple Windows**: Hot reload works across multiple browser tabs/windows
- **Asset Updates**: Image changes are immediately visible after reload
- **JSON Changes**: Portfolio data updates instantly when you modify `data.json`

Enjoy your enhanced development experience! 🚀