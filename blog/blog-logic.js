// Blog functionality logic (static, doesn't change when posts are rebuilt)

// Utility function to convert title to URL slug
function titleToSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim('-'); // Remove leading/trailing hyphens
}

// Get unique tags from all blog posts
function getUniqueTags() {
    const allTags = blogPosts.flatMap(post => post.tags);
    return [...new Set(allTags)].sort();
}

// Render blog posts
function renderBlogPosts(posts) {
    const blogPostsContainer = document.getElementById('blog-posts');
    
    if (posts.length === 0) {
        blogPostsContainer.innerHTML = '<div class="no-results">No posts found matching your criteria.</div>';
        return;
    }
    
    blogPostsContainer.innerHTML = posts.map(post => `
        <article class="blog-post" data-post-id="${post.id}">
            <div class="blog-post-content">
                <h2>${post.title}</h2>
                <p class="blog-post-excerpt">${post.excerpt}</p>
                <div class="blog-post-meta">
                    <span class="blog-post-date">${post.date}</span>
                    <div class="blog-post-tags">
                        ${post.tags.map(tag => `<span class="blog-post-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="blog-post-image">
                ${post.image && post.image !== 'placeholder' ? 
                    `<img src="${post.image}" alt="${post.title}" />` : 
                    'Image placeholder'
                }
            </div>
        </article>
    `).join('');
}

// Filter posts by tags
function filterPostsByTags(activeTags) {
    if (activeTags.includes('all') || activeTags.length === 0) {
        return blogPosts;
    }
    
    return blogPosts.filter(post => 
        activeTags.some(tag => post.tags.includes(tag))
    );
}

// Search posts
function searchPosts(query) {
    if (!query.trim()) {
        return blogPosts;
    }
    
    const searchTerm = query.toLowerCase();
    return blogPosts.filter(post => {
        // Search in title, excerpt, and tags
        const inTitle = post.title.toLowerCase().includes(searchTerm);
        const inExcerpt = post.excerpt.toLowerCase().includes(searchTerm);
        const inTags = post.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        // Also search in full content if available
        const inContent = post.content ? post.content.toLowerCase().includes(searchTerm) : false;
        
        return inTitle || inExcerpt || inTags || inContent;
    });
}

// Get currently active tags
function getActiveTags() {
    const activeButtons = document.querySelectorAll('.tag-btn.active');
    return Array.from(activeButtons).map(btn => btn.dataset.tag);
}

// Update display based on current filters
function updateDisplay() {
    const activeTags = getActiveTags();
    const searchQuery = document.getElementById('search-input').value;
    
    let filteredPosts = blogPosts;
    
    // Apply tag filter
    filteredPosts = filterPostsByTags(activeTags);
    
    // Apply search filter
    if (searchQuery.trim()) {
        const searchResults = searchPosts(searchQuery);
        filteredPosts = filteredPosts.filter(post => searchResults.includes(post));
    }
    
    renderBlogPosts(filteredPosts);
}

// Render tag buttons
function renderTagButtons() {
    const uniqueTags = getUniqueTags();
    const tagsContainer = document.querySelector('.blog-tags');
    
    tagsContainer.innerHTML = `
        <button class="tag-btn active" data-tag="all">All</button>
        ${uniqueTags.map(tag => `<button class="tag-btn" data-tag="${tag}">${tag}</button>`).join('')}
    `;
}

// Apply tag filter from URL parameter
function applyTagFilter(tagName) {
    // Clear all active states
    document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
    
    // Find and activate the matching tag button
    const targetButton = document.querySelector(`.tag-btn[data-tag="${tagName}"]`);
    if (targetButton) {
        targetButton.classList.add('active');
        updateDisplay();
    } else {
        // If tag not found, activate 'all'
        document.querySelector('.tag-btn[data-tag="all"]').classList.add('active');
    }
}

// Initialize the blog
function initBlog() {
    renderTagButtons();
    renderBlogPosts(blogPosts);
    
    // Check for tag parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tagParam = urlParams.get('tag');
    if (tagParam) {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => applyTagFilter(tagParam), 0);
    }
    
    // Set up event listeners
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag-btn')) {
            // Handle multi-select for tags
            if (e.target.dataset.tag === 'all') {
                // If 'All' is clicked, deactivate all other tags
                document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            } else {
                // Toggle individual tag
                e.target.classList.toggle('active');
                
                // Deactivate 'All' if any other tag is active
                const allBtn = document.querySelector('.tag-btn[data-tag="all"]');
                const activeNonAllBtns = document.querySelectorAll('.tag-btn.active:not([data-tag="all"])');
                
                if (activeNonAllBtns.length > 0) {
                    allBtn.classList.remove('active');
                } else {
                    // If no tags are active, activate 'All'
                    allBtn.classList.add('active');
                }
            }
            
            updateDisplay();
        }
        
        // Handle blog post card clicks
        if (e.target.closest('.blog-post')) {
            const postCard = e.target.closest('.blog-post');
            const postId = parseInt(postCard.dataset.postId);
            const post = blogPosts.find(p => p.id === postId);
            
            if (post) {
                // Navigate to the blog post page
                window.location.href = `${post.slug}.html`;
            }
        }
    });
    
    // Search functionality
    let searchTimeout;
    const searchInput = document.getElementById('search-input');
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            updateDisplay();
        }, 300);
    });
    
    // Prevent search form submission
    searchInput.closest('.search-container').addEventListener('submit', (e) => {
        e.preventDefault();
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initBlog);