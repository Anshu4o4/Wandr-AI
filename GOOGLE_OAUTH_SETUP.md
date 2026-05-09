# Google OAuth Setup Guide

## Steps to Get Your Google Client ID

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project** (if you don't have one)
   - Click "Select a Project" → "New Project"
   - Name it "Wandr AI" or similar
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - If prompted, configure the OAuth consent screen:
     - Click "Configure Consent Screen"
     - Choose "External" (for testing)
     - Fill in required fields:
       - App name: "Wandr AI"
       - User support email: your email
       - Developer contact: your email
     - Click "Save and Continue"
   - On the next screen, add scopes:
     - Select predefined scopes
     - Search for "email", "profile", "openid"
     - Click "Save and Continue"
   - Skip test users (or add your email)
   - Click "Back to Dashboard"

5. **Create the OAuth 2.0 Client ID**
   - Go back to Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Name: "Wandr AI Web"
   - Add Authorized redirect URIs:
     ```
     http://localhost:5001
     http://localhost:5173
     ```
   - Click "Create"

6. **Copy Your Client ID**
   - Your Client ID will be displayed
   - Copy it (format: `xxxxx.apps.googleusercontent.com`)

## Add to Your .env Files

### Server (.env in wandr-ai/server/)
```
GOOGLE_CLIENT_ID=your_client_id_here
```

### Client (.env in wandr-ai/client/)
```
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

## Restart Your Dev Servers
```bash
# Kill existing processes if needed
npm run dev
```

## Test It Out

1. Go to http://localhost:5173/login
2. Click "Sign in with Google"
3. You should see the Google login popup
4. After successful login, you'll be redirected to the app

## Production Setup

For production:
1. In Google Console, add your production domain to OAuth Consent Screen
2. Add these redirect URIs:
   ```
   https://yourdomain.com
   https://yourdomain.com/login
   https://yourdomain.com/register
   https://yourdomain-api.com
   ```
3. Update your production `.env` files with the Client ID

## Troubleshooting

- **"Invalid Client ID"**: Check that your VITE_GOOGLE_CLIENT_ID matches Google Console
- **"Redirect URI mismatch"**: Add all domains where your app is hosted to the OAuth 2.0 configuration
- **Popup blocked**: Some browsers block the Google popup - check your browser extensions
