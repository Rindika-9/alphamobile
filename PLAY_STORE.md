# Alpha Mobile — Google Play listing

Replace `https://YOUR-SITE` with your real Vercel URL (the same value as `VITE_SITE_URL`).

| Item | Value |
|---|---|
| App name | Alpha Mobile |
| Package / App ID | `com.alphamobile.app` |
| Version | 1.0.0 (versionCode 1) |
| Category | Shopping |
| Price | Free (no in-app purchases; physical goods are paid by UPI/COD to the shop) |
| Contains ads | **No** |
| Privacy policy URL | `https://YOUR-SITE/privacy` |
| Account deletion URL | `https://YOUR-SITE/delete-account` |
| Contact e-mail | alphamobilemizoram@gmail.com |
| Contact phone | +91 9612217093 |
| Website | `https://YOUR-SITE` |

---

## Short description (≤ 80 characters)

```
Quality secondhand phones & accessories from Alpha Mobile, Aizawl, Mizoram.
```
(75 characters)

## Full description (≤ 4000 characters)

```
Alpha Mobile is Mizoram's trusted shop for quality secondhand phones and accessories, now in an app.

Browse tested pre-owned iPhones and Android phones, AirPods, headphones, earphones, chargers, power banks, speakers and phone accessories at the best prices, and order straight to your door.

WHY ALPHA MOBILE
• Quality secondhand phones you can trust, checked by our shop in Bazar Bungkawn, Aizawl
• 1-month shop warranty on secondhand phones (screen, motherboard and battery; physical or water damage excluded)
• Brand new phones with official brand warranty
• Delivery across Mizoram in about 3–5 business days

EASY SHOPPING
• Search and filter by category and price range
• Product photos, details and stock shown before you buy
• Add to cart and apply coupon codes
• Simple 3-step checkout: address → payment → review

PAY YOUR WAY
• UPI: Google Pay, PhonePe, Paytm, BHIM. Scan the QR code or copy our UPI ID, then upload your payment screenshot and UTR number so we can confirm your payment quickly
• Cash on Delivery (when available)

TRACK YOUR ORDERS
• See all your orders and their status: Pending, Confirmed, Processing, Shipped, Out for Delivery, Delivered
• Get in-app notifications when your order status changes

ENGLISH AND MIZO
• Use the app in English or Mizo tawng

YOUR ACCOUNT, YOUR DATA
• Sign up with your Gmail address
• Change your password or reset it by e-mail
• Delete your account any time from Settings

NEED HELP?
Chat with us on WhatsApp at 9612217093, e-mail alphamobilemizoram@gmail.com, or visit our shop in Bazar Bungkawn, Aizawl, Mizoram.

Alpha Mobile: best quality secondhand phones at the best prices.
```

---

## Data safety form

Answers based on what the app actually collects (see `src/app/App.tsx`,
`src/app/services/supabaseService.ts` and `supabase/migrations/001_security.sql`).

**Data collection and security**

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS to Supabase) |
| Do you provide a way for users to request that their data is deleted? | **Yes**: in-app (Settings → Delete My Account) and `https://YOUR-SITE/delete-account` |

**Data types**: everything is *collected*, **not shared**. Supabase and Vercel are service
providers that process data on our behalf, which Play does not count as "sharing". Nothing is
processed ephemerally.

| Category → Data type | Collected | Shared | Required / Optional | Purposes |
|---|---|---|---|---|
| Personal info → **Name** | Yes | No | Required | App functionality, Account management |
| Personal info → **Email address** | Yes | No | Required | App functionality, Account management |
| Personal info → **Phone number** | Yes | No | Required | App functionality (delivery contact) |
| Personal info → **Address** | Yes | No | Required | App functionality (delivery) |
| Financial info → **Purchase history** | Yes | No | Required | App functionality |
| Financial info → **Other financial info** (UPI transaction ID / UTR) | Yes | No | Optional (UPI orders only) | App functionality (payment verification) |
| Photos and videos → **Photos** (payment screenshot the user uploads) | Yes | No | Optional (UPI orders only) | App functionality (payment verification) |

Answer **No** to every other type: location, contacts, messages, audio, files, calendar, health,
app activity, web browsing, app info and performance (no crash/analytics SDK), and device or
other IDs. The app has no ads, analytics or tracking SDKs.

The password is collected by Supabase Auth for login. Play does not list it as a separate data
type; it is covered by "Account management".

---

## Content rating (IARC questionnaire)

- E-mail for the rating certificate: alphamobilemizoram@gmail.com
- Category: **All other app types** (shopping / e-commerce)

| Question | Answer |
|---|---|
| Violence, blood, gore | No |
| Sexual content or nudity | No |
| Profanity or crude humour | No |
| Drugs, alcohol, tobacco | No |
| Gambling or simulated gambling | No |
| Users can interact or exchange content with each other | **No** (no chat, reviews or public profiles) |
| Shares the user's current physical location with other users | No |
| Allows users to purchase digital goods | No |
| Sells physical goods | Yes (phones and accessories; paid by UPI/COD outside Google Play) |
| Web browser or search engine | No |
| News app | No |

Expected rating: **Everyone / PEGI 3 / IARC 3+**.

## Other "App content" declarations

| Declaration | Answer |
|---|---|
| Ads | No ads |
| Target audience and content | **18 and over** (simplest: not designed for children; avoids the Families policy) |
| App access | **All or some functionality is restricted** → give the reviewer a test *customer* login (an e-mail and password you create; not your admin login) with the note: "Browse without login. Login is needed for checkout, Orders and Settings → Delete My Account." |
| Government app | No |
| Financial features | "My app doesn't provide any financial features" (it only takes payment for its own physical goods) |
| Health | No |
| News | No |
| Data safety | As above |
| Account deletion | URL `https://YOUR-SITE/delete-account` and in-app path |

---

## Graphics you need to make

| Asset | Size / format | Notes |
|---|---|---|
| **App icon** | 512 × 512 PNG, 32-bit, ≤ 1 MB | Square, no transparency needed; Play rounds the corners. Export from `public/icon.png` (1280×1266; pad it to a square first). |
| **Feature graphic** | 1024 × 500 PNG or JPG, ≤ 15 MB | Shown at the top of the listing. Logo plus "Quality secondhand phones · Aizawl" on the navy #0B1D3A background. Keep text away from the edges. |
| **Phone screenshots** | 2–8 images, PNG/JPG, 16:9 or 9:16, each side 320–3840 px (1080 × 1920 is a good size) | Suggested: 1 Home, 2 Shop with categories, 3 Product detail, 4 Cart with coupon, 5 Checkout with UPI QR, 6 My Orders / order tracking, 7 Mizo language. Take them from the app on a phone or emulator. Don't show real customer data. |
| 7-inch / 10-inch tablet screenshots | Optional | Only if you want the tablet layout listed. |

---

## Release checklist

1. Finish every step in `MANUAL_STEPS.md` (migration, admin user, keystore, `VITE_SITE_URL`).
2. Make sure `https://YOUR-SITE/privacy` and `https://YOUR-SITE/delete-account` open in a browser.
3. Build the signed `app-release.aab` (`MANUAL_STEPS.md` step 17).
4. Play Console → Create app → fill in the fields above → *Testing → Internal testing* first,
   upload the `.aab`, test on your phone, then promote to Production.
5. New personal developer accounts must run a **closed test with at least 12 testers for 14
   days** before Production access is granted. Plan for this.
