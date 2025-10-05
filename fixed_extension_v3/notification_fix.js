// Fix for notification dismissal issue
// This script will handle proper notification removal

function createDismissibleNotification(message, type = 'info') {
  // Remove any existing notifications first
  const existingNotifications = document.querySelectorAll('.tracker-notification');
  existingNotifications.forEach(notif => {
    notif.remove();
  });
  
  const notification = document.createElement('div');
  notification.className = `tracker-notification notification-${type}`;
  notification.innerHTML = `
    <span class="notification-text">${message}</span>
    <button class="notification-close">×</button>
  `;
  
  // Position and style the notification
  notification.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    max-width: 280px;
    animation: slideInFromRight 0.3s ease-out;
  `;
  
  // Style the close button
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    margin-left: 8px;
    opacity: 0.8;
  `;
  
  // Add click handlers for dismissal
  notification.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    notification.remove();
  });
  
  closeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    notification.remove();
  });
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInFromRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .tracker-notification:hover {
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    
    .notification-close:hover {
      opacity: 1 !important;
      background: rgba(255,255,255,0.2) !important;
      border-radius: 50%;
    }
  `;
  
  if (!document.head.querySelector('#notification-styles')) {
    style.id = 'notification-styles';
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideInFromRight 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }
  }, 8000);
  
  return notification;
}

// Export the function for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createDismissibleNotification };
}