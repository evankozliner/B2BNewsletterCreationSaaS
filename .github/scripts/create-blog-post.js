#!/usr/bin/env node

/**
 * GitHub Action script to create blog post from webhook data
 * Reads webhook payload and creates a markdown file
 */

const fs = require('fs');
const path = require('path');

// Read the webhook payload from environment variable
const payload = process.env.WEBHOOK_PAYLOAD;

if (!payload) {
    console.error('Error: WEBHOOK_PAYLOAD environment variable not set');
    process.exit(1);
}

let webhookData;
try {
    webhookData = JSON.parse(payload);
} catch (error) {
    console.error('Error parsing webhook payload:', error.message);
    process.exit(1);
}

// Parse the raw_body
let articleData;
try {
    const rawBody = JSON.parse(webhookData.raw_body);

    if (!rawBody.data || !rawBody.data.articles || rawBody.data.articles.length === 0) {
        throw new Error('No articles found in webhook data');
    }

    articleData = rawBody.data.articles[0];
} catch (error) {
    console.error('Error parsing raw_body:', error.message);
    process.exit(1);
}

// Generate slug from title if not provided
let slug = articleData.slug;
if (!slug) {
    slug = articleData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Generate date strings
const today = new Date();
const datePublished = today.toISOString().split('T')[0];
const dateModified = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const dateDisplay = today.toLocaleDateString('en-US', { month: "long", year: '2-digit' }).replace(' ', " '");

// Prepare frontmatter
const frontmatter = `---
title: "${articleData.title}"
slug: "${slug}"
excerpt: "${articleData.meta_description || 'AI-generated article from Outrank'}"
date: "${dateDisplay}"
datePublished: "${datePublished}"
dateModified: "${dateModified}"
tags: ${JSON.stringify(articleData.tags || ['AI', 'Generated'])}
image: "${articleData.image_url || 'https://via.placeholder.com/800x600'}"
keywords: "${(articleData.tags || []).join(', ')}"
dark: true
author:
  name: "Evan Kozliner"
  bio: "Evan is the founder of Potions, helping companies build newsletters that drive revenue."
  avatar: "../evan-li.webp"
  social: "https://linkedin.com/in/evan-kozliner"
  jobTitle: "Founder of Potions"
seo:
  ogImage: "${articleData.image_url || 'https://via.placeholder.com/800x600'}"
  twitterImage: "${articleData.image_url || 'https://via.placeholder.com/800x600'}"
  articleSection: "AI Generated"
---

${articleData.content_markdown}
`;

// Write the markdown file
const postsDir = path.join(process.cwd(), 'blog', 'posts');
const outputPath = path.join(postsDir, `${slug}.md`);

try {
    fs.writeFileSync(outputPath, frontmatter);
    console.log(`✓ Created blog post: ${outputPath}`);

    // Output GitHub Actions variables
    console.log(`::set-output name=slug::${slug}`);
    console.log(`::set-output name=title::${articleData.title}`);
    console.log(`::set-output name=filename::${slug}.md`);
} catch (error) {
    console.error('Error writing markdown file:', error.message);
    process.exit(1);
}
