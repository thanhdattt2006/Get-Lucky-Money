# Tet 2026 - Lucky Money Application

A web-based interactive application designed to digitize the traditional Lunar New Year "Lucky Money" (Li Xi) custom. This project provides a gamified interface for users to determine lucky money amounts via a spinning wheel and includes a secured administration dashboard for transaction management.

## Project Overview

The application is divided into two main modules:

1.  **Client Interface:** A responsive web page where users input their names, spin a canvas-based wheel, and receive a generated QR code for money transfer.
2.  **Administration Dashboard:** A secure, dark-themed control panel for tracking donors, filtering transactions, and managing data.

## Features

### User Interface (Frontend)

- **Interactive Wheel:** Built using the Canvas API with physics-based rotation logic and randomized outcome algorithms.
- **Audio Management:** Implements advanced logic to handle browser Autoplay Policies. Audio is programmatically triggered via user gestures (input focus or button click) to ensure consistent playback on mobile devices (iOS/Android).
- **Dynamic QR Generation:** Integration with QR Server API to generate payment codes based on the specific spun amount.
- **Responsive Design:** optimized for various viewports, ensuring functionality across desktop and mobile browsers.
- **Open Graph Integration:** Full metadata configuration for rich link previews on social platforms (Facebook, Messenger, Zalo).

### Administrator Dashboard

- **Security:** Simple authentication mechanism to protect sensitive data.
- **UI/UX:** Custom "Tokyo Night" design system, featuring a dark mode interface with high contrast for readability.
- **Data Management:**
  - Asynchronous data fetching from MockAPI.
  - Sorting and filtering capabilities by donation amount.
  - Individual record deletion.
  - Bulk deletion utility (Wipe All Data) with Promise.all for concurrent request handling.

## Technology Stack

- **Frontend:** HTML5, CSS3 (Custom Properties), JavaScript (ES6+).
- **Backend Service:** MockAPI.io (RESTful API).
- **Libraries:**
  - SweetAlert2 (Modal and Popup interface).
- **Version Control:** Git & GitHub.
- **Deployment:** GitHub Pages.

## Project Structure

```text
Get-Lucky-Money/
├── resources/
│   ├── css/
│   │   ├── admin.css
│   │   └── style.css
│   ├── js/
│   │   ├── admin.js
│   │   └── main.js
│   ├── dave.png
│   ├── loop.mp4
│   ├── qr.png
│   ├── song.mp3
│   └── thumbnail.png
├── admin.html
├── index.html
└── README.md
Installation and Setup
1. Clone the Repository
Bash
git clone [https://github.com/thanhdattt2006/Get-Lucky-Money.git](https://github.com/thanhdattt2006/Get-Lucky-Money.git)
2. Configuration
Navigate to resources/js/main.js and resources/js/admin.js to configure your API endpoint:

JavaScript
// Replace with your actual MockAPI endpoint
const API_URL = 'https://YOUR_API_ENDPOINT.mockapi.io/luckyMoney';
3. Probability Configuration
To adjust the winning rates, modify the logic in the spin() function within resources/js/main.js:

JavaScript
// Probability logic
if (rand < 60) finalMoney = 200000;      // 60% chance
else if (rand < 93) finalMoney = 500000; // 33% chance
else if (rand < 99) finalMoney = 100000; // 6% chance
else finalMoney = 10000;                 // 1% chance
4. Running Locally
Open index.html directly in a web browser or serve it using a local development server (e.g., Live Server in VS Code) to avoid CORS issues with modules or assets.

Deployment
This project is optimized for GitHub Pages.

Push code to the repository.

Go to Settings > Pages.

Select the main branch as the source.

Ensure thumbnail.png is accessible for Open Graph tags to function correctly.

Author
Thanh Dat (Dave)
Backend Developer transitioning to Full-stack.
```
