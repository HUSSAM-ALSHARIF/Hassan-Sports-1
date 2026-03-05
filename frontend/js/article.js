/**
 * Article Detail Page Module
 * Handles article fetching, rendering, and related articles
 */

// State management
let currentArticleId = null;
let currentArticle = null;

// DOM Elements
const articleContent = document.getElementById('articleContent');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const relatedArticles = document.getElementById('relatedArticles');
const noRelated = document.getElementById('noRelated');

/**
 * Get article ID from URL query parameters
 * @returns {string|null} Article ID or null if not found
 */
function getArticleIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

/**
 * Fetch article details from the API
 * @param {string} articleId - Article ID
 * @returns {Promise<Object>} Article object
 */
async function fetchArticle(articleId) {
    try {
        const response = await fetchWithAuth(`/articles/${articleId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Article not found');
            }
            throw new Error('Failed to fetch article');
        }
        
        const data = await response.json();
        return data.article;
    } catch (error) {
        console.error('Error fetching article:', error);
        throw error;
    }
}

/**
 * Render article content on the page
 * @param {Object} article - Article object
 */
function renderArticle(article) {
    // Get relative time and formatted date with timezone
    const relativeTime = getRelativeTime(article.published_at);
    const userTimezoneDate = formatDateInUserTimezone(article.published_at);
    const userTimezone = getUserTimezone();
    
    // Build article HTML
    const articleHTML = `
        <!-- Article Image -->
        ${article.image ? `
            <img 
                src="${article.image}" 
                alt="${article.title}" 
                class="w-full h-96 object-cover"
                onerror="this.src='https://via.placeholder.com/800x400?text=No+Image'"
            >
        ` : `
            <div class="w-full h-96 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <span class="text-gray-500 dark:text-gray-400 text-6xl">⚽</span>
            </div>
        `}
        
        <!-- Article Content -->
        <div class="p-6 md:p-8">
            <!-- Sport Type & Category Badges -->
            <div class="flex flex-wrap gap-2 mb-4">
                <span class="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-primary text-white">
                    ${article.sport_type || 'Sports'}
                </span>
                <span class="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    ${article.category}
                </span>
            </div>
            
            <!-- Title -->
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                ${article.title}
            </h1>
            
            <!-- Metadata -->
            <div class="flex flex-wrap items-center gap-4 text-sm mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span class="font-semibold">📰</span>
                    <span>${article.source || 'Unknown Source'}</span>
                </div>
                ${article.author ? `
                    <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span class="font-semibold">✍️</span>
                        <span>${article.author}</span>
                    </div>
                ` : ''}
                <div class="flex items-center gap-2">
                    <span class="font-semibold">🕒</span>
                    <span class="font-medium text-primary dark:text-blue-400">${relativeTime}</span>
                </div>
            </div>
            
            <!-- Timezone Information -->
            <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="text-sm space-y-2">
                    <div class="flex items-start gap-2">
                        <span class="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">📅 Published:</span>
                        <span class="text-gray-600 dark:text-gray-400">${userTimezoneDate}</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">🌍 Your Timezone:</span>
                        <span class="text-gray-600 dark:text-gray-400">${userTimezone} (${getTimezoneOffset()})</span>
                    </div>
                </div>
            </div>
            
            <!-- Article Content -->
            <div class="prose prose-lg dark:prose-invert max-w-none">
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    ${article.content}
                </p>
            </div>
            
            <!-- Source Link -->
            ${article.source_url ? `
                <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <a 
                        href="${article.source_url}" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                        Read original article
                        <span>↗️</span>
                    </a>
                </div>
            ` : ''}
        </div>
    `;
    
    articleContent.innerHTML = articleHTML;
    
    // Apply GSAP entrance animation
    gsap.from('#articleContent', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: 'power2.out'
    });
}

/**
 * Fetch related articles
 * @param {string} articleId - Article ID
 * @returns {Promise<Array>} Array of related articles
 */
async function fetchRelatedArticles(articleId) {
    try {
        const response = await fetchWithAuth(`/articles/${articleId}/related`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch related articles');
        }
        
        const data = await response.json();
        return data.articles;
    } catch (error) {
        console.error('Error fetching related articles:', error);
        return [];
    }
}

/**
 * Render related articles in sidebar
 * @param {Array} articles - Array of related article objects
 */
function renderRelatedArticles(articles) {
    if (!articles || articles.length === 0) {
        relatedArticles.classList.add('hidden');
        noRelated.classList.remove('hidden');
        return;
    }
    
    relatedArticles.classList.remove('hidden');
    noRelated.classList.add('hidden');
    
    relatedArticles.innerHTML = articles.map(article => {
        const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="related-article-card cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors" data-article-id="${article.id}">
                ${article.image ? `
                    <img 
                        src="${article.image}" 
                        alt="${article.title}" 
                        class="w-full h-32 object-cover rounded-lg mb-2"
                        onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'"
                    >
                ` : ''}
                <h3 class="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                    ${article.title}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                    ${formattedDate}
                </p>
            </div>
        `;
    }).join('');
    
    // Add click handlers to related articles
    document.querySelectorAll('.related-article-card').forEach(card => {
        card.addEventListener('click', () => {
            const articleId = card.dataset.articleId;
            window.location.href = `article.html?id=${articleId}`;
        });
    });
    
    // Apply GSAP animation
    gsap.from('.related-article-card', {
        opacity: 0,
        x: 20,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out'
    });
}

/**
 * Initialize the article detail page
 */
async function init() {
    // Get article ID from URL
    currentArticleId = getArticleIdFromUrl();
    
    if (!currentArticleId) {
        // No article ID provided, show error
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
        return;
    }
    
    try {
        // Fetch article details
        currentArticle = await fetchArticle(currentArticleId);
        
        // Hide loading state
        loadingState.classList.add('hidden');
        
        // Render article
        renderArticle(currentArticle);
        
        // Fetch and render related articles
        const related = await fetchRelatedArticles(currentArticleId);
        renderRelatedArticles(related);
        
    } catch (error) {
        console.error('Error loading article:', error);
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
