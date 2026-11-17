# My Planner

A private, installable planner for phone, tablet and laptop: timetable, habits with streaks and dashboards,
study blocks with a focus timer, Eisenhower to-do matrix + 1-3-5, journal (13 formats), affirmations and 3-6-9
with S Pen handwriting or typing, mood with Year in Pixels, Hindu-calendar Purnima/Amavasya, portal days,
birthdays and anniversaries, printable pages, optional Google Calendar sending, and an approval-gated
connection to Buddy OS.

**Privacy and security by design**
- Each person's data is stored only in their own Google Drive (`My Planner` folder). There is no app server.
- Google permission `drive.file`: the app can only see files it created. Calendar permission is asked for only when you first tap "Send to Calendar".
- Sign-in tokens are kept in memory only, never written to disk. Sign-out can remove the device copy.
- Strict Content-Security-Policy: only this site and Google sign-in/APIs can run or be contacted. Fonts are self-hosted. No ads, analytics or trackers.
- All text you type is escaped before display; backups and Buddy inbox files are validated before use.
- Family summary and Buddy OS connection are off by default, show exactly what is shared, and can be switched off at any time.
- "Delete all my data" removes the Drive folder and the device copy.

Setup: see the setup guide. The only file you edit is `config.js`.
Integration with Buddy OS and other apps: see `INTEGRATION.md`.
