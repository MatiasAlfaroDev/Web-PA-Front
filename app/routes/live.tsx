import type { Route } from "./+types/live";
import { getToken } from "~/lib/auth";
import { fetchLiveSession } from "~/lib/live";

// Loader-only resource route polled by the slides view (fast) and by the
// student layout's join banner (slow). Kept outside both layouts so a tick
// never re-runs the profile/role guards.
export async function loader({ request }: Route.LoaderArgs) {
  return { live: await fetchLiveSession(await getToken(request)) };
}
