# Social Authentication Setup

This guide explains how to set up Google and Facebook social authentication for Adaptapedia.

## Overview

Adaptapedia uses `django-allauth` with `dj-rest-auth` for social authentication, integrated with our JWT authentication system. Users can sign up/login with:
- Username/password (existing)
- Google OAuth
- Facebook OAuth

## Backend Setup

### 1. Install Dependencies

Dependencies are already in `requirements.txt`. Install them:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Migrations

Create the required database tables for allauth:

```bash
python manage.py migrate
```

### 3. Configure Environment Variables

Add these to your `.env` file (see `.env.example` for template):

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to "APIs & Services" → "Credentials"

### 2. Configure OAuth Consent Screen

1. Click "OAuth consent screen" in the left sidebar
2. Choose "External" user type
3. Fill in required fields:
   - App name: "Adaptapedia"
   - User support email: your email
   - Developer contact: your email
4. Add scopes: `profile` and `email`
5. Save and continue

### 3. Create OAuth 2.0 Credentials

1. Click "Credentials" → "Create Credentials" → "OAuth client ID"
2. Application type: "Web application"
3. Name: "Adaptapedia Web"
4. Authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
5. Authorized redirect URIs:
   - `http://localhost:8000/api/auth/social/google/callback/` (development)
   - `https://api.yourdomain.com/api/auth/social/google/callback/` (production)
6. Click "Create"
7. Copy the Client ID and Client Secret to your `.env` file

## Facebook OAuth Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as the app type
4. Fill in app details:
   - Display Name: "Adaptapedia"
   - Contact Email: your email
5. Click "Create App"

### 2. Add Facebook Login Product

1. From your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" platform
4. Enter your site URL: `http://localhost:3000` (development)

### 3. Configure OAuth Settings

1. Go to "Facebook Login" → "Settings"
2. Add Valid OAuth Redirect URIs:
   - `http://localhost:8000/api/auth/social/facebook/callback/` (development)
   - `https://api.yourdomain.com/api/auth/social/facebook/callback/` (production)
3. Save changes

### 4. Get App Credentials

1. Go to "Settings" → "Basic"
2. Copy the "App ID" and "App Secret" to your `.env` file
3. Add your domain to "App Domains"

### 5. Make App Live (Production Only)

1. The app starts in "Development" mode
2. To make it live, go to "App Settings" → "Basic"
3. Toggle "App Mode" to "Live"
4. Complete app review if required by Facebook

## Frontend Integration

The frontend login/signup pages include social login buttons that:
1. Redirect to `/api/auth/social/google/login/` or `/api/auth/social/facebook/login/`
2. User authenticates with the provider
3. Provider redirects back to backend callback URL
4. Backend creates/updates user and returns JWT tokens
5. Frontend stores tokens and redirects to app

Social login buttons are visible on:
- `/auth/login` - Login page
- `/auth/signup` - Signup page

## API Endpoints

### Social Login Flow

**Google Login:**
```
GET /api/auth/social/google/login/
```

**Facebook Login:**
```
GET /api/auth/social/facebook/login/
```

These endpoints redirect to the provider's OAuth flow. After authentication, the provider redirects back to:

```
GET /api/auth/social/{provider}/callback/?code=...
```

The backend exchanges the code for tokens and returns:

```json
{
  "access": "jwt-access-token",
  "refresh": "jwt-refresh-token",
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "role": "USER",
    "reputation_points": 0
  }
}
```

## Testing

### Development Testing

1. Start backend: `python manage.py runserver`
2. Start frontend: `npm run dev`
3. Navigate to `http://localhost:3000/auth/login`
4. Click "Continue with Google" or "Continue with Facebook"
5. Complete OAuth flow
6. Verify JWT tokens are returned and user is logged in

### Test Accounts

- Google: Use any Google account for testing
- Facebook: In development mode, only app developers/testers can login. Add test users in Facebook App Dashboard → "Roles"

## Troubleshooting

### "Redirect URI mismatch" error

- Verify redirect URIs in provider console exactly match backend URLs
- Include trailing slashes
- Check http vs https

### "App Not Setup" error (Facebook)

- Ensure Facebook Login product is added
- Verify Valid OAuth Redirect URIs are configured
- Check App ID and Secret in `.env`

### User created but no email

- Some users may not share email with the app
- Configure `ACCOUNT_EMAIL_REQUIRED = False` if email is optional
- Handle missing emails gracefully in your user model

### CORS errors

- Ensure frontend domain is in `CORS_ALLOWED_ORIGINS` (backend settings)
- Check browser console for specific CORS error messages

## Security Notes

1. **Never commit credentials**: Keep `.env` out of git (already in `.gitignore`)
2. **Use HTTPS in production**: OAuth providers require HTTPS for production redirects
3. **Rotate secrets regularly**: Change OAuth secrets periodically
4. **Limit OAuth scopes**: Only request necessary permissions (profile + email)
5. **Validate redirect URIs**: Whitelist exact redirect URIs, never use wildcards

## Production Deployment

1. Update OAuth provider redirect URIs with production domains
2. Set `ACCOUNT_EMAIL_VERIFICATION = 'mandatory'` for stricter verification
3. Configure proper CORS origins in production settings
4. Use environment-specific `.env` files (e.g., `.env.production`)
5. Monitor OAuth provider dashboards for usage/errors

## Additional Resources

- [django-allauth Documentation](https://django-allauth.readthedocs.io/)
- [dj-rest-auth Documentation](https://dj-rest-auth.readthedocs.io/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
