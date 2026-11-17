"""Command line: myplanner <command> [--profile NAME]"""
from __future__ import annotations

import argparse
import json
import sys

from .config import Settings


def main(argv=None):
    p = argparse.ArgumentParser(prog="myplanner", description="Buddy OS ↔ My Planner connector")
    p.add_argument("--profile", default=None, help="whose planner (e.g. vicky, harshita); each has its own sign-in")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("login", help="sign Buddy in to this person's Google account (drive.file only)")
    sub.add_parser("logout", help="forget this profile's sign-in on this machine")
    sub.add_parser("status", help="is the planner connected, what is shared, suggestion counts")
    b = sub.add_parser("briefing", help="plain-text summary for Buddy"); b.add_argument("--days", type=int, default=7)
    sub.add_parser("insights", help="suggestion ideas (sends nothing)")
    d = sub.add_parser("diary", help="write diary entries to Buddy's Diary"); d.add_argument("--days", type=int, default=7)
    r = sub.add_parser("run", help="Diary + Memory + insights in one go"); r.add_argument("--days", type=int, default=7)
    r.add_argument("--propose", action="store_true", help="also send the ideas to the planner for approval")
    r.add_argument("--memory", action="store_true", help="also index into Buddy's ChromaDB")
    s = sub.add_parser("suggest", help="propose one item for approval in the app")
    s.add_argument("kind"); s.add_argument("title"); s.add_argument("--why", required=True)
    for opt in ("date", "time", "end", "priority"):
        s.add_argument("--" + opt)
    sub.add_parser("suggestions", help="list Buddy's suggestions and their status")
    w = sub.add_parser("withdraw", help="take back an undecided suggestion"); w.add_argument("id")
    q = sub.add_parser("queue", help="(buddy gate mode) approve or reject a queued suggestion"); q.add_argument("action", choices=["approve", "reject"]); q.add_argument("id")
    a = p.parse_args(argv)
    st = Settings.from_env(a.profile)

    if a.cmd == "login":
        from .auth import login
        login(st); print(f"Signed in for profile '{st.profile}'. Next: myplanner --profile {st.profile} status"); return 0
    if a.cmd == "logout":
        from .auth import logout
        print("Signed out." if logout(st) else "Was not signed in."); return 0

    from .client import PlannerClient, PlannerNotConnected
    try:
        c = PlannerClient.from_settings(st)
        if a.cmd == "status":
            out = c.status()
        elif a.cmd == "briefing":
            from .insights import context_text
            print(context_text(c.feed(), days=a.days)); return 0
        elif a.cmd == "insights":
            from .insights import candidates
            out = [x.model_dump(exclude_none=True) for x in candidates(c.feed())]
        elif a.cmd == "diary":
            from .diary import build_entries, sink_from_env
            out = {"written": sink_from_env().upsert(build_entries(c.feed(), st.profile, days=a.days))}
        elif a.cmd == "run":
            from .diary import sink_from_env
            from .pipeline import run
            col = None
            if a.memory:
                from .memory import chroma_collection
                col = chroma_collection()
            out = run(c, st.profile, sink=sink_from_env(), collection=col, days=a.days, propose=a.propose)
        elif a.cmd == "suggest":
            out = c.propose([{"kind": a.kind, "title": a.title, "why": a.why, "date": a.date, "time": a.time, "end": a.end, "priority": a.priority}])
        elif a.cmd == "suggestions":
            out = c.suggestions()
        elif a.cmd == "withdraw":
            out = {"withdrawn": c.withdraw(a.id)}
        elif a.cmd == "queue":
            from .gate import QueueGate
            if not isinstance(c.gate, QueueGate):
                print("Queue is used only when MYPLANNER_GATE=buddy."); return 1
            ok = c.gate.approve(a.id) if a.action == "approve" else c.gate.reject(a.id)
            out = {"ok": ok, "sent": c.propose([])["sent"] if ok and a.action == "approve" else []}
    except PlannerNotConnected as e:
        print(e, file=sys.stderr); return 2
    print(json.dumps(out, indent=2, ensure_ascii=False, default=str))
    return 0


if __name__ == "__main__":
    sys.exit(main())
