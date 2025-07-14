/**
 * Fullscreen Communication Handler
 * 
 * A simple script that enables iframe-to-parent fullscreen communication.
 * Just import this script and iframe fullscreen requests will work automatically.
 * 
 * Usage:
 * <script src="fullscreen-communication.js"></script>
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        overlayId: 'fullscreen-communication-overlay',
        overlayClass: 'fullscreen-communication-overlay',
        activeClass: 'active',
        defaultBackgroundColor: '#ff0000',
        defaultTitle: 'Fullscreen Mode',
        defaultMessage: 'This overlay covers the entire browser window while keeping the browser UI visible.',
        zIndex: 9999
    };

    // State
    let overlay = null;
    let overlayTitle = null;
    let overlayMessage = null;
    let exitButton = null;
    let isInitialized = false;

    /**
     * Create the fullscreen overlay and inject it into the DOM
     */
    function createOverlay() {
        if (overlay) return; // Already created

        // Create overlay container
        overlay = document.createElement('div');
        overlay.id = CONFIG.overlayId;
        overlay.className = CONFIG.overlayClass;
        
        // Create title
        overlayTitle = document.createElement('h1');
        overlayTitle.id = 'overlayTitle';
        overlayTitle.textContent = CONFIG.defaultTitle;
        
        // Create message
        overlayMessage = document.createElement('p');
        overlayMessage.id = 'overlayMessage';
        overlayMessage.textContent = CONFIG.defaultMessage;
        
        // Create exit button
        exitButton = document.createElement('button');
        exitButton.id = 'exitOverlayBtn';
        exitButton.textContent = 'Exit Fullscreen';
        exitButton.addEventListener('click', exitParentFullscreen);
        
        // Assemble overlay
        overlay.appendChild(overlayTitle);
        overlay.appendChild(overlayMessage);
        overlay.appendChild(exitButton);
        
        // Add to document
        document.body.appendChild(overlay);
    }

    /**
     * Inject CSS styles for the overlay
     */
    function injectStyles() {
        const styleId = 'fullscreen-communication-styles';
        
        // Don't inject styles twice
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .${CONFIG.overlayClass} {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: ${CONFIG.defaultBackgroundColor};
                z-index: ${CONFIG.zIndex};
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                text-align: center;
                transition: opacity 0.3s ease;
                font-family: Arial, sans-serif;
            }
            
            .${CONFIG.overlayClass}.${CONFIG.activeClass} {
                display: flex;
            }
            
            .${CONFIG.overlayClass} h1 {
                color: white;
                margin-bottom: 20px;
                font-size: 2em;
            }
            
            .${CONFIG.overlayClass} p {
                margin: 10px 0;
                max-width: 600px;
                line-height: 1.4;
            }
            
            .${CONFIG.overlayClass} button {
                background-color: #dc3545;
                color: white;
                border: none;
                padding: 15px 30px;
                font-size: 16px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 20px;
                transition: background-color 0.3s ease;
            }
            
            .${CONFIG.overlayClass} button:hover {
                background-color: #c82333;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Enter parent fullscreen mode
     */
    function enterParentFullscreen(content = {}) {
        if (!overlay) return;

        // Update overlay content
        if (content.title) {
            overlayTitle.textContent = content.title;
        }
        if (content.message) {
            overlayMessage.textContent = content.message;
        }
        if (content.backgroundColor) {
            overlay.style.backgroundColor = content.backgroundColor;
        }
        
        // Show overlay
        overlay.classList.add(CONFIG.activeClass);
        document.body.style.overflow = 'hidden';
        
        // Send confirmation back to all iframes
        sendMessageToAllIframes({
            type: 'PARENT_FULLSCREEN_ENTERED'
        });
    }

    /**
     * Exit parent fullscreen mode
     */
    function exitParentFullscreen() {
        if (!overlay) return;

        // Hide overlay
        overlay.classList.remove(CONFIG.activeClass);
        document.body.style.overflow = 'auto';
        
        // Reset styles
        overlay.style.backgroundColor = CONFIG.defaultBackgroundColor;
        overlayTitle.textContent = CONFIG.defaultTitle;
        overlayMessage.textContent = CONFIG.defaultMessage;
        
        // Send confirmation back to all iframes
        sendMessageToAllIframes({
            type: 'PARENT_FULLSCREEN_EXITED'
        });
    }

    /**
     * Send message to all iframes on the page
     */
    function sendMessageToAllIframes(message) {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                iframe.contentWindow.postMessage(message, '*');
            } catch (e) {
                // Ignore cross-origin errors
                console.warn('Could not send message to iframe:', e);
            }
        });
    }

    /**
     * Handle messages from iframes
     */
    function handleMessage(event) {
        // Basic security check - you can enhance this for production
        if (!event.data || typeof event.data !== 'object') return;

        switch (event.data.type) {
            case 'ENTER_PARENT_FULLSCREEN':
                enterParentFullscreen(event.data.iframeContent || {});
                break;
            case 'EXIT_PARENT_FULLSCREEN':
                exitParentFullscreen();
                break;
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    function handleKeydown(event) {
        if (event.key === 'Escape' && overlay && overlay.classList.contains(CONFIG.activeClass)) {
            exitParentFullscreen();
        }
    }

    /**
     * Prevent scrolling when overlay is active
     */
    function handleWheel(event) {
        if (overlay && overlay.classList.contains(CONFIG.activeClass)) {
            event.preventDefault();
        }
    }

    /**
     * Initialize the fullscreen communication system
     */
    function initialize() {
        if (isInitialized) return;

        // Inject styles
        injectStyles();
        
        // Create overlay
        createOverlay();
        
        // Set up event listeners
        window.addEventListener('message', handleMessage);
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('wheel', handleWheel, { passive: false });
        
        isInitialized = true;
    }



    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})(); 