# ⚡ Google OAuth Quick Start (10 min)

## Step 1: Create Google OAuth Credentials (5 min)

### Go to Google Cloud Console
```
https://console.cloud.google.com/
```

### Create Project (if needed)
- Click "Select a Project" 
- Click "New Project"
- Name: "Wandr AI"
- Click "Create"

### Enable Google+ API
1. Go to "APIs & Services" → "Library"
2. Search: "Google+ API"
3. Click "Google+ API"
4. Click "Enable"

### Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted for consent screen:
   - Click "Configure Consent Screen"
   - Choose "External"
   - Fill: App name, support email, developer email
   - Click "Save and Continue"
4. On credentials page:
   - Choose "Web application"
   - Name: "Wandr AI Web"
   - Add Authorized Redirect URIs:
     ```
     http://localhost:5001
     http://localhost:5173
     ```
   - Click "Create"

### Copy Your Client ID
```
Your Client ID looks like: 123456789.apps.googleusercontent.com
```

---

## Step 2: Add Client ID to .env Files (2 min)

### Open `wandr-ai/server/.env`
Add this line:
```
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

### Open `wandr-ai/client/.env`
Add this line:
```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

---

## Step 3: Restart Your Servers (1 min)

```bash
cd /Users/anshu/Desktop/traveler
npm run dev
```

Wait for both servers to start:
```
[1] ➜ Local: http://localhost:5173/
[0] Server running on port 5001
```

---

## Step 4: Test It (2 min)

### Open Login Page
```
http://localhost:5173/login
```

### Click "Sign in with Google"
- You should see a Google login popup
- Choose your Google account
- Approve permissions
- You should be logged in! ✅

### Test Register Too
```
http://localhost:5173/register
```
Click "Sign up with Google" with a different account

---

## ✅ Success Indicators

✓ Google button visible on login page
✓ Google popup appears when clicked
✓ Can select Google account
✓ Redirected to home page after login
✓ User info shows in navbar
✓ Can access protected routes

---

## 🆘 Troubleshooting

### "Google button doesn't appear"
→ Check that `VITE_GOOGLE_CLIENT_ID` is in `.env`

### "Popup blocked"
→ Allow popups for localhost:5173 in browser settings

### "Redirect URI mismatch"
→ Check Google Console has these URIs:
  - http://localhost:5001
  - http://localhost:5173

### "Invalid Client ID"
→ Verify the Client ID in `.env` files matches Google Console exactly

### Still not working?
→ Check browser console (F12) for error messages
→ Check server logs for OAuth errors

---

## 📝 Next: Production Setup

When ready for production:

1. **Create Production OAuth Credentials**
   - In Google Console, create NEW credentials for your production domain
   - Add redirect URIs for your domain

2. **Update .env**
   ```
   GOOGLE_CLIENT_ID=your_production_client_id
   VITE_GOOGLE_CLIENT_ID=your_production_client_id
   ```

3. **Deploy**
   - Deploy both frontend and backend
   - Test OAuth on production domain

---

## ✨ What This Enables

✅ Users can sign up with Google  
✅ Users can sign in with Google  
✅ Automatic account creation  
✅ Avatar from Google profile  
✅ Account linking (same email)  
✅ No password needed for Google users  

---

**Stuck?** Check GOOGLE_OAUTH_README.md for more details!
