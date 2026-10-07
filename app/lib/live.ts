// The live slide session: one teacher drives, every student's deck follows.
// There is no socket in this stack — the frontend polls GET /presentation,
// which is a single tiny row, so a classroom of thirty costs about ten requests
// a second at worst. That is cheap enough to not justify a broadcast server.

import { api } from "./api";

export interface ApiPresentation {
  lesson_id: number | null;
  lesson_title?: string;
  course_id?: number;
  slide?: number;
  total?: number;
  updated_at?: string;
}

export interface LiveSession {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  slide: number;
  total: number;
}

export function mapLive(p: ApiPresentation): LiveSession | null {
  if (p.lesson_id == null) return null;
  return {
    lessonId: String(p.lesson_id),
    lessonTitle: p.lesson_title ?? "Clase en vivo",
    courseId: String(p.course_id ?? ""),
    slide: p.slide ?? 0,
    total: p.total ?? 1,
  };
}

// Fail-open, same as the site lock: a backend without this endpoint deployed
// should mean "nobody is presenting", not a 404 on every page.
export async function fetchLiveSession(token: string | null): Promise<LiveSession | null> {
  try {
    return mapLive(await api<ApiPresentation>("/presentation", { token }));
  } catch {
    return null;
  }
}
