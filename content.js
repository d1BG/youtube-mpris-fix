/**
 * @file content.js
 * @description This script runs directly on the YouTube/YouTube Music page. It finds the video
 * player and forces a metadata update for MPRIS whenever a new video is loaded.
 */
VERSION = 1.2
console.log("Youtube MPRIS Fixer: Content script loaded. Version " + VERSION);

// youtube vid
let videoElement = null;

/**
 * Finds the main video element on the page.
 * @returns {HTMLVideoElement|null}
 */
function findVideoElement() {
    return document.querySelector('video');
}

function updateMediaSession() {
    if (!('mediaSession' in navigator) || !videoElement) return;

    if (!isNaN(videoElement.duration)) {
        navigator.mediaSession.setPositionState({
            duration: videoElement.duration
        });
    }
}

/**
 * Attaches all necessary event listeners to the video element.
 */
function attachVideoListeners() {
    if (!videoElement) return;
    const masterListener = () => updateMediaSession();
    videoElement.removeEventListener('durationchange', masterListener);
    videoElement.addEventListener('durationchange', masterListener);
    console.log("MPRIS Fixer: All video event listeners attached.");
}

/**
 * Initializes the entire script. Finds the video element, sets up observers and listeners.
 */
function initialize() {
    videoElement = findVideoElement();
    if (videoElement) {
        console.log("Youtube MPRIS Fixer: Video element found. Initializing...");
        attachVideoListeners();
        updateMediaSession(); // Initial update
    }else {
        // If the video element isn't ready, wait and try again.
        console.log("Youtube MPRIS Fixer: Video element not found. Retrying...");
        setTimeout(initialize, 1000);
    }
}

/**
 * A master MutationObserver to watch for major page changes, like the player being
 * added to the DOM on navigation. This is more reliable than observing the title.
 */
const pageObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType === 1 && (node.querySelector('video') || node.matches('video'))) {
                console.log("Youtube MPRIS Fixer: Video player detected in DOM change. Re-initializing.");
                initialize();
                return;
            }
        }
    }
});

// Start observing the entire document for changes.
pageObserver.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial call to start the process.
initialize();

