# Potions B2B Newsletter SaaS - Project Instructions

## Project Overview
This is a static site for Potions, a B2B newsletter creation SaaS company. The site includes marketing pages and a blog with case studies and educational content about newsletter marketing.

## Tech Stack
- **Node.js** with EJS templating
- **Markdown** for blog posts with YAML frontmatter
- **marked.js** for markdown parsing
- **Static site generation** - all HTML is generated from templates
- No database - everything is file-based

## Build System

### Site Generation
The project has two main build scripts:

1. **Main Site Pages** (`npm run build-site`):
   - Uses `build-site.js` to generate marketing pages
   - Renders EJS templates from `templates/pages/*.ejs`
   - Uses `templates/layout.ejs` as the base layout
   - Outputs HTML files to root directory (e.g., `index.html`, `samples.html`)

2. **Blog Posts** (`npm run build-blog`):
   - Uses `blog/build-blog.js` to generate blog posts
   - Converts Markdown files from `blog/posts/*.md` to HTML
   - Parses YAML frontmatter for metadata
   - Generates `blog/{slug}.html` files
   - Also generates `blog/blog-data.js` for the blog index page
   - Uses the same `templates/layout.ejs` base layout

3. **Full Build** (`npm run build`):
   - Runs both `build-site` and `build-blog` sequentially

## Blog Post Structure

### File Location
All blog posts are Markdown files in `blog/posts/` with `.md` extension.

### Required Frontmatter
Every blog post MUST have YAML frontmatter at the top with these fields:

```yaml
---
title: "Post Title"
subheader: "Optional subtitle"
slug: "url-friendly-slug"
excerpt: "Brief description for SEO and previews"
date: "Month 'YY"
datePublished: "YYYY-MM-DD"
tags: ["Tag1", "Tag2"]
image: "https://withpotions.com/blog/assets/folder/image.png"
keywords: "comma, separated, keywords, for, seo"
tocTitles:
  - "Section 1 Title"
  - "Section 2 Title"
author:
  name: "Author Name"
  bio: "Short bio"
  avatar: "../path/to/avatar.webp"
  social: "https://linkedin.com/in/username"
  jobTitle: "Job Title"
seo:
  ogImage: "https://withpotions.com/blog/assets/folder/og-image.png"
  twitterImage: "https://withpotions.com/blog/assets/folder/twitter-image.png"
  articleSection: "Category Name"
  breadcrumbs:
    - name: "Home"
      url: "https://withpotions.com/"
    - name: "Blog"
      url: "https://withpotions.com/blog/"
    - name: "Post Title"
      url: "https://withpotions.com/blog/slug.html"
  faq:
    - question: "Question text?"
      answer: "Answer text."
---
```

### Table of Contents
- The build system auto-generates TOC from H2 headers (`##`) in the markdown
- Use `tocTitles` in frontmatter to override the display text
- Each H2 gets an auto-generated ID like `section-0`, `section-1`, etc.

## Important Rules

### When Creating a New Blog Post:

1. **Create the markdown file** in `blog/posts/` with all required frontmatter
2. **Add images** to `blog/assets/{post-slug}/` directory
3. **Run the build**: `npm run build-blog` to generate the HTML
4. **UPDATE THE SITEMAP**: Add the new post to `sitemap.xml` with:
   ```xml
   <url>
     <loc>https://withpotions.com/blog/{slug}.html</loc>
     <lastmod>YYYY-MM-DDTHH:MM:SS+00:00</lastmod>
     <priority>0.80</priority>
   </url>
   ```

   **CRITICAL**: The sitemap MUST be updated manually - there is no automation for this. Every new blog post requires a sitemap entry for SEO.

5. **Test locally**: Use `npm run dev` to preview

### Markdown Content Guidelines

- Use `##` for main sections (H2) - these appear in TOC
- Use `###` for subsections (H3)
- Tables support custom column widths via dash counts in separator row
- Links should use full URLs where appropriate
- Images should be optimized and stored in `blog/assets/{post-slug}/`
- Quote blocks use `>` syntax
- Code blocks use triple backticks

### File Paths and URLs

- **Main site pages**: Generated to root (e.g., `/index.html`)
- **Blog posts**: Generated to `/blog/{slug}.html`
- **Blog index**: `/blog/index.html`
- **Assets**: `/blog/assets/{post-slug}/filename.ext`
- **Base URLs in blog context**: Use `../` to reference root files

## Development Workflow

1. **Local development**: `npm run dev` - starts dev server with live reload
2. **Build site**: `npm run build` - generates all HTML files
3. **Preview**: `npm run serve` - serves static files on port 8080

## SEO Considerations

- Every page has structured data (JSON-LD)
- Blog posts get Article schema with author, publisher, dates
- Open Graph and Twitter Card meta tags are auto-generated
- Canonical URLs are set for all pages
- **Sitemap must be manually updated** for each new blog post

## Coding Standards

- Use EJS for templating (NOT React, Vue, etc.)
- Keep JavaScript minimal and vanilla (no frameworks)
- CSS is in root `style.css` with blog-specific styles in `blog/blog.css` and `blog/post.css`
- All external scripts should be deferred or async
- Maintain existing code style and structure

## Common Tasks

### Adding a new marketing page:
1. Create EJS template in `templates/pages/`
2. Add configuration to `pages` array in `build-site.js`
3. Run `npm run build-site`
4. Add to sitemap if needed

### Adding a new blog post:
1. Create `.md` file in `blog/posts/` with frontmatter
2. Add images to `blog/assets/{slug}/`
3. Run `npm run build-blog`
4. **Add entry to `sitemap.xml`** (REQUIRED)
5. Verify output in `blog/{slug}.html`

### Updating existing content:
1. Edit the source (EJS or Markdown)
2. Run appropriate build command
3. Verify changes locally

## Critical Reminders

- ✅ Always rebuild after making changes to templates or markdown
- ✅ **Always update sitemap.xml when adding blog posts**
- ✅ Test builds before committing
- ✅ Use correct base URLs for blog vs main site
- ✅ Maintain frontmatter structure exactly as specified
- ❌ Never edit generated HTML files directly
- ❌ Never skip sitemap updates for new blog posts
- ❌ Never use relative paths incorrectly between blog and main site
