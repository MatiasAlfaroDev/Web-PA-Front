import {
  type RouteConfig,
  index,
  route,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),

  // Student area
  layout("routes/student/layout.tsx", [
    ...prefix("app", [
      route("courses", "routes/student/courses.tsx"),
      route("courses/:courseId", "routes/student/course-detail.tsx"),
      route("challenges/:challengeId", "routes/student/challenge.tsx"),
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
    ]),
  ]),
] satisfies RouteConfig;
