import { useEffect } from "react";
import { useFetcher } from "react-router";
import type { LiveSession } from "~/lib/live";

// Polls /app/live on an interval and hands back the current session, seeded
// with whatever the page's loader already knew so the first paint is correct.
// Fast interval on the slides view (the slide number has to feel immediate),
// slow one for the layout banner (it only has to notice a session starting).
export function useLiveSession(
  initial: LiveSession | null,
  intervalMs: number,
): LiveSession | null {
  const poll = useFetcher<{ live: LiveSession | null }>();

  useEffect(() => {
    if (poll.state !== "idle") return;
    const id = setTimeout(() => poll.load("/app/live"), intervalMs);
    return () => clearTimeout(id);
    // Re-armed after every settled request, which keeps exactly one timer alive.
  }, [poll, intervalMs]);

  return poll.data ? poll.data.live : initial;
}
