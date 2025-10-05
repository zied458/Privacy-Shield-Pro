document.addEventListener('DOMContentLoaded', function() {
  // Initialize the popup
  initializePopup();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load data
  loadStoredData();
  
  // Initialize new features
  initializeNewFeatures();
});

function initializePopup() {
  // Get current tab info
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      const currentTab = tabs[0];
      updateCurrentSiteAnalysis(currentTab.url);
      loadCurrentSitePermissions(currentTab.url);
    }
  });
  
  // Load protection status and stats
  chrome.storage.local.get(['blockingEnabled', 'dailyBlockedCount'], function(result) {
    const isEnabled = result.blockingEnabled !== false;
    updateProtectionStatus(isEnabled);
    
    const count = result.dailyBlockedCount || 0;
    document.getElementById('blocked-count').textContent = count;
  });
}

function setupEventListeners() {
  // Toggle protection
  document.getElementById('toggle-protection').addEventListener('click', function() {
    const button = document.getElementById('toggle-protection');
    button.disabled = true;
    button.textContent = 'Updating...';
    
    chrome.runtime.sendMessage({
      action: 'toggleBlocking'
    }, function(response) {
      button.disabled = false;
      
      if (response && !response.error) {
        updateProtectionStatus(response.blockingEnabled);
      } else {
        console.error('Toggle failed:', response?.error);
        button.textContent = 'Error - Try Again';
        setTimeout(() => {
          chrome.storage.local.get(['blockingEnabled'], function(result) {
            updateProtectionStatus(result.blockingEnabled !== false);
          });
        }, 2000);
      }
    });
  });
  
  // Clear cookies
  document.getElementById('clear-cookies').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url) {
        try {
          const url = new URL(tabs[0].url);
          const domain = url.hostname;
          
          chrome.cookies.getAll({domain: domain}, function(cookies) {
            if (chrome.runtime.lastError) {
              console.error('Error getting cookies:', chrome.runtime.lastError);
              return;
            }
            
            let cookiesCleared = 0;
            const totalCookies = cookies.length;
            
            if (totalCookies === 0) {
              showCookiesFeedback('No cookies to clear');
              return;
            }
            
            cookies.forEach(function(cookie) {
              const cookieUrl = `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`;
              chrome.cookies.remove({
                url: cookieUrl,
                name: cookie.name
              }, function(details) {
                cookiesCleared++;
                if (cookiesCleared === totalCookies) {
                  showCookiesFeedback(`${totalCookies} cookies cleared!`);
                }
              });
            });
          });
        } catch (error) {
          console.error('Invalid URL:', error);
          showCookiesFeedback('Cannot clear cookies for this page');
        }
      }
    });
  });
  
  function showCookiesFeedback(message) {
    const button = document.getElementById('clear-cookies');
    const originalText = button.textContent;
    button.textContent = message;
    button.style.background = '#27ae60';
    button.style.color = 'white';
    button.disabled = true;
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
      button.style.color = '';
      button.disabled = false;
    }, 2000);
  }
  
  // Privacy settings
  document.getElementById('privacy-settings').addEventListener('click', function() {
    chrome.tabs.create({url: 'chrome://settings/privacy'});
  });
}

function updateProtectionStatus(isEnabled) {
  const statusElement = document.getElementById('protection-status');
  const toggleButton = document.getElementById('toggle-protection');
  
  if (isEnabled) {
    statusElement.textContent = 'Protected';
    statusElement.className = 'status-value protected';
    toggleButton.textContent = 'Disable Protection';
    toggleButton.className = 'toggle-btn enabled';
  } else {
    statusElement.textContent = 'Unprotected';
    statusElement.className = 'status-value unprotected';
    toggleButton.textContent = 'Enable Protection';
    toggleButton.className = 'toggle-btn disabled';
  }
}

function updateCurrentSiteAnalysis(url) {
  try {
    const domain = new URL(url).hostname;
    
    // Get tracker count for current site
    chrome.storage.local.get([`trackers_${domain}`], function(result) {
      if (chrome.runtime.lastError) {
        console.error('Storage error:', chrome.runtime.lastError);
        return;
      }
      
      const trackerCount = result[`trackers_${domain}`] || 0;
      document.getElementById('trackers-count').textContent = trackerCount;
      
      // Calculate privacy score
      const privacyScore = calculatePrivacyScore(trackerCount);
      updatePrivacyScore(privacyScore);
    });
  } catch (e) {
    // Invalid URL - set defaults
    console.log('Invalid URL, using defaults:', e.message);
    document.getElementById('trackers-count').textContent = '0';
    updatePrivacyScore('A');
  }
}

function calculatePrivacyScore(trackerCount) {
  if (trackerCount === 0) return 'A';
  if (trackerCount <= 2) return 'B';
  if (trackerCount <= 5) return 'C';
  if (trackerCount <= 10) return 'D';
  return 'F';
}

function updatePrivacyScore(grade) {
  const scoreElement = document.getElementById('privacy-score');
  scoreElement.textContent = grade;
  scoreElement.className = `analysis-value grade-${grade.toLowerCase()}`;
}

function loadStoredData() {
  // This function can be expanded to load other stored data
}

// New Features Implementation

function initializeNewFeatures() {
  setupFeatureTabs();
  initializeBreachMonitor();
  initializePermissionsManager();
}

function setupFeatureTabs() {
  const breachTab = document.getElementById('breach-tab');
  const permissionsTab = document.getElementById('permissions-tab');
  const breachSection = document.getElementById('breach-section');
  const permissionsSection = document.getElementById('permissions-section');
  
  breachTab.addEventListener('click', function() {
    // Switch to breach monitor tab
    breachTab.classList.add('active');
    permissionsTab.classList.remove('active');
    breachSection.classList.add('active');
    permissionsSection.classList.remove('active');
  });
  
  permissionsTab.addEventListener('click', function() {
    // Switch to permissions tab
    permissionsTab.classList.add('active');
    breachTab.classList.remove('active');
    permissionsSection.classList.add('active');
    breachSection.classList.remove('active');
  });
}

// Data Breach Monitor Implementation
function initializeBreachMonitor() {
  loadMonitoredEmails();
  
  document.getElementById('add-email').addEventListener('click', addEmailToMonitor);
  document.getElementById('email-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addEmailToMonitor();
    }
  });
}

function addEmailToMonitor() {
  const emailInput = document.getElementById('email-input');
  const email = emailInput.value.trim();
  
  if (!email || !isValidEmail(email)) {
    alert('Please enter a valid email address.');
    return;
  }
  
  chrome.storage.local.get(['monitoredEmails'], function(result) {
    const monitoredEmails = result.monitoredEmails || [];
    
    if (monitoredEmails.includes(email)) {
      alert('This email is already being monitored.');
      return;
    }
    
    monitoredEmails.push(email);
    chrome.storage.local.set({monitoredEmails: monitoredEmails}, function() {
      emailInput.value = '';
      loadMonitoredEmails();
      checkEmailForBreaches(email);
    });
  });
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function loadMonitoredEmails() {
  chrome.storage.local.get(['monitoredEmails'], function(result) {
    const monitoredEmails = result.monitoredEmails || [];
    const container = document.getElementById('monitored-emails');
    
    container.innerHTML = '';
    
    if (monitoredEmails.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: #6c757d; font-size: 11px; padding: 10px;">No emails being monitored</div>';
      return;
    }
    
    monitoredEmails.forEach(function(email) {
      const emailDiv = document.createElement('div');
      emailDiv.className = 'monitored-email';
      emailDiv.innerHTML = `
        <span>${email}</span>
        <button class="remove-email" onclick="removeEmailFromMonitor('${email}')">×</button>
      `;
      container.appendChild(emailDiv);
    });
  });
}

function removeEmailFromMonitor(email) {
  chrome.storage.local.get(['monitoredEmails'], function(result) {
    const monitoredEmails = result.monitoredEmails || [];
    const updatedEmails = monitoredEmails.filter(e => e !== email);
    
    chrome.storage.local.set({monitoredEmails: updatedEmails}, function() {
      loadMonitoredEmails();
    });
  });
}

function checkEmailForBreaches(email) {
  // Simulated breach check (in a real implementation, you'd use an API like Have I Been Pwned)
  // For demo purposes, we'll simulate some results
  setTimeout(() => {
    const simulatedBreaches = [
      'LinkedIn (2021)',
      'Facebook (2019)',
      'Adobe (2013)'
    ];
    
    // Randomly show a breach for demo
    if (Math.random() > 0.7) {
      const randomBreach = simulatedBreaches[Math.floor(Math.random() * simulatedBreaches.length)];
      showBreachAlert(email, randomBreach);
    }
  }, 1000);
}

function showBreachAlert(email, breachName) {
  const alertsContainer = document.getElementById('breach-alerts');
  const alertDiv = document.createElement('div');
  alertDiv.className = 'breach-alert';
  alertDiv.innerHTML = `
    <strong>⚠️ Breach Found!</strong><br>
    ${email} was found in ${breachName} breach.
  `;
  
  alertsContainer.appendChild(alertDiv);
}

// Website Permissions Manager Implementation
function initializePermissionsManager() {
  loadCurrentSitePermissions();
  loadAllSitePermissions();
}

function loadCurrentSitePermissions(url) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      const currentUrl = tabs[0].url;
      
      try {
        const domain = new URL(currentUrl).hostname;
        
        // Get permissions for current site
        const permissions = ['camera', 'microphone', 'geolocation', 'notifications'];
        const container = document.getElementById('current-permissions');
        container.innerHTML = '';
        
        permissions.forEach(function(permission) {
          // Simulate permission status (in real implementation, you'd query actual permissions)
          const status = Math.random() > 0.5 ? 'granted' : 'denied';
          
          const permissionDiv = document.createElement('div');
          permissionDiv.className = 'permission-item';
          permissionDiv.innerHTML = `
            <span class="permission-name">${permission}</span>
            <span class="permission-status ${status}">${status}</span>
            ${status === 'granted' ? '<button class="revoke-permission" onclick="revokePermission(\'' + domain + '\', \'' + permission + '\')">Revoke</button>' : ''}
          `;
          container.appendChild(permissionDiv);
        });
      } catch (e) {
        document.getElementById('current-permissions').innerHTML = '<div style="text-align: center; color: #6c757d; font-size: 11px;">Invalid URL</div>';
      }
    }
  });
}

function loadAllSitePermissions() {
  // Simulate some site permissions data
  const simulatedSites = [
    {
      domain: 'youtube.com',
      permissions: ['camera', 'microphone']
    },
    {
      domain: 'google.com',
      permissions: ['geolocation']
    },
    {
      domain: 'facebook.com',
      permissions: ['notifications', 'camera']
    }
  ];
  
  const container = document.getElementById('all-site-permissions');
  container.innerHTML = '';
  
  simulatedSites.forEach(function(site) {
    const siteDiv = document.createElement('div');
    siteDiv.className = 'site-permission-group';
    
    const permissionTags = site.permissions.map(p => 
      `<span class="site-permission-tag">${p}</span>`
    ).join('');
    
    siteDiv.innerHTML = `
      <div class="site-name">${site.domain}</div>
      <div class="site-permissions">${permissionTags}</div>
    `;
    
    container.appendChild(siteDiv);
  });
}

function revokePermission(domain, permission) {
  // In a real implementation, this would revoke the actual permission
  alert(`Revoked ${permission} permission for ${domain}`);
  loadCurrentSitePermissions();
}

// Make functions globally available
window.removeEmailFromMonitor = removeEmailFromMonitor;
window.revokePermission = revokePermission;

