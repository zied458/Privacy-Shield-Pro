// Monetization Integration for Enhanced Privacy & Security Dashboard
// This module handles freemium features and subscription management

class MonetizationManager {
  constructor() {
    this.isPremium = false;
    this.trialEndDate = null;
    this.init();
  }

  async init() {
    await this.loadSubscriptionStatus();
    this.setupPremiumFeatures();
  }

  async loadSubscriptionStatus() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['isPremium', 'trialEndDate', 'subscriptionDate'], (result) => {
        this.isPremium = result.isPremium || false;
        this.trialEndDate = result.trialEndDate;
        
        // If no trial has been started, start a 7-day trial
        if (!this.trialEndDate) {
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 7);
          this.trialEndDate = trialEnd.getTime();
          
          chrome.storage.local.set({
            trialEndDate: this.trialEndDate,
            isPremium: true // Trial users get premium features
          });
          
          this.isPremium = true;
        } else {
          // Check if trial has expired
          const now = new Date().getTime();
          if (now > this.trialEndDate && !result.subscriptionDate) {
            this.isPremium = false;
            chrome.storage.local.set({isPremium: false});
          }
        }
        
        resolve();
      });
    });
  }

  setupPremiumFeatures() {
    // Add premium indicators to UI
    this.addPremiumBadges();
    this.setupFeatureLimits();
  }

  addPremiumBadges() {
    // Add premium badges to advanced features
    const breachTab = document.getElementById('breach-tab');
    const permissionsTab = document.getElementById('permissions-tab');
    
    if (!this.isPremium) {
      // Add premium badges for non-premium users
      if (breachTab && !breachTab.querySelector('.premium-badge')) {
        const badge = document.createElement('span');
        badge.className = 'premium-badge';
        badge.textContent = 'PRO';
        badge.style.cssText = `
          background: linear-gradient(45deg, #ff6b6b, #feca57);
          color: white;
          font-size: 8px;
          padding: 2px 4px;
          border-radius: 8px;
          margin-left: 4px;
          font-weight: bold;
        `;
        breachTab.appendChild(badge);
      }
    }
  }

  setupFeatureLimits() {
    if (!this.isPremium) {
      this.limitBreachMonitoring();
      this.limitPermissionsFeature();
    }
  }

  limitBreachMonitoring() {
    // Limit to 1 email for free users
    const addEmailBtn = document.getElementById('add-email');
    if (addEmailBtn) {
      const originalAddEmail = window.addEmailToMonitor;
      
      window.addEmailToMonitor = () => {
        chrome.storage.local.get(['monitoredEmails'], (result) => {
          const monitoredEmails = result.monitoredEmails || [];
          
          if (monitoredEmails.length >= 1) {
            this.showUpgradeModal('breach-monitoring');
            return;
          }
          
          originalAddEmail();
        });
      };
    }
  }

  limitPermissionsFeature() {
    // Show upgrade prompt for permissions management
    const permissionsTab = document.getElementById('permissions-tab');
    if (permissionsTab) {
      permissionsTab.addEventListener('click', (e) => {
        if (!this.isPremium) {
          e.preventDefault();
          e.stopPropagation();
          this.showUpgradeModal('permissions-management');
        }
      });
    }
  }

  showUpgradeModal(feature) {
    // Create upgrade modal
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      max-width: 300px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;

    const featureNames = {
      'breach-monitoring': 'Multiple Email Monitoring',
      'permissions-management': 'Advanced Permissions Management'
    };

    modalContent.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
      <h3 style="margin: 0 0 12px 0; color: #2c3e50;">Upgrade to Pro</h3>
      <p style="margin: 0 0 20px 0; color: #6c757d; font-size: 14px;">
        Unlock ${featureNames[feature]} and other premium features!
      </p>
      <div style="margin-bottom: 20px;">
        <div style="font-size: 24px; font-weight: bold; color: #667eea;">$2.99/month</div>
        <div style="font-size: 12px; color: #6c757d;">7-day free trial</div>
      </div>
      <button id="upgrade-btn" style="
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        margin-right: 8px;
      ">Upgrade Now</button>
      <button id="close-modal" style="
        background: #f8f9fa;
        color: #6c757d;
        border: 1px solid #dee2e6;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
      ">Maybe Later</button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('upgrade-btn').addEventListener('click', () => {
      this.initiateUpgrade();
      document.body.removeChild(modal);
    });

    document.getElementById('close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  initiateUpgrade() {
    // In a real implementation, this would integrate with a payment processor
    // For demo purposes, we'll simulate the upgrade process
    
    const confirmUpgrade = confirm(
      'This would normally redirect to a secure payment page.\n\n' +
      'For demo purposes, would you like to simulate a successful upgrade?'
    );
    
    if (confirmUpgrade) {
      this.simulateSuccessfulUpgrade();
    }
  }

  simulateSuccessfulUpgrade() {
    // Simulate successful payment and upgrade
    const subscriptionDate = new Date().getTime();
    
    chrome.storage.local.set({
      isPremium: true,
      subscriptionDate: subscriptionDate
    }, () => {
      this.isPremium = true;
      
      // Remove premium badges
      document.querySelectorAll('.premium-badge').forEach(badge => {
        badge.remove();
      });
      
      // Re-enable features
      this.setupPremiumFeatures();
      
      // Show success message
      alert('🎉 Upgrade successful! You now have access to all premium features.');
      
      // Reload the popup to reflect changes
      window.location.reload();
    });
  }

  getTrialDaysRemaining() {
    if (!this.trialEndDate) return 0;
    
    const now = new Date().getTime();
    const daysRemaining = Math.ceil((this.trialEndDate - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysRemaining);
  }

  showTrialStatus() {
    const daysRemaining = this.getTrialDaysRemaining();
    
    if (daysRemaining > 0 && !this.isPremium) {
      const trialBanner = document.createElement('div');
      trialBanner.style.cssText = `
        background: linear-gradient(45deg, #667eea, #764ba2);
        color: white;
        padding: 8px 20px;
        text-align: center;
        font-size: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      `;
      trialBanner.innerHTML = `
        ⏰ ${daysRemaining} days left in your free trial
      `;
      
      const header = document.querySelector('.header');
      header.parentNode.insertBefore(trialBanner, header.nextSibling);
    }
  }
}

// Initialize monetization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const monetization = new MonetizationManager();
  
  // Show trial status after a short delay to ensure UI is ready
  setTimeout(() => {
    monetization.showTrialStatus();
  }, 100);
});

// Export for use in other scripts
window.MonetizationManager = MonetizationManager;

