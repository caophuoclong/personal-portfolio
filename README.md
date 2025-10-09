# Personal Portfolio - Long (Leon) Tran

![GitHub repo size](https://img.shields.io/github/repo-size/caophuoclong/personal-portfolio)
![GitHub stars](https://img.shields.io/github/stars/caophuoclong/personal-portfolio?style=social)
![GitHub forks](https://img.shields.io/github/forks/caophuoclong/personal-portfolio?style=social)

A modern, fully responsive personal portfolio website showcasing professional experience, skills, and projects. Built with HTML, CSS, JavaScript, and powered by Deno for enhanced development experience with hot reload, dynamic data loading, and AI-optimized content for recruitment systems.

## Demo

![vCard Desktop Demo](./website-demo-image/desktop.png "Desktop Demo")
![vCard Mobile Demo](./website-demo-image/mobile.png "Mobile Demo")

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [Git](https://git-scm.com/downloads "Download Git") must be installed on your operating system.
- [Deno](https://deno.land/manual@v1.37.0/getting_started/installation "Install Deno") must be installed for running the development server.

## Installation

To install the **Personal Portfolio**, follow these steps:

Linux and macOS:

```bash
git clone https://github.com/caophuoclong/personal-portfolio.git
cd personal-portfolio
```

Windows:

```bash
git clone https://github.com/caophuoclong/personal-portfolio.git
cd personal-portfolio
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

#### 1. Personal Information

Edit `data.json` to update your:

- Personal details (name, title, contact info)
- About section and professional summary
- Skills and technologies
- Work experience and projects
- Education and certifications
- Social media links

#### 2. Visual Assets

Replace files in `assets/images/` with your own:

- `my-avatar.png` - Your profile picture
- `project-*.jpg/png` - Project screenshots
- `logo-*.png` - Company/client logos
- `blog-*.jpg` - Blog post images

#### 3. Resume/CV

Update `assets/statics/FullstackDeveloper_LongTran.pdf` with your own resume

#### 4. Styling & Themes

Customize appearance by modifying:

- `assets/css/style.css` - Main stylesheet
- CSS variables for colors, fonts, and spacing
- Responsive breakpoints and layouts

#### 5. AI Recruitment Optimization

Update `ai-hiring.html` for better AI recruitment visibility:

- Structured data and JSON-LD
- SEO meta tags and keywords
- - Machine-readable professional information

## Project Structure

```text
personal-portfolio/
├── 📄 index.html              # Main portfolio page
├── 🤖 ai-hiring.html          # AI-optimized hiring page
├── 📊 data.json               # Portfolio data configuration
├── 🦕 server.ts               # Deno development server
├── ⚙️ deno.json               # Deno configuration & tasks
├── 🌐 sitemap.xml             # Search engine sitemap
├── 🤖 robots.txt              # Web crawler instructions
├── api/
│   └── 📋 profile.json        # API data endpoint
├── assets/
│   ├── css/
│   │   └── 🎨 style.css       # Main stylesheet
│   ├── js/
│   │   ├── 🔄 hot-reload.js   # Client-side hot reload
│   │   └── ⚡ script.js       # Main functionality
│   ├── images/                # All visual assets
│   └── statics/
│       └── 📄 *.pdf           # Resume/CV files
```

## API Endpoints

The Deno server provides the following endpoints:

- `GET /` - Main portfolio page
- `GET /ai-hiring.html` - AI-optimized hiring page
- `GET /api/data` - Portfolio data JSON API
- `GET /api/profile.json` - Profile data endpoint
- `GET /assets/*` - Static file serving
- `WebSocket /ws` - Hot reload connection (dev mode)

## Deployment

### Deno Deploy

This project is configured for Deno Deploy:

```bash
# Deploy to Deno Deploy (requires deno CLI)
deno task deploy
```

### Traditional Hosting

For static hosting platforms:

1. Remove or ignore `server.ts` and `deno.json`
2. Upload all HTML, CSS, JS, and asset files
3. Configure server to serve `index.html` as default

### Docker Deployment

```dockerfile
FROM denoland/deno:1.37.0
WORKDIR /app
COPY . .
EXPOSE 8000
CMD ["deno", "run", "--allow-net", "--allow-read", "server.ts"]
```

## Get in Touch

For questions about this portfolio template or to connect professionally:

- 📧 Email: [contact@leondev.me](mailto:contact@leondev.me)
- 💼 LinkedIn: [linkedin.com/in/caophuoclongse](https://linkedin.com/in/caophuoclongse)
- 🐙 GitHub: [github.com/caophuoclong](https://github.com/caophuoclong)
- 🌐 Portfolio: [portfolio.leondev.me](https://portfolio.leondev.me)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original vCard template inspiration
- Deno community for excellent tooling
- Open source contributors and the web development community
