// Post page functionality
let currentPost = null;

// Get post ID from URL parameter or window variable
function getPostIdFromUrl() {
    // Check if post ID is hardcoded in window object (for clean URLs)
    if (window.BLOG_POST_ID) {
        return window.BLOG_POST_ID.toString();
    }
    
    // Otherwise get from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Get post by ID from blog posts data
function getPostById(id) {
    return blogPosts.find(post => post.id === parseInt(id));
}

// Generate table of contents from post content
function generateTableOfContents(content) {
    const tocNav = document.getElementById('toc-nav');
    
    // Create a temporary div to parse the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Find all h2 and h3 elements
    const headers = tempDiv.querySelectorAll('h2, h3');
    
    if (headers.length === 0) {
        tocNav.innerHTML = '<p style="color: #666; font-style: italic;">No sections found</p>';
        return;
    }
    
    let tocHTML = '';
    headers.forEach((header, index) => {
        const text = header.textContent;
        const id = `section-${index}`;
        
        // Add ID to the header for linking
        header.id = id;
        
        // Create TOC entry
        const level = header.tagName.toLowerCase();
        const indent = level === 'h3' ? 'padding-left: 16px;' : '';
        
        tocHTML += `<a href="#${id}" style="${indent}">${text}</a>`;
    });
    
    tocNav.innerHTML = tocHTML;
    
    // Update the post body with the modified content
    document.getElementById('post-body').innerHTML = tempDiv.innerHTML;
}

// Handle table of contents clicks and active states
function handleTocNavigation() {
    const tocLinks = document.querySelectorAll('#toc-nav a');
    
    // Add click handlers
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Handle active states on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all links
                tocLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current section link
                const activeLink = document.querySelector(`#toc-nav a[href="#${entry.target.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, {
        rootMargin: '-20% 0px -35% 0px'
    });
    
    // Observe all header elements
    const headers = document.querySelectorAll('.post-body h2, .post-body h3');
    headers.forEach(header => {
        observer.observe(header);
    });
}

// Render post content
function renderPost(post) {
    if (!post) {
        // Redirect to blog index if post not found
        window.location.href = 'index.html';
        return;
    }
    
    currentPost = post;
    
    // Update page title
    document.getElementById('page-title').textContent = `${post.title} | Potions Blog`;
    document.title = `${post.title} | Potions Blog`;
    
    // Update post title
    document.getElementById('post-title').textContent = post.title;
    
    // Update post meta
    document.getElementById('post-date').textContent = post.date;
    
    // Update tags
    const tagsContainer = document.getElementById('post-tags');
    tagsContainer.innerHTML = post.tags.map(tag => 
        `<span class="post-tag" data-tag="${tag}">${tag}</span>`
    ).join('');
    
    // Add image after meta if it exists
    const postHeader = document.querySelector('.post-header');
    const existingImage = postHeader.querySelector('.post-image');
    if (existingImage) {
        existingImage.remove();
    }
    
    if (post.image && post.image !== 'placeholder') {
        const imageDiv = document.createElement('div');
        imageDiv.className = 'post-image';
        imageDiv.innerHTML = `<img src="${post.image}" alt="${post.title}" />`;
        postHeader.appendChild(imageDiv);
    }
    
    // Generate and render post content with TOC
    generateTableOfContents(post.fullContent || post.content);
    
    // Set up TOC navigation
    setTimeout(() => {
        handleTocNavigation();
    }, 100);
    
    // Update author info if provided
    if (post.author) {
        if (post.author.name) document.getElementById('author-name').textContent = post.author.name;
        if (post.author.bio) document.getElementById('author-bio').textContent = post.author.bio;
        if (post.author.avatar) document.getElementById('author-avatar').src = post.author.avatar;
        if (post.author.social) document.getElementById('author-social').href = post.author.social;
    }
}

// Handle share button
function handleShareButton() {
    const shareBtn = document.getElementById('share-btn');
    shareBtn.addEventListener('click', async () => {
        if (navigator.share && currentPost) {
            try {
                await navigator.share({
                    title: currentPost.title,
                    text: currentPost.excerpt,
                    url: window.location.href
                });
            } catch (err) {
                // Fallback to copying URL
                copyToClipboard();
            }
        } else {
            copyToClipboard();
        }
    });
}

function copyToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        // Show feedback
        const shareBtn = document.getElementById('share-btn');
        const originalHTML = shareBtn.innerHTML;
        shareBtn.innerHTML = '✓';
        setTimeout(() => {
            shareBtn.innerHTML = originalHTML;
        }, 2000);
    });
}

// Handle tag clicks to navigate to blog index with filter
function handleTagClicks() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('post-tag')) {
            const tag = e.target.dataset.tag;
            if (tag) {
                // Navigate to blog index with tag parameter
                window.location.href = `index.html?tag=${encodeURIComponent(tag)}`;
            }
        }
    });
}

// Initialize post page
function initPostPage() {
    const postId = getPostIdFromUrl();
    
    if (!postId) {
        // Redirect to blog index if no ID provided
        window.location.href = 'index.html';
        return;
    }
    
    const post = getPostById(postId);
    renderPost(post);
    handleShareButton();
    handleTagClicks();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for blog posts data to be available
    if (typeof blogPosts !== 'undefined') {
        initPostPage();
    } else {
        // Retry after a short delay if blog.js hasn't loaded yet
        setTimeout(initPostPage, 100);
    }
});