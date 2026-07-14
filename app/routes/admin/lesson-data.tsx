import type { Route } from "./+types/lesson-data";
import { api } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import type { ApiLesson } from "~/lib/mappers";

// Loader-only: full lesson (incl. markdown content) for the teacher edit dialog.
export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const lesson = await api<ApiLesson>(`/lessons/${params.lessonId}`, { token });
  return { lesson };
}
