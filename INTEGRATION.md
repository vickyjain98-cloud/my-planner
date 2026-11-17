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
               "share", "links": { "buddy": { "on", "cats": {habits,study,tasks,events,mood,journal}, "inbox" } } },
  "days":   { "YYYY-MM-DD": { "u", "h": {habitId: "d"|"p"|"m"}, "study": {rowId: true}, "focus", "phone",
                              "mood": { "am": {"w","s"}, "pm": {"w","s"} }, "note", "sleep", "water", "energy", "sits": {m,a,n} } },
  "tasks":  { id: { "u","t","due","done","b": "big"|"med"|"small"|"", "urg","imp" } },
  "events": { id: { "u","d","time","t" } },  "dates": { id: { "u","n","rel","type","md":"MM-DD" } },
  "weeks":  { "YYYY-MM-DD(Monday)": { "u","goal","worked","change" } },
  "typed":  { key: { "u","l": [lines] } },  "sent": { key: { "u","id" } },  "inbox": { id: { "u","kind","title","date","time","why","status" } } }
```

## 3. Buddy OS → reading (`buddy-feed.json`)
```
{ "schema": "my-planner-feed", "schemaVersion": 1, "generatedAt": ISO, "categories": [...],
  "data": { "name", "habits": {list, days:[{date,pct,marks}], streak}, "study": [{date,hours,focus}],
            "tasks": [{id,title,due,urgent,important,size,done}], "events": [...], "specialDates": [...],
            "mood": [...] (only if allowed), "journal": [...] (typed text only, only if allowed),
            "inboxDecisions": [{id,status}] } }
```
The feed is rewritten on each sync while the connection is on, and deleted when it is switched off.

## 4. Buddy OS → suggesting (`buddy-inbox.json`)
Buddy creates or updates this file in the **My Planner** folder:
```
{ "items": [ { "id": "unique-id", "kind": "task"|"event"|"habit"|"affirmation"|"note",
               "title": "Revise Unit 2", "date": "2026-11-20", "time": "16:00", "why": "You marked Unit 2 as weak" } ] }
```
- Up to 100 items are read; text is trimmed and always shown as plain text (never run as code).
- Each item appears once on Today under **Suggestions from Buddy** with **Approve / Dismiss**.
- Decisions come back to Buddy through `inboxDecisions` in the feed. This is the human approval gate.

## 5. In-app hooks for future modules
- `MP.bus.on(event, fn)`: events such as `day.updated`, `tasks.saved`, `tasks.deleted`, `events.saved`, `inbox.approved`.
- `MP.registerConnector({ id, name, categories, … })`: registry for future connectors.
- `MP.api`: read-only helpers (`feed()`, `dayPct`, `studyHours`, `streak`, `tasks`, `version`, `schemaVersion`).

## 6. Rules every future connection must follow
1. Off by default; the person switches it on and sees exactly which categories it can read.
2. Mood and journal are never shared unless the person ticks them.
3. Nothing is added, sent or changed outside the app without the person's approval.
4. Least-privilege Google permissions; no new servers holding personal data.
