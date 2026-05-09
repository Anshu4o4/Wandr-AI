# Google OAuth User Flow

## Sign-In Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  User navigates to http://localhost:5173/login                  │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             ▼
         ┌────────────────────────────────────────┐
         │  Login Page displays                   │
         │  ┌──────────────────────────────────┐  │
         │  │ Email/Password inputs            │  │
         │  ├──────────────────────────────────┤  │
         │  │ OR continue with:                │  │
         │  │ [Sign in with Google] ◄─ Click  │  │
         │  └──────────────────────────────────┘  │
         └────────────────────┬───────────────────┘
                              │
                              ▼
              ┌───────────────────────────────────────┐
              │ Google OAuth Popup Opens              │
              │ ┌─────────────────────────────────┐   │
              │ │ Google Sign-In                  │   │
              │ │ Select account or sign in       │   │
              │ │ Approve permissions             │   │
              │ └─────────────────────────────────┘   │
              └───────────────┬───────────────────────┘
                              │
                     ┌────────┴─────────┐
                     │                  │
                     ▼                  ▼
            ┌──────────────┐     ┌──────────────┐
            │ SUCCESS:     │     │ ERROR:       │
            │ Get JWT Token│     │ Popup Closed │
            └──────┬───────┘     └──────┬───────┘
                   │                    │
                   ▼                    ▼
          ┌─────────────────┐    ┌────────────┐
          │ Frontend sends  │    │ Show error │
          │ JWT to backend  │    │ message    │
          │ POST /auth/     │    └────────────┘
          │ google          │
          └────────┬────────┘
                   │
                   ▼
        ┌────────────────────────────────┐
        │ Backend verifies JWT           │
        │ with Google's public keys      │
        └────────────┬───────────────────┘
                     │
           ┌─────────┴──────────┐
           │                    │
    ┌──────▼──────┐      ┌──────▼──────┐
    │ User Exists │      │ New User    │
    └─────┬───────┘      └─────┬───────┘
          │                    │
          ▼                    ▼
    ┌───────────┐      ┌──────────────────┐
    │ Login     │      │ Create new user  │
    │ existing  │      │ with Google data:│
    │ user      │      │ - name           │
    └─────┬─────┘      │ - email          │
          │            │ - avatar (Google)│
          │            │ - googleId       │
          │            │ - authProvider   │
          │            └────────┬─────────┘
          │                     │
          └─────────────┬───────┘
                        │
                        ▼
        ┌────────────────────────────────┐
        │ Backend returns:                │
        │ - accessToken                  │
        │ - refreshToken (in cookie)     │
        │ - user data                    │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │ Frontend stores tokens         │
        │ Redirect to home page          │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │ ✅ USER LOGGED IN!             │
        │                                │
        │ Navbar shows user info         │
        │ Can access protected routes    │
        └────────────────────────────────┘
```

## Sign-Up Flow

```
User goes to /register

                    ▼
        
    Click "Sign up with Google"
            
                    ▼
            
    Google popup opens
    (same as above)
            
                    ▼
            
    JWT sent to backend
            
                    ▼
            
    Email already exists?
    ├─ YES: Link accounts
    └─ NO: Create new user
            
                    ▼
            
    ✅ NEW ACCOUNT CREATED
    User logged in automatically
```

## Account Linking Flow

```
Scenario: User signs up with email, then tries Google OAuth

┌──────────────────────────────────────────────────────┐
│ 1. Sign up with email: john@gmail.com                │
│    Account created: { email, password hash }         │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│ 2. Later, click "Sign in with Google"                │
│    Use Google account: john@gmail.com                │
│    Google returns: { email, googleId, name, avatar } │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│ 3. Backend checks: Email john@gmail.com exists       │
│    ✓ User found!                                     │
│    Update: { googleId, authProvider = 'google' }    │
│    Response: Login tokens                            │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│ 4. ✅ ACCOUNTS LINKED!                              │
│    john@gmail.com can now login with:               │
│    ✓ Email + password (original)                    │
│    ✓ Google OAuth (newly linked)                    │
│    Both access same account                          │
└──────────────────────────────────────────────────────┘
```

## Data Stored

### User Document in MongoDB
```javascript
{
  _id: ObjectId("..."),
  
  // Basic info
  name: "John Doe",
  email: "john@gmail.com",
  avatar: "https://lh3.googleusercontent.com/...",
  
  // Authentication
  password: undefined,  // Not needed for Google OAuth
  googleId: "105123456789",  // From Google
  authProvider: "google",  // 'email' or 'google'
  
  // Account status
  isVerified: true,  // Auto-verified for Google users
  
  // Additional fields
  savedTrips: [],
  savedItineraries: [],
  role: "user",
  
  // Timestamps
  createdAt: "2026-05-08T21:56:00Z",
  updatedAt: "2026-05-08T21:56:00Z"
}
```

## Request/Response Format

### Frontend → Backend
```javascript
POST /api/v1/auth/google
Content-Type: application/json

{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZkNzA5OTEwOTE3MjE5OTdhOWY1YjEyOTBhMjcyYjk0ZWE3ZjU1YzAiLCJ0eXAiOiJKV1QifQ..."
}
```

### Backend → Frontend
```javascript
{
  "status": "success",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@gmail.com",
      "avatar": "https://...",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## States During OAuth

### Frontend Component States

```
┌─────────────────────────────────────────┐
│ Button States                           │
├─────────────────────────────────────────┤
│ Normal: "Sign in with Google"           │
│ ⬇️                                       │
│ Clicked: "Sign in with Google"          │
│ (isLoading = false, popup opens)        │
│ ⬇️                                       │
│ Submitting: Loading spinner             │
│ (isLoading = true)                      │
│ ⬇️                                       │
│ Success: Redirect ✅                    │
│ OR                                      │
│ Error: "Show error message"             │
│ (error message displays)                │
└─────────────────────────────────────────┘
```

---

## Files Modified / Created

### Backend Changes
```
server/
├── models/User.js                    ← Modified (OAuth fields)
├── controllers/authController.js     ← Modified (googleAuth function)
├── routes/auth.js                    ← Modified (POST /google route)
├── .env                              ← Created (GOOGLE_CLIENT_ID)
└── package.json                      ← Modified (google-auth-library)
```

### Frontend Changes
```
client/
├── src/
│   ├── App.jsx                       ← Modified (GoogleOAuthProvider)
│   ├── pages/
│   │   ├── Login.jsx                 ← Modified (Google button)
│   │   └── Register.jsx              ← Modified (Google button)
│   └── store/authStore.js            ← Modified (loginWithGoogle)
├── .env                              ← Created (VITE_GOOGLE_CLIENT_ID)
└── package.json                      ← Modified (@react-oauth/google)
```

