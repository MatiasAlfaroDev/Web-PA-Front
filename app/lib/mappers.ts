// UI contract types + mapping from the Laravel API's snake_case payloads.
// Challenge unlock status is computed server-side (done | current | locked).

export type ChallengeStatus = "done" | "current" | "locked";

export interface Course {
  id: string;
  initials: string;
  title: string;
  description: string;
  done: number;
  total: number;
  published: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
}

// Published + inside its availability window (or no window set). Teachers
// bypass this entirely server-side; this is only ever computed for students.
export function courseLockState(c: Pick<Course, "published" | "availableFrom" | "availableUntil">): {
  locked: boolean;
  unlocksAt: string | null;
} {
  if (!c.published) return { locked: true, unlocksAt: c.availableFrom };
  const now = Date.now();
  if (c.availableFrom && new Date(c.availableFrom).getTime() > now) {
    return { locked: true, unlocksAt: c.availableFrom };
  }
  if (c.availableUntil && new Date(c.availableUntil).getTime() < now) {
    return { locked: true, unlocksAt: null };
  }
  return { locked: false, unlocksAt: null };
}

export interface Challenge {
  id: string;
  day: number;
  title: string;
  points: number;
  status: ChallengeStatus;
}

export interface CourseDetail extends Course {
  unlockCopy: string;
  challenges: Challenge[];
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  position: number;
}

export interface LessonDetail extends Lesson {
  content: string;
}

export interface ChallengeDetail extends Challenge {
  courseId: string;
  courseTitle: string;
  total: number;
  remaining: number;
  instructions: string;
  hints: string;
  starterCode: string;
  languageId: number;
  filename: string;
  tests: { name: string; hidden: boolean }[];
}

export interface LeaderboardEntry {
  rank: number;
  initials: string;
  name: string;
  streak: number;
  points: number;
  isCurrentUser?: boolean;
}

// Initials from a title: first letter of the first two words.
export function initialsFromTitle(title: string): string {
  const words = title.replace(/[^\p{L}\p{N} ]/gu, "").trim().split(/\s+/);
  return (words.slice(0, 2).map((w) => w[0]).join("") || title.slice(0, 2)).toUpperCase();
}

// Judge0 language id → editor filename.
export function filenameFor(languageId: number): string {
  return languageId === 62 ? "Main.java" : "solution.txt";
}

// --- backend shapes (only the fields we read) ---
export interface ApiCourse {
  id: number;
  title: string;
  description: string | null;
  difficulty?: string;
  challenges_count?: number;
  solved_count?: number;
  lessons_count?: number;
  updated_at?: string;
  challenges?: ApiChallenge[];
  lessons?: ApiLesson[];
  published?: boolean;
  available_from?: string | null;
  available_until?: string | null;
}
export interface ApiLesson {
  id: number;
  course_id: number;
  title: string;
  content?: string;
  position: number;
  published?: boolean;
  available_from?: string | null;
  available_until?: string | null;
  challenges?: ApiChallenge[];
}
export interface ApiChallenge {
  id: number;
  title: string;
  points: number;
  position: number;
  difficulty?: string;
  status?: ChallengeStatus;
  published?: boolean;
  statement?: string;
  starter_code?: string | null;
  language_id?: number;
  course_id?: number;
  my_best_score?: number;
  min_points?: number | null;
  testCases?: { id: number; stdin: string | null; expected_output: string }[];
}
export interface ApiLeaderRow {
  id: number;
  first_name: string;
  last_name: string;
  total_score: number | string;
  streak?: number;
}

// --- teacher: student audit ---
export interface ApiStudentRow {
  id: number;
  first_name: string;
  last_name: string;
  ci: string | null;
  email: string;
  email_verified_at: string | null;
  total_score: number | string;
  challenges_solved: number | string;
}
export interface ApiStudentProgress {
  id: number;
  title: string;
  points: number;
  course_id: number;
  attempts: number | string;
  best_score: number | string;
  solved: number | string;
}
export interface ApiStudentSubmission {
  id: number;
  challenge_id: number;
  code: string;
  status: "pending" | "judging" | "passed" | "partial" | "failed" | "error";
  passed_count: number;
  total_count: number;
  score: number;
  created_at: string;
  challenge: { id: number; title: string };
}
export interface ApiStudentDetail {
  student: { id: number; first_name: string; last_name: string; ci: string | null; email: string };
  progress: ApiStudentProgress[];
  recent_submissions: ApiStudentSubmission[];
}

export function mapCourse(c: ApiCourse): Course {
  return {
    id: String(c.id),
    initials: initialsFromTitle(c.title),
    title: c.title,
    description: c.description ?? "",
    done: c.solved_count ?? 0,
    total: c.challenges_count ?? c.challenges?.length ?? 0,
    published: c.published ?? true,
    availableFrom: c.available_from ?? null,
    availableUntil: c.available_until ?? null,
  };
}

const mapChallenge = (c: ApiChallenge): Challenge => ({
  id: String(c.id),
  day: c.position,
  title: c.title,
  points: c.points,
  status: c.status ?? "current",
});

export function mapLesson(l: ApiLesson): Lesson {
  return { id: String(l.id), title: l.title, position: l.position };
}

export function mapLessonDetail(l: ApiLesson): LessonDetail {
  return { ...mapLesson(l), content: l.content ?? "" };
}

export function mapCourseDetail(c: ApiCourse): CourseDetail {
  const challenges = (c.challenges ?? []).map(mapChallenge);
  return {
    ...mapCourse(c),
    total: challenges.length,
    done: challenges.filter((ch) => ch.status === "done").length,
    unlockCopy: "se desbloquea uno por día al completar el anterior",
    challenges,
    lessons: (c.lessons ?? []).map(mapLesson),
  };
}

export function mapChallengeDetail(
  c: ApiChallenge,
  course: { title: string; challenges?: ApiChallenge[] },
): ChallengeDetail {
  const languageId = c.language_id ?? 62;
  const siblings = course.challenges ?? [];
  const remaining = siblings.filter((s) => s.status !== "done").length;
  const cases = c.testCases ?? [];
  return {
    id: String(c.id),
    day: c.position,
    title: c.title,
    points: c.points,
    status: c.status && c.status !== ("draft" as ChallengeStatus) ? c.status : "current",
    courseId: String(c.course_id),
    courseTitle: course.title,
    total: siblings.length || cases.length,
    remaining,
    instructions: c.statement ?? "",
    // No hints field in the API — surface the visible example cases instead.
    hints: cases.length
      ? "## Casos de ejemplo\n\n" +
        cases.map((t, i) => `Caso ${i + 1}\nEntrada: \`${t.stdin ?? ""}\`\nEsperado: \`${t.expected_output}\``).join("\n\n")
      : "No hay ejemplos disponibles para este desafío.",
    starterCode: c.starter_code ?? "",
    languageId,
    filename: filenameFor(languageId),
    // Pre-run: name the visible sample cases. After a submission the results
    // panel renders the judged cases (incl. hidden) from the submission itself.
    tests: cases.map((_, i) => ({ name: `Caso ${i + 1}`, hidden: false })),
  };
}

export function mapLeaderboard(rows: ApiLeaderRow[], meId?: number): LeaderboardEntry[] {
  return rows.map((r, i) => ({
    rank: i + 1,
    initials: `${r.first_name[0] ?? ""}${r.last_name[0] ?? ""}`.toUpperCase(),
    name: `${r.first_name} ${r.last_name}`.trim(),
    streak: r.streak ?? 0,
    points: Number(r.total_score) || 0,
    isCurrentUser: meId != null && r.id === meId,
  }));
}
