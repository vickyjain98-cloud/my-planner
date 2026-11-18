# My Planner — Integration guide (for Buddy OS and future apps)

My Planner is built to connect to other apps without ever giving up the owner's control.
Everything below is **opt-in per person**, and anything that changes the planner needs the person's **approval**.

## 1. Where the data lives
Each person's data is in their own Google Drive, in a folder called **My Planner**:

| File | What it holds |
| --- | --- |
| `planner.json` | Profile, timetable, habits, days (habits, study, mood, wellness), tasks, events, special dates, week goals, typed writing, Calendar links, inbox decisions |
| `ink-YYYY-MM.json` | Handwriting (S Pen strokes) for that month |
| `buddy-feed.json` | Only when Buddy OS is connected: a read-only feed of the categories the person allowed |
| `buddy-inbox.json` | Written **by Buddy OS**: suggestions shown to the person for approval |
| Progress summary (Google Doc) | Only when family sharing is on |

The app uses the `drive.file` permission, so it can only see files it created. **Buddy OS must use the same Google Cloud project (OAuth client)** as My Planner to read and write these files without asking for access to the whole Drive.

## 2. Data format (`planner.json`, schemaVersion 1)
Every record carries `u` (updated-at, epoch ms). Sync merges record by record: the newer `u` wins. A deleted record becomes `{ "del": 1, "u": … }` (a tombstone) so deletions sync too.

```
{ "v": 1,
  "profile": { "u", "name", "theme", "timetable": [{ "id","start":"HH:MM","end":"HH:MM","text","type" }],
               "weekend": null | [...], "habits": [{ "id","name","def","active" }], "collections", "mine", "practice",
               "share", "links": { "buddy": { "on", "cats": {habits,study,tasks,events,mood,journal}, "inbox", "auto", "ring" } } },
  "days":   { "YYYY-MM-DD": { "u", "h": {habitId: "d"|"p"|"m"}, "study": {rowId: true}, "focus", "phone",
                              "mood": { "am": {"w","s"}, "pm": {"w","s"} }, "note", "sleep", "water", "energy", "sits": {m,a,n} } },
  "tasks":  { id: { "u","t","due","done","b": "big"|"med"|"small"|"", "urg","imp" } },
  "events": { id: { "u","d","time","t" } },  "dates": { id: { "u","n","rel","type","md":"MM-DD" } },
  "weeks":  { "YYYY-MM-DD(Monday)": { "u","goal","worked","change" } },
  "typed":  { key: { "u","l": [lines] } },  "sent": { key: { "u","id" } },  "inbox": { id: { "u","kind","title","date","time","why","status" } } }
```

## 3. Buddy OS → reading (`buddy-feed.json`)
```
{ "schema": "my-planner-feed", "schemaVersion": 1, "appVersion", "timeZone", "generatedAt": ISO, "categories": [...],
  "data": { "name", "habits": {list, days:[{date,pct,marks}], streak}, "study": [{date,hours,focus}],
            "tasks": [{id,title,due,urgent,important,size,done}],
            "studyPlan": {weekday:[{id,start,end,text}], weekend},
            "events": [{id,title,kind,date,time,end,priority,reminderMin,repeat:{rule,days,ends,until,count,text}}],
            "upcoming": [{id,date,time,end,title,kind,priority}] (next 14 days, repeats expanded), "specialDates": [...],
            "mood": [...] (only if allowed), "journal": [...] (typed text only, only if allowed),
            "inboxDecisions": [{id,status}] } }
```
The feed is rewritten on each sync while the connection is on, and deleted when it is switched off.

## 4. Buddy OS → suggesting (`buddy-inbox.json`)
Buddy creates or updates this file in the **My Planner** folder:
```
{ "items": [ { "id": "unique-id", "kind": "task"|"event"|"reminder"|"study"|"habit"|"affirmation"|"note"|"mood"|"journal",
               "title": "Revise Unit 2", "date": "2026-11-20", "time": "16:00", "end": "17:00",
               "priority": "low"|"med"|"high"|"urgent", "why": "You marked Unit 2 as weak",
               "by": "owner"|"buddy", "note": "full journal text (journal only, up to 4000 chars)" } ],
  "withdrawn": ["id-of-an-undecided-item"] }
```
- Up to 100 items are read; text is trimmed and always shown as plain text (never run as code).
- Each item appears once on Today under **Suggestions from Buddy** with **Approve / Dismiss**.
- Decisions come back to Buddy through `inboxDecisions` in the feed (`approved`, `dismissed`, `withdrawn`). This is the human approval gate.
- Ids listed in `withdrawn` are taken back if the person hasn't decided yet.
- **`"by": "owner"`** means the person said it to Buddy themselves. While Settings → Connections → Buddy OS →
  **"Add what I tell Buddy without asking"** is on (the default, since 1.10), these items are added straight
  away, never shown for approval, and reported back as `approved`. The feed then carries
  `"autoAddFromBuddy": true` in `data`. `"by": "buddy"` (or no `by`) always waits for Approve / Dismiss.
- `mood`: `title` is 1–5; it fills an empty mood for that day (morning before 3 pm, evening after) and never
  overwrites one the person set. `journal`: `note` (or `title`) is added after that day's free-write journal lines.
- Records added from the inbox get the id `bd-<inbox id>`, so two devices adding the same item end up with one.
- The inbox is read on open, when the app comes back into view, and every minute while it's open.
- **"Let Buddy ring my reminders"** (off by default) silences this app's own in-app alerts, because Buddy rings them.

The ready-made Buddy-side client (feed, approval inbox, Diary entries, ChromaDB memory, LangGraph tools, FastAPI router) is in `buddy-connector/` — see its README.

## 5. In-app hooks for future modules
- `MP.bus.on(event, fn)`: events such as `day.updated`, `tasks.saved`, `tasks.deleted`, `events.saved`, `inbox.approved`.
- `MP.registerConnector({ id, name, categories, … })`: registry for future connectors.
- `MP.api`: read-only helpers (`feed()`, `dayPct`, `studyHours`, `streak`, `tasks`, `version`, `schemaVersion`).

## 6. Rules every future connection must follow
1. Off by default; the person switches it on and sees exactly which categories it can read.
2. Mood and journal are never shared unless the person ticks them.
3. Nothing is added, sent or changed outside the app without the person's approval.
4. Least-privilege Google permissions; no new servers holding personal data.
