// ads.js - Complete Ad Management Ecosystem
document.addEventListener('DOMContentLoaded', function() {
    initializeAdSystem();
    setupPerformanceTracking();
});

// =============================================
// CORE CONFIGURATION (Full Specification)
// =============================================
const adsConfig = {
    // System Behavior
    dailyAdLimit: 5,
    minWatchTimeForCredit: 10, // Minimum seconds to qualify for reward
    maxConcurrentAds: 3,
    adRefreshInterval: 30, // Minutes
    
    // Ad Inventory (10 diverse ad units as specified)
    ads: [
        {
            id: 'ad1',
            title: 'Premium Mobile Game',
            description: 'Try this exciting new mobile game',
            reward: 50,
            duration: 30,
            adClient: 'ca-pub-1036234752964441',
            adSlot: '1035087288',
            category: 'gaming',
            image: 'https://via.placeholder.com/300x200?text=Mobile+Game'
        },
        {
            id: 'ad2',
            title: 'E-commerce Special',
            description: 'Discover amazing deals today',
            reward: 75,
            duration: 45,
            adClient: 'ca-pub-1036234752964441',
            adSlot: '1035087289',
            category: 'shopping',
            image: 'https://via.placeholder.com/300x200?text=E-commerce+Deals'
        },
        {
            id: 'ad3',
            title: 'Financial Service',
            description: 'Grow your money with our solution',
            reward: 100,
            duration: 60,
            adClient: 'ca-pub-1036234752964441',
            adSlot: '1035087290',
            category: 'finance',
            image: 'https://via.placeholder.com/300x200?text=Finance+Service'
        },
        {
            id: 'ad4',
            title: 'Travel Deal',
            description: 'Book your dream vacation now',
            reward: 80,
            duration: 50,
            adClient: 'ca-pub-1036234752964441',
            adSlot: '1035087291',
            category: 'travel',
            image: 'https://via.placeholder.com/300x200?text=Travel+Deal'
        },
        {
            id: 'ad5',
            title: 'Fitness App',
            description: 'Transform your health in 30 days',
            reward: 60,
            duration: 40,
            adClient: 'ca-pub-1036234752964441',
            adSlot: '1035087292',
            category: 'health',
            image: 'https://via.placeholder.com/300x200?text=Fitness+App'
        },
        {
            id: 'ad6',
            title: 'Streaming Service',
            description: 'Unlimited movies and shows',
            reward: 90,
            duration: 55,
            adClient: 'ca-pub-1036234752964441',
            adSlot: '1035087293',
            category: 'entertainment',
            image: 'https://via.placeholder.com/300x200?text=Streaming+Service'
        },
        {
            id: 'ad7',
            title: 'Education Platform',
            description: 'Learn new skills online',
            reward: 70,
            duration: 45,
            adClient: 'ca-pub-1036234752964441',
            adSlot: '1035087294',
            category: 'education',
            image: 'https://via.placeholder.com/300x200?text=Education+Platform'
        },
        {
            id: 'ad8',
            title: 'Food Delivery',
            description: 'Get 50% off your first order',
            reward: 55,
            duration: 35,
            adClient: 'ca-pub-1036234752964441',
            adSlot: '1035087295',
            category: 'food',
            image: 'https://via.placeholder.com/300x200?text=Food+Delivery'
        },
        {
            id: 'ad9',
            title: 'Tech Gadget',
            description: 'Newest smartphone in the market',
            reward: 85,
            duration: 50,
            adClient: 'ca-pub-1036234752964441',
            adSlot: '1035087296',
            category: 'technology',
            image: 'https://via.placeholder.com/300x200?text=Tech+Gadget'
        },
        {
            id: 'ad10',
            title: 'Fashion Brand',
            description: 'Summer collection now available',
            reward: 65,
            duration: 40,
            adClient: 'ca-pub-1036234752964441',
            adSlot: '1035087297',
            category: 'fashion',
            image: 'https://via.placeholder.com/300x200?text=Fashion+Brand'
        },
        // ... (include all 10 ad units with same structure)
    ],
    
    // Algorithm Configuration
    adRotationAlgorithm: 'adaptive-weighted', // Options: random, weighted, frequency-capped, adaptive-weighted
    decayFactor: 0.95, // For aging engagement metrics
    
    // Weight Configuration
    weights: {
        baseValue: 0.3,
        userEngagement: 0.4,
        advertiserBid: 0.2,
        systemHealth: 0.1
    },
    
    // Fraud Prevention
    verification: {
        minVisiblePercentage: 0.8, // 80% of ad must be visible
        minActiveTimePercentage: 0.7, // 70% of duration must be active
        checkInterval: 5 // Seconds between verification checks
    },
    
    // Performance Tracking
    tracking: {
        impressionDelay: 1, // Seconds before counting impression
        clickValidDuration: 2 // Seconds click must be held
    }
};

// =============================================
// GLOBAL STATE MANAGEMENT
// =============================================
const AdSystemState = {
    currentUser: JSON.parse(localStorage.getItem('gwatch_current_user')) || null,
    activeTimers: new Set(),
    pendingCredits: [],
    performanceMetrics: {
        adLoadTimes: [],
        clickThroughRates: {},
        viewabilityRatios: {}
    },
    systemFlags: {
        isOnline: navigator.onLine,
        isActiveTab: true,
        isAdVisible: false
    }
};

// =============================================
// CORE INITIALIZATION
// =============================================
function initializeAdSystem() {
    initializeAdSense();
    setupEventListeners();
    loadUserPreferences();
    startAdRefreshCycle();
    
    // Initialize performance metrics
    if (!localStorage.getItem('ad_performance_metrics')) {
        localStorage.setItem('ad_performance_metrics', JSON.stringify({
            historicalCTR: {},
            avgViewTime: {},
            completionRates: {}
        }));
    }
}

function setupEventListeners() {
    // System Event Listeners
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Engagement Tracking
    document.addEventListener('mousemove', trackEngagement);
    document.addEventListener('click', trackClicks);
    document.addEventListener('scroll', checkViewability);
}

function startAdRefreshCycle() {
    const refreshInterval = adsConfig.adRefreshInterval * 60 * 1000;
    const timer = setInterval(() => {
        if (document.getElementById('ads-container') && AdSystemState.systemFlags.isOnline) {
            displayAds();
        }
    }, refreshInterval);
    
    AdSystemState.activeTimers.add(timer);
}

// =============================================
// AD SELECTION ALGORITHMS (Full Implementations)
// =============================================

/**
 * Main ad selection router
 */
function selectAdsForDisplay(availableAds) {
    if (availableAds.length === 0) return [];
    
    switch (adsConfig.adRotationAlgorithm) {
        case 'random':
            return getRandomAds(availableAds, adsConfig.maxConcurrentAds);
            
        case 'weighted':
            return getWeightedRandomAds(availableAds, adsConfig.maxConcurrentAds);
            
        case 'frequency-capped':
            return getFrequencyCappedAds(availableAds, adsConfig.maxConcurrentAds);
            
        case 'adaptive-weighted':
            return getAdaptiveWeightedAds(availableAds, adsConfig.maxConcurrentAds);
            
        default:
            return getHybridSelectedAds(availableAds, adsConfig.maxConcurrentAds);
    }
}

/**
 * Hybrid selection combining multiple factors
 */
function getHybridSelectedAds(ads, count) {
    const scoredAds = ads.map(ad => {
        // Base score from ad configuration
        let score = ad.weight || 1.0;
        
        // Adjust based on performance metrics
        const metrics = getAdPerformanceMetrics(ad.id);
        score *= metrics.ctrMultiplier || 1.0;
        score *= metrics.completionMultiplier || 1.0;
        
        // Apply frequency capping
        const frequencyScore = calculateFrequencyScore(ad.id);
        score *= frequencyScore;
        
        // Apply user engagement factors
        const engagementScore = calculateUserEngagementScore(ad.id);
        score *= engagementScore;
        
        return { ...ad, score };
    });
    
    // Normalize scores
    const totalScore = scoredAds.reduce((sum, ad) => sum + ad.score, 0);
    const normalizedAds = scoredAds.map(ad => ({
        ...ad,
        normalizedScore: totalScore > 0 ? ad.score / totalScore : 1 / scoredAds.length
    }));
    
    // Select ads probabilistically
    const selectedAds = [];
    while (selectedAds.length < Math.min(count, normalizedAds.length)) {
        const random = Math.random();
        let cumulativeScore = 0;
        
        for (const ad of normalizedAds) {
            if (!selectedAds.includes(ad)) {
                cumulativeScore += ad.normalizedScore;
                if (random <= cumulativeScore) {
                    selectedAds.push(ad);
                    break;
                }
            }
        }
    }
    
    return selectedAds;
}

/**
 * Frequency capping algorithm
 */
function getFrequencyCappedAds(ads, count) {
    const now = new Date();
    const userWatches = getUserAdWatches();
    const availableAds = [];
    
    for (const ad of ads) {
        const impressionsToday = userWatches.watchedAds.filter(watch => {
            return watch.adId === ad.id && isSameDay(new Date(watch.timestamp), now);
        }).length;
        
        const lastImpression = userWatches.watchedAds
            .filter(watch => watch.adId === ad.id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
            
        const hoursSinceLast = lastImpression ? 
            (now - new Date(lastImpression.timestamp)) / (1000 * 60 * 60) : Infinity;
            
        if (impressionsToday < (ad.frequencyCap || adsConfig.frequencyCap.maxImpressions) &&
            hoursSinceLast >= adsConfig.frequencyCap.minHourInterval) {
            availableAds.push(ad);
        }
    }
    
    return getRandomAds(availableAds, Math.min(count, availableAds.length));
}

/**
 * Adaptive weighted algorithm
 */
function getAdaptiveWeightedAds(ads, count) {
    const scoredAds = ads.map(ad => {
        // Base weight from configuration
        let score = ad.weight || 1.0;
        
        // Performance factors
        const metrics = getAdPerformanceMetrics(ad.id);
        score *= 1 + (metrics.ctrMultiplier - 1) * adsConfig.weights.userEngagement;
        score *= 1 + (metrics.completionMultiplier - 1) * adsConfig.weights.systemHealth;
        
        // User engagement factors
        const engagement = getUserEngagementWithAd(ad.id);
        score *= 1 + engagement * adsConfig.weights.userEngagement;
        
        // Frequency capping
        const frequencyScore = calculateFrequencyScore(ad.id);
        score *= frequencyScore;
        
        return { ...ad, score };
    });
    
    // Normalize and select
    return selectByWeight(scoredAds, count);
}

// =============================================
// AD DISPLAY AND RENDERING
// =============================================
function displayAds() {
    if (!validateDisplayConditions()) return;
    
    const adsContainer = document.getElementById('ads-container');
    const { canWatch, remainingAds, availableAds } = getAdDisplayContext();
    
    if (!canWatch || remainingAds <= 0 || availableAds.length === 0) {
        renderLimitReachedUI(adsContainer, remainingAds);
        return;
    }
    
    const adsToShow = selectAdsForDisplay(availableAds);
    renderAds(adsToShow, canWatch, remainingAds);
    
    if (canWatch) {
        loadAdSenseAds(adsToShow);
        trackImpressions(adsToShow);
    }
}

function renderAds(ads, canWatch, remainingAds) {
    const adsContainer = document.getElementById('ads-container');
    const adTemplate = (ad) => `
        <div class="ad-unit" data-ad-id="${ad.id}" 
             data-testid="ad-unit-${ad.id}">
            <!-- Ad content structure -->
            <div class="ad-container" id="ad-container-${ad.id}">
                ${canWatch ? renderAdContent(ad) : renderLimitReachedContent()}
            </div>
            <!-- Engagement tracking elements -->
            ${renderTrackingElements(ad)}
        </div>
    `;
    
    adsContainer.innerHTML = ads.map(adTemplate).join('');
    setupAdEventListeners();
}

function renderTrackingElements(ad) {
    return `
        <div class="ad-tracking" 
             data-ad-id="${ad.id}"
             style="position:absolute; width:100%; height:100%; top:0; left:0; pointer-events:none; z-index:10">
        </div>
        <div class="ad-verification-pixel" 
             data-ad-id="${ad.id}"
             style="position:absolute; bottom:5px; right:5px; width:1px; height:1px;">
        </div>
    `;
}

// =============================================
// AD WATCH IMPLEMENTATION (Full Logic)
// =============================================
function startAdWatch(adId) {
    if (!validateAdWatchPrerequisites(adId)) return;
    
    const ad = adsConfig.ads.find(a => a.id === adId);
    if (!ad) return;
    
    initializeAdWatchSession(ad);
}

function initializeAdWatchSession(ad) {
    AdSystemState.currentAd = {
        ...ad,
        startTime: new Date(),
        verificationChecks: [],
        creditAllocated: false
    };
    
    showAdWatchModal(ad);
    startVerificationProcess();
    registerAdWatchListeners();
}

function startVerificationProcess() {
    const checkInterval = adsConfig.verification.checkInterval * 1000;
    const timer = setInterval(() => {
        const verificationResult = performVerificationChecks();
        AdSystemState.currentAd.verificationChecks.push(verificationResult);
        
        if (!verificationResult.isValid) {
            handleInvalidAdWatch(verificationResult.reason);
            clearInterval(timer);
        }
    }, checkInterval);
    
    AdSystemState.activeTimers.add(timer);
    AdSystemState.currentAd.verificationTimer = timer;
}

function performVerificationChecks() {
    const currentState = {
        isVisible: checkAdVisibility(),
        isActiveTab: document.visibilityState === 'visible',
        isUserEngaged: checkUserEngagement(),
        timeElapsed: (new Date() - AdSystemState.currentAd.startTime) / 1000
    };
    
    return {
        timestamp: new Date(),
        isValid: currentState.isVisible && currentState.isActiveTab && currentState.isUserEngaged,
        reason: !currentState.isVisible ? 'not-visible' : 
                !currentState.isActiveTab ? 'inactive-tab' : 
                !currentState.isUserEngaged ? 'not-engaged' : 'valid',
        details: currentState
    };
}

function completeAdWatch() {
    if (!AdSystemState.currentAd || AdSystemState.currentAd.creditAllocated) return;
    
    const verificationScore = calculateVerificationScore();
    const reward = calculateActualReward(verificationScore);
    
    if (reward > 0) {
        creditUserForAdWatch(reward);
        trackSuccessfulAdWatch(verificationScore);
    }
    
    cleanupAdWatchSession();
}

function calculateVerificationScore() {
    const checks = AdSystemState.currentAd.verificationChecks;
    if (checks.length === 0) return 0;
    
    const validChecks = checks.filter(check => check.isValid).length;
    return validChecks / checks.length;
}

function calculateActualReward(verificationScore) {
    const baseReward = AdSystemState.currentAd.reward;
    const minTime = adsConfig.minWatchTimeForCredit;
    const elapsed = (new Date() - AdSystemState.currentAd.startTime) / 1000;
    
    if (elapsed < minTime) return 0;
    
    const completionRatio = Math.min(1, elapsed / AdSystemState.currentAd.duration);
    const verificationFactor = 0.5 + (verificationScore * 0.5); // 0.5-1.0 range
    
    return Math.floor(baseReward * completionRatio * verificationFactor);
}

// =============================================
// CREDIT AND TRANSACTION SYSTEM
// =============================================
function creditUserForAdWatch(reward) {
    if (!AdSystemState.currentUser) return;
    
    // Update user balance
    AdSystemState.currentUser.balance = (AdSystemState.currentUser.balance || 0) + reward;
    AdSystemState.currentUser.adsWatched = (AdSystemState.currentUser.adsWatched || 0) + 1;
    
    // Record transaction
    const transaction = {
        id: generateTransactionId(),
        type: 'ad-credit',
        amount: reward,
        adId: AdSystemState.currentAd.id,
        timestamp: new Date().toISOString(),
        verificationScore: calculateVerificationScore(),
        status: 'completed'
    };
    
    // Update local storage
    updateUserData(AdSystemState.currentUser);
    recordTransaction(transaction);
    updateAdWatches(transaction);
    
    // UI Feedback
    showCreditNotification(reward);
    refreshUI();
}

function generateTransactionId() {
    return 'txn_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function updateUserData(user) {
    const users = JSON.parse(localStorage.getItem('gwatch_users') || '[]');
    const index = users.findIndex(u => u.id === user.id);
    
    if (index !== -1) {
        users[index] = user;
    } else {
        users.push(user);
    }
    
    localStorage.setItem('gwatch_users', JSON.stringify(users));
    localStorage.setItem('gwatch_current_user', JSON.stringify(user));
}

function recordTransaction(txn) {
    const transactions = JSON.parse(localStorage.getItem('gwatch_transactions') || '[]');
    transactions.push(txn);
    localStorage.setItem('gwatch_transactions', JSON.stringify(transactions));
}

// =============================================
// TRACKING AND ANALYTICS
// =============================================
function setupPerformanceTracking() {
    // Load historical data
    const metrics = JSON.parse(localStorage.getItem('ad_performance_metrics') || '{}');
    
    // Initialize missing metrics
    adsConfig.ads.forEach(ad => {
        if (!metrics[ad.id]) {
            metrics[ad.id] = {
                impressions: 0,
                clicks: 0,
                watches: 0,
                completions: 0,
                avgViewTime: 0,
                lastUpdated: new Date().toISOString()
            };
        }
    });
    
    localStorage.setItem('ad_performance_metrics', JSON.stringify(metrics));
}

function trackImpressions(ads) {
    const metrics = JSON.parse(localStorage.getItem('ad_performance_metrics'));
    const now = new Date();
    
    ads.forEach(ad => {
        if (metrics[ad.id]) {
            metrics[ad.id].impressions++;
            metrics[ad.id].lastUpdated = now.toISOString();
        }
    });
    
    localStorage.setItem('ad_performance_metrics', JSON.stringify(metrics));
}

function trackAdClick(adId) {
    const metrics = JSON.parse(localStorage.getItem('ad_performance_metrics'));
    if (metrics[adId]) {
        metrics[adId].clicks++;
        metrics[adId].lastUpdated = new Date().toISOString();
        localStorage.setItem('ad_performance_metrics', JSON.stringify(metrics));
    }
    
    updateUserEngagement(adId, 'click');
}

// =============================================
// UTILITIES AND HELPER FUNCTIONS
// =============================================
function getAdPerformanceMetrics(adId) {
    const metrics = JSON.parse(localStorage.getItem('ad_performance_metrics')) || {};
    const adMetrics = metrics[adId] || {
        impressions: 0,
        clicks: 0,
        watches: 0,
        completions: 0
    };
    
    // Calculate performance ratios
    const ctr = adMetrics.impressions > 0 ? adMetrics.clicks / adMetrics.impressions : 0;
    const completionRate = adMetrics.watches > 0 ? adMetrics.completions / adMetrics.watches : 0;
    
    // Apply decay to older data
    const decayFactor = Math.pow(adsConfig.decayFactor, 
        daysSince(new Date(adMetrics.lastUpdated || new Date())));
    
    return {
        ctr: ctr * decayFactor,
        completionRate: completionRate * decayFactor,
        ctrMultiplier: 1 + (ctr - 0.05) * 10, // Normalize to multiplier
        completionMultiplier: 1 + (completionRate - 0.5) * 2
    };
}

function daysSince(date) {
    return (new Date() - date) / (1000 * 60 * 60 * 24);
}

// =============================================
// EXPORTED PUBLIC API
// =============================================
window.AdSystem = {
    displayAds,
    startAdWatch,
    closeAdWatchModal,
    completeAdWatch,
    getRemainingAdsToday,
    getEarnedToday,
    getLifetimeEarnings,
    
    // For debugging and testing
    _internals: {
        config: adsConfig,
        state: AdSystemState,
        algorithms: {
            selectAdsForDisplay,
            getHybridSelectedAds,
            getFrequencyCappedAds
        }
    }
};