/**
 * Register Page Module
 * Handles user registration functionality
 */

const registerForm = document.getElementById('registerForm');
const errorMessage = document.getElementById('errorMessage');

/**
 * Handle registration form submission
 */
async function handleRegister(e) {
    e.preventDefault();
    
    // Get form values
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Hide previous error
    errorMessage.classList.add('hidden');
    
    // Validate password confirmation
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match';
        errorMessage.classList.remove('hidden');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        errorMessage.textContent = 'Password must be at least 6 characters';
        errorMessage.classList.remove('hidden');
        return;
    }
    
    try {
        // Make registration request
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show success message
            showSuccess('Registration successful! Redirecting to login...');
            
            // Redirect to login page after short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            // Show error message
            errorMessage.textContent = data.message || 'Registration failed';
            errorMessage.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Registration error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.remove('hidden');
    }
}

// Attach form submit handler
registerForm.addEventListener('submit', handleRegister);

// Check if already logged in
if (getAuthToken()) {
    window.location.href = 'index.html';
}
