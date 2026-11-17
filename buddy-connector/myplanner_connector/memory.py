"""Index My Planner diary entries into Buddy's ChromaDB memory for RAG.

Uses the same DiaryEntry text as the Diary, with stable ids (source:profile:date), so re-indexing a day
replaces it. Works with any object that has a Chroma-style `upsert(ids, documents, metadatas)`.
"""
from __future__ import annotations

from .diary import DiaryEntry


def index_entries(collection, entries: list[DiaryEntry]) -> int:
    if not entries:
        return 0
    collection.upsert(
        ids=[e.key for e in entries],
        documents=[f"{e.title}\n\n{e.body}" for e in entries],
        metadatas=[{"source": e.source, "profile": e.profile, "date": e.date, "type": "diary", "tags": ",".join(e.tags),
                    **{k: v for k, v in e.metrics.items() if isinstance(v, (int, float, str))}} for e in entries],
    )
    return len(entries)


def chroma_collection(path: str | None = None, name: str = "buddy_memory"):
    """Open (or create) Buddy's persistent Chroma collection. Requires `pip install chromadb`."""
    import os
    import chromadb
    client = chromadb.PersistentClient(path=path or os.environ.get("BUDDY_CHROMA_PATH", os.path.expanduser("~/.buddy/chroma")))
    return client.get_or_create_collection(name)
