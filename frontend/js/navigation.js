/**
 * Navigation Module
 * Handles navigation and search functionality
 */

/**
 * Handle search form submission
 */
function handleSearchSubmit(e) {
    e.preventDefault();
    const searchInput = document.getElementById('searchInput');
    const searchQuery = searchInput.value.trim();
    
    if (searchQuery) {
        window.location.href = `index.html?search=${encodeURIComponent(searchQuery)}`;
    }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Setup search form
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    }
});
