# My Planner — Play Store launch kit

Live app: https://vickyjain98-cloud.github.io/my-planner/
Privacy policy: https://vickyjain98-cloud.github.io/my-planner/privacy.html
Terms of use: https://vickyjain98-cloud.github.io/my-planner/terms.html

## Store listing (draft)

**App name (30):** My Planner: Daily & Study

**Short description (80):** Private planner for study, habits, journal & reminders — saved in your own Drive.

**Full description:**
My Planner is a calm, beautiful daily planner that keeps your life in one place — and keeps it private. Everything you write is saved in your own Google Drive. No ads, no tracking, no analytics.

PLAN YOUR DAY
• Today view as a summary, detailed day sheet, 24-hour day clock or journal spread
• Add / schedule: reminders, tasks, habits, study sessions, events, birthdays — with priority, reminders and repeats (daily, weekdays, weekends, chosen days, fortnightly, monthly, yearly)
• Timetable for weekdays and weekends, month and year planner
• To-dos in the Eisenhower matrix plus the 1-3-5 rule

BUILD HABITS
• Habit tracker with 100% days, efficiency and winning streaks
• Study blocks with a focus timer and study-music links

MIND & WELLBEING
• Journal in 13 trending formats — gratitude, morning pages, CBT thought record, shadow work, scripting and more
• Daily affirmations and 3-6-9 manifestation practice
• Morning and evening mood check-in with Year in Pixels
• Purnima and Amavasya dates (Hindu calendar) and 11:11 portal days

MADE FOR PEN AND TABLET
• Write with the S Pen or any stylus: six pen types, colours, palm rejection — or switch to typing

YOURS, EVERYWHERE
• Syncs between phone, tablet and laptop through your own Google Drive
• Works offline
• Send only the items you choose to Google Calendar
• Printable pages, backup and CSV export

**Category:** Productivity · **Tags:** planner, habit tracker, study planner, journal
**Contact email:** vickyjain98@gmail.com · **Website:** the live app link

## Data safety form (answers)
- Does the app collect or share user data? **No data is collected by the developer** (data is processed on device and stored in the user's own Google Drive; nothing is sent to the developer's servers — there are none).
- Is data encrypted in transit? **Yes** (HTTPS to Google only).
- Can users request deletion? **Yes** — in-app Settings → Delete all my data; or revoke access at myaccount.google.com/permissions.
- Ads: **No.** Target audience: **18+ (or 13+ with guidance)** — choose 18+ to avoid the Families policy.
- Note: the Suggestions email is sent by the user from their own email app (user-initiated), not collected by the app.

## Graphics needed
- App icon 512×512 (have: icons/icon-512.png)
- Feature graphic 1024×500
- At least 2 phone screenshots (1080×1920 suggested) — Today, Add / schedule, Habits dashboard, Journal, To-Do matrix
- 7" and 10" tablet screenshots (recommended, S Pen writing)

## Launch steps
1. **Google Play developer account** — play.google.com/console, personal account, US$25 one-time, identity verification (a few days).
2. **Google OAuth: publish & verify** — Google Cloud console → Google Auth Platform:
   - Branding: app name, logo, support email, home page = live app link, privacy policy and terms links above.
   - Verify ownership of the home-page domain in Google Search Console (HTML-file method works for a github.io user site; a custom domain such as myplanner.in is simpler and looks more professional).
   - Audience → Publish app (moves out of Testing). The Calendar scope is *sensitive* → submit for verification with a short demo video; drive.file is non-sensitive. Until verified, users see an "unverified app" screen and there is a 100-user cap.
3. **Package as an Android app** — pwabuilder.com → enter the live link → Package for stores → Android (Trusted Web Activity). Package ID e.g. `com.vickyjain.myplanner`. Download the .aab plus the signing key (keep the key and its passwords safe — losing it means you cannot update the app).
4. **Digital Asset Links** — PWABuilder gives an `assetlinks.json`. It must be served at `https://<domain>/.well-known/assetlinks.json` (domain root). For github.io this needs a repo named `vickyjain98-cloud.github.io`; with a custom domain, put it in the site root. Without it the app shows a browser address bar.
5. **Closed test** — Play Console → Testing → Closed testing → upload the .aab, add at least **12 testers** (Gmail list) who keep it installed for **14 days**.
6. **Production** — apply for production access, complete the listing, content rating questionnaire, data safety form (above), then roll out.
7. **Later — Premium (freemium)** — Play Billing via the Digital Goods API in the TWA; decide what is free vs Premium before step 6 so the listing is accurate.
