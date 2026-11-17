"""Rule-based suggestion candidates from the feed.

Deliberately simple and explainable: each candidate says *why*. Buddy's LLM can rephrase or rank them
before proposing; nothing here writes anywhere.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
from statistics import mean

from .models import Feed, Suggestion


def _hm_minutes(hm: str | None) -> int:
    if not hm:
        return 0
    h, m = hm.split(":")
    return int(h) * 60 + int(m)


def planned_study_hours(feed: Feed, weekend: bool = False) -> float:
    plan = (feed.data.get("studyPlan") or {})
    rows = (plan.get("weekend") if weekend and plan.get("weekend") is not None else plan.get("weekday")) or []
    return sum(max(0, _hm_minutes(r.get("end")) - _hm_minutes(r.get("start"))) for r in rows if r.get("end")) / 60


def candidates(feed: Feed, today: date | None = None, limit: int = 5) -> list[Suggestion]:
    t = today or date.today()
    tomorrow = (t + timedelta(days=1)).isoformat()
    out: list[Suggestion] = []

    # 1. Study below plan over the last 7 days → protect tomorrow's first block
    if feed.allowed("study"):
        last7 = [s for s in feed.data.get("study", []) if s.get("date", "") >= (t - timedelta(days=7)).isoformat()]
        plan = planned_study_hours(feed)
        done = sum(s.get("hours", 0) for s in last7) / 7
        rows = (feed.data.get("studyPlan") or {}).get("weekday") or []
        if plan and done < 0.7 * plan and rows:
            first = sorted(rows, key=lambda r: r.get("start") or "99")[0]
            out.append(Suggestion(kind="study", title=f"Protect study time: {first.get('text') or 'Study block'}", date=tomorrow,
                                  time=first.get("start"), end=first.get("end"), priority="high",
                                  why=f"Last 7 days averaged {done:.1f} h a day against a plan of {plan:.1f} h."))
        focus = [s["focus"] for s in last7 if s.get("focus")]
        if len(focus) >= 3 and mean(focus) <= 2.5:
            out.append(Suggestion(kind="note", title="Try shorter focus rounds (15 min) with the phone in another room",
                                  why=f"Average focus score this week is {mean(focus):.1f} out of 5."))

    # 2. Weakest habit over 14 days → a gentle reminder tomorrow morning
    if feed.allowed("habits"):
        h = feed.data.get("habits") or {}
        days = [d for d in h.get("days", []) if d.get("date", "") >= (t - timedelta(days=14)).isoformat()]
        if len(days) >= 5:
            rate = {}
            for hb in h.get("list", []):
                marks = [d.get("marks", {}).get(hb["id"]) for d in days]
                rate[hb["name"]] = sum(1 if m == "d" else 0.5 if m == "p" else 0 for m in marks) / len(days)
            if rate:
                name, r = min(rate.items(), key=lambda x: x[1])
                if r < 0.5:
                    out.append(Suggestion(kind="reminder", title=f"{name} — small start today", date=tomorrow, time="08:00", priority="med",
                                          why=f"{name} was done {round(r * 100)}% of days in the last two weeks."))

    # 3. Overdue to-dos → one evening catch-up reminder
    if feed.allowed("tasks"):
        overdue = [x for x in feed.data.get("tasks", []) if not x.get("done") and x.get("due") and x["due"] < t.isoformat()]
        if overdue:
            first = sorted(overdue, key=lambda x: x["due"])[0]
            more = f" (+{len(overdue) - 1} more)" if len(overdue) > 1 else ""
            out.append(Suggestion(kind="reminder", title=f"Catch up: {first['title']}{more}", date=t.isoformat(), time="18:00",
                                  priority="high" if first.get("urgent") else "med", why=f"Due {first['due']} and not ticked yet."))

    # 4. Birthday / anniversary within a week → reminder the day before
    if feed.allowed("events"):
        for sd in feed.data.get("specialDates", []):
            try:
                md = datetime.strptime(f"{t.year}-{sd['monthDay']}", "%Y-%m-%d").date()
            except (KeyError, ValueError):
                continue
            if md < t:
                md = md.replace(year=t.year + 1)
            if 1 <= (md - t).days <= 7:
                out.append(Suggestion(kind="reminder", title=f"{sd['type']} tomorrow: {sd['name']} — gift or call", date=(md - timedelta(days=1)).isoformat(),
                                      time="19:00", priority="med", why=f"{sd['name']}'s {sd['type'].lower()} is on {md.strftime('%d %b')}."))

    # 5. A busy day ahead (4+ timed items) → plan the evening before
    if feed.allowed("events"):
        by_day: dict[str, int] = {}
        for u in feed.data.get("upcoming", []):
            if u.get("time"):
                by_day[u["date"]] = by_day.get(u["date"], 0) + 1
        for d, n in sorted(by_day.items()):
            if n >= 4 and d > t.isoformat():
                prev = (date.fromisoformat(d) - timedelta(days=1)).isoformat()
                out.append(Suggestion(kind="reminder", title=f"Plan for a busy {date.fromisoformat(d).strftime('%A')}", date=prev, time="20:00",
                                      priority="low", why=f"{n} timed items are scheduled on {d}."))
                break

    return [s.with_id() for s in out][:limit]


def context_text(feed: Feed, days: int = 7, today: date | None = None) -> str:
    """A compact plain-text briefing for Buddy's LLM prompt (only the shared categories)."""
    t = today or date.today()
    since = (t - timedelta(days=days)).isoformat()
    lines = [f"My Planner briefing for {feed.name} (shared: {', '.join(feed.categories) or 'nothing'})."]
    if feed.allowed("habits"):
        h = feed.data.get("habits") or {}
        ds = [d for d in h.get("days", []) if d["date"] >= since]
        if ds:
            lines.append(f"Habits: average {round(mean(d['pct'] for d in ds) * 100)}% over {len(ds)} days; winning streak {h.get('streak', 0)} days.")
    if feed.allowed("study"):
        ss = [s for s in feed.data.get("study", []) if s["date"] >= since]
        lines.append(f"Study: {sum(s['hours'] for s in ss):.1f} h in the last {days} days; plan {planned_study_hours(feed):.1f} h per weekday.")
    if feed.allowed("tasks"):
        open_ = [x for x in feed.data.get("tasks", []) if not x.get("done")]
        lines.append(f"To-dos: {len(open_)} open, {sum(1 for x in open_ if x.get('urgent') and x.get('important'))} urgent and important.")
    if feed.allowed("events"):
        up = feed.data.get("upcoming", [])[:8]
        if up:
            lines.append("Next items: " + "; ".join(f"{u['date']} {u.get('time') or 'all day'} {u['title']} [{u.get('priority') or '-'}]" for u in up))
    if feed.allowed("mood"):
        mo = [m for m in feed.data.get("mood", []) if m["date"] >= since]
        if mo:
            words = [x["w"] for m in mo for x in (m.get("am"), m.get("pm")) if x and x.get("w")]
            lines.append("Mood words this week: " + ", ".join(words[-10:]))
    return "\n".join(lines)
