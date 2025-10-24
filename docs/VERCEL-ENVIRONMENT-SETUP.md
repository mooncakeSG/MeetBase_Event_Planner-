# Vercel Environment Variables Setup

## Required Environment Variables for MeetBase

### 1. Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Site URL Configuration
```bash
NEXT_PUBLIC_SITE_URL=https://meet-base-event-planner.vercel.app
NEXT_PUBLIC_FRONTEND_URL=https://meet-base-event-planner.vercel.app
```

### 3. Backend API Configuration
```bash
NEXT_PUBLIC_API_BASE_URL=https://meetbase-event-planner-backend.onrender.com
```

### 4. AI Configuration (Optional)
```bash
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 5. Email Configuration (Optional)
```bash
EMAIL_FROM=MeetBase <noreply@meetbase.com>
```

## Supabase Dashboard Configuration

### Authentication → URL Configuration
Add these URLs to your Supabase project:

**Site URL:**
```
https://meet-base-event-planner.vercel.app
```

**Redirect URLs:**
```
https://meet-base-event-planner.vercel.app/**
https://meet-base-event-planner.vercel.app/dashboard
https://meet-base-event-planner.vercel.app/auth/callback
```

**Additional Redirect URLs (for development):**
```
http://localhost:3000/**
http://localhost:3000/dashboard
http://localhost:3000/auth/callback
```

### Cookie Domain Settings
In Supabase Dashboard → Authentication → Settings:
- **Cookie Domain**: `.vercel.app` (or leave empty for automatic detection)
- **Secure Cookies**: Enabled (for HTTPS)
- **SameSite**: `lax`

## Verification Steps

1. **Check Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify all required variables are set
   - Ensure no typos in variable names

2. **Test Supabase Connection:**
   - Use the browser console to run: `window.supabase.auth.getSession()`
   - Should return a valid session or null (not an error)

3. **Check Redirect URLs:**
   - Visit: `https://meet-base-event-planner.vercel.app`
   - Should not redirect in a loop
   - Should either show login page or dashboard (if already logged in)

4. **Clear Browser Data:**
   - Clear cookies and localStorage
   - Test the complete login flow

## Troubleshooting

### Common Issues:

1. **ERR_TOO_MANY_REDIRECTS**
   - Check Supabase redirect URLs include your Vercel domain
   - Verify NEXT_PUBLIC_SITE_URL matches your Vercel domain
   - Clear browser cookies and localStorage

2. **Session Not Persisting**
   - Check if PKCE flow is enabled in Supabase client
   - Verify cookie domain settings
   - Check if localStorage is accessible

3. **Environment Variables Not Loading**
   - Ensure variable names start with `NEXT_PUBLIC_` for client-side access
   - Check for typos in variable names
   - Redeploy after adding new variables

### Debug Commands:

```javascript
// Check environment variables
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Site URL:', process.env.NEXT_PUBLIC_SITE_URL)

// Check Supabase session
import { supabase } from './lib/supabase'
supabase.auth.getSession().then(console.log)

// Check cookies
console.log('Cookies:', document.cookie)
console.log('LocalStorage:', localStorage.getItem('sb-meetbase-auth-token'))
```
