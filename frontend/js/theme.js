/**
 * Theme Manager
 * Handles dark/light theme toggling and persistence
 */

const THEME_KEY = 'theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';
const DEFAULT_THEME = THEME_DARK;

/**
 * Apply the specified theme to the document
 * @param {string} theme - 'dark' or 'light'
 */
function applyTheme(theme) {
    if (theme === THEME_DARK) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

/**
 * Toggle between dark and light themes
 */
function toggleTheme() {
    const currentTheme = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
    const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
}

/**
 * Initialize theme on page load
 */
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
    applyTheme(savedTheme);
}

// Load theme immediately on page load
initTheme();

// Attach theme toggle button click handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggle');
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
});
