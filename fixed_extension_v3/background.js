let blockingEnabled = true;
let totalBlocked = 0;
let dailyBlockedCount = 0;

chrome.runtime.onInstalled.addListener(async () => {
  // Initialize storage
  await chrome.storage.local.set({ 
    blockingEnabled: true,
    totalBlocked: 0,
    dailyBlockedCount: 0
  });
  
  // Enable declarative net request rules
  await enableBlockingRules();
  
  // Set initial badge and icon
  chrome.action.setBadgeText({ text: "ON" });
  chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
  chrome.action.setIcon({
    path: {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png", 
      "128": "icons/icon128.png"
    }
  });
});

async function enableBlockingRules() {
  try {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIds = rules.map(rule => rule.id);
    
    if (ruleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds
      });
    }
    
    // Add blocking rules if enabled
    if (blockingEnabled) {
      await addBlockingRules();
    }
  } catch (error) {
    console.error('Error managing blocking rules:', error);
  }
}

async function addBlockingRules() {
  const trackerRules = [
    {
      id: 1001,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: "*google-analytics.com*",
        resourceTypes: ["script", "xmlhttprequest", "image"]
      }
    },
    {
      id: 1002,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: "*googletagmanager.com*",
        resourceTypes: ["script", "xmlhttprequest"]
      }
    },
    {
      id: 1003,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: "*doubleclick.net*",
        resourceTypes: ["script", "xmlhttprequest", "image"]
      }
    }
  ];

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: trackerRules
    });
    console.log('Blocking rules added successfully');
  } catch (error) {
    console.error('Error adding blocking rules:', error);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleBlocking") {
    toggleBlockingRules().then(() => {
      sendResponse({ blockingEnabled: blockingEnabled });
    }).catch(error => {
      console.error('Error toggling blocking:', error);
      sendResponse({ error: error.message });
    });
    return true;
    
  } else if (request.action === "getBlockingStatus") {
    sendResponse({ blockingEnabled: blockingEnabled });
    
  } else if (request.action === "pageAnalysis") {
    handlePageAnalysis(request.data, sender.tab);
    sendResponse({ success: true });
    
  } else if (request.action === "getStats") {
    chrome.storage.local.get(['dailyBlockedCount', 'totalBlocked'], (result) => {
      sendResponse({
        dailyBlocked: result.dailyBlockedCount || 0,
        totalBlocked: result.totalBlocked || 0
      });
    });
    return true;
  }
});

async function toggleBlockingRules() {
  blockingEnabled = !blockingEnabled;
  
  try {
    await chrome.storage.local.set({ blockingEnabled });
    
    if (blockingEnabled) {
      await addBlockingRules();
    } else {
      // Remove all dynamic rules
      const rules = await chrome.declarativeNetRequest.getDynamicRules();
      const ruleIds = rules.map(rule => rule.id);
      if (ruleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: ruleIds
        });
      }
    }
    
    // Update badge and icon
    if (blockingEnabled) {
      const result = await chrome.storage.local.get(['dailyBlockedCount']);
      const dailyCount = result.dailyBlockedCount || 0;
      chrome.action.setBadgeText({ text: "ON" });
      chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
      chrome.action.setIcon({
        path: {
          "16": "icons/icon16.png",
          "48": "icons/icon48.png", 
          "128": "icons/icon128.png"
        }
      });
    } else {
      chrome.action.setBadgeText({ text: "OFF" });
      chrome.action.setBadgeBackgroundColor({ color: "#f44336" });
      chrome.action.setIcon({
        path: {
          "16": "icons/icon16_disabled.png",
          "48": "icons/icon48_disabled.png",
          "128": "icons/icon128_disabled.png"
        }
      });
    }
    
  } catch (error) {
    console.error('Error in toggleBlockingRules:', error);
    throw error;
  }
}

function handlePageAnalysis(data, tab) {
  if (!data || !tab) return;
  
  try {
    const domain = new URL(tab.url).hostname;
    
    // Update blocked count
    if (data.blockedCount > 0) {
      chrome.storage.local.get(['dailyBlockedCount', 'totalBlocked'], (result) => {
        const newDailyCount = (result.dailyBlockedCount || 0) + data.blockedCount;
        const newTotalCount = (result.totalBlocked || 0) + data.blockedCount;
        
        chrome.storage.local.set({
          dailyBlockedCount: newDailyCount,
          totalBlocked: newTotalCount,
          [`trackers_${domain}`]: data.trackers.length
        });
      });
    }
    
    console.log(`Page analysis for ${domain}:`, data);
  } catch (error) {
    console.error('Error handling page analysis:', error);
  }
}

// Initialize on startup
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['blockingEnabled']);
  blockingEnabled = result.blockingEnabled !== false;
  
  chrome.action.setBadgeText({ text: blockingEnabled ? "ON" : "OFF" });
  chrome.action.setBadgeBackgroundColor({ 
    color: blockingEnabled ? "#4CAF50" : "#f44336" 
  });
});

// Clear daily stats at midnight
function resetDailyStats() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const msUntilMidnight = tomorrow.getTime() - now.getTime();
  
  setTimeout(() => {
    chrome.storage.local.set({ dailyBlockedCount: 0 });
    resetDailyStats(); // Set up for next day
  }, msUntilMidnight);
}

// Start the daily reset cycle
resetDailyStats();


