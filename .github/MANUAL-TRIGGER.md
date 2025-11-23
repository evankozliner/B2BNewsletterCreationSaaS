# Manual Trigger Guide

How to run the "Create Blog Post from Webhook" GitHub Action manually from the UI.

## Steps to Trigger from GitHub UI

1. **Go to the Actions tab**
   - Navigate to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
   - Or click the "Actions" tab at the top of your repository

2. **Select the workflow**
   - In the left sidebar, click: **"Create Blog Post from Webhook"**

3. **Click "Run workflow"**
   - On the right side, click the **"Run workflow"** dropdown button

4. **Paste the webhook JSON**
   - You'll see a text field labeled: "Webhook JSON payload"
   - Paste the entire webhook request JSON (see example below)

5. **Click "Run workflow"** (the green button)

6. **Wait for completion**
   - The workflow will appear in the list below
   - Click on it to see progress and logs
   - When complete, check for a new Pull Request

## Example JSON to Paste

For manual testing, paste this JSON into the text field:

```json
{
  "headers": {
    "content_type": "application/json"
  },
  "querystring": {},
  "raw_body": "{\"event_type\":\"publish_articles\",\"timestamp\":\"2025-11-22T20:53:01.091Z\",\"data\":{\"articles\":[{\"id\":\"test-article-123\",\"title\":\"Sample Article Title for Testing\",\"content_markdown\":\"# Sample Article\\n\\nThis is a test article content in **Markdown** format.\\n\\n## Introduction\\n\\nThis webhook test ensures your endpoint can receive and process article data correctly.\",\"content_html\":\"<h1>Sample Article</h1><p>This is a test article content in <strong>Markdown</strong> format.</p><h2>Introduction</h2><p>This webhook test ensures your endpoint can receive and process article data correctly.</p>\",\"meta_description\":\"A sample article for testing webhook integration with Outrank\",\"created_at\":\"2025-11-22T20:53:01.091Z\",\"image_url\":\"https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Test+Article+Image\",\"slug\":\"sample-article-title-for-testing\",\"tags\":[\"test\",\"webhook\",\"integration\",\"outrank\"]}]}}"
}
```

**Note:** This is the exact format from your original request. Just copy and paste it!

## Customizing the Test

To test with your own content, modify the `raw_body` field. The key fields are:

```json
{
  "raw_body": "{\"event_type\":\"publish_articles\",\"data\":{\"articles\":[{\"title\":\"YOUR_TITLE\",\"content_markdown\":\"YOUR_MARKDOWN_CONTENT\",\"meta_description\":\"YOUR_DESCRIPTION\",\"slug\":\"your-slug\",\"tags\":[\"tag1\",\"tag2\"],\"image_url\":\"https://your-image-url.com/image.jpg\"}]}}"
}
```

**Important:** The `raw_body` must be a JSON string (with escaped quotes), not a JSON object.

## Visual Guide

```
GitHub Repo
    ↓
[Actions Tab]
    ↓
Left Sidebar: "Create Blog Post from Webhook"
    ↓
Right Side: [Run workflow ▼]
    ↓
Text Field: "Webhook JSON payload (paste the entire webhook request)"
    ↓
[Paste JSON here]
    ↓
Green Button: [Run workflow]
```

## After Running

1. **Check workflow status**
   - The workflow will appear in the list
   - Green checkmark = success
   - Red X = failed (click to see logs)

2. **Find the Pull Request**
   - Go to the "Pull requests" tab
   - Look for: "New Blog Post: [Your Title]"

3. **Review and merge**
   - Click on the PR
   - Review the markdown file
   - Merge when ready

4. **Build the HTML**
   - After merging, run: `npm run build-blog`
   - Post will be at: `/blog/articles/your-slug.html`

## Troubleshooting

### "Run workflow" button is grayed out
- Make sure you've committed and pushed the workflow file
- Wait a few minutes for GitHub to process the workflow file
- Refresh the page

### Workflow fails immediately
- Check that you pasted valid JSON
- Ensure the `raw_body` field exists
- Verify the `raw_body` contains `data.articles[0]`

### No PR created
- Check the workflow logs (click on the failed workflow)
- Verify `GITHUB_TOKEN` has write permissions
- Ensure you're not hitting branch limits

## Quick Test Template

Minimal JSON for quick testing:

```json
{
  "raw_body": "{\"data\":{\"articles\":[{\"title\":\"Quick Test Post\",\"content_markdown\":\"# Test\\n\\nQuick test content.\",\"meta_description\":\"Test description\",\"tags\":[\"test\"]}]}}"
}
```

This creates a post with:
- Title: "Quick Test Post"
- Slug: auto-generated as "quick-test-post"
- Minimal content
- Tag: "test"
