// Campus BorrowHub Frontend JavaScript

const API_BASE_URL = 'http://localhost:3000'; // Adjust if needed

// DOM Elements
const loginSection = document.getElementById('login-section');
const signupSection = document.getElementById('signup-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');
const loginMessage = document.getElementById('login-message');
const signupMessage = document.getElementById('signup-message');
const userNameSpan = document.getElementById('user-name');
const userRoleSpan = document.getElementById('user-role');
const equipmentList = document.getElementById('equipment-list');
const requestsList = document.getElementById('requests-list');

// Global state
let currentUser = null;
let authToken = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignUp);
    logoutBtn.addEventListener('click', handleLogout);
}

// Check if user is already logged in
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        showDashboard();
    } else {
        showLogin();
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            authToken = data.access_token;
            currentUser = data.user;

            // Store in localStorage
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            showDashboard();
        } else {
            const error = await response.json();
            showLoginMessage(error.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginMessage('Network error. Please try again.', 'error');
    }
}

// Handle sign up form submission
async function handleSignUp(event) {
    event.preventDefault();

    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, lastName, email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            showSignUpMessage('Registration successful! Please login.', 'success');
            setTimeout(() => showLogin(), 2000);
        } else {
            const error = await response.json();
            showSignUpMessage(error.message || 'Sign up failed', 'error');
        }
    } catch (error) {
        console.error('Sign up error:', error);
        showSignUpMessage('Network error. Please try again.', 'error');
    }
}

// Handle logout
function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showLogin();
}

// Show login section
function showLogin() {
    loginSection.classList.remove('hidden');
    signupSection.classList.add('hidden');
    dashboardSection.classList.add('hidden');
    loginMessage.textContent = '';
    signupMessage.textContent = '';
    loginForm.reset();
    signupForm.reset();
}

// Show sign up section
function showSignUp() {
    loginSection.classList.add('hidden');
    signupSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    loginMessage.textContent = '';
    signupMessage.textContent = '';
    loginForm.reset();
    signupForm.reset();
}

// Show dashboard section
function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');

    userNameSpan.textContent = currentUser.firstName + ' ' + currentUser.lastName;
    userRoleSpan.textContent = currentUser.role;

    loadEquipment();
    loadUserRequests();
}

// Show login message
function showLoginMessage(message, type = 'info') {
    loginMessage.textContent = message;
    loginMessage.style.color = type === 'error' ? 'red' : 'green';
}

// Show sign up message
function showSignUpMessage(message, type = 'info') {
    signupMessage.textContent = message;
    signupMessage.style.color = type === 'error' ? 'red' : 'green';
}

// Load available equipment
async function loadEquipment() {
    try {
        const response = await fetch(`${API_BASE_URL}/equipment`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (response.ok) {
            const equipment = await response.json();
            displayEquipment(equipment);
        } else {
            console.error('Failed to load equipment');
            equipmentList.innerHTML = '<p>Failed to load equipment.</p>';
        }
    } catch (error) {
        console.error('Error loading equipment:', error);
        equipmentList.innerHTML = '<p>Error loading equipment.</p>';
    }
}

// Display equipment list
function displayEquipment(equipment) {
    if (!equipment || equipment.length === 0) {
        equipmentList.innerHTML = '<p>No equipment available.</p>';
        return;
    }

    equipmentList.innerHTML = equipment.map(item => `
        <div class="equipment-item">
            <h4>${item.name}</h4>
            <p>${item.description}</p>
            <p><strong>Category:</strong> ${item.category}</p>
            <p><strong>Available:</strong> ${item.availableQuantity}/${item.totalQuantity}</p>
            <button onclick="borrowEquipment(${item.id})" ${item.availableQuantity === 0 ? 'disabled' : ''}>
                ${item.availableQuantity === 0 ? 'Unavailable' : 'Request Borrow'}
            </button>
        </div>
    `).join('');
}

// Load user's requests
async function loadUserRequests() {
    try {
        const response = await fetch(`${API_BASE_URL}/requests`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (response.ok) {
            const requests = await response.json();
            displayRequests(requests);
        } else {
            console.error('Failed to load requests');
            requestsList.innerHTML = '<p>Failed to load requests.</p>';
        }
    } catch (error) {
        console.error('Error loading requests:', error);
        requestsList.innerHTML = '<p>Error loading requests.</p>';
    }
}

// Display user requests
function displayRequests(requests) {
    if (!requests || requests.length === 0) {
        requestsList.innerHTML = '<p>No requests found.</p>';
        return;
    }

    requestsList.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background-color: #f8f9fa;">
                    <th style="border: 1px solid #ddd; padding: 8px;">Equipment</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Dates</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${requests.map(request => `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${request.equipmentName || 'N/A'}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${request.status}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${new Date(request.startDate).toLocaleDateString()} - ${new Date(request.endDate).toLocaleDateString()}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">
                            ${request.status === 'PENDING' ? `<button onclick="cancelRequest(${request.id})">Cancel</button>` : ''}
                            ${request.status === 'APPROVED' ? `<button onclick="returnEquipment(${request.id})">Return</button>` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Borrow equipment (placeholder)
function borrowEquipment(equipmentId) {
    // This would open a modal or form to select dates and submit request
    alert(`Borrow request for equipment ${equipmentId} - Feature not implemented yet`);
}

// Cancel request (placeholder)
function cancelRequest(requestId) {
    alert(`Cancel request ${requestId} - Feature not implemented yet`);
}

// Return equipment (placeholder)
function returnEquipment(requestId) {
    alert(`Return equipment for request ${requestId} - Feature not implemented yet`);
}