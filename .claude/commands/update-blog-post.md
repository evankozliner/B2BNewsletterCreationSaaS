---
description: Update a blog post's dateModified field and sitemap lastmod date to today
---

When I say "update blog post [slug]" or reference updating a blog post:

1. **Update the markdown file's frontmatter:**
   - Find the blog post markdown file in `blog/posts/[slug].md`
   - Add or update the `dateModified` field with today's date in format "Month Day, Year" (e.g., "November 17, 2025")
   - Keep all other frontmatter fields unchanged

2. **Update the sitemap.xml:**
   - Find the blog post entry in `sitemap.xml` with URL matching `https://withpotions.com/blog/[slug].html`
   - Update the `<lastmod>` date to today's date in ISO format `YYYY-MM-DDT00:00:00+00:00`

3. **Rebuild the blog:**
   - Run `npm run build-blog` to regenerate the HTML files with the updated dates

4. **Confirm completion:**
   - Tell me which files were updated and what dates were set

Example usage:
- "update blog post best-newsletter-services"
- "update the consultants blog post"
- "/update-blog-post stat-digital-case-study"
