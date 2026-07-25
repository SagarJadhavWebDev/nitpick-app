# Nitpick — Weekend SaaS Plan

**One-liner:** A Chrome extension that lets anyone on a small team capture a bug (screenshot + console errors + browser/URL context) and send it straight to Slack — no dashboard, no login for reporters, no enterprise bloat. Priced for 2-8 person teams that Marker.io/BugHerd ignore.

**Target:** $1-2k MRR = ~65-100 teams at $15-19/month (recommended, see Pricing), plus lifetime deal revenue later via AppSumo (separate from MRR target — see Section 9).

---

## 0. Validation phase — BEFORE Weekend 1 (do this first)

Don't write product code until this step gives a real signal. Cheapest way to test demand:

- Post the landing page in r/SaaS, r/webdev, r/sideproject. Don't ask "would you pay for this?" — always gets a hollow yes. Ask instead: *"I built this for [bug-reporting-to-Slack pain] — is this something your team deals with, and how do you handle it today?"* The real signal is people describing their current painful workaround, not upvotes.
- The landing page's email waitlist form (see Section 9a) is the actual test — conversion from post-viewers to real email signups is much harder to fake than an upvote or a comment.
- **Decision rule:** if Reddit response is lukewarm/quiet after a few posts across subreddits, pivot the niche/angle before writing more code — don't push through to Weekend 3 hoping it improves. If response is decent (real workaround stories + waitlist signups), proceed to Weekend 1 below.

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend/dashboard | Next.js 14 (App Router) + Tailwind | You already know it, fast to ship |
| Extension | Plain Manifest V3 Chrome extension (vanilla JS/TS, not React — keep it light) | Extensions should be tiny; React adds bundle weight for no benefit here |
| Backend | Next.js API routes (or Route Handlers) — no separate server needed | One repo, one deploy, less to manage solo |
| DB | Postgres via **Supabase** (free tier to start) | Free tier, built-in auth option, generous limits, easy Prisma integration |
| ORM | Prisma | Type-safe, fast to iterate schema |
| Auth | Clerk or Supabase Auth (pick Clerk — faster to wire up, generous free tier) | Don't build auth yourself |
| Payments | **Paddle** Checkout + Customer Portal (hosted, not custom UI) | Merchant of Record — Paddle is legally the seller, handles all global tax compliance, and pays you out. No business registration required to start, unlike Stripe in India which requires a registered entity + invite approval. Supports subscriptions AND one-time/lifetime payments (needed for AppSumo later). |
| File storage (screenshots) | Supabase Storage or Cloudflare R2 | Cheap, S3-compatible |
| Hosting | Vercel (Next.js) | Zero-config deploy, free tier fine to start |
| Notifications | Slack Incoming Webhooks (v1), email digest (v2) | Slack webhook = ~10 lines of code, no OAuth needed for v1 |

---

## 2. Database Schema (Prisma-style)

```prisma
model Team {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique          // used in extension config
  apiKey      String   @unique          // extension auth token
  createdAt   DateTime @default(now())

  // Paddle (Merchant of Record) fields — replaces Stripe
  paddleCustomerId       String?  @unique
  paddleSubscriptionId   String?  // null for lifetime customers — they have no subscription
  subscriptionStatus     String   @default("trialing") // trialing | active | past_due | canceled | lifetime
  planTier               String   @default("starter")  // starter | pro | lifetime_tier1 | lifetime_tier2
  trialEndsAt            DateTime?

  // Lifetime deal (AppSumo) fields — kept fully separate from subscription lifecycle
  isLifetime             Boolean  @default(false)
  lifetimeCode           String?  @unique   // the redemption code claimed, for support lookups
  lifetimePurchasedAt    DateTime?

  members     Member[]
  reports     BugReport[]
  integrations Integration[]
}

// AppSumo/lifetime redemption codes — generated in a batch upfront, claimed later by a Team
model RedemptionCode {
  id        String   @id @default(cuid())
  code      String   @unique
  batch     String   // e.g. "appsumo_launch_2026"
  claimedBy String?  // Team.id once redeemed
  claimedAt DateTime?
  createdAt DateTime @default(now())
}

model Member {
  id        String   @id @default(cuid())
  teamId    String
  team      Team     @relation(fields: [teamId], references: [id])
  email     String
  role      String   @default("member") // owner | member
  clerkUserId String @unique
  createdAt DateTime @default(now())
}

model Integration {
  id          String   @id @default(cuid())
  teamId      String
  team        Team     @relation(fields: [teamId], references: [id])
  type        String   // "slack_webhook" (v1), "jira", "linear" (v2)
  config      Json     // { webhookUrl: "..." }
  createdAt   DateTime @default(now())
}

model BugReport {
  id            String   @id @default(cuid())
  teamId        String
  team          Team     @relation(fields: [teamId], references: [id])
  screenshotUrl String
  pageUrl       String
  consoleLogs   Json?
  browserInfo   Json?    // { os, browser, viewport }
  note          String?
  reporterEmail String?
  status        String   @default("open") // open | resolved | ignored
  createdAt     DateTime @default(now())
}
```

Keep it to these 5 tables for v1 (4 core + redemption codes). Don't add anything else until real users ask for it.

**Important access-check rule:** anywhere in the app you check "is this team allowed to use the product," check `subscriptionStatus === 'active' || isLifetime === true`. Never let trial-expiry or billing-webhook logic touch a lifetime account — keep lifetime customers completely outside the subscription lifecycle so a failed-payment or cancellation webhook can never accidentally lock out someone who already paid for good.

---

## 3. Auth Flow

**Two separate auth contexts — don't conflate them:**

1. **Dashboard auth (team owners/members logging into the web app)**
   - Use Clerk's hosted sign-up/sign-in components — drop-in, ~30 min setup.
   - On first sign-up → create a `Team` row + make the user an `owner` `Member`.
   - Clerk gives you `userId` on every request; map to your `Member`/`Team` via `clerkUserId`.

2. **Extension auth (no login — API key based)**
   - When a team is created, generate a random `apiKey` (e.g. `bsnap_live_xxxxx`).
   - Team owner pastes this key into the extension's settings popup once.
   - Every bug report the extension sends includes this key in a header; your API route looks up the `Team` by `apiKey` — no session, no OAuth, no cookies needed in the extension.
   - This is exactly why "no login for reporters" works — the extension is authenticated once per install, not per person.

**Signup → paying flow (subscription customers):**
```
Visit landing page → Sign up (Clerk) → Team created (status: trialing, 14-day trialEndsAt)
→ Install extension, paste API key → Start reporting bugs immediately (works during trial)
→ Day 14: Paddle Checkout prompt in dashboard banner → Subscribe → status: active
→ If not subscribed by day 14+3 grace: extension still captures but stops sending (soft paywall)
```

**Lifetime (AppSumo) flow — separate path, bypasses trial entirely:**
```
Buyer purchases on AppSumo → gets a redemption code via AppSumo's system
→ Visits your /redeem page → Sign up (Clerk) → enters code
→ API validates code against RedemptionCode table (unclaimed, correct batch)
→ Team created/updated: isLifetime: true, subscriptionStatus: "lifetime", claimedBy set
→ Full access immediately, no trial countdown, never touched by billing webhooks
```

---

## 4. Paddle Setup — what you actually need

**Why Paddle instead of Stripe:** Stripe in India has been invite-only since May 2024, with approvals skewed heavily toward registered businesses with a GSTIN — individual freelancers without company registration are rarely approved. Paddle is a Merchant of Record: Paddle is legally the seller, handles all global sales tax/VAT/GST compliance, and pays *you* out as a seller — no business registration required to start. It also natively supports one-time payments, which you need for the AppSumo lifetime deal anyway.

1. **Create a Paddle account** (paddle.com) — sign up as an individual seller, no company registration needed to start selling.
2. **Create Products/Prices** in the Paddle Dashboard:
   - `Starter` — $15/mo recurring
   - `Pro` — $19/mo recurring
   - `Lifetime Tier 1` / `Lifetime Tier 2` — one-time prices, used later for AppSumo codes
3. Use **Paddle Checkout** (hosted overlay or hosted page) — never build a custom card form:
   ```js
   import { initializePaddle } from '@paddle/paddle-js';

   const paddle = await initializePaddle({ environment: 'sandbox', token: 'your_client_token' });

   paddle.Checkout.open({
     items: [{ priceId: 'pri_xxx', quantity: 1 }],
     customer: { email: user.email },
     successUrl: "https://yourapp.com/dashboard?success=true",
   });
   ```
4. **Webhook endpoint** (`/api/paddle/webhook`) — this is the only complex part. Listen for:
   - `subscription.created` / `transaction.completed` → save `paddleCustomerId`, `paddleSubscriptionId` (if recurring), set `subscriptionStatus: active`
   - For a one-time lifetime purchase: `transaction.completed` with a lifetime price ID → set `isLifetime: true`, `subscriptionStatus: "lifetime"`, `lifetimePurchasedAt: now()` — do NOT set a `paddleSubscriptionId`
   - `subscription.payment_failed` → set `status: past_due`
   - `subscription.canceled` → set `status: canceled` (never applies to lifetime accounts)
5. **Customer Portal** — Paddle hosts a "manage/cancel subscription" page for you, same idea as Stripe's Billing Portal. You never build cancel/upgrade/invoice-history UI yourself.
6. Use Paddle's **sandbox environment** to test the full checkout + webhook flow before going live — equivalent to Stripe's test mode.
7. **Payouts:** Paddle pays you out to your Indian bank account in your local currency on a regular schedule (check current payout terms/minimums on their site, as these can change) — this is the main practical benefit over Stripe for your situation: no FIRA paperwork, no GSTIN requirement to get started.

That's the entire billing system — no custom invoicing, no manual dunning emails, no PCI concerns, no tax compliance filing (Paddle handles all of that as Merchant of Record).

---

## 5. Chrome Extension Structure (Manifest V3)

```
extension/
├── manifest.json
├── popup/
│   ├── popup.html        # small UI: API key input, "capture bug" button, note field
│   ├── popup.js
│   └── popup.css
├── background.js          # service worker: handles screenshot capture, API calls
├── content-script.js      # injected into pages: grabs console logs, page context
└── icons/
```

**manifest.json essentials:**
```json
{
  "manifest_version": 3,
  "name": "Nitpick",
  "version": "0.1.0",
  "permissions": ["activeTab", "storage", "scripting"],
  "host_permissions": ["<all_urls>"],
  "action": { "default_popup": "popup/popup.html" },
  "background": { "service_worker": "background.js" },
  "content_scripts": [{ "matches": ["<all_urls>"], "js": ["content-script.js"] }]
}
```

**Capture flow:** `chrome.tabs.captureVisibleTab()` for screenshot → content script pulls `window.location.href`, `navigator.userAgent`, and any buffered `console.error` calls (override `console.error` early in content script to buffer them) → background script POSTs everything + API key to your Next.js API → API validates key, uploads screenshot to storage, saves `BugReport` row, fires Slack webhook.

---

## 6. Weekend-by-Weekend Roadmap

**Weekend 1 — Core capture loop**
- Next.js project scaffold + Prisma + Supabase connected
- Chrome extension: popup UI, screenshot capture, console log buffering
- One API route: `POST /api/reports` that accepts extension payload and saves to DB (no Slack yet, just prove the loop works end to end)

**Weekend 2 — Slack integration + team creation**
- Landing page + Clerk sign-up → creates Team + apiKey
- Settings page to paste Slack webhook URL
- Wire `POST /api/reports` to also fire the Slack webhook with a formatted message + screenshot link

**Weekend 3 — Billing**
- Paddle products, Checkout integration, webhook handler, Customer Portal link
- Trial countdown logic + soft paywall after trial ends
- Dashboard page listing past reports (simple table, filter by status)

**Weekend 4 — Ship**
- Chrome Web Store listing: icon, 3-5 screenshots, description targeting "small team bug reporting"
- Polish onboarding (empty states, error messages)
- Launch: Indie Hackers post, relevant subreddit (r/SaaS, r/webdev), Product Hunt if ready
- Give it free to your first 5-10 real users in exchange for feedback before charging anyone

---

## 7. Pricing recommendation

Skip $9/month — undercharging makes the $1-2k target need 125-165 customers, which is a lot of individual sales conversations for a solo builder. Price at **$15-19/month** for up to 8 members, unlimited reports. That drops your target to **~65-100 customers**, which is far more achievable through a handful of good launches (Product Hunt, Indie Hackers, a couple of relevant subreddits) rather than needing sustained, large-scale marketing you don't have time for.

---

## 8. What NOT to build in v1 (avoid scope creep)
- No Jira/Linear/Asana integrations yet — Slack only. Add these only when a paying customer asks.
- No session replay, no video recording — Marker.io already owns that at the high end.
- No custom dashboard analytics — a simple table of reports is enough.
- No team roles/permissions beyond owner/member — not worth the complexity yet.

---

## 9. AppSumo / Lifetime deal — timing and how it fits in

**Do not apply on Weekend 4.** AppSumo requires a stable, fully developed product with existing market validation and active paying customers — it's a month-2/3 move, not a launch-day one. Review itself takes 3-4 weeks. Sequence:

1. Weekend 4: launch normal SaaS pricing ($15/$19 monthly via Paddle), get first 10-30 real paying customers organically.
2. Once you have real testimonials and proof it retains customers (roughly 6-10 weeks in), apply to AppSumo.
3. When approved: generate a batch of unique redemption codes (`RedemptionCode` table, Section 2) — AppSumo requires 500-10,000 unique one-time-use codes per listing.
4. Build a simple `/redeem` page: user signs up (Clerk) → enters code → API checks `RedemptionCode.claimedBy` is null and batch matches → marks `Team.isLifetime = true`, sets `subscriptionStatus: "lifetime"`, links the code.
5. Be deliberate about the lifetime price point — too many one-time lifetime sales too early works against your recurring $1-2k/month target, since LTD buyers pay once, not monthly. Treat AppSumo revenue as a separate lump-sum bucket, not a substitute for MRR growth.
6. Once live on AppSumo, you're required to keep the listing up for at least 120 days, and changing price/features/terms frequently erodes buyer trust — decide your lifetime tiers carefully before submitting, since they're not easy to walk back.

## 10. Landing page — waitlist (validation phase, Section 0)

The landing page includes an email capture form (see `nitpick-landing.html`) used specifically for the Reddit validation step in Section 0, before any code is written. Point every Reddit post/comment to this page. A real email address is a much stronger signal of intent than an upvote — treat signup count (and the words people use to describe their current workaround) as the actual go/no-go gate for Weekend 1.
