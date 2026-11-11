# Cathedra Digital - Setup Guide

## Infrastructure Configuration

### 1. Storage Buckets

Two S3-compatible buckets have been configured:

#### **avatars** (5MB limit)
- Public read access
- Supported formats: JPEG, PNG, WebP
- Used for user profile pictures

#### **public-assets** (50MB limit)
- Public read access
- Supported formats: JPEG, PNG, WebP, PDF, MP4
- Used for campaign images, videos, documents

**Setup via Supabase Dashboard:**
```
1. Go to Storage → Buckets
2. Create "avatars" bucket (Public)
3. Create "public-assets" bucket (Public)
```

Or use the CLI:
```bash
supabase storage create avatars --public
supabase storage create public-assets --public
```

---

### 2. Google OAuth Configuration

#### Prerequisites
- Google Cloud Project created
- OAuth 2.0 credentials generated

#### Steps

1. **Get Google Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials (Web Application)
   - Authorized redirect URIs:
     ```
     https://c--e3469c19-539b-4d3d-a625-5b72c0f10979-prod.lovable.cloud/auth/v1/callback?provider=google
     ```

2. **Configure in Supabase Dashboard**
   - Navigate to: Authentication → Providers → Google
   - Enable the provider
   - Paste:
     - Client ID: (from Google Console)
     - Client Secret: (from Google Console)

3. **Add Environment Variables**
   ```bash
   # .env.local
   VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   VITE_GOOGLE_CLIENT_SECRET=your_client_secret
   ```

4. **Test OAuth Flow**
   ```typescript
   // In your auth component
   import { lovable } from '@/integrations/lovable/index';
   
   const signInWithGoogle = async () => {
     const result = await lovable.auth.signInWithOAuth('google', {
       redirectTo: window.location.origin,
     });
   };
   ```

---

### 3. Apple OAuth Configuration

#### Prerequisites
- Apple Developer Account
- App ID created in Apple Developer

#### Steps

1. **Get Apple Credentials**
   - Go to [Apple Developer](https://developer.apple.com)
   - Create App ID with Sign in with Apple capability
   - Generate Keys in Certificates section

2. **Configure in Supabase Dashboard**
   - Navigate to: Authentication → Providers → Apple
   - Enable the provider
   - Paste credentials from Apple Developer

3. **Add Environment Variables**
   ```bash
   # .env.local
   VITE_APPLE_CLIENT_ID=your_apple_client_id
   VITE_APPLE_TEAM_ID=your_apple_team_id
   VITE_APPLE_KEY_ID=your_apple_key_id
   VITE_APPLE_PRIVATE_KEY=your_apple_private_key
   ```

---

### 4. Database Migrations

#### Apply Pending Migrations
```bash
# Via Supabase CLI
supabase db pull          # Pull latest schema
supabase migration list   # View pending migrations
supabase db push          # Apply all pending migrations

# Or via Docker
docker-compose -f supabase/docker-compose.yml exec db psql -U postgres -d postgres < supabase/migrations/*.sql
```

#### Current Schema
- 159 tables (from original Cathedra Digital)
- Row Level Security (RLS) enabled on all public tables
- Service role policies for backend operations
- User-scoped data isolation

---

### 5. Row Level Security (RLS) Policies

#### Default Policies

**Public Content Tables:**
```sql
-- Anyone can read published content
CREATE POLICY "public_read" ON saints
  FOR SELECT USING (published = true);
```

**User-Scoped Data:**
```sql
-- Users can only access their own data
CREATE POLICY "user_isolation" ON user_preferences
  FOR SELECT USING (user_id = auth.uid());
```

**Admin Operations:**
```sql
-- Only admins can modify admin tables
CREATE POLICY "admin_only" ON admin_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

---

### 6. Verification Checklist

- [ ] Storage buckets created (avatars, public-assets)
- [ ] Google OAuth configured in Supabase
- [ ] Apple OAuth configured in Supabase
- [ ] Environment variables added (.env.local)
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Test sign-in flow with Google
- [ ] Test sign-in flow with Apple
- [ ] Verify file uploads to buckets
- [ ] Check user data isolation (RLS)

---

### 7. Troubleshooting

**OAuth Redirect Loop**
- Verify redirect URI matches exactly in both Google Console and Supabase
- Check browser console for CORS errors
- Ensure origin is https (not http)

**Storage Upload Fails**
- Verify bucket name is correct
- Check file size limits
- Ensure bucket is public (for public assets)
- Verify MIME type is allowed

**RLS Blocking Access**
- Check `auth.uid()` is set for authenticated users
- Verify policies match your data access pattern
- Use service role key for admin operations

**Database Connection Errors**
- Verify SUPABASE_URL and keys in .env
- Check project status in Supabase Dashboard
- Confirm network connectivity

---

### 8. Environment Variables Summary

```bash
# Required (already configured)
SUPABASE_PROJECT_ID=bpnosuwoljbmdjogcmnw
SUPABASE_URL=https://c--e3469c19-539b-4d3d-a625-5b72c0f10979-prod.lovable.cloud
SUPABASE_PUBLISHABLE_KEY=sb_publishable_3oFZD0ZgK7xm7uDvR5Te7w_4IN2MVoo

# OAuth Configuration (add as needed)
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_CLIENT_SECRET=your_client_secret
VITE_APPLE_CLIENT_ID=your_apple_id
VITE_APPLE_TEAM_ID=your_team_id
VITE_APPLE_KEY_ID=your_key_id
VITE_APPLE_PRIVATE_KEY=your_private_key
```

---

## Next Steps

1. ✅ Build completed
2. ✅ Dependencies installed
3. ⏳ **Configure storage buckets** (this guide)
4. ⏳ **Enable Google/Apple OAuth** (this guide)
5. ⏳ Apply database migrations
6. ⏳ Deploy to production

**Questions?** Check the [Supabase Documentation](https://supabase.com/docs)
