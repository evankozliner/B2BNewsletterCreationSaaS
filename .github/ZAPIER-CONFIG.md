# Zapier Webhook Configuration

Quick reference for setting up the Zapier webhook to trigger blog post creation.

## Webhook Action Setup

### 1. Add "Webhooks by Zapier" Action

Choose: **POST** request

### 2. Configure the Request

**URL:**
```
https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO_NAME/dispatches
```
Replace:
- `YOUR_USERNAME` with your GitHub username (e.g., `evankozliner`)
- `YOUR_REPO_NAME` with your repo name (e.g., `B2BNewsletterCreationSaaS`)

Example:
```
https://api.github.com/repos/evankozliner/B2BNewsletterCreationSaaS/dispatches
```

### 3. Set Headers

Add these 3 headers:

| Header | Value |
|--------|-------|
| `Accept` | `application/vnd.github.v3+json` |
| `Authorization` | `Bearer YOUR_GITHUB_PAT` |
| `Content-Type` | `application/json` |

**Important:** Replace `YOUR_GITHUB_PAT` with your actual GitHub Personal Access Token (see below for setup).

### 4. Configure Request Body

**Payload Type:** JSON

**Data:**

If your Zapier trigger provides the exact webhook structure you showed, map it like this:

```json
{
  "event_type": "create-blog-post",
  "client_payload": {
    "headers": {{1. Headers}},
    "querystring": {{1. Querystring}},
    "raw_body": {{1. Raw Body}}
  }
}
```

Where `{{1. Headers}}`, `{{1. Querystring}}`, and `{{1. Raw Body}}` are mapped from your trigger step.

**Alternative - Hardcoded Test:**

For testing, you can use:

```json
{
  "event_type": "create-blog-post",
  "client_payload": {
    "headers": {
      "content_type": "application/json"
    },
    "querystring": {},
    "raw_body": "{\"event_type\":\"publish_articles\",\"timestamp\":\"2025-11-22T20:53:01.091Z\",\"data\":{\"articles\":[{\"id\":\"test-123\",\"title\":\"Test Article from Zapier\",\"content_markdown\":\"# Test Article\\n\\nThis is test content.\",\"meta_description\":\"Test article description\",\"slug\":\"test-article-zapier\",\"tags\":[\"test\"],\"image_url\":\"https://via.placeholder.com/800x600\"}]}}"
  }
}
```

## Creating GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click: **Generate new token (classic)**
3. Token name: `Zapier Blog Webhook`
4. Expiration: Choose based on your preference (90 days, 1 year, or No expiration)
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Click: **Generate token**
7. **Copy the token immediately** (you won't see it again!)
8. Use this token in Zapier's `Authorization` header: `Bearer YOUR_TOKEN_HERE`

## Testing the Webhook

### Option 1: Test in Zapier
1. Use Zapier's "Test" button
2. Check GitHub Actions: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
3. Look for a new workflow run called "Create Blog Post from Webhook"

### Option 2: Test with curl
```bash
curl -X POST \
  https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: Bearer YOUR_GITHUB_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "create-blog-post",
    "client_payload": {
      "raw_body": "{\"event_type\":\"publish_articles\",\"data\":{\"articles\":[{\"title\":\"Test Post\",\"content_markdown\":\"# Test\\n\\nContent\",\"meta_description\":\"Test\",\"tags\":[\"test\"]}]}}"
    }
  }'
```

## Verifying It Works

After triggering the webhook:

1. **Check GitHub Actions:**
   - Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
   - You should see a new workflow run
   - Click on it to see logs

2. **Check for Pull Request:**
   - Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/pulls`
   - You should see a new PR with title: "New Blog Post: {your article title}"

3. **Review the PR:**
   - The PR will contain a new file: `blog/posts/{slug}.md`
   - Review the content
   - Merge when ready

4. **Build and view:**
   - After merging, run: `npm run build-blog`
   - Post will be at: `/blog/articles/{slug}.html`

## Common Issues

### "Not Found" or 404 Error
- Check your repository URL is correct
- Verify the PAT has `repo` scope
- Make sure the repository exists and you have access

### "Bad credentials" Error
- Check your PAT is correct
- Ensure you included "Bearer " before the token
- Verify the PAT hasn't expired

### Workflow doesn't run
- Check the `event_type` is exactly: `create-blog-post`
- Verify GitHub Actions are enabled for your repo
- Check repo Settings → Actions → General → Allow all actions

### PR not created
- Check workflow logs for errors
- Verify `GITHUB_TOKEN` has write permissions
- Ensure branch protection rules don't block automated PRs

## Data Mapping Reference

From your webhook to the GitHub Action:

| Webhook Field | Used For | Required |
|---------------|----------|----------|
| `data.articles[0].title` | Post title & filename | ✅ Yes |
| `data.articles[0].content_markdown` | Post content | ✅ Yes |
| `data.articles[0].meta_description` | SEO excerpt | ✅ Yes |
| `data.articles[0].slug` | URL slug | No (auto-generated from title) |
| `data.articles[0].tags` | Post tags | No (defaults to `["AI", "Generated"]`) |
| `data.articles[0].image_url` | Header image | No (defaults to placeholder) |
