// Mock data for the UI. Loaders return this today; swap each getter for an
// `api()` call once the backend exists. Shapes here are the contract the UI
// expects, so the swap is source-only.

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type ChallengeStatus = "done" | "current" | "locked";
export type CourseStatus = "Published" | "Draft";

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

export interface ChallengeDetail extends Challenge {
  courseId: string;
  courseTitle: string;
  total: number;
  remaining: number;
  instructions: string;
  hints: string;
  starterCode: string;
  filename: string;
  tests: { name: string }[];
}

export interface AdminCourse extends Course {
  status: CourseStatus;
  students: number;
  updated: string;
}

export interface LeaderboardEntry {
  rank: number;
  initials: string;
  name: string;
  streak: number;
  points: number;
  isCurrentUser?: boolean;
}

export const currentUser = {
  name: "Jordan Silva",
  email: "jordan.silva@school.edu",
  initials: "JS",
  points: 130,
  streak: 8,
  solved: 29,
};

export const courses: Course[] = [
  {
    id: "js-foundations",
    initials: "JS",
    title: "JavaScript Foundations",
    description: "Core syntax, functions and the patterns behind every real app.",
    difficulty: "Beginner",
    done: 8,
    total: 12,
  },
  {
    id: "python-for-data",
    initials: "PY",
    title: "Python for Data",
    description: "Wrangle, clean and visualize real datasets with pandas.",
    difficulty: "Intermediate",
    done: 3,
    total: 10,
  },
  {
    id: "algorithms",
    initials: "AL",
    title: "Algorithms & Problem Solving",
    description: "Sorting, searching and the thinking behind technical interviews.",
    difficulty: "Advanced",
    done: 0,
    total: 15,
  },
];

const jsChallenges: Challenge[] = [
  { id: "c1", day: 1, title: "Variables & Types", points: 10, status: "done" },
  { id: "c2", day: 2, title: "Functions", points: 10, status: "done" },
  { id: "c3", day: 3, title: "Arrays", points: 15, status: "done" },
  { id: "c4", day: 4, title: "Loops", points: 15, status: "done" },
  { id: "c5", day: 5, title: "Objects", points: 15, status: "done" },
  { id: "c6", day: 6, title: "Strings", points: 15, status: "done" },
  { id: "c7", day: 7, title: "Conditionals", points: 10, status: "done" },
  { id: "c8", day: 8, title: "Higher-order functions", points: 20, status: "done" },
  { id: "c9", day: 9, title: "Closures", points: 20, status: "current" },
  { id: "c10", day: 10, title: "Recursion", points: 20, status: "locked" },
  { id: "c11", day: 11, title: "Promises", points: 25, status: "locked" },
  { id: "c12", day: 12, title: "Modules", points: 25, status: "locked" },
];

export interface CourseDetail extends Course {
  unlockCopy: string;
  challenges: Challenge[];
}

export function getCourseDetail(courseId: string): CourseDetail {
  const course = courses.find((c) => c.id === courseId) ?? courses[0];
  return {
    ...course,
    unlockCopy: "unlock one a day as you complete the last",
    challenges: jsChallenges,
  };
}

export function getChallenge(challengeId: string): ChallengeDetail {
  const ch = jsChallenges.find((c) => c.id === challengeId) ?? jsChallenges[8];
  return {
    ...ch,
    courseId: "js-foundations",
    courseTitle: "JavaScript Foundations",
    total: jsChallenges.length,
    remaining: 3,
    filename: "solution.js",
    instructions:
      "# Build a counter with closures\n\nWrite a function `makeCounter()` that returns another function. Each time the returned function is called, it should increment and return an internal count — starting at `0`.\n\nTwo separate calls to `makeCounter()` must produce independent counters that do not share state.\n\n## Example\n\n```\nconst a = makeCounter();\nconst b = makeCounter();\na(); // 1\na(); // 2\nb(); // 1\n```",
    hints:
      "A closure lets an inner function keep access to a variable declared in its outer function, even after the outer function has returned.\n\nDeclare `count` inside `makeCounter`, not outside it — that's what keeps each counter independent.",
    starterCode:
      "// return a function that closes over `count`\nfunction makeCounter() {\n  let count = 0;\n  return function () {\n    count += 1;\n    return count;\n  };\n}\n",
    tests: [
      { name: "first call returns 1" },
      { name: "counts increment independently" },
      { name: "separate counters don't share state" },
    ],
  };
}

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, initials: "AO", name: "Amara Okafor", streak: 21, points: 940 },
  { rank: 2, initials: "LF", name: "Leo Fischer", streak: 14, points: 885 },
  { rank: 3, initials: "PN", name: "Priya Nair", streak: 18, points: 860 },
  { rank: 4, initials: "JS", name: "Jordan Silva", streak: 8, points: 605, isCurrentUser: true },
  { rank: 5, initials: "MK", name: "Mei Kwan", streak: 6, points: 540 },
  { rank: 6, initials: "DR", name: "Diego Rossi", streak: 11, points: 495 },
  { rank: 7, initials: "SA", name: "Sara Ahmed", streak: 4, points: 430 },
];

export const teacher = { name: "Taylor Wynn", initials: "TW" };

export const adminCourses: AdminCourse[] = [
  {
    id: "js-foundations",
    initials: "JS",
    title: "JavaScript Foundations",
    description: "",
    difficulty: "Beginner",
    status: "Published",
    total: 12,
    done: 0,
    students: 86,
    updated: "2 days ago",
  },
  {
    id: "python-for-data",
    initials: "PY",
    title: "Python for Data",
    description: "",
    difficulty: "Intermediate",
    status: "Published",
    total: 10,
    done: 0,
    students: 54,
    updated: "1 week ago",
  },
  {
    id: "algorithms",
    initials: "AL",
    title: "Algorithms & Problem Solving",
    description: "",
    difficulty: "Advanced",
    status: "Draft",
    total: 15,
    done: 0,
    students: 0,
    updated: "3 hours ago",
  },
  {
    id: "css-layout",
    initials: "CS",
    title: "CSS Layout Lab",
    description: "",
    difficulty: "Beginner",
    status: "Published",
    total: 8,
    done: 0,
    students: 41,
    updated: "5 days ago",
  },
  {
    id: "typescript",
    initials: "TS",
    title: "TypeScript Deep Dive",
    description: "",
    difficulty: "Advanced",
    status: "Draft",
    total: 9,
    done: 0,
    students: 33,
    updated: "yesterday",
  },
];

export interface EditCourse {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  status: CourseStatus;
  challenges: Challenge[];
}

export function getEditCourse(courseId: string): EditCourse {
  return {
    id: courseId,
    title: "JavaScript Foundations",
    description:
      "A beginner-friendly path through core JavaScript: variables, functions, arrays, objects, and the patterns that show up in every real app.",
    difficulty: "Beginner",
    status: "Published",
    challenges: jsChallenges,
  };
}
