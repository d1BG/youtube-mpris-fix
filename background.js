/**
 * @file background.js
 * @description Background script for the extension. Its primary role is to listen for tab updates
 * and inject the content script into YouTube and YouTube Music pages when they load.
 */

// This listener fires whenever a tab is updated.
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // We only want to inject the script when the page has finished loading.
  if (changeInfo.status === 'complete') {
    // Check if the URL is a YouTube video or YouTube Music.
    const isYouTube = tab.url && tab.url.includes("youtube.com/watch");
    const isYouTubeMusic = tab.url && tab.url.includes("music.youtube.com");

    if (isYouTube || isYouTubeMusic) {
      // Inject the content script into the active tab.
      browser.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).then(() => {
        console.log("Youtube MPRIS Fixer: Injected content script into YouTube page.");
      }).catch(err => {
        console.error("Youtube MPRIS Fixer: Failed to inject script:", err);
      });
    }
  }
});



