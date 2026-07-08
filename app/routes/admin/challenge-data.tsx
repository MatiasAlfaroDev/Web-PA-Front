import type { Route } from "./+types/challenge-data";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import type { ApiChallenge } from "~/lib/mappers";

// Loader-only: the teacher challenge view (includes statement + starter code +
// hidden test cases). Loaded on demand when opening the edit dialog.
export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const challenge = await api<ApiChallenge>(`/teacher/challenges/${params.challengeId}`, { token });
  return { challenge };
}
