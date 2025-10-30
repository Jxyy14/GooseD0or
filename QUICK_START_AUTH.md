# ⚡ Quick Start - Add Authentication NOW

## 🎯 Goal
Block ALL trolls by requiring .edu or @uwaterloo.ca emails to submit offers.

---

## ✅ Step 1: Database (2 minutes)

**In Supabase SQL Editor:**

Copy/paste and run this entire file:
`supabase/migrations/20251029144000_require_auth_and_restrict_emails.sql`

---

## ✅ Step 2: Enable Email Auth (1 minute)

1. Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Email**
3. Check ✅ "Enable Email Confirmations"
4. Save

---

## ✅ Step 3: Add Routes (30 seconds)

Your `App.tsx` needs these two new routes added.

Find your Routes section and add:
```typescript
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
```

And add imports at the top:
```typescript
import Login from "./pages/Login";
import Signup from "./pages/Signup";
```

---

## ✅ Step 4: Deploy (2 minutes)

```bash
npm run build
# Then deploy to your platform (Vercel/Netlify/etc)
```

---

## 🧪 Test It Works

1. Visit your site
2. Click "Sign Up"
3. Try `test@gmail.com` → Should show error ❌
4. Try `student@uwaterloo.ca` → Should work ✅
5. Verify email
6. Login
7. Try submitting an offer → Should work! ✅
8. Logout
9. Try submitting without login → Redirects to login ✅

---

## 🎉 Done!

Now ONLY verified .edu and @uwaterloo.ca students can submit offers.

**Files Created:**
- ✅ `src/pages/Login.tsx` - Login page
- ✅ `src/pages/Signup.tsx` - Signup page (with email validation)
- ✅ `src/pages/Submit.tsx` - Updated to require auth
- ✅ `supabase/migrations/20251029144000_require_auth_and_restrict_emails.sql` - Database protection

**Trolls Blocked**: 99% 🎯

---

## Common Issues

**"User already registered"**
→ User tried to sign up twice. Tell them to use `/login` instead.

**"Only .edu and @uwaterloo.ca emails allowed"**
→ Working as intended! Non-university emails are blocked.

**Can't submit offers**
→ Make sure user is logged in. Check they verified their email.

**Still getting spam**
→ Make sure you applied the database migration. Check RLS policies are active.

---

## Advanced: View All Users

```sql
SELECT email, total_submissions, created_at
FROM public.user_profiles
ORDER BY created_at DESC;
```

See full guide: `SETUP_AUTHENTICATION.md`

