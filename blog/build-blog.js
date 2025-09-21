#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check if marked is available, if not provide installation instructions
let marked;
try {
    marked = require('marked');
} catch (e) {
    console.error('marked package not found. Please install it first:');
    console.error('npm install marked js-yaml');
    process.exit(1);
}

let yaml;
try {
    yaml = require('js-yaml');
} catch (e) {
    console.error('js-yaml package not found. Please install it first:');
    console.error('npm install marked js-yaml');
    process.exit(1);
}

const postsDir = path.join(__dirname, 'posts');
const outputDir = __dirname;

// HTML template for individual blog posts
const postTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="{{excerpt}}" />
    <meta property="og:image" content="https://withpotions.com/PotionsPreview.png" />
    <meta name="keywords" content="Newsletter, Email Marketing, Marketing, Blog" />
    <meta name="author" content="Potions" />
    <link rel="stylesheet" href="../style.css" />
    <link rel="stylesheet" href="blog.css" />
    <link rel="stylesheet" href="post.css" />
    <link rel="stylesheet" type="text/css" href="../webfonts/prosa-light.css">
    <link rel="icon" href="../airplane.svg" />
    <title>{{title}} | Potions</title>
</head>
<body>
    <header>
        <nav>
            <div class="logo">
                <a href="../index.html">
                    <img src="../potions-logo.svg" alt="Logo" class="logo-img">
                </a>
            </div>
            <ul class="nav-links">
                <li><a href="../index.html#testimonial" class="hover-underline">Testimonials</a></li>
                <li><a href="../samples.html" class="hover-underline">Samples</a></li>
                <li><a href="index.html" class="hover-underline">Blog</a></li>
                <li><a href="../index.html#faq" class="hover-underline">FAQ</a></li>
                <li><a href="../index.html#pricing" class="hover-underline">Pricing</a></li>
                <li><a href="https://billing.stripe.com/p/login/5kA7tpbg6cSJ8gwbII" class="hover-underline">Manage Subscription</a></li>
            </ul>
            <div class="burger">
                <div></div>
                <div></div>
                <div></div>
            </div>
        </nav>
    </header>

    <main class="post-main">
        <div class="post-container">
            <div class="post-sidebar">
                <div class="table-of-contents">
                    <h3>Table of Contents</h3>
                    <nav id="toc-nav">
                        {{tableOfContents}}
                    </nav>
                </div>
            </div>

            <div class="post-content">
                <article class="blog-post-full">
                    <div class="post-header">
                        <h1>{{title}}</h1>
                        <div class="post-meta">
                            <span>{{date}}</span>
                            <div class="post-tags">
                                {{tags}}
                            </div>
                        </div>
                        <div class="share-button">
                            <button id="share-btn">
                                <img src="../share.svg" alt="Share" width="20" height="20">
                            </button>
                        </div>
                    </div>
                    {{image}}
                    <div class="post-body">
                        {{content}}
                    </div>
                </article>
            </div>

            <div class="post-right-sidebar">
                <div class="author-card">
                    <div class="author-avatar">
                        <img src="{{authorAvatar}}" alt="{{authorName}}">
                    </div>
                    <div class="author-info">
                        <h4>{{authorName}}</h4>
                        <p>{{authorBio}}</p>
                        <a href="{{authorSocial}}" class="author-social">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0077B5">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <div class="sticky-cta-wrapper">
                    <div class="cta-card">
                        <div class="cta-content">
                            <div class="cta-logo">
                                <img src="../potions-logo.svg" alt="Potions Logo">
                            </div>
                            <p>Confused about where to start? We can help. Get your first newsletter designed for you for free.</p>
                            <a href="https://dzlivd9t4eb.typeform.com/to/kMeO3tlp" class="cta-button">
                                Try it for free!
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <footer class="footer">
        <ul>
            <li><a href="../terms_and_conditions.html">Terms & Conditions</a></li>
            <li>©Potions 2025. All rights reserved.</li>
            <li><a href="../private_policy.html">Privacy Policy</a></li>
        </ul>
    </footer>

    <script src="../hamburger.js"></script>
    <script>
        // Handle share button
        document.getElementById('share-btn').addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: '{{title}}',
                        text: '{{excerpt}}',
                        url: window.location.href
                    });
                } catch (err) {
                    copyToClipboard();
                }
            } else {
                copyToClipboard();
            }
        });

        function copyToClipboard() {
            navigator.clipboard.writeText(window.location.href).then(() => {
                const shareBtn = document.getElementById('share-btn');
                const originalHTML = shareBtn.innerHTML;
                shareBtn.innerHTML = '✓';
                setTimeout(() => {
                    shareBtn.innerHTML = originalHTML;
                }, 2000);
            });
        }

        // Handle tag clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('post-tag')) {
                const tag = e.target.dataset.tag;
                if (tag) {
                    window.location.href = \`index.html?tag=\${encodeURIComponent(tag)}\`;
                }
            }
        });
    </script>
</body>
</html>`;

// Function to parse markdown file with frontmatter
function parseMarkdownFile(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Extract frontmatter
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = fileContent.match(frontmatterRegex);
    
    if (!match) {
        throw new Error('No frontmatter found in file');
    }
    
    const frontmatter = yaml.load(match[1]);
    const markdownContent = fileContent.slice(match[0].length).trim();
    
    return { frontmatter, content: markdownContent };
}

// Function to generate table of contents from markdown
function generateTableOfContents(markdownContent) {
    const htmlContent = marked.parse(markdownContent);
    
    // Simple regex to extract headers
    const headerRegex = /<h([23]).*?>(.*?)<\/h[23]>/g;
    const headers = [];
    let match;
    
    while ((match = headerRegex.exec(htmlContent)) !== null) {
        headers.push({
            level: parseInt(match[1]),
            text: match[2].replace(/<[^>]*>/g, ''), // Strip HTML tags
            id: `section-${headers.length}`
        });
    }
    
    if (headers.length === 0) {
        return '<p style="color: #666; font-style: italic;">No sections found</p>';
    }
    
    return headers.map(header => {
        const indent = header.level === 3 ? 'padding-left: 16px;' : '';
        return `<a href="#${header.id}" style="${indent}">${header.text}</a>`;
    }).join('');
}

// Function to add IDs to headers in HTML content
function addHeaderIds(htmlContent) {
    let headerIndex = 0;
    return htmlContent.replace(/<h([23])([^>]*)>(.*?)<\/h[23]>/g, (match, level, attrs, text) => {
        const id = `section-${headerIndex++}`;
        return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
    });
}

// Function to build a single post
function buildPost(markdownFile) {
    console.log(`Building ${markdownFile}...`);
    
    const filePath = path.join(postsDir, markdownFile);
    const { frontmatter, content } = parseMarkdownFile(filePath);
    
    // Generate HTML content from markdown
    let htmlContent = marked.parse(content);
    htmlContent = addHeaderIds(htmlContent);
    
    // Generate table of contents
    const tableOfContents = generateTableOfContents(content);
    
    // Generate tags HTML
    const tagsHtml = frontmatter.tags.map(tag => 
        `<span class="post-tag" data-tag="${tag}">${tag}</span>`
    ).join('');
    
    // Generate image HTML if exists
    const imageHtml = frontmatter.image && frontmatter.image !== 'placeholder' 
        ? `<div class="post-image"><img src="${frontmatter.image}" alt="${frontmatter.title}" /></div>`
        : '';
    
    // Replace template variables
    let html = postTemplate
        .replace(/{{title}}/g, frontmatter.title)
        .replace(/{{excerpt}}/g, frontmatter.excerpt)
        .replace(/{{date}}/g, frontmatter.date)
        .replace(/{{tags}}/g, tagsHtml)
        .replace(/{{content}}/g, htmlContent)
        .replace(/{{tableOfContents}}/g, tableOfContents)
        .replace(/{{image}}/g, imageHtml)
        .replace(/{{authorName}}/g, frontmatter.author.name)
        .replace(/{{authorBio}}/g, frontmatter.author.bio)
        .replace(/{{authorAvatar}}/g, frontmatter.author.avatar)
        .replace(/{{authorSocial}}/g, frontmatter.author.social);
    
    // Write HTML file
    const outputPath = path.join(outputDir, `${frontmatter.slug}.html`);
    fs.writeFileSync(outputPath, html);
    
    // Return frontmatter plus the raw markdown content for search
    return { ...frontmatter, content };
}

// Function to generate blog-data.js with post data only
function generateBlogData(posts) {
    const blogData = posts.map((post, index) => ({
        id: index + 1,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content, // Include full content for search
        date: post.date,
        tags: post.tags,
        image: post.image,
        author: post.author
    }));
    
    const jsContent = `// Auto-generated blog data - DO NOT EDIT THIS FILE MANUALLY
// Generated on ${new Date().toISOString()}
// Run 'npm run build-blog' to update this file from markdown posts

const blogPosts = ${JSON.stringify(blogData, null, 4)};`;
    
    fs.writeFileSync(path.join(outputDir, 'blog-data.js'), jsContent);
}

// Main build function
function buildBlog() {
    console.log('Building blog from markdown files...');
    
    if (!fs.existsSync(postsDir)) {
        console.error('Posts directory not found. Please create blog/posts/ directory with markdown files.');
        process.exit(1);
    }
    
    const markdownFiles = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    
    if (markdownFiles.length === 0) {
        console.error('No markdown files found in posts directory.');
        process.exit(1);
    }
    
    const posts = [];
    
    // Build each post
    markdownFiles.forEach(file => {
        try {
            const postData = buildPost(file);
            posts.push(postData);
            console.log(`✓ Built ${postData.slug}.html`);
        } catch (error) {
            console.error(`✗ Error building ${file}:`, error.message);
        }
    });
    
    // Generate JavaScript file with blog data only
    generateBlogData(posts);
    console.log('✓ Generated blog-data.js');
    
    console.log(`\nBuild complete! Generated ${posts.length} blog posts.`);
    console.log(`\nBlog data has been updated in blog-data.js`);
    console.log(`Make sure your blog/index.html includes both:
<script src="blog-data.js"></script>
<script src="blog-logic.js"></script>`);
}

// Run the build
buildBlog();