================================================================================
                    GOOGLE OAUTH IMPLEMENTATION GUIDE
================================================================================

QUICK REFERENCE:

Files to read (in order):
  1. QUICK_START_GOOGLE_OAUTH.md - Steps to enable (10 min)
  2. USER_FLOW_DIAGRAM.md - Visual explanation
  3. GOOGLE_OAUTH_README.md - Troubleshooting

Files modified/created:
  Backend:  server/models/User.js, authController.js, routes/auth.js, .env
  Frontend: client/App.jsx, pages/Login.jsx, pages/Register.jsx, authStore.js, .env

Key changes:
  - User model now supports googleId and authProvider fields
  - Backend can verify Google JWT tokens
  - Frontend has Google login/register buttons
  - Automatic account creation and linking

Setup checklist:
  [ ] Get Client ID from https://console.cloud.google.com/
  [ ] Add GOOGLE_CLIENT_ID to wandr-ai/server/.env
  [ ] Add VITE_GOOGLE_CLIENT_ID to wandr-ai/client/.env
  [ ] Restart servers: npm run dev
  [ ] Test at http://localhost:5173/login

Expected behavior:
  - "Sign in with Google" button visible on login/register pages
  - Click button opens Google OAuth popup
  - After login, user is logged into the app
  - User data saved in MongoDB with Google OAuth flag
  - Same Google account can't create multiple accounts
  - Email + Google OAuth can link to same account

Problems?
  - Button not showing: Check .env has VITE_GOOGLE_CLIENT_ID
  - Popup blocked: Allow popups for localhost:5173
  - Redirect URI error: Add to Google Console OAuth redirect URIs
  - JWT error: Verify GOOGLE_CLIENT_ID in server .env

Production:
  - Create new OAuth credentials for production domain
  - Add production domain to redirect URIs
  - Update production .env files
  - Deploy both frontend and backend

Questions? Read GOOGLE_OAUTH_README.md or QUICK_START_GOOGLE_OAUTH.md
