// Global variables
let currentUser = null;
let users = [];
let transactions = [];
let referrals = [];
let banks = [];
let chatbotOpen = false;
let monnifyInitialized = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Load data from localStorage
    loadData();
    
    // Check if user is logged in
    checkAuth();
    
    // Initialize Monnify SDK
    initializeMonnify();
    
    // Load banks from Monnify
    loadBanks();
    
    // Show home page
    showHomePage();
});

// Data management functions
function loadData() {
    const savedUsers = localStorage.getItem('gwatch_users');
    const savedTransactions = localStorage.getItem('gwatch_transactions');
    const savedReferrals = localStorage.getItem('gwatch_referrals');
    
    if (savedUsers) users = JSON.parse(savedUsers);
    if (savedTransactions) transactions = JSON.parse(savedTransactions);
    if (savedReferrals) referrals = JSON.parse(savedReferrals);
    
    // Check URL for referral code
    checkReferral();
}

function saveData() {
    localStorage.setItem('gwatch_users', JSON.stringify(users));
    localStorage.setItem('gwatch_transactions', JSON.stringify(transactions));
    localStorage.setItem('gwatch_referrals', JSON.stringify(referrals));
}

function checkReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    
    if (ref) {
        localStorage.setItem('gwatch_referral_code', ref);
    }
}

// Authentication functions
function checkAuth() {
    const userId = localStorage.getItem('gwatch_user_id');
    
    if (userId) {
        const user = users.find(u => u.id === userId);
        if (user) {
            currentUser = user;
            updateUIForLoggedInUser();
        }
    }
}

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

function updateUIForLoggedOutUser() {
    document.getElementById('auth-buttons').classList.remove('hidden');
    document.getElementById('user-menu').classList.add('hidden');
    
    // Show home page
    showHomePage();
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

// Form display functions
function showLoginForm() {
    const content = `
        <div class="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Login to Your Account</h2>
            
            <form id="login-form" onsubmit="login(event)">
                <div class="mb-4">
                    <label for="login-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="login-email" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <div class="mb-6">
                    <label for="login-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" id="login-password" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Login
                </button>
                
                <div class="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <a href="#" onclick="showRegisterForm()" class="font-medium text-blue-600 hover:text-blue-500">Register</a>
                </div>
            </form>
        </div>
    `;
    
    document.getElementById('content-area').innerHTML = content;
}

function showRegisterForm() {
    const content = `
        <div class="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Create an Account</h2>
            
            <form id="register-form" onsubmit="register(event)">
                <div class="mb-4">
                    <label for="register-name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" id="register-name" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <div class="mb-4">
                    <label for="register-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="register-email" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <div class="mb-4">
                    <label for="register-phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" id="register-phone" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <div class="mb-6">
                    <label for="register-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" id="register-password" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Register
                </button>
                
                <div class="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <a href="#" onclick="showLoginForm()" class="font-medium text-blue-600 hover:text-blue-500">Login</a>
                </div>
            </form>
        </div>
    `;
    
    document.getElementById('content-area').innerHTML = content;
}

function showHomePage() {
    const content = `
        <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Welcome to GWatch</h2>
            <p class="text-gray-600 mb-6">Watch ads, earn money, and withdraw to your bank account. Refer friends to earn even more!</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-blue-50 p-6 rounded-lg">
                    <div class="flex items-center mb-3">
                        <div class="p-2 rounded-full bg-blue-100 text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3 class="ml-3 text-lg font-medium text-gray-800">Watch Ads</h3>
                    </div>
                    <p class="text-gray-600">Earn money by watching ads. The more you watch, the more you earn!</p>
                </div>
                <div class="bg-purple-50 p-6 rounded-lg">
                    <div class="flex items-center mb-3">
                        <div class="p-2 rounded-full bg-purple-100 text-purple-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 class="ml-3 text-lg font-medium text-gray-800">Refer Friends</h3>
                    </div>
                    <p class="text-gray-600">Earn ₦200 for each friend you refer when they watch their first ad.</p>
                </div>
                <div class="bg-green-50 p-6 rounded-lg">
                    <div class="flex items-center mb-3">
                        <div class="p-2 rounded-full bg-green-100 text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 class="ml-3 text-lg font-medium text-gray-800">Withdraw Earnings</h3>
                    </div>
                    <p class="text-gray-600">Withdraw your earnings directly to your bank account (minimum ₦1000).</p>
                </div>
            </div>
            
            <!-- AdSense Ad -->
            <div class="mb-8">
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1036234752964441" crossorigin="anonymous"></script>
                <!-- Godix -->
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-1036234752964441"
                     data-ad-slot="1035087288"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
                <script>
                     (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
            </div>
            
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 text-yellow-400">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-yellow-700">
                            You need to <a href="#" onclick="showLoginForm()" class="font-medium underline text-yellow-700 hover:text-yellow-600">login</a> or <a href="#" onclick="showRegisterForm()" class="font-medium underline text-yellow-700 hover:text-yellow-600">register</a> to start earning.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('content-area').innerHTML = content;
}

function showDashboard() {
    if (!currentUser) return;
    
    // Calculate referral count
    const userReferrals = referrals.filter(r => r.referrerId === currentUser.id);
    const todayReferrals = userReferrals.filter(r => {
        const refDate = new Date(r.date);
        const today = new Date();
        return refDate.toDateString() === today.toDateString();
    });
    
    const content = `
        <div class="space-y-6">
            <!-- Balance Card -->
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm font-medium">Available Balance</p>
                        <p class="text-3xl font-bold">₦${currentUser.balance.toFixed(2)}</p>
                    </div>
                    <div class="bg-white bg-opacity-20 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>
                
                <div class="mt-6 grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm font-medium">Total Earnings</p>
                        <p class="text-xl font-bold">₦${(currentUser.balance + currentUser.totalWithdrawn).toFixed(2)}</p>
                    </div>
                    <div>
                        <p class="text-sm font-medium">Total Withdrawn</p>
                        <p class="text-xl font-bold">₦${currentUser.totalWithdrawn.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onclick="showWatchAds()" class="bg-white shadow rounded-lg p-4 flex items-center justify-center space-x-2 hover:bg-gray-50">
                    <div class="bg-blue-100 p-2 rounded-full text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                    <span>Watch Ads</span>
                </button>
                <button onclick="showWithdrawForm()" class="bg-white shadow rounded-lg p-4 flex items-center justify-center space-x-2 hover:bg-gray-50">
                    <div class="bg-green-100 p-2 rounded-full text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <span>Withdraw</span>
                </button>
                <button onclick="showReferralSection()" class="bg-white shadow rounded-lg p-4 flex items-center justify-center space-x-2 hover:bg-gray-50">
                    <div class="bg-purple-100 p-2 rounded-full text-purple-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <span>Refer Friends</span>
                </button>
            </div>
            
            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white shadow rounded-lg p-4">
                    <div class="flex items-center space-x-3">
                        <div class="bg-blue-100 p-2 rounded-full text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Ads Watched</p>
                            <p class="font-bold">${currentUser.adsWatched || 0}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white shadow rounded-lg p-4">
                    <div class="flex items-center space-x-3">
                        <div class="bg-purple-100 p-2 rounded-full text-purple-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Total Referrals</p>
                            <p class="font-bold">${userReferrals.length}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white shadow rounded-lg p-4">
                    <div class="flex items-center space-x-3">
                        <div class="bg-green-100 p-2 rounded-full text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Today's Referrals</p>
                            <p class="font-bold">${todayReferrals.length}/5</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Recent Transactions -->
            <div class="bg-white shadow rounded-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-800">Recent Transactions</h3>
                    <button onclick="showAllTransactions()" class="text-sm text-blue-600 hover:text-blue-500">View All</button>
                </div>
                
                <div class="space-y-4">
                    ${getRecentTransactions().join('')}
                </div>
            </div>
            
            <!-- Recent Payments from Other Users -->
            <div class="bg-white shadow rounded-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-800">Recent Payments</h3>
                    <button onclick="loadRecentPayments()" class="text-sm text-blue-600 hover:text-blue-500">Refresh</button>
                </div>
                
                <div id="recent-payments" class="space-y-4">
                    <!-- Payments will be loaded by ads.js -->
                    <div class="text-center py-4 text-gray-500">Loading recent payments...</div>
                </div>
            </div>
            
            <!-- AdSense Ad -->
            <div class="mb-8">
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1036234752964441" crossorigin="anonymous"></script>
                <!-- Godix -->
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-1036234752964441"
                     data-ad-slot="1035087288"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
                <script>
                     (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
            </div>
        </div>
    `;
    
    document.getElementById('content-area').innerHTML = content;
    
    // Load recent payments
    loadRecentPayments();
}

function getRecentTransactions() {
    if (!currentUser) return [];
    
    const userTransactions = transactions
        .filter(t => t.userId === currentUser.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    if (userTransactions.length === 0) {
        return ['<p class="text-gray-500 text-center py-4">No transactions yet</p>'];
    }
    
    return userTransactions.map(t => {
        const isCredit = t.type === 'credit';
        const icon = isCredit ? 'fas fa-arrow-down' : 'fas fa-arrow-up';
        const colorClass = isCredit ? 'text-green-600' : 'text-red-600';
        const sign = isCredit ? '+' : '-';
        
        return `
            <div class="flex justify-between items-center p-3 border-b border-gray-100">
                <div class="flex items-center space-x-3">
                    <div class="${colorClass}">
                        <i class="${icon}"></i>
                    </div>
                    <div>
                        <p class="font-medium">${t.description}</p>
                        <p class="text-sm text-gray-500">${new Date(t.date).toLocaleString()}</p>
                    </div>
                </div>
                <div class="${colorClass} font-medium">
                    ${sign}₦${t.amount.toFixed(2)}
                </div>
            </div>
        `;
    });
}

function showWatchAds() {
    if (!currentUser) return;
    
    const content = `
        <div class="bg-white shadow rounded-lg p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Watch Ads & Earn</h2>
                <div class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Balance: ₦${currentUser.balance.toFixed(2)}
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="ads-container">
                <!-- Ads will be loaded by ads.js -->
                <div class="text-center py-8 text-gray-500">Loading ads...</div>
            </div>
        </div>
    `;
    
    document.getElementById('content-area').innerHTML = content;
    
    // Load ads
    loadAds();
}

function showWithdrawForm() {
    if (!currentUser) return;
    
    const content = `
        <div class="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Withdraw Earnings</h2>
            
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 text-blue-500">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-blue-700">
                            Minimum withdrawal amount is ₦1,000. Processing time is 24-48 hours.
                        </p>
                    </div>
                </div>
            </div>
            
            <form id="withdraw-form" onsubmit="processWithdrawal(event)">
                <div class="mb-4">
                    <label for="withdraw-amount" class="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                    <input type="number" id="withdraw-amount" min="1000" max="${currentUser.balance}" value="1000" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <p class="mt-1 text-sm text-gray-500">Available: ₦${currentUser.balance.toFixed(2)}</p>
                </div>
                
                <div class="mb-4">
                    <label for="withdraw-bank" class="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                    <select id="withdraw-bank" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select Bank</option>
                        ${banks.map(bank => `
                            <option value="${bank.code}">${bank.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="mb-4">
                    <label for="withdraw-account-number" class="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input type="text" id="withdraw-account-number" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <p id="account-name" class="mt-1 text-sm font-medium text-green-600 hidden"></p>
                </div>
                
                <div class="mb-4">
                    <label for="withdraw-account-name" class="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                    <input type="text" id="withdraw-account-name" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Withdraw
                </button>
            </form>
        </div>
    `;
    
    document.getElementById('content-area').innerHTML = content;
    
    // Add event listeners for bank account verification
    document.getElementById('withdraw-bank').addEventListener('change', function() {
        const bankCode = this.value;
        const accountNumber = document.getElementById('withdraw-account-number').value;
        
        if (bankCode && accountNumber.length >= 10) {
            verifyAccountNumber(bankCode, accountNumber);
        }
    });
    
    document.getElementById('withdraw-account-number').addEventListener('input', function() {
        const bankCode = document.getElementById('withdraw-bank').value;
        const accountNumber = this.value;
        
        if (bankCode && accountNumber.length >= 10) {
            verifyAccountNumber(bankCode, accountNumber);
        }
    });
}

function showReferralSection() {
    if (!currentUser) return;
    
    const userReferrals = referrals.filter(r => r.referrerId === currentUser.id);
    
    const content = `
        <div class="bg-white shadow rounded-lg p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Refer Friends & Earn</h2>
                <div class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    Earned: ₦${(userReferrals.length * 200).toFixed(2)}
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-purple-50 p-6 rounded-lg">
                    <h3 class="text-lg font-medium text-gray-800 mb-3">Your Referral Link</h3>
                    <div class="flex">
                        <input type="text" id="referral-link" value="${window.location.origin}?ref=${currentUser.id}" readonly class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-purple-500 focus:border-purple-500">
                        <button onclick="copyReferralLink()" class="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                        </button>
                    </div>
                    <p class="mt-2 text-sm text-gray-600">Share this link with friends and earn ₦200 when they sign up and watch their first ad.</p>
                </div>
                
                <div class="bg-blue-50 p-6 rounded-lg">
                    <h3 class="text-lg font-medium text-gray-800 mb-3">Referral Stats</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500">Total Referrals</p>
                            <p class="text-2xl font-bold">${userReferrals.length}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Total Earnings</p>
                            <p class="text-2xl font-bold">₦${(userReferrals.length * 200).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 class="text-lg font-medium text-gray-800">Your Referrals</h3>
                </div>
                
                <div class="divide-y divide-gray-200">
                    ${userReferrals.length > 0 ? 
                        userReferrals.map(ref => {
                            const referredUser = users.find(u => u.id === ref.referredId);
                            return `
                                <div class="p-4 flex items-center">
                                    <div class="profile-pic w-10 h-10 rounded-full mr-3">
                                        ${getInitials(referredUser.name)}
                                    </div>
                                    <div class="flex-1">
                                        <p class="font-medium">${referredUser.name}</p>
                                        <p class="text-sm text-gray-500">Joined on ${new Date(ref.date).toLocaleDateString()}</p>
                                    </div>
                                    <div class="text-green-600 font-medium">
                                        +₦200
                                    </div>
                                </div>
                            `;
                        }).join('') : 
                        '<div class="p-6 text-center text-gray-500">No referrals yet</div>'
                    }
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('content-area').innerHTML = content;
}

function showAllTransactions() {
    if (!currentUser) return;
    
    const userTransactions = transactions
        .filter(t => t.userId === currentUser.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const content = `
        <div class="bg-white shadow rounded-lg p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Transaction History</h2>
                <button onclick="showDashboard()" class="text-blue-600 hover:text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5 inline mr-1">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${userTransactions.length > 0 ? 
                            userTransactions.map(t => {
                                const isCredit = t.type === 'credit';
                                const colorClass = isCredit ? 'text-green-600' : 'text-red-600';
                                const sign = isCredit ? '+' : '-';
                                const statusClass = t.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                  t.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                  'bg-red-100 text-red-800';
                                
                                return `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(t.date).toLocaleString()}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${t.description}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm ${colorClass}">${sign}₦${t.amount.toFixed(2)}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                                                ${t.status}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('') : 
                            `<tr>
                                <td colspan="4" class="px-6 py-4 text-center text-gray-500">No transactions yet</td>
                            </tr>`
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('content-area').innerHTML = content;
}

// Auth functions
function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('gwatch_user_id', user.id);
        updateUIForLoggedInUser();
        
        // Show success toast
        showToast('Login successful!', 'success');
        
        // Check for referral
        checkAndProcessReferral();
    } else {
        showToast('Invalid email or password', 'error');
    }
}

function register(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateId(),
        name,
        email,
        phone,
        password,
        balance: 0,
        totalWithdrawn: 0,
        adsWatched: 0,
        dateRegistered: new Date().toISOString()
    };
    
    users.push(newUser);
    saveData();
    
    // Login the new user
    currentUser = newUser;
    localStorage.setItem('gwatch_user_id', newUser.id);
    updateUIForLoggedInUser();
    
    // Show success toast
    showToast('Registration successful!', 'success');
    
    // Check for referral
    checkAndProcessReferral();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('gwatch_user_id');
    updateUIForLoggedOutUser();
    showToast('Logged out successfully', 'info');
}

function checkAndProcessReferral() {
    const referralCode = localStorage.getItem('gwatch_referral_code');
    
    if (referralCode && currentUser) {
        const referrer = users.find(u => u.id === referralCode);
        
        if (referrer && referrer.id !== currentUser.id) {
            // Check if this referral already exists
            const existingReferral = referrals.find(r => 
                r.referrerId === referrer.id && r.referredId === currentUser.id
            );
            
            if (!existingReferral) {
                // Create new referral
                referrals.push({
                    id: generateId(),
                    referrerId: referrer.id,
                    referredId: currentUser.id,
                    date: new Date().toISOString()
                });
                
                // Credit referrer
                referrer.balance += 200;
                
                // Create transaction for referrer
                transactions.push({
                    id: generateId(),
                    userId: referrer.id,
                    type: 'credit',
                    amount: 200,
                    description: 'Referral bonus',
                    date: new Date().toISOString(),
                    status: 'completed'
                });
                
                saveData();
                
                // Show success message
                showToast(`You've been referred by ${referrer.name}. They earned ₦200!`, 'success');
                
                // Remove referral code from storage
                localStorage.removeItem('gwatch_referral_code');
            }
        }
    }
}

// Ad functions
function loadAds() {
    // This will be handled by ads.js
    fetchAds();
}

function watchAd(adId) {
    if (!currentUser) return;
    
    const ad = ads.find(a => a.id === adId);
    if (!ad) return;
    
    // Show ad watching modal
    const content = `
        <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg overflow-hidden w-full max-w-2xl">
                <div class="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="font-bold text-lg">${ad.title}</h3>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div class="p-4">
                    <div class="bg-black aspect-video flex items-center justify-center mb-4">
                        <img src="${ad.image}" alt="${ad.title}" class="max-h-full max-w-full">
                    </div>
                    
                    <div class="mb-4">
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div id="progress-bar" class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
                        </div>
                        <p id="time-remaining" class="text-sm text-gray-600 mt-1 text-center">${ad.duration} seconds remaining</p>
                    </div>
                    
                    <p class="text-center mb-4">Watch the full ad to earn ₦${ad.reward.toFixed(2)}</p>
                    
                    <div class="flex justify-center">
                        <button id="complete-btn" disabled class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md opacity-50 cursor-not-allowed">
                            Earning ₦${ad.reward.toFixed(2)}...
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    // Simulate watching the ad
    let secondsRemaining = ad.duration;
    const progressBar = document.getElementById('progress-bar');
    const timeRemaining = document.getElementById('time-remaining');
    const completeBtn = document.getElementById('complete-btn');
    
    const timer = setInterval(() => {
        secondsRemaining--;
        const progress = 100 - (secondsRemaining / ad.duration * 100);
        progressBar.style.width = `${progress}%`;
        timeRemaining.textContent = `${secondsRemaining} seconds remaining`;
        
        if (secondsRemaining <= 0) {
            clearInterval(timer);
            completeBtn.disabled = false;
            completeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            completeBtn.textContent = 'Complete & Earn ₦' + ad.reward.toFixed(2);
            completeBtn.onclick = function() {
                creditUserForAd(ad);
                closeModal();
            };
        }
    }, 1000);
    
    window.closeModal = function() {
        clearInterval(timer);
        document.body.removeChild(modal);
    };
}

function creditUserForAd(ad) {
    if (!currentUser) return;
    
    // Credit user
    currentUser.balance += ad.reward;
    currentUser.adsWatched = (currentUser.adsWatched || 0) + 1;
    
    // Create transaction
    transactions.push({
        id: generateId(),
        userId: currentUser.id,
        type: 'credit',
        amount: ad.reward,
        description: `Ad watched: ${ad.title}`,
        date: new Date().toISOString(),
        status: 'completed'
    });
    
    saveData();
    
    // Show success message
    showToast(`You've earned ₦${ad.reward.toFixed(2)} for watching the ad!`, 'success');
    
    // Update UI
    showDashboard();
}

// Withdrawal functions
function processWithdrawal(event) {
    event.preventDefault();
    
    if (!currentUser) return;
    
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const bankCode = document.getElementById('withdraw-bank').value;
    const accountNumber = document.getElementById('withdraw-account-number').value;
    const accountName = document.getElementById('withdraw-account-name').value;
    
    if (amount < 1000) {
        showToast('Minimum withdrawal amount is ₦1000', 'error');
        return;
    }
    
    if (amount > currentUser.balance) {
        showToast('Insufficient balance', 'error');
        return;
    }
    
    if (!bankCode || !accountNumber || !accountName) {
        showToast('Please fill all bank details', 'error');
        return;
    }
    
    // Initialize Monnify payment
    initializeMonnifyPayment(amount, bankCode, accountNumber, accountName);
}

function verifyAccountNumber(bankCode, accountNumber) {
    if (accountNumber.length < 10) return;
    
    // In a real app, this would call the Monnify API
    // For demo, we'll simulate the response after a delay
    setTimeout(() => {
        const bank = banks.find(b => b.code === bankCode);
        if (bank) {
            document.getElementById('account-name').textContent = 'Account Name: Demo User';
            document.getElementById('account-name').classList.remove('hidden');
            document.getElementById('withdraw-account-name').value = 'Demo User';
        }
    }, 1000);
}

// Monnify functions
function initializeMonnify() {
    // Initialize Monnify SDK
    MonnifySDK.init({
        amount: 0, // Will be set dynamically
        currency: "NGN",
        reference: "" + Math.floor(Math.random() * 1000000000 + 1),
        customerFullName: currentUser ? currentUser.name : 'Guest User',
        customerEmail: currentUser ? currentUser.email : 'guest@example.com',
        customerMobileNumber: currentUser ? currentUser.phone : '08012345678',
        apiKey: "MK_TEST_SAF7HR5F3F", // Test API key - replace with your production key
        contractCode: "4934121697", // Test contract code - replace with your production code
        paymentDescription: "Withdrawal from GWatch",
        isTestMode: true, // Set to false for production
        metadata: {
            "name": "GWatch",
            "version": "1.0.0"
        },
        onComplete: function(response) {
            // Handle successful payment
            console.log("Payment completed", response);
            if (response.paymentStatus === "PAID") {
                processSuccessfulWithdrawal(response.amount, response.customer.bankCode, response.customer.bankAccountNumber, response.customer.bankAccountName);
            }
        },
        onClose: function(data) {
            // Handle when modal is closed
            console.log("Payment modal closed", data);
        }
    });
    
    monnifyInitialized = true;
}

function initializeMonnifyPayment(amount, bankCode, accountNumber, accountName) {
    if (!monnifyInitialized) {
        initializeMonnify();
    }
    
    // Update Monnify payment details
    MonnifySDK.init({
        amount: amount,
        bankCode: bankCode,
        bankAccountNumber: accountNumber,
        bankAccountName: accountName,
        customerFullName: currentUser.name,
        customerEmail: currentUser.email,
        customerMobileNumber: currentUser.phone,
        reference: "GW" + Date.now(),
    });
    
    // Load Monnify script
    MonnifySDK.load();
}

function processSuccessfulWithdrawal(amount, bankCode, accountNumber, accountName) {
    if (!currentUser) return;
    
    // Create withdrawal request
    const withdrawalId = "GW" + Date.now();
    
    // Deduct from user balance
    currentUser.balance -= amount;
    currentUser.totalWithdrawn += amount;
    
    // Create transaction
    transactions.push({
        id: withdrawalId,
        userId: currentUser.id,
        type: 'debit',
        amount: amount,
        description: 'Withdrawal to ' + accountNumber,
        date: new Date().toISOString(),
        status: 'completed'
    });
    
    saveData();
    
    // Show success message
    showToast(`Withdrawal of ₦${amount.toFixed(2)} processed successfully!`, 'success');
    
    // Send receipt (simulated)
    sendWithdrawalReceipt(withdrawalId, amount, accountNumber, accountName);
    
    // Update UI
    showDashboard();
}

function sendWithdrawalReceipt(withdrawalId, amount, accountNumber, accountName) {
    // In a real app, this would send an email and WhatsApp message
    console.log(`Withdrawal receipt sent to ojtechbot@gmail.com and 08081428591:
        ID: ${withdrawalId}
        Amount: ₦${amount}
        Account Number: ${accountNumber}
        Account Name: ${accountName}
        User: ${currentUser.name} (${currentUser.email})
    `);
}

function loadBanks() {
    // In a real app, this would come from the Monnify API
    banks = [
        { code: '044', name: 'Access Bank' },
        { code: '063', name: 'Access Bank (Diamond)' },
        { code: '035A', name: 'ALAT by WEMA' },
        { code: '401', name: 'ASO Savings and Loans' },
        { code: '023', name: 'Citibank Nigeria' },
        { code: '050', name: 'Ecobank Nigeria' },
        { code: '562', name: 'Ekondo Microfinance Bank' },
        { code: '070', name: 'Fidelity Bank' },
        { code: '011', name: 'First Bank of Nigeria' },
        { code: '214', name: 'First City Monument Bank' },
        { code: '058', name: 'Guaranty Trust Bank' },
        { code: '030', name: 'Heritage Bank' },
        { code: '301', name: 'Jaiz Bank' },
        { code: '082', name: 'Keystone Bank' },
        { code: '526', name: 'Parallex Bank' },
        { code: '076', name: 'Polaris Bank' },
        { code: '101', name: 'Providus Bank' },
        { code: '221', name: 'Stanbic IBTC Bank' },
        { code: '068', name: 'Standard Chartered Bank' },
        { code: '232', name: 'Sterling Bank' },
        { code: '100', name: 'Suntrust Bank' },
        { code: '032', name: 'Union Bank of Nigeria' },
        { code: '033', name: 'United Bank For Africa' },
        { code: '215', name: 'Unity Bank' },
        { code: '035', name: 'Wema Bank' },
        { code: '057', name: 'Zenith Bank' }
    ];
}

// Referral functions
function copyReferralLink() {
    const referralLink = document.getElementById('referral-link');
    referralLink.select();
    document.execCommand('copy');
    
    showToast('Referral link copied to clipboard!', 'success');
}

// Chatbot functions
function toggleChatbot() {
    const chatbot = document.getElementById('chatbot-container');
    chatbotOpen = !chatbotOpen;
    
    if (chatbotOpen) {
        chatbot.style.display = 'flex';
    } else {
        chatbot.style.display = 'none';
    }
}

function sendChatMessage() {
    const inputField = document.getElementById('chatbot-input-field');
    const message = inputField.value.trim();
    
    if (message === '') return;
    
    // Add user message
    addChatMessage(message, 'user');
    inputField.value = '';
    
    // Generate bot response
    setTimeout(() => {
        let response;
        
        if (message.toLowerCase().includes('balance')) {
            if (currentUser) {
                response = `Your current balance is ₦${currentUser.balance.toFixed(2)}.`;
            } else {
                response = 'You need to login to check your balance.';
            }
        } else if (message.toLowerCase().includes('withdraw') || message.toLowerCase().includes('payment')) {
            if (currentUser) {
                response = 'You can withdraw your earnings when you reach ₦1000. Go to the Withdraw section to request a payment.';
            } else {
                response = 'Please login to withdraw your earnings.';
            }
        } else if (message.toLowerCase().includes('refer') || message.toLowerCase().includes('invite')) {
            if (currentUser) {
                response = `Share your referral link to earn ₦200 per friend: ${window.location.origin}?ref=${currentUser.id}`;
            } else {
                response = 'Please login to access your referral link.';
            }
        } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
            response = 'Hello! How can I help you today?';
        } else {
            response = 'I can help you with information about your balance, withdrawals, and referrals. What would you like to know?';
        }
        
        addChatMessage(response, 'bot');
    }, 500);
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Utility functions
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

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

function loadRecentPayments() {
    // This will be handled by ads.js
    fetchRecentPayments();
}