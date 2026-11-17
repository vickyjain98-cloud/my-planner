# My Planner connector for Buddy OS

This connector links each person's **My Planner** to **Buddy OS**. It lets Buddy:

- **Read** the planner summary the person chose to share.
- **Write Buddy's Diary**: one entry a day for each person.
- **Feed Buddy's memory** (ChromaDB / RAG) with the same entries, so Diary and memory never disagree.
- **Give Buddy's agent tools** (LangGraph / LangChain) and **FastAPI endpoints**.
- **Suggest** reminders, tasks, study sessions, events, habits and affirmations. Each suggestion still has to be approved in the planner.

Buddy's non-negotiable rule, a human approval gate, holds throughout:

- Buddy never changes the planner directly.
- A suggestion only appears on the person's Today screen. Nothing is added until they tap **Approve**.
- With `MYPLANNER_GATE=buddy`, a suggestion must also be approved in Buddy before it is sent.

```
My Planner app ──(buddy-feed.json: only ticked categories)──▶ connector ──▶ Diary  (one entry per day)
     ▲                                                             │──────▶ Memory (ChromaDB, same text)
     │                                                             │──────▶ Agent tools / FastAPI
     └──(buddy-inbox.json: suggestions)──── approval gate ◀────────┘
     Approve / Dismiss on Today ──▶ decisions return in the feed ──▶ Buddy's ledger
```

## What the person shares

| Planner category (ticked in Settings) | Used for |
|---|---|
| Habits | Diary (done / partly / missed, %), streak, weakest-habit idea |
| Study | Diary (hours, blocks, focus), study plan vs actual, protect-study-time idea |
| To-dos | Diary (due / finished), overdue catch-up idea |
| Events & dates | Diary (schedule), upcoming list, birthday and busy-day ideas |
| Mood & sleep | Diary (only if ticked) |
| Journal (typed) | Diary (only if ticked; handwriting is never shared) |

## Setup (one time)

1. **Install the connector into Buddy's environment.** Use `pip install -e ".[all]"`. For only the parts you need, use `pip install -e ".[api,tools]"` and add `memory` for ChromaDB.

2. **Create a sign-in client for Buddy in the *same* Google Cloud project as My Planner.**
   - Go to Google Cloud console → project **My Planner** → Google Auth Platform → Clients → **Create client** → type **Desktop app**. Download the JSON.
   - It must be the same project. Both apps use the `drive.file` permission, which only lets an app see files created by apps in its own project. This keeps Buddy away from the rest of the person's Drive.
   - Each person Buddy reads for must be on the project's **Test users** list. Family members already are.

3. **Sign Buddy in once per person.**
   ```bash
   export MYPLANNER_CLIENT_SECRET=~/secrets/myplanner-desktop.json
   myplanner --profile vicky login        # opens the browser; sign in as Vicky
   myplanner --profile harshita login     # only with Harshita's consent, signing in as her
   ```
   - Tokens are stored per profile in `~/.buddy/myplanner/` and only the owner can read them.
   - Set `BUDDY_TOKEN_KEY` to a Fernet key to also encrypt the tokens.
   - `myplanner --profile X logout` removes a token. The person can also revoke access at myaccount.google.com/permissions.

4. **In the person's My Planner:** go to Settings → Connections → **Buddy OS**, tick the categories to share, then sync (the status pill).

5. **Check the link.**
   ```bash
   myplanner --profile vicky status
   ```
   It should show `"connected": true` and the categories.

## Wiring into Buddy OS

### Buddy's Diary

The connector builds one diary entry per day and upserts it by `my-planner:<profile>:<date>`, so re-runs update entries instead of duplicating them. Choose where the entries go:

| Setting | Diary destination |
|---|---|
| `BUDDY_DIARY_URL=http://localhost:8000/diary/entries` | POST to Buddy's own diary endpoint (localhost only, unless explicitly allowed) |
| `BUDDY_DB_PATH=/path/buddy.db` | A `diary_entries` table in Buddy's SQLite database |
| *(neither)* | Markdown files in `~/.buddy/diary/my-planner/<profile>/YYYY-MM-DD.md` |

Each entry has these fields:

| Field | Contents |
|---|---|
| `date`, `profile`, `title`, `source = "my-planner"` | Identifies the entry |
| `body` | Markdown sections: Habits, Study, To-dos due, Schedule, Mood, Journal |
| `tags` | Short labels for the entry |
| `metrics` | `habitsPct`, `studyHours` |
| `key` | `my-planner:<profile>:<date>` |

### Memory (RAG)

```python
from myplanner_connector.memory import chroma_collection, index_entries
```

Entries go into Buddy's collection (default `buddy_memory`). Each has `metadata.type = "diary"`, `source = "my-planner"`, plus `profile` and `date`, so retrieval can filter by person.

### Scheduler

Run the daily job every evening (e.g. 21:00 IST) and at start-up:

```python
from myplanner_connector import PlannerClient
from myplanner_connector.config import Settings
from myplanner_connector.diary import sink_from_env
from myplanner_connector.memory import chroma_collection
from myplanner_connector import pipeline

for profile in ["vicky", "harshita"]:
    c = PlannerClient.from_settings(Settings.from_env(profile))
    pipeline.run(c, profile, sink=sink_from_env(), collection=chroma_collection(), propose=False)
```

`propose=True` also sends the rule-based ideas for approval. Keep it `False` until you've reviewed what the ideas look like:

```bash
myplanner --profile vicky insights
```

### Agent (LangGraph)

```python
from myplanner_connector.tools import make_tools
tools = make_tools(lambda: PlannerClient.from_settings(Settings.from_env("vicky")))
```

This gives five tools: `planner_briefing`, `planner_upcoming`, `planner_suggestion_ideas`, `planner_propose`, `planner_suggestion_status`. `planner_propose` only proposes.

### FastAPI

```python
from myplanner_connector.api import make_router
app.include_router(make_router(lambda p: PlannerClient.from_settings(Settings.from_env(p)),
                               get_sink=sink_from_env, get_collection=chroma_collection), prefix="/planner")
```

| Endpoint | Purpose |
|---|---|
| `GET /planner/{profile}/status` | Is the planner connected, and what is shared |
| `GET /planner/{profile}/briefing` | Plain-text summary for Buddy |
| `GET /planner/{profile}/upcoming` | Upcoming schedule |
| `GET /planner/{profile}/diary` | Diary entries |
| `GET /planner/{profile}/insights` | Suggestion ideas (sends nothing) |
| `GET /planner/{profile}/suggestions` | Buddy's suggestions and their status |
| `POST /planner/{profile}/suggestions` | Propose suggestions for approval |
| `DELETE /planner/{profile}/suggestions/{id}` | Withdraw a suggestion the person hasn't decided on |
| `POST /planner/{profile}/run` | Diary + memory + insights in one go |

## Privacy rules built in

- Only categories the person ticked are read. Mood and journal are off unless they tick them.
- The connector stores **no copy of the planner**. Its local ledger keeps only Buddy's own suggestion text and statuses.
- Least-privilege Google permission (`drive.file`). Tokens are private to the machine, with optional encryption.
- The diary endpoint must be on the same machine unless explicitly allowed.
- Switching Buddy off in the planner deletes the feed file immediately. The connector then reports "not connected".

## Development

Tests use a fake Google Drive, with a real feed captured from the app:

```bash
pip install -e ".[dev]"
pytest -q
```
