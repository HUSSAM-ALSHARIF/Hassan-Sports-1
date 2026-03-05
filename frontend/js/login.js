/**
 * Login Page Module
 * Handles user login functionality
 */

const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

/**
 * Handle login form submission
 */
async function handleLogin(e) {
    e.preventDefault();
    
    // Get form values
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Hide previous error
    errorMessage.classList.add('hidden');
    
    try {
        // Make login request
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token
            setAuthToken(data.token);
            
            // Show success message
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to homepage after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            // Show error message
            errorMessage.textContent = data.message || 'Invalid username or password';
            errorMessage.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.remove('hidden');
    }
}

// Attach form submit handler
loginForm.addEventListener('submit', handleLogin);

// Check if already logged in
if (getAuthToken()) {
    window.location.href = 'index.html';
}
