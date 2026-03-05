/**
 * Dashboard Page Module
 * Handles user profile, favorites, and comments
 */

// Check authentication
if (!getAuthToken()) {
    window.location.href = 'login.html';
}

// DOM Elements
const displayUsername = document.getElementById('displayUsername');
const displayEmail = document.getElementById('displayEmail');
const displayMemberSince = document.getElementById('displayMemberSince');
const editProfileForm = document.getElementById('editProfileForm');
const changePasswordForm = document.getElementById('changePasswordForm');
const favoritesList = document.getElementById('favoritesList');
const noFavorites = document.getElementById('noFavorites');
const commentsList = document.getElementById('commentsList');
const noComments = document.getElementById('noComments');
const logoutBtn = document.getElementById('logoutBtn');

/**
 * Fetch user profile
 */
async function fetchProfile() {
    try {
        const response = await fetchWithAuth('/user/profile');
        
        if (response.ok) {
            const data = await response.json();
            renderProfile(data.user);
        } else {
            showError('Failed to load profile');
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        showError('Failed to load profile');
    }
}

/**
 * Render profile information
 */
function renderProfile(user) {
    displayUsername.textContent = user.username;
    displayEmail.textContent = user.email;
    
    const memberSince = new Date(user.created_at);
    displayMemberSince.textContent = memberSince.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Set form placeholders
    document.getElementById('newUsername').placeholder = user.username;
    document.getElementById('newEmail').placeholder = user.email;
}

/**
 * Handle profile update
 */
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const newUsername = document.getElementById('newUsername').value.trim();
    const newEmail = document.getElementById('newEmail').value.trim();
    
    if (!newUsername && !newEmail) {
        showError('Please enter at least one field to update');
        return;
    }
    
    const updates = {};
    if (newUsername) updates.username = newUsername;
    if (newEmail) updates.email = newEmail;
    
    try {
        const response = await fetchWithAuth('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
        
        if (response.ok) {
            showSuccess('Profile updated successfully');
            fetchProfile();
            editProfileForm.reset();
        } else {
            const data = await response.json();
            showError(data.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Failed to update profile');
    }
}

/**
 * Handle password change
 */
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (newPassword !== confirmNewPassword) {
        showError('New passwords do not match');
        return;
    }
    
    if (newPassword.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    try {
        const response = await fetchWithAuth('/user/password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        if (response.ok) {
            showSuccess('Password changed successfully');
            changePasswordForm.reset();
        } else {
            const data = await response.json();
            showError(data.message || 'Failed to change password');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showError('Failed to change password');
    }
}

/**
 * Fetch user favorites
 */
async function fetchFavorites() {
    try {
        const response = await fetchWithAuth('/favorites');
        
        if (response.ok) {
            const data = await response.json();
            renderFavorites(data.favorites);
        } else {
            showError('Failed to load favorites');
        }
    } catch (error) {
        console.error('Error fetching favorites:', error);
        showError('Failed to load favorites');
    }
}

/**
 * Render favorites list
 */
function renderFavorites(favorites) {
    if (!favorites || favorites.length === 0) {
        favoritesList.classList.add('hidden');
        noFavorites.classList.remove('hidden');
        return;
    }
    
    favoritesList.classList.remove('hidden');
    noFavorites.classList.add('hidden');
    
    favoritesList.innerHTML = favorites.map(article => {
        const date = new Date(article.published_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        return `
            <div class="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                ${article.image ? `
                    <img 
                        src="${article.image}" 
                        alt="${article.title}" 
                        class="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        onerror="this.src='https://via.placeholder.com/100x100?text=No+Image'"
                    >
                ` : ''}
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                        <a href="article.html?id=${article.id}" class="hover:text-primary">
                            ${article.title}
                        </a>
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${date}</p>
                    <button 
                        onclick="removeFavorite(${article.id})" 
                        class="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                        Remove
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Remove article from favorites
 */
async function removeFavorite(articleId) {
    try {
        const response = await fetchWithAuth(`/favorites/${articleId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Removed from favorites');
            fetchFavorites();
        } else {
            showError('Failed to remove favorite');
        }
    } catch (error) {
        console.error('Error removing favorite:', error);
        showError('Failed to remove favorite');
    }
}

/**
 * Fetch user comments
 */
async function fetchComments() {
    try {
        const response = await fetchWithAuth('/user/comments');
        
        if (response.ok) {
            const data = await response.json();
            renderComments(data.comments);
        } else {
            showError('Failed to load comments');
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
        showError('Failed to load comments');
    }
}

/**
 * Render comments list
 */
function renderComments(comments) {
    if (!comments || comments.length === 0) {
        commentsList.classList.add('hidden');
        noComments.classList.remove('hidden');
        return;
    }
    
    commentsList.classList.remove('hidden');
    noComments.classList.add('hidden');
    
    commentsList.innerHTML = comments.map(comment => {
        const date = new Date(comment.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const statusBadge = comment.approved 
            ? '<span class="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">Approved</span>'
            : '<span class="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">Pending</span>';
        
        return `
            <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div class="flex items-start justify-between mb-2">
                    <div>
                        <a href="article.html?id=${comment.article_id}" class="font-semibold text-primary hover:underline">
                            ${comment.article_title}
                        </a>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${date}</p>
                    </div>
                    ${statusBadge}
                </div>
                <p class="text-gray-700 dark:text-gray-300 mb-2">${comment.comment}</p>
                <button 
                    onclick="deleteComment(${comment.id})" 
                    class="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                    Delete
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Delete comment
 */
async function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }
    
    try {
        const response = await fetchWithAuth(`/comments/${commentId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Comment deleted');
            fetchComments();
        } else {
            showError('Failed to delete comment');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        showError('Failed to delete comment');
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    removeAuthToken();
    showSuccess('Logged out successfully');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Event listeners
editProfileForm.addEventListener('submit', handleProfileUpdate);
changePasswordForm.addEventListener('submit', handlePasswordChange);
logoutBtn.addEventListener('click', handleLogout);

// Make functions globally available
window.removeFavorite = removeFavorite;
window.deleteComment = deleteComment;

// Initialize
fetchProfile();
fetchFavorites();
fetchComments();
