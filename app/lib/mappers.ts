// UI contract types + mapping from the Laravel API's snake_case payloads.
// Backend courses have no course-level difficulty/publish; the API computes a
// course difficulty from its challenges. Challenge unlock status is computed
// server-side (done | current | locked).

export type Difficulty = "Principiante" | "Intermedio" | "Avanzado";
export type ChallengeStatus = "done" | "current" | "locked";

export interface Course {
  id: string;
  initials: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  done: number;
  total: number;
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

const DIFFICULTY: Record<string, Difficulty> = {
  easy: "Principiante",
  medium: "Intermedio",
  hard: "Avanzado",
};

export const mapDifficulty = (d?: string): Difficulty => DIFFICULTY[d ?? "easy"] ?? "Principiante";

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
  testCases?: { id: number; stdin: string | null; expected_output: string }[];
}
export interface ApiLeaderRow {
  id: number;
  first_name: string;
  last_name: string;
  total_score: number | string;
  streak?: number;
}

export function mapCourse(c: ApiCourse): Course {
  return {
    id: String(c.id),
    initials: initialsFromTitle(c.title),
    title: c.title,
    description: c.description ?? "",
    difficulty: mapDifficulty(c.difficulty),
    done: c.solved_count ?? 0,
    total: c.challenges_count ?? c.challenges?.length ?? 0,
  };
}

const mapChallenge = (c: ApiChallenge): Challenge => ({
  id: String(c.id),
  day: c.position,
  title: c.title,
  points: c.points,
  status: c.status ?? "current",
});

export function mapCourseDetail(c: ApiCourse): CourseDetail {
  const challenges = (c.challenges ?? []).map(mapChallenge);
  return {
    ...mapCourse(c),
    total: challenges.length,
    done: challenges.filter((ch) => ch.status === "done").length,
    unlockCopy: "se desbloquea uno por día al completar el anterior",
    challenges,
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
