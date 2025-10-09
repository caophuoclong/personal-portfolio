# vCard - Personal portfolio

![GitHub repo size](https://img.shields.io/github/repo-size/codewithsadee/vcard-personal-portfolio)
![GitHub stars](https://img.shields.io/github/stars/codewithsadee/vcard-personal-portfolio?style=social)
![GitHub forks](https://img.shields.io/github/forks/codewithsadee/vcard-personal-portfolio?style=social)
[![Twitter Follow](https://img.shields.io/twitter/follow/codewithsadee_?style=social)](https://twitter.com/intent/follow?screen_name=codewithsadee_)
[![YouTube Video Views](https://img.shields.io/youtube/views/SoxmIlgf2zM?style=social)](https://youtu.be/SoxmIlgf2zM)

vCard is a fully responsive personal portfolio website, responsive for all devices, built using HTML, CSS, and JavaScript. This version includes a Deno server for local development and API endpoints for dynamic data loading.

## Demo

![vCard Desktop Demo](./website-demo-image/desktop.png "Desktop Demo")
![vCard Mobile Demo](./website-demo-image/mobile.png "Mobile Demo")

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [Git](https://git-scm.com/downloads "Download Git") must be installed on your operating system.
- [Deno](https://deno.land/manual@v1.37.0/getting_started/installation "Install Deno") must be installed for running the development server.

## Installing vCard

To install **vCard**, follow these steps:

Linux and macOS:

```bash
sudo git clone https://github.com/codewithsadee/vcard-personal-portfolio.git
```

Windows:

```bash
git clone https://github.com/codewithsadee/vcard-personal-portfolio.git
```

## Running with Deno

This portfolio includes a Deno server for enhanced development experience:

### Development Server

```bash
# Run with auto-reload on file changes
deno task dev

# Or run directly
deno run --allow-net --allow-read --watch server.ts
```

### Production Server

```bash
# Run without auto-reload
deno task start

# Or run directly
deno run --allow-net --allow-read server.ts
```

The server will start on `http://localhost:8000` and provides:

- Static file serving for all portfolio assets
- API endpoint at `/api/data` for portfolio data
- Automatic JSON data loading with fallback support
- **Hot Reload** - Automatic browser refresh when files change (dev mode only)

### Hot Reload Features

When running in development mode (`deno task dev`), the server provides:

- **File Watching** - Monitors changes to HTML, CSS, JS, JSON, and image files
- **WebSocket Connection** - Real-time communication between server and browser
- **Auto Refresh** - Browser automatically reloads when files are modified
- **Smart Filtering** - Ignores temporary files, git files, and system files
- **Reconnection** - Automatically reconnects if connection is lost

**Supported file types for hot reload:**

- `.html`, `.css`, `.js` - Web assets
- `.json` - Configuration and data files
- `.png`, `.jpg`, `.jpeg`, `.svg` - Images

### Customizing Your Portfolio

1. **Edit Personal Data**: Modify `data.json` to update your personal information, projects, experience, etc.
2. **Update Assets**: Replace images in the `assets/images/` folder with your own
3. **Customize Styling**: Modify `assets/css/style.css` for visual changes

### Features

- 📱 Fully responsive design
- 🚀 Deno-powered development server
- 🔄 Dynamic data loading from JSON
- 📊 API endpoints for data management
- ⚡ Hot reload during development
- 🎨 Customizable via JSON configuration

## Contact

If you want to contact me you can reach me at [Twitter](https://www.x.com/codewithsadee_).

## License

MIT
