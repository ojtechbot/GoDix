// pop.js
// This script simulates ad pop-ups with custom styling to match the GoDix UI.
// In a real-world scenario, you would integrate actual ad network scripts here.

// Ad display configuration
const AD_DISPLAY_INTERVAL_NAVIGATIONS = 3; // Show ad every X navigations
const AD_DISPLAY_INTERVAL_SECONDS = 60; // Show ad every X seconds (if no navigation)
const AD_DISPLAY_DURATION = 8000; // Ad visible for 8 seconds

let navigationCount = 0;
let adTimer = null;
let lastAdTime = Date.now();

const adContainerId = 'go-dix-ad-modal'; // ID for the ad modal container

/**
 * Initializes the ad display logic.
 * Should be called once on app start.
 */
function initializeAdLogic() {
    // Start a timer for time-based ad display
    startAdTimer();
}

/**
 * Increments navigation count and potentially shows an ad.
 * Call this function whenever a major page navigation occurs.
 */
function triggerAdOnNavigation() {
    navigationCount++;
    // Reset timer on navigation to avoid immediate double-ads
    clearTimeout(adTimer);
    startAdTimer();

    if (navigationCount >= AD_DISPLAY_INTERVAL_NAVIGATIONS) {
        showSimulatedAd();
        navigationCount = 0; // Reset count after showing ad
        lastAdTime = Date.now(); // Reset ad time
    }
}

/**
 * Starts or resets the timer for time-based ad display.
 */
function startAdTimer() {
    clearTimeout(adTimer); // Clear any existing timer
    adTimer = setTimeout(() => {
        const timeSinceLastAd = Date.now() - lastAdTime;
        if (timeSinceLastAd >= (AD_DISPLAY_INTERVAL_SECONDS * 1000)) {
            showSimulatedAd();
            lastAdTime = Date.now(); // Reset ad time
            navigationCount = 0; // Reset navigation count too
        }
        startAdTimer(); // Re-arm the timer
    }, AD_DISPLAY_INTERVAL_SECONDS * 1000);
}


/**
 * Displays a simulated ad modal.
 * This is where you would typically integrate actual Monetag ad code.
 */
function showSimulatedAd() {
    const existingAd = document.getElementById(adContainerId);
    if (existingAd) {
        return; // An ad is already visible
    }

    // Create the ad modal structure
    const adModalHtml = `
        <div id="${adContainerId}" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[102] p-4 animate-fade-in">
            <div class="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl shadow-3xl w-full max-w-sm transform transition-all duration-300 scale-95 opacity-0 animate-scale-in-fade-in-content">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-white">Special Offer!</h3>
                    <button id="close-ad-button" class="text-white opacity-75 hover:opacity-100 focus:outline-none p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition duration-200" aria-label="Close ad">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>
                <p class="text-white text-opacity-90 mb-6 text-center">
                    Unlock Premium Features: Ad-Free Learning & Exclusive Content!
                </p>
                <div class="w-full h-32 bg-purple-400 rounded-lg mb-6 flex items-center justify-center text-white text-sm font-semibold">
                    <img src="https://placehold.co/280x100/6B46C1/FFFFFF?text=Ad+Content" alt="Ad Placeholder" class="rounded-md object-cover w-full h-full">
                </div>
                <button id="view-offer-button" class="w-full bg-yellow-400 text-purple-900 py-3 rounded-lg font-bold text-lg hover:bg-yellow-300 transition duration-300 shadow-md transform hover:-translate-y-1">
                    View Offer Now!
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', adModalHtml); // Insert at the end of body

    const adModal = document.getElementById(adContainerId);
    const adContent = adModal.querySelector('.animate-scale-in-fade-in-content');

    // Trigger content animation after modal is in DOM
    requestAnimationFrame(() => {
        adContent.classList.remove('opacity-0', 'scale-95');
        adContent.classList.add('opacity-100', 'scale-100');
    });

    // Event listeners for the ad modal
    document.getElementById('close-ad-button').addEventListener('click', () => {
        hideSimulatedAd(adModal, adContent);
    });

    document.getElementById('view-offer-button').addEventListener('click', () => {
        // In a real app, this would redirect to an offer page or trigger an action
        showToast('Redirecting to offer...', 'info');
        console.log('Simulated Ad: User clicked "View Offer Now!"');
        hideSimulatedAd(adModal, adContent);
        // Simulate external link opening (Monetag often does this)
        window.open('https://example.com/premium-offer', '_blank');
    });

    // Auto-hide the ad after a duration
    setTimeout(() => {
        hideSimulatedAd(adModal, adContent);
    }, AD_DISPLAY_DURATION);
}

/**
 * Hides the simulated ad modal with an animation.
 * @param {HTMLElement} adModal - The main ad modal element.
 * @param {HTMLElement} adContent - The content container within the ad modal.
 */
function hideSimulatedAd(adModal, adContent) {
    if (!adModal) return;

    adContent.classList.remove('opacity-100', 'scale-100');
    adContent.classList.add('opacity-0', 'scale-95');

    adModal.classList.remove('animate-fade-in');
    adModal.classList.add('animate-fade-out'); // Assuming you define animate-fade-out

    adModal.addEventListener('animationend', () => {
        adModal.remove();
    }, { once: true });
}
