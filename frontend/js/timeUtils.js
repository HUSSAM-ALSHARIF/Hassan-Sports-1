/**
 * Time Utilities Module
 * Provides relative time formatting functions with timezone support
 */

/**
 * Get user's timezone
 * @returns {string} User's timezone (e.g., "America/New_York")
 */
function getUserTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Relative time string
 */
function getRelativeTime(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffSeconds < 60) {
        return 'Just now';
    } else if (diffMinutes < 60) {
        return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffWeeks < 4) {
        return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffMonths < 12) {
        return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    } else {
        return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
    }
}

/**
 * Format date with user's timezone
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Formatted date in user's timezone
 */
function formatDateInUserTimezone(timestamp) {
    const date = new Date(timestamp);
    const userTimezone = getUserTimezone();
    
    return date.toLocaleString('en-US', {
        timeZone: userTimezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Get timezone offset string
 * @returns {string} Timezone offset (e.g., "GMT+3", "GMT-5")
 */
function getTimezoneOffset() {
    const date = new Date();
    const offset = -date.getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    
    return `GMT${sign}${hours}${minutes > 0 ? ':' + minutes.toString().padStart(2, '0') : ''}`;
}

/**
 * Format date with relative time and timezone
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Formatted date with relative time
 */
function formatDateWithRelative(timestamp) {
    const relativeTime = getRelativeTime(timestamp);
    const formattedDate = formatDateInUserTimezone(timestamp);
    
    return `${relativeTime} • ${formattedDate}`;
}

/**
 * Get short timezone abbreviation
 * @returns {string} Timezone abbreviation (e.g., "EST", "PST")
 */
function getTimezoneAbbreviation() {
    const date = new Date();
    const timeString = date.toLocaleTimeString('en-US', { timeZoneName: 'short' });
    const parts = timeString.split(' ');
    return parts[parts.length - 1];
}

/**
 * Format date for article metadata (compact version)
 * Shows date in user's timezone
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Compact formatted date in user's timezone
 */
function formatArticleDate(timestamp) {
    const date = new Date(timestamp);
    const userTimezone = getUserTimezone();
    
    // Format in user's timezone
    return date.toLocaleString('en-US', {
        timeZone: userTimezone,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Get just the date (no time) in user's timezone
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Date string (e.g., "Mar 6, 2026")
 */
function formatDateOnly(timestamp) {
    const date = new Date(timestamp);
    const userTimezone = getUserTimezone();
    
    return date.toLocaleDateString('en-US', {
        timeZone: userTimezone,
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
