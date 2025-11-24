# 🦊 YouTube MPRIS Fixer 🎵

A lightweight but powerful Firefox extension to fix annoying MPRIS metadata bugs on YouTube and YouTube Music! 🎧✨
(This thing is hella vibecoded if u couldn't tell)

There is a more lightweight [solution that works on all browsers](https://github.com/LurkAndLoiter/youtube-mpris-fix) by @LurkAndLoiter
Once it releases on the Firefox Add-ons page, this repo will be archived

## The Problem 😩

Have you ever been listening to a YouTube playlist, and when a new video autoplays, your media controls (like in your OS notification center or on your keyboard) still show the information for the *last* video?

You might see issues like:

* 📜 The title and artist don't update.

* ⌛ The track length is wrong (it still shows the duration of the previous video).

* ⏱️ The playback position gets stuck or continues counting up from where the last video ended.

This happens because YouTube is a Single-Page Application (SPA). It loads new videos dynamically without a full page refresh, which can confuse Firefox's media reporting service (MPRIS).

## The Solution ✨

This extension injects a smart script directly into YouTube and YouTube Music pages. It carefully listens for when a new video starts playing and **manually forces** Firefox to update the media session information.

This ensures your media controls are always in sync, giving you a seamless listening experience! ✅

## Features 🚀

* 💯 **Accurate Duration & Position:** Ensures the track length and playback timer reset correctly for every new video.

* 🌐 **Works on YouTube & YouTube Music:** Enjoy a consistent experience across both platforms.

* 🪶 **Super Lightweight:** No unnecessary bloat. It does one job and does it well.

## Installation 🔧:
Add from Firefox Add-ons: [Youtube MPRIS Fix](https://addons.mozilla.org/en-US/firefox/addon/youtube-mpris-fix)

## How to load for development 👨‍💻

If you want to load the extension for development or inspect the code:

1. Clone or download this repository.

2. In Firefox, navigate to `about:debugging`.

3. Click on "This Firefox" on the left.

4. Click the "Load Temporary Add-on..." button.

5. Select the `manifest.json` file inside the `youtube-mpris-fixer` directory.

6. The extension will be active until you close Firefox.
