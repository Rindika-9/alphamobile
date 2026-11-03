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

---

## Phase 2 — Bugs

11. [ ] **If you already ran `001_security.sql` before Phase 2, run it again.** It now also
    checks the total the customer saw (`p_expected_total`). The file is safe to re-run.
12. [ ] **Free-shipping threshold.** Admin → Payments → Shipping Fee → "Free above ₹".
    The default is `0`, which means free shipping is off and the shipping fee is charged on
    every order. The old hidden "free above ₹100" rule is gone, so set this value if you
    still want free shipping. Then press **Save Payment Settings**.
13. [ ] **Realtime.** The migration adds `orders` to the `supabase_realtime` publication.
    To confirm, go to Dashboard → Database → Publications → `supabase_realtime` and check
    that `orders` is ticked. New orders appear on the admin's phone live, and customers get
    a toast when you change their order status. Both need the app to be open; this is not a
    push notification.
14. [ ] Notifications are now cached per account on each device. Old local notifications
    from before this update are cleared once.
15. [ ] Not done (optional item 2.7): splitting `App.tsx` into `screens/` and `admin/`
    files. I skipped it to avoid any behaviour change before the Play release.

---

## Phase 3 — Android app (Capacitor)

App ID **`com.alphamobile.app`** (you confirmed it) · name "Alpha Mobile" · versionCode 1 ·
versionName 1.0.0 · minSdk 24 · targetSdk/compileSdk 36. Capacitor 8.6.

16. [ ] **Create your keystore and set its password yourself.** Follow `scripts/make-keystore.md`.
    Then replace the `CHANGE_ME` values in `android/key.properties` (Git ignores this file).
17. [ ] **Build the signed .aab.** Run these in PowerShell:
    ```powershell
    cd D:\alphamobile
    pnpm install
    pnpm build
    npx cap sync android
    cd android
    $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
    .\gradlew.bat bundleRelease
    ```
    Output: `D:\alphamobile\android\app\build\outputs\bundle\release\app-release.aab`.
    I already built it once without a key to prove the build works. That file is
    **unsigned**, so it can't be uploaded. Rebuild after step 16.
18. [ ] **Build only after `.env` is final.** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and
    `VITE_SITE_URL` are baked into the app at `pnpm build` time. In the app, the
    password-reset e-mail link uses `VITE_SITE_URL`. If it is empty, it uses the Supabase
    "Site URL".
19. [ ] **Every Play update:** raise `versionCode` (2, 3, ...) and `versionName` in
    `android/app/build.gradle`, then repeat step 17.
20. [ ] **Test on a real phone before uploading.** Android Studio → open the `android` folder
    → Run. Or install a debug APK with `.\gradlew.bat assembleDebug`. Check: login, order
    with UPI and screenshot, the back button, and the WhatsApp/Instagram/phone links.
21. [ ] **Decide: "⚡ Open GPay / UPI App" button.** The task file mentions this button, but
    the current UI never shows it. There is only a translation string for it, and the Help FAQ
    mentions it. I did **not** add it, because you said not to change features or look. The app
    is ready for it: `upi://` links open the Android UPI app chooser. If you want the button
    under the QR code, tell me and I'll add it in the same blue button style.
22. [ ] `local.properties` points to `C:/Users/Onema/AppData/Local/Android/Sdk`. Git ignores
    it. Android Studio will rewrite it if your SDK is somewhere else.

---

## Phase 4 — Store prep and final check

23. [ ] **Deploy the website to Vercel** (merge or push `play-release`, or deploy that branch).
    Then open `https://YOUR-SITE/privacy` and `https://YOUR-SITE/delete-account`. Play needs
    both URLs.
24. [ ] **Fill in Play Console** from `PLAY_STORE.md`: descriptions, Data safety, content
    rating, app access with a test customer login, and graphics.
25. [ ] **End-to-end test after step 2 (migration).** I could not run this against your real
    Supabase, because the migration isn't applied there yet and testing would create real
    orders. Do it once on the website and once in the Android app:
    1. Register a new customer, confirm the e-mail if confirmation is on, then log in.
    2. Add a product, apply a coupon, and check that Cart, Checkout, the QR amount and the
       Review total all match.
    3. Pay by UPI: upload a screenshot, enter a UTR, and place the order.
    4. On a second device logged in as admin: the "New Order Received" toast appears without
       a refresh, and the screenshot opens.
    5. Admin sets Payment Status to **Paid** and Order Status to **Confirmed**.
    6. The customer gets the "Order Status Updated" toast. Payment status stays Paid after a
       refresh.
    7. Settings → Delete My Account on a test customer, then check that the user is gone in
       Supabase → Authentication.
26. [ ] **Security note (found while checking).** Right now, before the migration, anyone with
    the public key can read **all orders** (`/rest/v1/orders`). The old live `orders` table
    also has **no `payment_status` column**, so the old app's order inserts were failing
    and the app only pretended to save them. Running step 2 fixes both. Please do it soon.

### What I verified

- `pnpm build` passes after every phase, and a TypeScript check is clean.
- The migration was run **twice** (it is re-runnable) on a local test Postgres (PGlite) with
  stub `auth`/`storage` schemas and your live table shapes. 46 checks passed: prices from
  the DB, coupon, shipping and free-shipping threshold, stock decrement and out-of-stock
  rollback, `price_changed`, UPI screenshot folder check, RLS for customer/other/admin,
  storage rules, `payment_meta` on old JSON rows, and `delete_my_account` keeping orders but
  unlinking them.
- The built website renders `/`, `/auth`, `/admin` (no pre-filled credentials or hint),
  `/privacy` and `/delete-account` in headless Chrome.
- `gradlew bundleRelease` builds `app-release.aab` (unsigned until you add your key).
- **Not verified:** the real Supabase project, the Android app on a device or emulator
  (none is set up on this PC), and that Supabase lets `delete_my_account()` delete from
  `auth.users` on your plan. It normally does. Test it with step 25.7.
