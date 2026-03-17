# OAuth Setup Guide for Tilt

## Supabase Project Details
- **Project URL:** https://wqgmocwpsrmvmorybkqp.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/wqgmocwpsrmvmorybkqp/auth/providers
- **Redirect URL (for both providers):** `https://wqgmocwpsrmvmorybkqp.supabase.co/auth/v1/callback`

---

## 1. Google Sign-In Setup

### Step A: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project called "Tilt" (or use existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**

### Step B: Configure OAuth Consent Screen
1. Go to **OAuth consent screen**
2. Set User Type to **External**
3. Fill in:
   - App name: **Tilt**
   - User support email: pedro@blackfyre.app
   - Developer contact: pedro@blackfyre.app
4. Add scopes: `email`, `profile`, `openid`
5. Save

### Step C: Create OAuth Client IDs

**For iOS:**
1. Create credentials → OAuth client ID
2. Application type: **iOS**
3. Bundle ID: `app.blackfyre.tilt`
4. Save the **Client ID** (you'll need this for Expo)

**For Android:**
1. Create credentials → OAuth client ID
2. Application type: **Android**
3. Package name: `app.blackfyre.tilt`
4. SHA-1: Get from EAS build (`eas credentials`)
5. Save the **Client ID**

**For Web (Supabase needs this):**
1. Create credentials → OAuth client ID
2. Application type: **Web application**
3. Authorized redirect URIs: `https://wqgmocwpsrmvmorybkqp.supabase.co/auth/v1/callback`
4. Save the **Client ID** and **Client Secret**

### Step D: Configure in Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/wqgmocwpsrmvmorybkqp/auth/providers
2. Find **Google** provider → Enable
3. Enter the **Web Client ID** and **Client Secret** from Step C
4. Save

---

## 2. Apple Sign-In Setup

### Step A: Apple Developer Portal
1. Go to [Apple Developer](https://developer.apple.com)
2. You need an Apple Developer Account ($99/year)

### Step B: Create App ID
1. Go to **Certificates, Identifiers & Profiles → Identifiers**
2. Click **+** → **App IDs** → **App**
3. Description: **Tilt**
4. Bundle ID: `app.blackfyre.tilt`
5. Enable **Sign in with Apple** capability
6. Save

### Step C: Create Service ID (for Supabase)
1. Go to **Identifiers** → Click **+** → **Services IDs**
2. Description: **Tilt Web Auth**
3. Identifier: `app.blackfyre.tilt.auth`
4. Enable **Sign in with Apple**
5. Configure:
   - Domains: `wqgmocwpsrmvmorybkqp.supabase.co`
   - Return URLs: `https://wqgmocwpsrmvmorybkqp.supabase.co/auth/v1/callback`
6. Save

### Step D: Create Private Key
1. Go to **Keys** → Click **+**
2. Key Name: **Tilt Supabase Auth**
3. Enable **Sign in with Apple**
4. Configure → Select your App ID
5. Register → **Download the .p8 key file** (you can only download once!)
6. Note the **Key ID**

### Step E: Configure in Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/wqgmocwpsrmvmorybkqp/auth/providers
2. Find **Apple** provider → Enable
3. Enter:
   - **Client ID (Service ID):** `app.blackfyre.tilt.auth`
   - **Secret Key:** Paste contents of the .p8 file
   - **Key ID:** From Step D
   - **Team ID:** Your Apple Developer Team ID (found in top-right of developer portal)
4. Save

---

## 3. Update Expo App Config

After setting up both providers, update your `app.json` to include the scheme for deep linking:

```json
{
  "expo": {
    "scheme": "tilt",
    "ios": {
      "bundleIdentifier": "app.blackfyre.tilt",
      "usesAppleSignIn": true
    }
  }
}
```

---

## 4. Test Authentication

1. Run `npx expo start`
2. Test email sign-up first (works out of the box)
3. Test Google Sign-In
4. Test Apple Sign-In (only works on real iOS device or TestFlight)

---

## Quick Checklist
- [ ] Google Cloud project created
- [ ] Google OAuth consent screen configured
- [ ] Google Web Client ID + Secret added to Supabase
- [ ] Apple Developer Account active
- [ ] Apple App ID created with Sign in with Apple
- [ ] Apple Service ID created with redirect URL
- [ ] Apple Private Key (.p8) downloaded and added to Supabase
- [ ] Tested email auth
- [ ] Tested Google auth
- [ ] Tested Apple auth
