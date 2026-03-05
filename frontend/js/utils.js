/**
 * Shared Utilities Module
 * Provides authentication helpers and API utilities
 */

// API Configuration
const API_BASE_URL = '/api';
const AUTH_TOKEN_KEY = 'authToken';

/**
 * Retrieve JWT token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Store JWT token in localStorage
 * @param {string} token - JWT token to store
 */
function setAuthToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Remove JWT token from localStorage
 */
function removeAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Make an authenticated API call with automatic Authorization header
 * @param {string} endpoint - API endpoint (e.g., '/articles', '/user/profile')
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithAuth(endpoint, options = {}) {
    const token = getAuthToken();
    
    // Build full URL
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    // Prepare headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make the request
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    return response;
}

/**
 * Show error toast notification
 * @param {string} message - Error message to display
 */
function showError(message) {
    showToast(message, 'error');
}

/**
 * Show success toast notification
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
    showToast(message, 'success');
}

/**
 * Display a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast ('success' or 'error')
 */
function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300 ${
        type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
    }`;
    toast.textContent = message;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Fade in
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}
