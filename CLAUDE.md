# Potions Marketing Site (withpotions.com)

Static marketing website + blog for Potions, a done-for-you B2B newsletter service. Hosted on GitHub Pages with custom domain.

## Build System

- **EJS** templates render to static HTML; **Marked** converts markdown blog posts
- `npm run build` — full build (site + blog)
- `npm run build-site` — renders 19 EJS page templates via `build-site.js`
- `npm run build-blog` — converts markdown posts via `blog/build-blog.js`
- `npm run dev` — watch + rebuild + serve at http://localhost:8080

Generated HTML files are committed to the repo root (GitHub Pages deploys from `/` on main).

## Project Structure

```
templates/
  layout.ejs            # Master layout (head, scripts, SEO, tracking)
  pages/                # 19 page templates (index, samples, industry landing pages, etc.)
  partials/             # header.ejs, footer.ejs
blog/
  posts/                # Markdown source files with YAML frontmatter
  articles/             # Generated "dark" blog posts (not in blog index listing)
  build-blog.js         # Blog build script
samples/                # Newsletter sample showcases
js/                     # Client-side JS modules
build-site.js           # Main site build script — page configs live here
dev-server.js           # Dev server with chokidar file watching
```

## How Pages Work

1. Each page is configured in `build-site.js` with metadata (title, description, scripts, CSS, tracking flags, etc.)
2. The page's EJS template is rendered first, then injected into `templates/layout.ejs`
3. Output HTML is written to the repo root (e.g., `templates/pages/index.ejs` → `./index.html`)

### Adding a new page
1. Create `templates/pages/my-page.ejs`
2. Add a page config object in `build-site.js`
3. Run `npm run build-site`

### Adding a blog post
1. Create a `.md` file in `blog/posts/` with YAML frontmatter (title, author, date, description, tags)
2. Run `npm run build-blog`
3. Alternatively, use the webhook → GitHub Actions workflow (`.github/workflows/create-blog-post.yml`) which auto-creates a PR

## Key Layout Variables

- `title`, `description`, `keywords` — SEO metadata
- `baseUrl` — relative path (`''` for root, `'../'` for subdirs)
- `scripts[]`, `styleSheet`, `additionalCSS[]` — page-specific assets
- `canonicalUrl` — SEO canonical tag
- `tracking` — toggles GTM / Meta Pixel / REB2B
- `hideHeaderFooter` — for landing/booking pages
- `isBlogPost` — enables Article schema.org structured data

## Dependencies

- **ejs** ^3.1.10, **marked** ^9.1.6, **js-yaml** ^4.1.0
- Dev: **chokidar** ^4.0.3, **http-server** ^14.1.1, **nodemon** ^3.1.10

## Deployment

Push to `main` → GitHub Pages auto-deploys to `withpotions.com` (see `CNAME` file).
