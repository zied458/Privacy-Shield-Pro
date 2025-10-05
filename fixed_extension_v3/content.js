// Content script for Enhanced Privacy & Security Dashboard
let blockedCount = 0;

// PROFESSIONAL clickable notification system
function showBlockedNotification(count) {
  console.log('Creating blocked notification for count:', count);
  
  // Remove ALL existing notifications
  const selectors = [
    '#privacy-indicator',
    '.tracker-blocked-notification',
    '[data-tracker-notification]'
  ];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  });
  
  // Create notification with guaranteed unique identifier
  const notification = document.createElement('div');
  const uniqueId = 'tracker-notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  notification.id = uniqueId;
  notification.setAttribute('data-tracker-notification', 'true');
  
  // Create notification with close button
  notification.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
      <span>🛡️ Blocked: ${count}</span>
      <button style="
        background: rgba(255,255,255,0.3);
        border: none;
        color: white;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
      ">×</button>
    </div>
  `;
  
  // FORCED styling that cannot be overridden
  notification.style.cssText = `
    position: fixed !important;
    top: 60px !important;
    right: 20px !important;
    background: #2196F3 !important;
    color: white !important;
    padding: 12px 16px !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    z-index: 2147483647 !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25) !important;
    cursor: pointer !important;
    max-width: 280px !important;
    pointer-events: auto !important;
    user-select: none !important;
    transition: all 0.2s ease !important;
  `;
  
  let isRemoved = false;
  
  // GUARANTEED removal function
  function forceRemoveNotification() {
    if (isRemoved) return;
    isRemoved = true;
    
    console.log('Force removing notification:', uniqueId);
    
    try {
      const elem = document.getElementById(uniqueId);
      if (elem) {
        elem.style.opacity = '0';
        elem.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (elem.parentNode) {
            elem.parentNode.removeChild(elem);
          }
        }, 200);
      }
    } catch (e) {
      console.log('Notification removed');
    }
  }
  
  // Multiple event handlers for reliable removal
  const closeBtn = notification.querySelector('button');
  
  // Close button click
  closeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    forceRemoveNotification();
  });
  
  // Notification body click
  notification.addEventListener('click', function(e) {
    if (e.target !== closeBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      forceRemoveNotification();
    }
  });
  
  // Mouse events
  notification.addEventListener('mousedown', function(e) {
    if (e.target !== closeBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      forceRemoveNotification();
    }
  });
  
  // Hover effects
  closeBtn.addEventListener('mouseenter', function() {
    this.style.backgroundColor = 'rgba(255,255,255,0.5)';
  });
  
  closeBtn.addEventListener('mouseleave', function() {
    this.style.backgroundColor = 'rgba(255,255,255,0.3)';
  });
  
  notification.addEventListener('mouseenter', function() {
    if (!isRemoved) {
      this.style.transform = 'scale(1.02)';
      this.style.boxShadow = '0 6px 25px rgba(0,0,0,0.35)';
    }
  });
  
  notification.addEventListener('mouseleave', function() {
    if (!isRemoved) {
      this.style.transform = 'scale(1)';
      this.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
    }
  });
  
  // Add to DOM
  document.body.appendChild(notification);
  console.log('Notification added with ID:', uniqueId);
  
  // Auto-remove after 8 seconds
  setTimeout(() => {
    forceRemoveNotification();
  }, 8000);
  
  return notification;
}

// Function to inject privacy indicator
function injectPrivacyIndicator() {
  // Use the new notification system instead
  if (blockedCount > 0) {
    showBlockedNotification(blockedCount);
  }
}

// Function to analyze page for privacy threats
function analyzePagePrivacy() {
  const scripts = document.querySelectorAll('script[src]');
  const trackers = [];
  
  const knownTrackers = [
    'google-analytics.com',
    'doubleclick.net',
    'facebook.com/tr',
    'googletagmanager.com',
    'adnxs.com',
    'adsystem.amazon.com'
  ];
  
  scripts.forEach(script => {
    const src = script.src;
    knownTrackers.forEach(tracker => {
      if (src.includes(tracker)) {
        trackers.push(tracker);
        blockedCount++;
      }
    });
  });
  
  return {
    trackers: trackers,
    totalScripts: scripts.length,
    blockedCount: blockedCount
  };
}

// Initialize when page loads
function init() {
  // Check if blocking is enabled
  chrome.storage.local.get(['blockingEnabled'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Storage error:', chrome.runtime.lastError);
      return;
    }
    
    if (result.blockingEnabled !== false) {
      const analysis = analyzePagePrivacy();
      injectPrivacyIndicator();
      
      // Send data to background script
      chrome.runtime.sendMessage({
        action: 'pageAnalysis',
        data: analysis,
        url: window.location.href
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Message error:', chrome.runtime.lastError);
        }
      });
    }
  });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageData') {
    const analysis = analyzePagePrivacy();
    sendResponse(analysis);
  }
});

