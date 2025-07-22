// Initialize user data storage
document.addEventListener('DOMContentLoaded', function() {
    // Load existing users from localStorage or initialize
    if (!localStorage.getItem('gwatch_users')) {
        localStorage.setItem('gwatch_users', JSON.stringify([]));
    }
    if (!localStorage.getItem('gwatch_referrals')) {
        localStorage.setItem('gwatch_referrals', JSON.stringify([]));
    }
    if (!localStorage.getItem('gwatch_transactions')) {
        localStorage.setItem('gwatch_transactions', JSON.stringify([]));
    }

    // Setup event listeners
    initializeFormListeners();
    
    // Auto-save every 5 minutes
    setInterval(autoSaveData, 5 * 60 * 1000);
});

// Auto-save all data
function autoSaveData() {
    try {
        const users = JSON.parse(localStorage.getItem('gwatch_users') || '[]');
        const referrals = JSON.parse(localStorage.getItem('gwatch_referrals') || '[]');
        const transactions = JSON.parse(localStorage.getItem('gwatch_transactions') || '[]');
        
        const allData = {
            users,
            referrals,
            transactions,
            timestamp: new Date().toISOString()
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `gwatch_backup_${new Date().toISOString().slice(0,10)}.json`);
        downloadAnchor.style.display = "none";
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        
        console.log('Auto-save completed');
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
}

// Export all data
function exportAllData() {
    try {
        const users = JSON.parse(localStorage.getItem('gwatch_users') || '[]');
        const referrals = JSON.parse(localStorage.getItem('gwatch_referrals') || '[]');
        const transactions = JSON.parse(localStorage.getItem('gwatch_transactions') || '[]');
        
        if (users.length === 0 && referrals.length === 0 && transactions.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }
        
        const allData = {
            users,
            referrals,
            transactions,
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "gwatch_data_export.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        
        showToast('All data exported successfully', 'success');
    } catch (error) {
        console.error('Export failed:', error);
        showToast('Failed to export data', 'error');
    }
}

// Import data from JSON file
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.users) {
                localStorage.setItem('gwatch_users', JSON.stringify(data.users));
            }
            if (data.referrals) {
                localStorage.setItem('gwatch_referrals', JSON.stringify(data.referrals));
            }
            if (data.transactions) {
                localStorage.setItem('gwatch_transactions', JSON.stringify(data.transactions));
            }
            
            showToast('Data imported successfully', 'success');
            setTimeout(() => window.location.reload(), 1000); // Refresh to apply changes
        } catch (error) {
            console.error('Import failed:', error);
            showToast('Invalid data file', 'error');
        }
    };
    reader.readAsText(file);
}

// Handle registration form submission
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;

    // Validate inputs
    if (!name || !email || !phone || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('gwatch_users'));
    if (users.some(user => user.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }

    // Create new user (in production, hash the password!)
    const newUser = {
        id: generateUserId(),
        name,
        email,
        phone,
        password,
        balance: 0,
        totalWithdrawn: 0,
        adsWatched: 0,
        dateRegistered: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };

    // Save user
    users.push(newUser);
    localStorage.setItem('gwatch_users', JSON.stringify(users));

    // Show success message
    showToast('Registration successful!', 'success');

    // Automatically log in the user
    currentUser = newUser;
    localStorage.setItem('gwatch_user_id', newUser.id);
    updateUIForLoggedInUser();

    // Check for referral
    checkAndProcessReferral();

    // Clear form
    event.target.reset();
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Validate inputs
    if (!email || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }

    // Check credentials
    const users = JSON.parse(localStorage.getItem('gwatch_users'));
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('gwatch_users', JSON.stringify(users));

        // Set as current user
        currentUser = user;
        localStorage.setItem('gwatch_user_id', user.id);
        updateUIForLoggedInUser();

        // Show success message
        showToast('Login successful!', 'success');

        // Check for referral
        checkAndProcessReferral();

        // Clear form
        event.target.reset();
    } else {
        showToast('Invalid email or password', 'error');
    }
}

// Helper function to generate user ID
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Check for and process referral
function checkAndProcessReferral() {
    const referralCode = localStorage.getItem('gwatch_referral_code');
    
    if (referralCode && currentUser) {
        const users = JSON.parse(localStorage.getItem('gwatch_users'));
        const referrer = users.find(u => u.id === referralCode);
        
        if (referrer && referrer.id !== currentUser.id) {
            // Check if this referral already exists
            const referrals = JSON.parse(localStorage.getItem('gwatch_referrals') || '[]');
            const existingReferral = referrals.find(r => 
                r.referrerId === referrer.id && r.referredId === currentUser.id
            );
            
            if (!existingReferral) {
                // Create new referral
                referrals.push({
                    id: 'ref_' + Math.random().toString(36).substr(2, 9),
                    referrerId: referrer.id,
                    referredId: currentUser.id,
                    date: new Date().toISOString()
                });
                
                // Credit referrer
                referrer.balance += 200;
                
                // Create transaction
                const transactions = JSON.parse(localStorage.getItem('gwatch_transactions') || '[]');
                transactions.push({
                    id: 'txn_' + Math.random().toString(36).substr(2, 9),
                    userId: referrer.id,
                    type: 'credit',
                    amount: 200,
                    description: 'Referral bonus',
                    date: new Date().toISOString(),
                    status: 'completed'
                });
                
                // Save all updates
                localStorage.setItem('gwatch_users', JSON.stringify(users));
                localStorage.setItem('gwatch_referrals', JSON.stringify(referrals));
                localStorage.setItem('gwatch_transactions', JSON.stringify(transactions));
                
                // Show success message
                showToast(`You've been referred by ${referrer.name}. They earned ₦200!`, 'success');
                
                // Remove referral code from storage
                localStorage.removeItem('gwatch_referral_code');
            }
        }
    }
}

// Update UI after login
function updateUIForLoggedInUser() {
    document.getElementById('auth-buttons').classList.add('hidden');
    document.getElementById('user-menu').classList.remove('hidden');
    
    // Update profile pic and username
    const profilePic = document.getElementById('profile-pic');
    profilePic.textContent = getInitials(currentUser.name);
    document.getElementById('username-display').textContent = currentUser.name.split(' ')[0];
    
    // Show dashboard
    showDashboard();
}

// Show toast notification
function showToast(message, type = 'info') {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        className: `toast-${type}`,
    }).showToast();
}

// Initialize form event listeners
function initializeFormListeners() {
    // Form submissions
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    
    // Data management buttons
    const exportBtn = document.getElementById('export-data-btn');
    const importInput = document.getElementById('import-data-input');
    
    if (exportBtn) exportBtn.addEventListener('click', exportAllData);
    if (importInput) importInput.addEventListener('change', importData);
}

// Helper function to get initials
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}