import type { Route } from "./+types/submission-status";
import { api } from "~/lib/api";
import { getToken } from "~/lib/auth";

export interface JudgeCase {
  test_case_id: number;
  hidden: boolean;
  status: string;
  passed: boolean;
  stderr?: string | null;
  compile_output?: string | null;
}

export interface Submission {
  id: number;
  status: "pending" | "judging" | "passed" | "partial" | "failed" | "error";
  passed_count: number;
  total_count: number;
  score: number;
  judge_output?: { cases?: JudgeCase[]; message?: string } | null;
}

// Loader-only resource route the challenge page polls via useFetcher until the
// submission reaches a terminal status. Kept outside the student layout so
// polling doesn't re-run the profile guard each tick.
export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await getToken(request);
  const submission = await api<Submission>(`/submissions/${params.submissionId}`, { token });
  return { submission };
}
