/**
 * Homepage Article Browsing Module
 * Handles article fetching, rendering, and pagination
 */

// State management
let currentPage = 1;
let currentCategory = '';
let currentSearch = '';
let currentTimeFilter = '';
let currentSportType = '';
let totalPages = 1;

// DOM Elements
const articlesGrid = document.getElementById('articlesGrid');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumbersContainer = document.getElementById('pageNumbers');

/**
 * Fetch articles from the API with query parameters
 * @param {number} page - Page number (default: 1)
 * @param {string} category - Category filter (optional)
 * @param {string} search - Search query (optional)
 * @param {string} timeFilter - Time filter (optional)
 * @param {string} sportType - Sport type filter (optional)
 * @returns {Promise<Object>} Articles data with pagination metadata
 */
async function fetchArticles(page = 1, category = '', search = '', timeFilter = '', sportType = '') {
    try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', '12');
        
        if (category) {
            params.append('category', category);
        }
        
        if (search) {
            params.append('search', search);
        }
        
        if (timeFilter) {
            params.append('time', timeFilter);
        }
        
        if (sportType) {
            params.append('sportType', sportType);
        }
        
        // Make API request
        const response = await fetchWithAuth(`/articles?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch articles');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching articles:', error);
        showError('Failed to load articles. Please try again.');
        throw error;
    }
}

/**
 * Render articles in the grid
 * @param {Array} articles - Array of article objects
 */
function renderArticles(articles) {
    // Clear existing articles
    articlesGrid.innerHTML = '';
    
    // Hide loading and empty states
    loadingState.classList.add('hidden');
    emptyState.classList.add('hidden');
    
    // Check if articles array is empty
    if (!articles || articles.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    // Create article cards
    articles.forEach((article, index) => {
        const card = createArticleCard(article);
        articlesGrid.appendChild(card);
    });
    
    // Apply GSAP stagger animation for card entrance
    gsap.from('.article-card', {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
    });
}

/**
 * Create an article card element
 * @param {Object} article - Article object
 * @returns {HTMLElement} Article card element
 */
function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer';
    
    // Get relative time
    const relativeTime = getRelativeTime(article.published_at);
    
    // Create excerpt from content (first 150 characters)
    const excerpt = article.content.length > 150 
        ? article.content.substring(0, 150) + '...' 
        : article.content;
    
    // Get sport icon
    const sportIcons = {
        'Soccer': '⚽',
        'American Football': '🏈',
        'Basketball': '🏀',
        'Baseball': '⚾',
        'Tennis': '🎾',
        'Hockey': '🏒'
    };
    const sportIcon = sportIcons[article.sport_type] || '⚽';
    
    // Build card HTML
    card.innerHTML = `
        ${article.image ? `
            <img 
                src="${article.image}" 
                alt="${article.title}" 
                class="w-full h-48 object-cover"
                onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'"
            >
        ` : `
            <div class="w-full h-48 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <span class="text-gray-500 dark:text-gray-400 text-4xl">${sportIcon}</span>
            </div>
        `}
        
        <div class="p-4">
            <!-- Sport Type and Category Badges -->
            <div class="flex flex-wrap gap-2 mb-2">
                <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-500 text-white">
                    ${sportIcon} ${article.sport_type || 'Soccer'}
                </span>
                <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-primary text-white">
                    ${article.category}
                </span>
            </div>
            
            <!-- Title -->
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                ${article.title}
            </h3>
            
            <!-- Excerpt -->
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                ${excerpt}
            </p>
            
            <!-- Metadata -->
            <div class="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-500">
                <div class="flex items-center justify-between">
                    <span>${article.source || 'Unknown Source'}</span>
                    <span class="font-medium text-primary dark:text-blue-400">${relativeTime}</span>
                </div>
                <div class="text-right text-gray-400 dark:text-gray-600">
                    ${formatDateOnly(article.published_at)}
                </div>
            </div>
        </div>
    `;
    
    // Add click handler to navigate to article detail page
    card.addEventListener('click', () => {
        window.location.href = `article.html?id=${article.id}`;
    });
    
    return card;
}

/**
 * Render pagination controls
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 */
function renderPagination(currentPage, totalPages) {
    // Update previous button state
    prevPageBtn.disabled = currentPage <= 1;
    
    // Update next button state
    nextPageBtn.disabled = currentPage >= totalPages;
    
    // Clear existing page numbers
    pageNumbersContainer.innerHTML = '';
    
    // Don't show page numbers if there's only one page or no pages
    if (totalPages <= 1) {
        return;
    }
    
    // Calculate page range to display
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
        addPageButton(1);
        if (startPage > 2) {
            addEllipsis();
        }
    }
    
    // Add page number buttons
    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i, i === currentPage);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            addEllipsis();
        }
        addPageButton(totalPages);
    }
}

/**
 * Add a page number button to pagination
 * @param {number} pageNum - Page number
 * @param {boolean} isActive - Whether this is the current page
 */
function addPageButton(pageNum, isActive = false) {
    const button = document.createElement('button');
    button.className = `px-4 py-2 rounded-lg transition-colors ${
        isActive 
            ? 'bg-primary text-white font-bold' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
    }`;
    button.textContent = pageNum;
    
    if (!isActive) {
        button.addEventListener('click', () => {
            loadArticles(pageNum);
        });
    }
    
    pageNumbersContainer.appendChild(button);
}

/**
 * Add ellipsis to pagination
 */
function addEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'px-2 text-gray-500 dark:text-gray-400';
    ellipsis.textContent = '...';
    pageNumbersContainer.appendChild(ellipsis);
}

/**
 * Load articles with current filters
 * @param {number} page - Page number to load
 */
async function loadArticles(page = 1) {
    try {
        // Show loading state
        loadingState.classList.remove('hidden');
        articlesGrid.classList.add('hidden');
        emptyState.classList.add('hidden');
        
        // Update current page
        currentPage = page;
        
        // Fetch articles
        const data = await fetchArticles(
            currentPage,
            currentCategory,
            currentSearch,
            currentTimeFilter,
            currentSportType
        );
        
        // Update total pages
        totalPages = data.totalPages || 1;
        
        // Show articles grid
        articlesGrid.classList.remove('hidden');
        
        // Render articles
        renderArticles(data.articles);
        
        // Render pagination
        renderPagination(currentPage, totalPages);
        
        // Update URL query params
        updateUrlParams();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading articles:', error);
        loadingState.classList.add('hidden');
        articlesGrid.classList.remove('hidden');
    }
}

/**
 * Update URL query parameters to reflect current filters
 */
function updateUrlParams() {
    const params = new URLSearchParams();
    
    if (currentSportType) {
        params.set('sportType', currentSportType);
    }
    
    if (currentCategory) {
        params.set('category', currentCategory);
    }
    
    if (currentSearch) {
        params.set('search', currentSearch);
    }
    
    if (currentTimeFilter) {
        params.set('timeFilter', currentTimeFilter);
    }
    
    if (currentPage > 1) {
        params.set('page', currentPage);
    }
    
    // Update URL without reloading page
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.pushState({}, '', newUrl);
}

/**
 * Load filters from URL query parameters
 */
function loadFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    
    currentCategory = params.get('category') || '';
    currentSearch = params.get('search') || '';
    currentTimeFilter = params.get('timeFilter') || '';
    currentSportType = params.get('sportType') || '';
    const page = parseInt(params.get('page')) || 1;
    
    // Update UI to reflect loaded filters
    if (currentSearch) {
        document.getElementById('searchInput').value = currentSearch;
    }
    
    if (currentTimeFilter) {
        document.getElementById('timeFilter').value = currentTimeFilter;
    }
    
    // Update sport type button active state
    document.querySelectorAll('.sport-btn').forEach(btn => {
        const btnSport = btn.dataset.sport;
        if (btnSport === currentSportType) {
            btn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            btn.classList.add('bg-primary', 'text-white');
        } else {
            btn.classList.remove('bg-primary', 'text-white');
            btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
        }
    });
    
    // Update category button active state
    document.querySelectorAll('.category-btn').forEach(btn => {
        const btnCategory = btn.dataset.category;
        if (btnCategory === currentCategory) {
            btn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            btn.classList.add('bg-primary', 'text-white');
        } else {
            btn.classList.remove('bg-primary', 'text-white');
            btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
        }
    });
    
    return page;
}

/**
 * Initialize the homepage
 */
function init() {
    // Load filters from URL and get initial page
    const initialPage = loadFiltersFromUrl();
    
    // Load initial articles with filters
    loadArticles(initialPage);
    
    // Setup sport type filter button handlers
    document.querySelectorAll('.sport-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sportType = btn.dataset.sport;
            
            // Update current sport type
            currentSportType = sportType;
            
            // Update button active states
            document.querySelectorAll('.sport-btn').forEach(b => {
                b.classList.remove('bg-primary', 'text-white');
                b.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            });
            
            btn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            btn.classList.add('bg-primary', 'text-white');
            
            // Reset to page 1 and reload articles
            loadArticles(1);
        });
    });
    
    // Setup category filter button handlers
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            
            // Update current category
            currentCategory = category;
            
            // Update button active states
            document.querySelectorAll('.category-btn').forEach(b => {
                b.classList.remove('bg-primary', 'text-white');
                b.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            });
            
            btn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            btn.classList.add('bg-primary', 'text-white');
            
            // Reset to page 1 and reload articles
            loadArticles(1);
        });
    });
    
    // Setup time filter dropdown handler
    const timeFilterDropdown = document.getElementById('timeFilter');
    timeFilterDropdown.addEventListener('change', (e) => {
        currentTimeFilter = e.target.value;
        
        // Reset to page 1 and reload articles
        loadArticles(1);
    });
    
    // Setup search form handler
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        currentSearch = searchInput.value.trim();
        
        // Reset to page 1 and reload articles
        loadArticles(1);
    });
    
    // Setup pagination button handlers
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            loadArticles(currentPage - 1);
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            loadArticles(currentPage + 1);
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
