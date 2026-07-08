import {
  type RouteConfig,
  index,
  route,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  // Auth
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("verify-email", "routes/verify-email.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
  route("logout", "routes/logout.tsx"),

  // Loader-only resource routes (outside layouts to avoid re-running guards)
  route("app/submissions/:submissionId", "routes/submission-status.tsx"),
  route("admin/challenges/:challengeId", "routes/admin/challenge-data.tsx"),

  // Student area
  layout("routes/student/layout.tsx", [
    ...prefix("app", [
      route("courses", "routes/student/courses.tsx"),
      route("courses/:courseId", "routes/student/course-detail.tsx"),
      route("courses/:courseId/challenges/:challengeId", "routes/student/challenge.tsx"),
      route("profile", "routes/student/profile.tsx"),
      route("leaderboard", "routes/student/leaderboard.tsx"),
    ]),
  ]),

  // Teacher / admin area
  layout("routes/admin/layout.tsx", [
    ...prefix("admin", [
      route("courses", "routes/admin/courses.tsx"),
      route("courses/new", "routes/admin/course-new.tsx"),
      route("courses/:courseId", "routes/admin/course-edit.tsx"),
      route("students", "routes/admin/students.tsx"),
      route("students/:studentId", "routes/admin/student-detail.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
