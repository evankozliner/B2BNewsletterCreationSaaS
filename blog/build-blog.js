#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check if required packages are available
let marked, yaml, ejs;
try {
    marked = require('marked');
    yaml = require('js-yaml');
    ejs = require('ejs');
} catch (e) {
    console.error('Required packages not found. Please install them first:');
    console.error('npm install marked js-yaml ejs');
    process.exit(1);
}

const postsDir = path.join(__dirname, 'posts');
const outputDir = __dirname;
const templatesDir = path.join(__dirname, '../templates');

// Custom renderer for tables to detect column width from markdown separator
const renderer = new marked.Renderer();
const originalTableRenderer = renderer.table.bind(renderer);

renderer.table = function(header, body) {
    // We need to detect the column widths from the original markdown
    // This will be passed through the token system
    return `<table>${header}${body}</table>`;
};

// Override the actual parsing to capture separator info
marked.use({
    extensions: [{
        name: 'table',
        level: 'block',
        start(src) {
            return src.match(/^\s*\|/)?.index;
        },
        tokenizer(src) {
            // Let marked handle the tokenization, we'll just add metadata
            return false; // Let default tokenizer handle it
        },
        renderer(token) {
            // Analyze the separator line to determine column widths
            const rows = token.raw.split('\n');
            let separatorLine = '';

            // Find the separator line (contains dashes)
            for (let row of rows) {
                if (row.includes('-') && row.includes('|')) {
                    separatorLine = row;
                    break;
                }
            }

            if (separatorLine) {
                // Extract dash counts from each column
                const columns = separatorLine.split('|').filter(col => col.trim());
                const dashCounts = columns.map(col => (col.match(/-/g) || []).length);

                let tableClass = '';
                let columnWidths = [];

                if (dashCounts.length === 2) {
                    const [left, right] = dashCounts;
                    if (left < right) {
                        tableClass = ' class="table-left-narrow"';
                    } else if (right < left) {
                        tableClass = ' class="table-right-narrow"';
                    }
                } else if (dashCounts.length >= 3) {
                    // Calculate proportional widths based on dash counts
                    const totalDashes = dashCounts.reduce((sum, count) => sum + count, 0);
                    columnWidths = dashCounts.map(count => {
                        const percentage = Math.round((count / totalDashes) * 100);
                        return `${percentage}%`;
                    });
                    tableClass = ' class="table-multi-column"';
                }

                // Generate table HTML
                let html = `<table${tableClass}>`;

                // Generate thead with width styles if we have column widths
                if (columnWidths.length > 0) {
                    html += '<thead>' + token.header.map((cell, index) =>
                        `<th style="width: ${columnWidths[index]}">${this.parser.parseInline(cell.tokens)}</th>`
                    ).join('') + '</thead>';
                } else {
                    html += '<thead>' + token.header.map(cell =>
                        `<th>${this.parser.parseInline(cell.tokens)}</th>`
                    ).join('') + '</thead>';
                }

                html += '<tbody>';
                token.rows.forEach(row => {
                    html += '<tr>';
                    row.forEach((cell, index) => {
                        if (columnWidths.length > 0) {
                            html += `<td style="width: ${columnWidths[index]}">${this.parser.parseInline(cell.tokens)}</td>`;
                        } else {
                            html += `<td>${this.parser.parseInline(cell.tokens)}</td>`;
                        }
                    });
                    html += '</tr>';
                });
                html += '</tbody></table>';

                return html;
            }

            return false; // Fall back to default
        }
    }]
});

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
function generateTableOfContents(markdownContent, tocTitles = []) {
    const htmlContent = marked.parse(markdownContent);

    // Simple regex to extract only H2 headers
    const headerRegex = /<h2.*?>(.*?)<\/h2>/g;
    const headers = [];
    let match;

    while ((match = headerRegex.exec(htmlContent)) !== null) {
        const index = headers.length;
        const defaultText = match[1].replace(/<[^>]*>/g, ''); // Strip HTML tags
        const displayText = tocTitles[index] || defaultText; // Use custom title if provided

        headers.push({
            level: 2,
            text: displayText,
            id: `section-${index}`
        });
    }

    if (headers.length === 0) {
        return '<p style="color: #666; font-style: italic;">No sections found</p>';
    }

    return headers.map(header => {
        return `<a href="#${header.id}">${header.text}</a>`;
    }).join('');
}

// Function to add IDs to headers in HTML content
function addHeaderIds(htmlContent) {
    let headerIndex = 0;
    // Only add IDs to H2 headers to match the TOC generation
    return htmlContent.replace(/<h2([^>]*)>(.*?)<\/h2>/g, (match, attrs, text) => {
        const id = `section-${headerIndex++}`;
        return `<h2${attrs} id="${id}">${text}</h2>`;
    });
}

// Function to convert relative on-website paths to absolute paths
function convertRelativeToAbsolutePaths(htmlContent) {
    // Convert relative image paths (src="../something.svg" or src="../path/to/file.ext")
    htmlContent = htmlContent.replace(/(<img[^>]+src=["'])\.\.\/([^"']+)(["'])/g, '$1/$2$3');

    // Convert relative anchor paths (href="../something")
    htmlContent = htmlContent.replace(/(<a[^>]+href=["'])\.\.\/([^"']+)(["'])/g, '$1/$2$3');

    return htmlContent;
}

// Function to build a single post using EJS
async function buildPost(markdownFile) {
    console.log(`Building ${markdownFile}...`);

    const filePath = path.join(postsDir, markdownFile);
    const { frontmatter, content } = parseMarkdownFile(filePath);

    // Determine if this is a dark post
    const isDarkPost = frontmatter.dark === true;

    // Generate HTML content from markdown
    let htmlContent = marked.parse(content);
    htmlContent = addHeaderIds(htmlContent);
    htmlContent = convertRelativeToAbsolutePaths(htmlContent);

    // Generate table of contents
    const tableOfContents = generateTableOfContents(content, frontmatter.tocTitles || []);
    
    // Generate tags HTML
    const tagsHtml = frontmatter.tags.map(tag => 
        `<span class="post-tag" data-tag="${tag}">${tag}</span>`
    ).join('');
    
    // Generate image HTML if exists
    const imageHtml = frontmatter.image && frontmatter.image !== 'placeholder'
        ? `<div class="post-image"><img src="${frontmatter.image}" alt="${frontmatter.title}" /></div>`
        : '';

    // Convert author avatar relative path to absolute
    if (frontmatter.author && frontmatter.author.avatar && frontmatter.author.avatar.startsWith('../')) {
        frontmatter.author.avatar = frontmatter.author.avatar.replace(/^\.\.\//, '/');
    }

    // Prepare template data
    // For dark posts, we need to adjust paths since they're in a subdirectory
    const baseUrl = isDarkPost ? '../../' : '../';

    const templateData = {
        title: `${frontmatter.title}${frontmatter.date ? ` (${frontmatter.date} Case Study)` : ''} | Potions`,
        description: frontmatter.excerpt,
        keywords: frontmatter.keywords || 'Newsletter, Email Marketing, Marketing, Blog',
        author: 'Potions',
        baseUrl: baseUrl,
        styleSheet: 'style.css',
        additionalCSS: ['blog/blog.css', 'blog/post.css'],
        showBlogLink: true,
        tracking: true,
        scripts: ['hamburger.js'],
        canonicalUrl: `https://withpotions.com/blog/${isDarkPost ? 'articles/' : ''}${frontmatter.slug}.html`,
        navTargetPage: '/', // Normal page: nav points to homepage
        // SEO-specific data
        frontmatter: frontmatter, // Pass the entire frontmatter for SEO usage
        isBlogPost: true,
        isDarkPost: isDarkPost, // Flag for dark posts
        body: `    <main class="post-main">
        <div class="post-container">
            <div class="post-sidebar">
                <div class="table-of-contents">
                    <h3>Table of Contents</h3>
                    <nav id="toc-nav">
                        ${tableOfContents}
                    </nav>
                </div>
            </div>

            <div class="post-content">
                <article class="blog-post-full">
                    <div class="post-header">
                        <h1>${frontmatter.title}</h1>
                        ${frontmatter.subheader ? `<p class="post-subheader">${frontmatter.subheader}</p>` : ''}
                        <div class="post-meta">
                            <span>${frontmatter.date}</span>
                            ${frontmatter.dateModified ? `<span class="date-modified">Last updated: ${frontmatter.dateModified}</span>` : ''}
                            <div class="post-tags">
                                ${tagsHtml}
                            </div>
                        </div>
                        <div class="share-button">
                            <button id="share-btn">
                                <img src="/share.svg" alt="Share" width="20" height="20">
                            </button>
                        </div>
                    </div>
                    ${imageHtml}
                    <div class="post-body">
                        ${htmlContent}
                    </div>
                </article>
            </div>

            <div class="post-right-sidebar">
                <div class="author-card">
                    <div class="author-avatar">
                        <img src="${frontmatter.author.avatar}" alt="${frontmatter.author.name}">
                    </div>
                    <div class="author-info">
                        <h4>${frontmatter.author.name}</h4>
                        <p>${frontmatter.author.bio}</p>
                        <a href="${frontmatter.author.social}" class="author-social">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <rect width="24" height="24" fill="#0077B5" rx="4"/>
                                <path fill="white" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <div class="sticky-cta-wrapper">
                    <div class="cta-card">
                        <div class="cta-content">
                            <div class="cta-logo">
                                <img src="/potions-logo.svg" alt="Potions Logo">
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

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Handle share button
            const shareBtn = document.getElementById('share-btn');
            if (shareBtn) {
                shareBtn.addEventListener('click', async () => {
                    if (navigator.share) {
                        try {
                            await navigator.share({
                                title: '${frontmatter.title}',
                                text: '${frontmatter.excerpt}',
                                url: window.location.href
                            });
                        } catch (err) {
                            if (err.name !== 'AbortError') {
                                copyToClipboard();
                            }
                        }
                    } else {
                        copyToClipboard();
                    }
                });
            }

            function copyToClipboard() {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    const shareBtn = document.getElementById('share-btn');
                    const originalHTML = shareBtn.innerHTML;
                    shareBtn.innerHTML = '✓ Copied!';
                    setTimeout(() => {
                        shareBtn.innerHTML = originalHTML;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                    alert('Link copied to clipboard!');
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
        });
    </script>`
    };
    
    // Render template
    const templatePath = path.join(templatesDir, 'layout.ejs');
    const html = await ejs.renderFile(templatePath, templateData);

    // Write HTML file - dark posts go in articles/ subdirectory
    let outputPath;
    if (isDarkPost) {
        const articlesDir = path.join(outputDir, 'articles');
        if (!fs.existsSync(articlesDir)) {
            fs.mkdirSync(articlesDir, { recursive: true });
        }
        outputPath = path.join(articlesDir, `${frontmatter.slug}.html`);
    } else {
        outputPath = path.join(outputDir, `${frontmatter.slug}.html`);
    }
    fs.writeFileSync(outputPath, html);
    
    // Return frontmatter plus the raw markdown content for search
    return { ...frontmatter, content };
}

// Function to generate blog-data.js with post data only
function generateBlogData(posts) {
    // Filter out dark posts from the public blog listing
    const publicPosts = posts.filter(post => !post.dark);

    const blogData = publicPosts.map((post, index) => ({
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
async function buildBlog() {
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
    for (const file of markdownFiles) {
        try {
            const postData = await buildPost(file);
            posts.push(postData);
            const location = postData.dark ? 'articles/' : '';
            console.log(`✓ Built ${location}${postData.slug}.html`);
        } catch (error) {
            console.error(`✗ Error building ${file}:`, error.message);
        }
    }
    
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
buildBlog().catch(console.error);