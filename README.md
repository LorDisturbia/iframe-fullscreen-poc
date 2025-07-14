# Fullscreen POC - Reference Implementation

Two approaches to implement fullscreen functionality from within an iframe.

## Files

- `index.html` - Main demo page showcasing both approaches
- `iframe-page.html` - Standard fullscreen API implementation
- `iframe-page-parent-communication.html` - Parent communication implementation
- `fullscreen-communication.js` - Parent-side script for communication approach

## Usage

1. Start a local server: `npx http-server 8080`
2. Open `http://localhost:8080` in your browser
3. Test both approaches side by side

## Approach 1: Standard Fullscreen API

**File:** `iframe-page.html`

Uses `requestFullscreen()` - hides all browser UI completely.

```javascript
document.documentElement.requestFullscreen();
```

It doesn't require additional changes to the parent website. It's the same iframe they've used since ever.

## Approach 2: Parent Communication

**Files:** `iframe-page-parent-communication.html` + `fullscreen-communication.js`

Iframe sends messages to parent to create fullscreen overlay - keeps browser UI visible.

**Iframe sends:**

```javascript
window.parent.postMessage({
    type: 'ENTER_PARENT_FULLSCREEN',
    iframeContent: {
        title: 'Custom Title',
        message: 'Custom message',
        backgroundColor: '#ff0000'
    }
}, '*');
```

**Parent includes:**

```html
<script src="fullscreen-communication.js"></script>
```

This means that, in addition to the iframe, the parent website also needs to import a new script that we serve. We also need to build this script to make sure it handles all scenarios correctly.

## Key Differences

- **Standard API:** True fullscreen, hides browser UI
- **Parent Communication:** Simulated fullscreen, keeps browser UI visible

## Better test with cross-origin support

1. Start one instance of the server on port 8080 with `npx http-server -p 8080`
2. Start another one on port 8181 with `npx http-server -p 8081`
3. Serve the first one through the internet with `ngrok http 127.0.0.1:8080` (requires ngrok to be available and logged in)
4. Serve the second one through the internet with `ngrok http 127.0.0.1:8081`
5. Change the `src` attribute of the `iframe` elements in `index.html` to point to the ngrok URL for the second instance of your HTTP server. It should look like : `src="https://bb8cb81b62d0.ngrok.app/iframe-page.html`.
6. Visit the URL for your first instance of ngrok
7. In the developer tools, you should see the first ngrok URL responding for /, and then the second one responding from iframe-page.html
8. You should still be able to operate full-screen, even if those pages are served from different domains.
