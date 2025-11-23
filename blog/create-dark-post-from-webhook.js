#!/usr/bin/env node

/**
 * Creates a dark blog post from webhook data
 * Usage: node blog/create-dark-post-from-webhook.js <webhook-json-file>
 *
 * Example webhook JSON structure:
 * {
 *   "raw_body": "{\"event_type\":\"publish_articles\",\"data\":{\"articles\":[{\"title\":\"...\",\"content_markdown\":\"...\",\"meta_description\":\"...\",\"slug\":\"...\",\"tags\":[...],\"image_url\":\"...\"}]}}"
 * }
 */

const fs = require('fs');
const path = require('path');

// Check if file argument is provided
if (process.argv.length < 3) {
    console.error('Usage: node create-dark-post-from-webhook.js <webhook-json-file>');
    console.error('Example: node create-dark-post-from-webhook.js webhook-data.json');
    process.exit(1);
}

const webhookFile = process.argv[2];

// Read and parse webhook data
let webhookData;
try {
    const fileContent = fs.readFileSync(webhookFile, 'utf-8');
    webhookData = JSON.parse(fileContent);
} catch (error) {
    console.error('Error reading webhook file:', error.message);
    process.exit(1);
}

// Parse the raw_body from the webhook
let articleData;
try {
    const rawBody = JSON.parse(webhookData.raw_body);

    if (!rawBody.data || !rawBody.data.articles || rawBody.data.articles.length === 0) {
        throw new Error('No articles found in webhook data');
    }

    articleData = rawBody.data.articles[0]; // Take the first article
} catch (error) {
    console.error('Error parsing webhook raw_body:', error.message);
    process.exit(1);
}

// Generate frontmatter and content
const today = new Date();
const datePublished = today.toISOString().split('T')[0];
const dateModified = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const dateDisplay = today.toLocaleDateString('en-US', { month: "long", year: '2-digit' }).replace(' ', " '");

const frontmatter = `---
title: "${articleData.title}"
slug: "${articleData.slug}"
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
const outputPath = path.join(__dirname, 'posts', `${articleData.slug}.md`);

try {
    fs.writeFileSync(outputPath, frontmatter);
    console.log(`✓ Created dark post: ${outputPath}`);
    console.log(`\nNext steps:`);
    console.log(`1. Review the post at: blog/posts/${articleData.slug}.md`);
    console.log(`2. Run: npm run build-blog`);
    console.log(`3. The post will be accessible at: blog/articles/${articleData.slug}.html`);
    console.log(`\nNote: This is a "dark" post and will NOT appear in the public blog listing.`);
    console.log(`Dark posts are built to the blog/articles/ subdirectory.`);
} catch (error) {
    console.error('Error writing markdown file:', error.message);
    process.exit(1);
}
