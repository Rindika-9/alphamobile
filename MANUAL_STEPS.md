# Alpha Mobile — things you must do by hand

Do these in order. Tick each box when it's done. I never guessed or committed any secret.

---

## Phase 1 — Security & auth

1. [ ] **Back up the database first.** Supabase Dashboard → Database → Backups (or
   Table Editor → export `orders`, `products`, `customers`, `content_settings` as CSV).
2. [ ] **Run the migration.** Supabase Dashboard → SQL Editor → New query → paste the whole
   file `supabase/migrations/001_security.sql` → **Run**. It runs in one transaction: if
   anything fails, nothing changes. Send me the error text if it fails.
   - It **does not delete rows or drop tables**.
   - It **does drop the old RLS policies** on `products, orders, customers, profiles,
     content_settings, admins`, plus old storage policies that mention `product-images` /
     `payment-proofs`, so that the new rules are the only ones.
   - Old `orders.customer_id` values (like `c-1719...`) are kept in a new column
     `orders.legacy_customer_id`.
3. [ ] **Check other storage policies.** Dashboard → Storage → Policies. If you see an old
   policy on `storage.objects` that allows everything (for example `true` for INSERT) and
   does not mention a bucket name, delete it. Otherwise anyone could still upload to
   `product-images`.
4. [ ] **Create your admin login.** Dashboard → Authentication → Users → **Add user** →
   "Create new user" → your admin e-mail + a strong password (choose it yourself) → tick
   "Auto Confirm User".
5. [ ] **Make that user an admin.** SQL Editor:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'YOUR-ADMIN-EMAIL@gmail.com';
   ```
   The old `admin@gmail.com / admin123` login no longer exists.
6. [ ] **Auth settings.** Dashboard → Authentication:
   - Sign In / Providers → Email: enabled. "Confirm email": your choice (ON is safer;
     the app shows "check your Gmail" when it's on).
   - URL Configuration → **Site URL** = your Vercel URL (e.g. `https://alphamobile.vercel.app`).
     **Redirect URLs**: add `https://YOUR-SITE/**`.
   - (Optional) Emails → SMTP: the built-in Supabase mailer only sends a few e-mails per
     hour. For real customers, set up your own SMTP (Gmail SMTP / Resend / Brevo).
7. [ ] **Set `VITE_SITE_URL`.** In `.env` (local) and in Vercel → Project → Settings →
   Environment Variables: `VITE_SITE_URL=https://YOUR-SITE` (no trailing slash). Then redeploy.
8. [ ] **Old customer accounts.** Accounts made before this update only existed in each
   phone's browser (localStorage), so they never reached the server. Those customers must
   **register again**. On first load, the app now deletes those old local copies (they
   held plain-text passwords).
9. [ ] Password minimum is now **6 characters**, because Supabase Auth needs at least 6.
   The old minimum was 4.
10. [ ] **Check the new Mizo text.** I wrote the "Delete My Account", "Forgot password", and
    `/delete-account` page text in Mizo myself. Please read and correct it in
    `src/app/App.tsx` (search `deleteAccount`, `forgotPassword`, `DeleteAccountPage`).
