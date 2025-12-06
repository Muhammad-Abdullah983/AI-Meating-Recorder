# Supabase Email OTP Configuration

## ⚠️ IMPORTANT: Enable Email Confirmation

Your OTP is not being sent because **Email Confirmation is disabled** in Supabase. Follow these steps:

### Step 1: Enable Email Confirmation in Supabase Dashboard

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **Authentication** → **Providers**
3. Click on **Email** provider
4. **Enable "Confirm email"** checkbox
5. Click **Save**

### Step 2: Configure Email Templates (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup** template
3. Customize the OTP email template if needed
4. Make sure `{{ .ConfirmationURL }}` or OTP token is included

### Step 3: Set OTP Expiry Time

1. Go to **Authentication** → **Settings**
2. Under **Email Auth** section
3. Set **OTP Expiry** to `60` seconds (1 minute)
4. Click **Save**

### Step 4: Verify SMTP Settings

1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Ensure SMTP is configured OR use Supabase's default email service
4. Test email sending

## Current Implementation Status

### ✅ What's Fixed in Code:

1. **Signup Flow:**
   - ✅ Checks for existing users
   - ✅ Creates user with `signUp()`
   - ✅ Creates profile with `email_verified: false`
   - ✅ **Always redirects to verify page**
   - ✅ Shows detailed console logs for debugging

2. **Verify Flow:**
   - ✅ Accepts 6-digit OTP
   - ✅ Validates OTP with expiry check
   - ✅ Updates profile to verified
   - ✅ Signs out user after verification
   - ✅ Redirects to login page

### 🔍 Debugging

Open browser console and check logs during signup:
- `Signup response:` - Shows if session exists or is null
- `Redirecting to verify page for:` - Confirms redirect happens

### Expected Behavior After Configuration:

1. **User signs up** → Supabase sends OTP email automatically
2. **User goes to verify page** → Enters 6-digit OTP from email
3. **OTP expires in 60 seconds** → User must request new one if expired
4. **After verification** → User redirected to login
5. **User logs in** → Authenticated and can access app

### If Email Still Not Sent:

**Option A: Check Supabase Dashboard → Authentication → Users**
- Look for the new user
- Check if `email_confirmed_at` is null
- If user has `email_confirmed_at` set, email confirmation is disabled

**Option B: Enable in Local Development (if using Supabase CLI)**

Edit `supabase/config.toml`:
```toml
[auth]
# Enable email confirmations
enable_confirmations = true

[auth.email]
# Enable signups
enable_signup = true
# Require email confirmation
double_confirm_changes = true
enable_confirmations = true
# OTP expiry in seconds
mailer_otp_exp = 60
```

Then restart Supabase:
```bash
supabase stop
supabase start
```

**Option C: Manual OTP Testing**

If emails aren't working, you can test with Supabase's test OTP (development only):
1. Go to **Authentication** → **Users**
2. Find your test user
3. Click **Send Magic Link** or view OTP in logs

## Testing Checklist

- [ ] Email confirmation enabled in dashboard
- [ ] SMTP configured or using Supabase email
- [ ] OTP expiry set to 60 seconds
- [ ] Test signup with new email
- [ ] Check email inbox for OTP
- [ ] Verify OTP works on verify page
- [ ] Check user can login after verification

## Common Issues

### Issue: No email received
**Solution:** Check spam folder, verify SMTP settings, enable "Confirm email" in Auth providers

### Issue: User auto-logged in after signup
**Solution:** Disable "Enable email confirmations" is OFF - turn it ON

### Issue: "User already registered" error
**Solution:** This is correct! It means duplicate prevention is working

### Issue: OTP always invalid
**Solution:** Check OTP expiry settings, ensure time is synced, try resending OTP

## Production Checklist

Before deploying:
- [ ] Email confirmation enabled in production Supabase project
- [ ] Custom email templates configured
- [ ] SMTP properly configured for production
- [ ] Test complete signup → verify → login flow
- [ ] Monitor email delivery rates

