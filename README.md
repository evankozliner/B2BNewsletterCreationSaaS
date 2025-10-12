# B2BNewsletterCreationSaaS

## Development Notes

### Template System
This project uses EJS templates to generate HTML files.

**IMPORTANT**: When making changes to HTML structure, images, or content:
- ✅ **DO**: Edit the EJS template files in the `templates/` directory
- ❌ **DON'T**: Edit the generated HTML files directly (they will be overwritten)

### EJS Template Locations
- Main layout: `templates/layout.ejs`
- Page templates: `templates/pages/*.ejs`
- Partials: `templates/partials/*.ejs`

### Image References
When updating image references (e.g., PNG to WebP):
1. Update the EJS template files only
2. The generated HTML files are built from templates and should not be edited directly
3. Generated files include: `index.html`, `samples.html`, `b2b-newsletter-service.html`, etc.
