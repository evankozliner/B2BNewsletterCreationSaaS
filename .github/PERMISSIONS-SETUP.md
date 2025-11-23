# GitHub Actions Permissions Setup

The workflow needs permission to create Pull Requests. Choose **Option 1** (recommended) or **Option 2**.

## Option 1: Enable Workflow Permissions (Recommended)

This gives the built-in `GITHUB_TOKEN` write access.

### Steps:

1. **Go to your repository settings**
   - Navigate to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings`

2. **Click "Actions" in the left sidebar**
   - Then click "General"

3. **Scroll to "Workflow permissions"**
   - Located near the bottom of the page

4. **Select "Read and write permissions"**
   - Change from "Read repository contents and packages permissions"
   - To: **"Read and write permissions"**

5. **Check the box:**
   - ✅ "Allow GitHub Actions to create and approve pull requests"

6. **Click "Save"**

That's it! The workflow will now work with the default `GITHUB_TOKEN`.

---

## Option 2: Create a Personal Access Token (Alternative)

If you can't enable workflow permissions (or prefer more control), use a PAT.

### Steps:

1. **Create a Personal Access Token**
   - Go to: https://github.com/settings/tokens
   - Click: **"Generate new token (classic)"**
   - Name: `Blog Post Workflow`
   - Expiration: Choose your preference (90 days, 1 year, or No expiration)
   - **Select scopes:**
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
   - Click: **"Generate token"**
   - **Copy the token immediately** (you won't see it again!)

2. **Add the token as a repository secret**
   - Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
   - Click: **"New repository secret"**
   - Name: `BLOG_PAT`
   - Value: Paste the token you copied
   - Click: **"Add secret"**

3. **Done!**
   - The workflow will automatically use `BLOG_PAT` instead of `GITHUB_TOKEN`

---

## Verifying It Works

After setting up permissions:

1. **Trigger the workflow manually** (see `.github/MANUAL-TRIGGER.md`)
2. **Check the workflow run** in the Actions tab
3. **Look for a Pull Request** - should be created successfully

If you still see permission errors:
- Make sure you saved the settings
- Try re-running the workflow
- Check that the PAT hasn't expired (if using Option 2)

---

## Why This Is Needed

GitHub Actions workflows have restricted permissions by default to prevent unauthorized changes. The `create-pull-request` action needs:

- ✅ Permission to create branches
- ✅ Permission to push commits
- ✅ Permission to open Pull Requests

The default `GITHUB_TOKEN` doesn't have these permissions unless you enable them (Option 1) or you create a PAT with broader permissions (Option 2).

---

## Recommended: Option 1

**Use Option 1** unless:
- You're working in an organization with strict security policies
- You need the workflow to work across different repositories
- You want more granular control over permissions

**Option 1 is simpler** and doesn't require managing tokens.
