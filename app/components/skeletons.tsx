// Placeholder UI shown in the layouts while a navigation is loading (see
// useNavigation() in student/layout.tsx and admin/layout.tsx). Shapes roughly
// match each page's real layout so content doesn't jump around once it loads.

function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function CoursesSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] px-8 py-10 pb-20">
      <div className="mb-7 space-y-2">
        <Block className="h-8 w-48" />
        <Block className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[18px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <Block className="size-10 rounded-full" />
              <Block className="h-5 w-16" />
            </div>
            <Block className="h-5 w-3/4" />
            <Block className="h-4 w-full" />
            <Block className="h-1.5 w-full" />
          </div>
        ))}
      </div>
    </main>
  );
}

function CourseDetailSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] px-8 py-10 pb-20">
      <Block className="mb-6 h-4 w-32" />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Block className="h-8 w-64" />
          <Block className="h-4 w-80" />
        </div>
        <Block className="h-10 w-20" />
      </div>
      <Block className="mt-4 mb-8 h-1.5 max-w-[420px]" />
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Block key={i} className="h-24 w-full" />
        ))}
      </div>
    </main>
  );
}

function ChallengeSkeleton() {
  return (
    <div className="flex h-[calc(100svh-3.5rem)] flex-col">
      <div className="flex items-center gap-6 border-b px-8 py-3">
        <Block className="h-4 w-24" />
        <Block className="h-4 w-40" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="w-[38%] space-y-3 border-r p-8">
          <Block className="h-4 w-full" />
          <Block className="h-4 w-5/6" />
          <Block className="h-4 w-full" />
          <Block className="h-24 w-full" />
        </div>
        <div className="flex-1 bg-[#1e1e1e] p-4">
          <Block className="h-full w-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] px-8 py-10 pb-20">
      <div className="mb-7 space-y-2">
        <Block className="h-8 w-56" />
        <Block className="h-4 w-72" />
      </div>
      <div className="divide-y rounded-xl border bg-card">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Block className="size-7 shrink-0 rounded-full" />
            <Block className="size-8 shrink-0 rounded-full" />
            <Block className="h-4 w-40" />
            <Block className="ml-auto h-4 w-14" />
          </div>
        ))}
      </div>
    </main>
  );
}

function ProfileSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-8 py-10 pb-20">
      <Block className="h-8 w-40" />
      <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
        <Block className="size-16 rounded-full" />
        <div className="space-y-2">
          <Block className="h-5 w-40" />
          <Block className="h-4 w-56" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Block key={i} className="h-24 w-full" />
        ))}
      </div>
    </main>
  );
}

function AdminCoursesSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] px-8 py-10 pb-20">
      <div className="mb-7 space-y-2">
        <Block className="h-8 w-40" />
        <Block className="h-4 w-56" />
      </div>
      <div className="space-y-px overflow-hidden rounded-xl border bg-card">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Block className="size-10 rounded-full" />
            <Block className="h-4 w-64" />
          </div>
        ))}
      </div>
    </main>
  );
}

function FormSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] space-y-4 px-8 py-10 pb-20">
      <Block className="h-8 w-56" />
      <Block className="h-40 w-full" />
      <Block className="h-64 w-full" />
    </main>
  );
}

function GenericSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] space-y-4 px-8 py-10 pb-20">
      <Block className="h-8 w-56" />
      <Block className="h-40 w-full" />
    </main>
  );
}

export function PageSkeleton({ pathname }: { pathname: string }) {
  if (pathname === "/app/courses") return <CoursesSkeleton />;
  if (/^\/app\/courses\/[^/]+\/challenges\//.test(pathname)) return <ChallengeSkeleton />;
  if (/^\/app\/courses\/[^/]+$/.test(pathname)) return <CourseDetailSkeleton />;
  if (pathname === "/app/leaderboard") return <LeaderboardSkeleton />;
  if (pathname === "/app/profile") return <ProfileSkeleton />;
  if (pathname === "/admin/courses" || pathname === "/admin/students") return <AdminCoursesSkeleton />;
  if (/^\/admin\/courses\/(new|[^/]+)$/.test(pathname)) return <FormSkeleton />;
  if (/^\/admin\/students\/[^/]+$/.test(pathname)) return <ProfileSkeleton />;
  return <GenericSkeleton />;
}
