# GitHub Action Webhook Setup

This guide explains how to set up the automated blog post creation workflow using Zapier webhooks and GitHub Actions.

## Overview

When Zapier sends a webhook with article data, it triggers a GitHub Action that:
1. Parses the webhook payload
2. Creates a markdown file in `blog/posts/`
3. Opens a Pull Request for review
4. The post becomes a "dark" blog post (not visible in main listing)

## Setup Instructions

### 1. GitHub Repository Setup

The GitHub Action is already configured in `.github/workflows/create-blog-post.yml`.

**⚠️ IMPORTANT:** You must enable workflow permissions first!

**See [PERMISSIONS-SETUP.md](./PERMISSIONS-SETUP.md)** for detailed instructions.

**Quick setup:**
1. Go to: `Settings` → `Actions` → `General`
2. Scroll to "Workflow permissions"
3. Select: **"Read and write permissions"**
4. Check: ✅ "Allow GitHub Actions to create and approve pull requests"
5. Click "Save"

### 2. Zapier Configuration

Configure Zapier to send a webhook to trigger the GitHub Action:

**Webhook URL:**
```
https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches
```

**Method:** POST

**Headers:**
```
Accept: application/vnd.github.v3+json
Authorization: Bearer YOUR_GITHUB_PAT
Content-Type: application/json
```

**Body:**
```json
{
  "event_type": "create-blog-post",
  "client_payload": {
    "headers": {...},
    "querystring": {},
    "raw_body": "{\"event_type\":\"publish_articles\",\"data\":{...}}"
  }
}
```

The entire webhook request body should be wrapped in `client_payload`.

### 3. Create GitHub Personal Access Token (PAT)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name it: "Zapier Blog Webhook"
4. Select scopes:
   - `repo` (full control of private repositories)
   - `workflow` (update GitHub Action workflows)
5. Generate and copy the token
6. Add this token to Zapier in the Authorization header

### 4. Webhook Payload Format

The webhook must include the full request in `client_payload` with this structure:

```json
{
  "event_type": "create-blog-post",
  "client_payload": {
    "headers": {
      "content_type": "application/json",
      "http_authorization": "Bearer asdf"
    },
    "querystring": {},
    "raw_body": "{\"event_type\":\"publish_articles\",\"timestamp\":\"2025-11-22T20:53:01.091Z\",\"data\":{\"articles\":[{\"id\":\"test-article-123\",\"title\":\"Sample Article Title for Testing\",\"content_markdown\":\"# Sample Article\\n\\nThis is a test article content in **Markdown** format.\\n\\n## Introduction\\n\\nThis webhook test ensures your endpoint can receive and process article data correctly.\",\"content_html\":\"<h1>Sample Article</h1><p>This is a test article content in <strong>Markdown</strong> format.</p><h2>Introduction</h2><p>This webhook test ensures your endpoint can receive and process article data correctly.</p>\",\"meta_description\":\"A sample article for testing webhook integration with Outrank\",\"created_at\":\"2025-11-22T20:53:01.091Z\",\"image_url\":\"https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Test+Article+Image\",\"slug\":\"sample-article-title-for-testing\",\"tags\":[\"test\",\"webhook\",\"integration\",\"outrank\"]}]}}"
  }
}
```

**Key fields in `raw_body`:**
- `data.articles[0].title` - Article title (required)
- `data.articles[0].content_markdown` - Markdown content (required)
- `data.articles[0].meta_description` - SEO description (required)
- `data.articles[0].slug` - URL slug (optional, generated from title if not provided)
- `data.articles[0].tags` - Array of tags (optional)
- `data.articles[0].image_url` - Header image URL (optional)

## How It Works

### 1. Trigger Event
Zapier sends a `repository_dispatch` event with type `create-blog-post` to GitHub.

### 2. GitHub Action Runs
- Checks out the repository
- Runs the Node.js script `.github/scripts/create-blog-post.js`
- The script parses the webhook payload and extracts article data from `raw_body`

### 3. Markdown File Created
Creates a file at `blog/posts/{slug}.md` with:
- Frontmatter populated from webhook data
- `dark: true` flag (makes it a hidden post)
- Markdown content from `content_markdown` field

### 4. Pull Request Created
- Branch name: `blog-post/{slug}`
- Title: "New Blog Post: {title}"
- Automatically labeled: `blog-post`, `automated`

### 5. Review & Merge
1. Review the PR content
2. Merge when ready
3. Run `npm run build-blog` locally or in CI
4. Post will be accessible at `/blog/articles/{slug}.html`

## Testing

### Test with curl:

```bash
curl -X POST \
  https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: Bearer YOUR_GITHUB_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "create-blog-post",
    "client_payload": {
      "raw_body": "{\"event_type\":\"publish_articles\",\"data\":{\"articles\":[{\"title\":\"Test Article\",\"content_markdown\":\"# Test\\n\\nContent here\",\"meta_description\":\"Test description\",\"slug\":\"test-article\",\"tags\":[\"test\"],\"image_url\":\"https://via.placeholder.com/800x600\"}]}}"
    }
  }'
```

### Check workflow runs:
Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`

## Troubleshooting

### Workflow not triggering
- Check that the PAT has correct permissions
- Verify the webhook URL is correct
- Check GitHub Actions tab for errors

### PR not created
- Check workflow logs in Actions tab
- Verify `GITHUB_TOKEN` has write permissions
- Ensure the script has execute permissions

### Markdown file issues
- Check that `raw_body` is properly JSON-escaped
- Verify all required fields are present
- Look at the PR to see what was generated

## Files

- **Workflow:** `.github/workflows/create-blog-post.yml`
- **Script:** `.github/scripts/create-blog-post.js`
- **Output:** `blog/posts/{slug}.md`
- **Built HTML:** `blog/articles/{slug}.html` (after running `npm run build-blog`)
