// Common JavaScript functions used across all pages

// Show alert message
function showAlert(message, type = 'info') {
    const container = document.getElementById('alert-container');
    if (!container) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.innerHTML = '';
    container.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Set active navigation link
function setActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
});

// API helper functions
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(endpoint, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Request failed');
        }
        
        return result;
    } catch (error) {
        showAlert('Error: ' + error.message, 'error');
        throw error;
    }
}

// Load profiles for dropdowns
async function loadProfileSelects() {
    try {
        const profiles = await apiCall('/api/profiles');
        const selects = document.querySelectorAll('.profile-select');
        
        selects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">-- Select a profile --</option>';
            
            for (const [id, profile] of Object.entries(profiles)) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = profile.name;
                select.appendChild(option);
            }
            
            if (currentValue) {
                select.value = currentValue;
            }
        });
    } catch (error) {
        console.error('Error loading profile selects:', error);
    }
}


