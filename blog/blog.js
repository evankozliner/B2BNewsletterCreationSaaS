// Blog posts data
const blogPosts = [
    {
        id: 1,
        title: "How to Start a Newsletter",
        excerpt: "It is a long established fact that a reader will be distracted by the readable content of a page...",
        date: "September '25",
        tags: ["Content Tips", "Driving Sales"],
        image: "placeholder"
    },
    {
        id: 2,
        title: "10 Ways to Grow Your Email List",
        excerpt: "Learn proven strategies to organically grow your newsletter subscriber base and increase engagement rates effectively.",
        date: "September '25",
        tags: ["List Growth", "Driving Sales"],
        image: "placeholder"
    },
    {
        id: 3,
        title: "Newsletter Design Best Practices",
        excerpt: "Master the art of newsletter design with proven techniques. Learn how layout and typography can improve your open rates.",
        date: "August '25",
        tags: ["Content Tips", "Benchmarks"],
        image: "placeholder"
    },
    {
        id: 4,
        title: "The Evolution of Email Marketing",
        excerpt: "From the first marketing email in 1978 to today's AI-powered campaigns, explore how email marketing has transformed.",
        date: "August '25",
        tags: ["History", "Platforms"],
        image: "placeholder"
    },
    {
        id: 5,
        title: "Building a Newsletter Empire: Case Study",
        excerpt: "How one consultant grew from 100 to 50,000 subscribers in 18 months. Discover the strategies that made it possible.",
        date: "July '25",
        tags: ["Consultants", "List Growth"],
        image: "placeholder"
    },
    {
        id: 6,
        title: "Platform Comparison: Mailchimp vs ConvertKit vs Beehiiv",
        excerpt: "An in-depth comparison of the top newsletter platforms. Find out which one is right for your business size and budget.",
        date: "July '25",
        tags: ["Platforms", "Benchmarks"],
        image: "placeholder"
    },
    {
        id: 7,
        title: "Media Companies That Mastered Newsletters",
        excerpt: "Learn from the best. How major media companies like Morning Brew, The Hustle, and Axios built newsletter businesses.",
        date: "June '25",
        tags: ["Media Companies", "Driving Sales"],
        image: "placeholder"
    },
    {
        id: 8,
        title: "Newsletter Monetization Strategies",
        excerpt: "From sponsorships to premium subscriptions, discover the most effective ways to turn your newsletter into profit.",
        date: "June '25",
        tags: ["Driving Sales", "Consultants"],
        image: "placeholder"
    }
];

// Search index for local search
let searchIndex = [];

// Initialize search index
function buildSearchIndex() {
    searchIndex = blogPosts.map(post => ({
        id: post.id,
        searchText: `${post.title} ${post.excerpt} ${post.tags.join(' ')}`.toLowerCase()
    }));
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
                Image placeholder
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
    const matchingIds = searchIndex
        .filter(item => item.searchText.includes(searchTerm))
        .map(item => item.id);
    
    return blogPosts.filter(post => matchingIds.includes(post.id));
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

// Get unique tags from all blog posts
function getUniqueTags() {
    const allTags = blogPosts.flatMap(post => post.tags);
    return [...new Set(allTags)].sort();
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

// Initialize the blog
function initBlog() {
    buildSearchIndex();
    renderTagButtons();
    renderBlogPosts(blogPosts);
    
    // Tag filtering using event delegation
    document.querySelector('.blog-tags').addEventListener('click', (e) => {
        if (e.target.classList.contains('tag-btn')) {
            const button = e.target;
            const tag = button.dataset.tag;
            
            if (tag === 'all') {
                // Clear all other selections and activate 'all'
                document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            } else {
                // Remove 'all' selection if any specific tag is selected
                document.querySelector('.tag-btn[data-tag="all"]').classList.remove('active');
                
                // Toggle this tag
                button.classList.toggle('active');
                
                // If no tags are selected, activate 'all'
                const hasActiveTags = document.querySelectorAll('.tag-btn.active:not([data-tag="all"])').length > 0;
                if (!hasActiveTags) {
                    document.querySelector('.tag-btn[data-tag="all"]').classList.add('active');
                }
            }
            
            updateDisplay();
        }
    });
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            updateDisplay();
        }, 300); // Debounce search for better performance
    });
    
    // Blog post click handling (for future navigation to individual posts)
    document.addEventListener('click', (e) => {
        const blogPost = e.target.closest('.blog-post');
        if (blogPost) {
            const postId = blogPost.dataset.postId;
            // For now, just log the post ID. In the future, navigate to individual post page
            console.log('Clicked post ID:', postId);
            // You could navigate to a post detail page here:
            // window.location.href = `post.html?id=${postId}`;
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initBlog);