# Dark Blog Feature

The "dark" blog feature allows you to create blog posts that are **not visible** in the main blog listing but are still accessible via direct URL. This is useful for:

- Testing new content before publishing publicly
- Creating content specifically for webhook integrations
- Sharing posts with specific audiences via direct links
- A/B testing content

## Features

### 1. Posts marked as `dark: true` are:
- ✅ Built to the `/blog/articles/` subdirectory and accessible via direct URL (e.g., `/blog/articles/your-slug.html`)
- ❌ **NOT** included in the blog listing (`/blog/index.html`)
- ❌ **DO NOT** show breadcrumbs in the UI or structured data
- ✅ Still indexed by search engines (unless you add robots meta tags)
- 🔧 Automatically use adjusted paths for CSS/JS to work from the subdirectory

### 2. Creating Dark Posts

#### Manual Creation

Add `dark: true` to the frontmatter of any markdown post:

```markdown
---
title: "Your Post Title"
slug: "your-post-slug"
excerpt: "Post description"
date: "November '25"
datePublished: "2025-11-22"
tags: ["Tag1", "Tag2"]
dark: true
author:
  name: "Author Name"
  # ... other author fields
---

Your content here...
```

Then run:
```bash
npm run build-blog
```

#### From Webhook Data

Use the helper script to create dark posts from webhook JSON:

```bash
node blog/create-dark-post-from-webhook.js path/to/webhook.json
```

**Webhook JSON structure:**
```json
{
  "raw_body": "{\"event_type\":\"publish_articles\",\"data\":{\"articles\":[{\"title\":\"...\",\"content_markdown\":\"...\",\"meta_description\":\"...\",\"slug\":\"...\",\"tags\":[...],\"image_url\":\"...\"}]}}"
}
```

**Example:**
```bash
node blog/create-dark-post-from-webhook.js blog/sample-webhook.json
npm run build-blog
```

### 3. Accessing Dark Posts

Dark posts are accessible directly via their URL in the `/blog/articles/` subdirectory:
```
https://withpotions.com/blog/articles/your-slug.html
```

They will **NOT** appear in:
- Blog index page
- Tag filters
- Search results within the blog

### 4. Technical Details

The dark blog feature works through:

1. **Frontmatter field**: `dark: true` in the markdown file
2. **Subdirectory output**: Dark posts are built to `/blog/articles/` instead of `/blog/`
3. **Path adjustments**: CSS/JS paths automatically adjust (`../../` instead of `../`) for the subdirectory
4. **Build script filter**: `blog/build-blog.js` filters dark posts from `blog-data.js`
5. **Template logic**: `templates/layout.ejs` conditionally hides breadcrumbs when `isDarkPost` is true
6. **No sitemap inclusion**: Dark posts should be excluded from your sitemap (you'll need to implement this if needed)

### 5. Example Use Cases

**Webhook Integration:**
Automatically create dark posts when receiving content from external systems like Outrank or Zapier.

**Private Sharing:**
Share specific content with clients or partners without making it publicly discoverable.

**Staging Content:**
Test content formatting and design before making it public by toggling `dark: false` when ready.

## Files Modified

- `blog/build-blog.js` - Filters dark posts and passes `isDarkPost` flag
- `templates/layout.ejs` - Conditionally hides breadcrumbs
- `blog/create-dark-post-from-webhook.js` - Helper script for webhook integration
- `blog/sample-webhook.json` - Example webhook data format

## Converting Dark to Public

To make a dark post public:

1. Open the markdown file
2. Change `dark: true` to `dark: false` (or remove the field entirely)
3. Run `npm run build-blog`

The post will now appear in the blog listing!
