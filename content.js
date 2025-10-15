/**
 * @file content.js
 * @description This script runs directly on the YouTube/YouTube Music page. It finds the video
 * player and forces a metadata update for MPRIS whenever a new video is loaded.
 */

console.log("Youtube MPRIS Fixer: Content script loaded. Version 1.1");

// --- Global State ---
let videoElement = null;
let lastTrackTitle = null; // Prevent redundant metadata updates

// --- Core Functions ---

/**
 * Finds the main video element on the page.
 * @returns {HTMLVideoElement|null}
 */
function findVideoElement() {
  return document.querySelector('video');
}

/**
 * Updates all media session information: metadata and position state.
 * This is the main function to call when the track changes or state is updated.
 */
function updateMediaSession() {
  if (!('mediaSession' in navigator) || !videoElement) {
    return;
  }

  // Part 1: Update Metadata (Title, Artist, Artwork)
  const { title, artist, album, artwork } = getTrackMetadata();

  // Only update metadata if the title has actually changed.
  // This is the key to preventing race conditions and redundant updates.
  if (title && title !== lastTrackTitle) {
    console.log(`Youtube MPRIS Fixer: Track changed. Updating metadata for "${title}".`);
    lastTrackTitle = title;
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album,
      artwork: artwork ? [{ src: artwork, sizes: '512x512' }] : [],
    });
  }

  // Part 2: Update Position State (Duration, Position, Playback State)
  // This part runs regardless of whether metadata changed, to keep the position synced.
  if (!isNaN(videoElement.duration)) {
    navigator.mediaSession.playbackState = videoElement.paused ? 'paused' : 'playing';
    navigator.mediaSession.setPositionState({
      duration: videoElement.duration,
      playbackRate: videoElement.playbackRate,
      position: videoElement.currentTime,
    });
  }
}

/**
 * Extracts track metadata from the current page's DOM.
 * @returns {{title: string, artist: string, album: string, artwork: string}}
 */
function getTrackMetadata() {
  const isMusic = window.location.hostname === 'music.youtube.com';
  let title = '', artist = '', album = '', artwork = '';

  try {
    if (isMusic) {
      const playerBar = document.querySelector('ytmusic-player-bar');
      title = playerBar.querySelector('.title')?.textContent.trim();
      const byline = playerBar.querySelector('.byline');
      const metadataElements = byline ? Array.from(byline.querySelectorAll('a, span')) : [];
      artist = metadataElements[0]?.textContent.trim() || '';
      album = metadataElements.length > 2 ? metadataElements[2]?.textContent.trim() : '';
      artwork = playerBar.querySelector('img.image')?.src;
    } else {
      title = document.querySelector('h1.ytd-watch-metadata .title yt-formatted-string')?.textContent.trim();
      artist = document.querySelector('#owner-name a')?.textContent.trim() || 'YouTube';
      album = document.querySelector('#playlist-title a')?.textContent.trim() || '';
      const videoId = new URLSearchParams(window.location.search).get('v');
      if (videoId) {
        artwork = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
  } catch (e) {
    console.error("Youtube MPRIS Fixer: Error extracting metadata.", e);
  }
  
  return { title, artist, album, artwork };
}


/**
 * Attaches all necessary event listeners to the video element.
 */
function attachVideoListeners() {
  if (!videoElement) return;

  const events = [
    'play', 'pause', 'seeking', 'seeked', 'timeupdate', 'durationchange', 'loadedmetadata'
  ];

  // A single, comprehensive listener for all playback-related events.
  const masterListener = () => {
    updateMediaSession();
  };

  events.forEach(event => {
    videoElement.removeEventListener(event, masterListener); // Clean up first
    videoElement.addEventListener(event, masterListener);
  });
  console.log("MPRIS Fixer: All video event listeners attached.");
}

/**
 * Initializes the entire script. Finds the video element, sets up observers and listeners.
 */
function initialize() {
  videoElement = findVideoElement();
  if (videoElement) {
    console.log("Youtube MPRIS Fixer: Video element found. Initializing...");
    lastTrackTitle = null; // Reset on initialization
    attachVideoListeners();
    setupActionHandlers();
    updateMediaSession(); // Initial update
  } else {
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


