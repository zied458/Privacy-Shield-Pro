# Enhanced Privacy & Security Dashboard

A comprehensive **Chrome extension** that provides real-time privacy protection by **blocking trackers** and offering **detailed security insights** all processed locally on your device.
---

## ✨ Features

### 🛡️ Core Protection
- **Real-time Tracker Blocking**: Blocks analytics, advertising, and social media trackers.
- **Daily & Monthly Statistics**: Counts blocked requests with **automatic resets** (daily at midnight; monthly on the 1st).
- **Visual Notifications**: Badge shows **blocked tracker count** on each page.
- **Privacy Score**: Grades websites based on tracking activity and cookie usage.

### 📊 Dashboard
- **Protection Status**: Toggle protection **on/off**.
- **Blocked Today**: Daily counter (auto-reset at midnight).
- **Total Blocked**: Monthly counter (auto-reset on the 1st).
- **Current Site Analysis**: Real-time tracker detection summary.
- **Cookie Management**: One-click to clear **site-specific cookies**.

### ⚙️ Advanced Options
- **Selective Blocking** by category:
  - **Analytics**: Google Analytics, Tag Manager, Segment, etc.
  - **Social**: Facebook, X/Twitter, LinkedIn, TikTok pixels.
  - **Ads**: DoubleClick, Amazon Ads, AppNexus, etc.
- **Custom Allow/Block Lists**: Add your own rules per domain or pattern.
 <p align="center">
  <img src="./fixed_extension_v3/Screenshot 2025-10-05 150429.png" alt="Extension dashboard capture" width="400">
 
 </p>

---
## How It Works

### Tracker Blocking
This extension uses Chrome’s **Declarative Net Request (DNR)** API to block known tracking domains and URL patterns at the network layer.

**Examples of targets include:**
- Google Analytics & Tag Manager
- Facebook Pixel
- DoubleClick advertising
- Amazon advertising endpoints
- Twitter analytics
- LinkedIn tracking pixels  
…and many more.



---

### Counting System
- **Daily Count** — Resets automatically at **local midnight**.
- **Monthly Count** — Resets on the **1st** of each month.
- **Real-time Updates** — Counters increment instantly as trackers are blocked.

**Implementation notes (typical approach):**
- Store counters and timestamps in `chrome.storage.local`.
- Use `chrome.alarms` to schedule reset checks.
- On each block event, increment counters and update the badge.

---

### Privacy Scoring
Websites receive a simple **A–F** grade based on the number of trackers detected:

| Grade | Trackers Detected | Meaning      |
|------:|-------------------|--------------|
| **A** | 0                 | Excellent    |
| **B** | 1–2               | Good         |
| **C** | 3–5               | Fair         |
| **D** | 6–10              | Poor         |
| **F** | 10+               | Very Poor    |

## Technical Details

### File Structure
```text
├── manifest.json          # Extension configuration (MV3)
├── background.js          # Service worker: blocking logic, counters, resets
├── popup.html             # Dashboard interface
├── popup.js               # Dashboard functionality
├── popup.css              # Dashboard styling
├── content.js             # Page analysis and notifications (optional)
├── rules.json             # Declarative Net Request (DNR) rules
└── icons/                 # Extension icons
```
## Permissions

| Permission                          | Why it’s needed |
|-------------------------------------|-----------------|
| `declarativeNetRequest`             | Block tracking requests at the network layer |
| `activeTab`                         | Access the current tab for on-demand analysis and badge updates |
| `storage`                           | Store settings and statistics locally |
| `cookies` (optional)                | Clear **site-specific** cookies from the dashboard |
| `tabs` (optional)                   | Open settings or create/read tabs if the UI needs it |

> Tip: If you only open the Options page, prefer `chrome.runtime.openOptionsPage()` instead of creating a new tab.

---

## Storage Data

| Key                  | Description |
|----------------------|-------------|
| `blockingEnabled`    | Protection on/off status |
| `dailyBlockedCount`  | Today’s blocked tracker count |
| `totalBlocked`       | Monthly blocked tracker count |
| `lastResetDate`      | Timestamp of the last daily reset |
| `lastMonthReset`     | Timestamp of the last monthly reset |
| `blockCategories`    | Per-category blocking preferences (analytics/social/ads) |
| `allowlist`          | Domains/patterns to always allow |
| `blocklist`          | Domains/patterns to always block |

---

## Privacy Policy

This extension:

- ✅ Blocks trackers to protect your privacy  
- ✅ Stores statistics **locally** on your device  
- ✅ **Does not** collect or transmit personal data  
- ✅ **Does not** track your browsing activity  
- ✅ Is **open source and transparent**
---
