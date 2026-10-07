// Placeholder UI shown in the layouts while a navigation is loading (see
// useNavigation() in student/layout.tsx and admin/layout.tsx). Shapes roughly
// match each page's real layout so content doesn't jump around once it loads.

function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function Head({ wide = "w-48" }: { wide?: string }) {
  return (
    <div className="mb-8 space-y-2">
      <Block className={`h-7 ${wide}`} />
      <Block className="h-4 w-64" />
    </div>
  );
}

// Ruled list: theory, leaderboard, lesson lists. One shape covers all of them
// because they are deliberately the same layout family.
function RuledSkeleton({ rows = 8, narrow = false }: { rows?: number; narrow?: boolean }) {
  return (
    <main className={`mx-auto px-8 py-10 pb-20 ${narrow ? "max-w-[900px]" : "max-w-[1400px]"}`}>
      <Head />
      <div className="divide-y border-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4">
            <Block className="h-4 w-6 shrink-0" />
            <Block className="h-4 w-56" />
            <Block className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </main>
  );
}

function CoursesSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] px-8 py-10 pb-20">
      <Head />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-5 rounded-xl border bg-card p-5">
            <div className="space-y-2">
              <Block className="h-5 w-3/4" />
              <Block className="h-4 w-full" />
              <Block className="h-4 w-2/3" />
            </div>
            <div className="space-y-2">
              <Block className="h-1.5 w-full" />
              <Block className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function CourseDetailSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] px-8 py-10 pb-20">
      <Block className="mb-5 h-4 w-32" />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b pb-6">
        <div className="space-y-2">
          <Block className="h-7 w-64" />
          <Block className="h-4 w-80" />
        </div>
        <div className="flex items-end gap-8">
          <Block className="h-9 w-20" />
          <Block className="h-1.5 w-56" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Block key={i} className="h-26 w-full" />
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

// Slides: the stage is the page, so reserving its aspect ratio is what keeps
// the deck from jumping once the lesson arrives.
function SlidesSkeleton() {
  return (
    <main className="mx-auto max-w-[1100px] px-8 py-8 pb-16">
      <Block className="mb-5 h-4 w-32" />
      <Block className="mb-5 h-7 w-72" />
      <Block className="aspect-[4/3] w-full sm:aspect-[16/9]" />
      <div className="mt-3 flex items-center gap-3">
        <Block className="size-8" />
        <Block className="size-8" />
        <Block className="h-1.5 flex-1" />
      </div>
    </main>
  );
}

function ProfileSkeleton() {
  return (
    <main className="mx-auto max-w-[900px] px-8 py-10 pb-20">
      <Head wide="w-40" />
      <div className="flex items-center gap-5 border-b pb-8">
        <Block className="size-16 rounded-full" />
        <div className="space-y-2">
          <Block className="h-5 w-40" />
          <Block className="h-4 w-56" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6 border-b py-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Block className="h-7 w-16" />
            <Block className="h-3 w-24" />
          </div>
        ))}
      </div>
    </main>
  );
}

function TableSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] px-8 py-10 pb-20">
      <Head />
      <div className="overflow-hidden rounded-xl border bg-card">
        <Block className="h-10 w-full rounded-none" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t px-4 py-3.5">
            <Block className="h-4 w-64" />
            <Block className="ml-auto h-4 w-20" />
          </div>
        ))}
      </div>
    </main>
  );
}

function FormSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] space-y-4 px-8 py-10 pb-20">
      <Block className="h-7 w-56" />
      <Block className="h-40 w-full" />
      <Block className="h-64 w-full" />
    </main>
  );
}

function GenericSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] space-y-4 px-8 py-10 pb-20">
      <Block className="h-7 w-56" />
      <Block className="h-40 w-full" />
    </main>
  );
}

export function PageSkeleton({ pathname }: { pathname: string }) {
  if (pathname === "/app/courses") return <CoursesSkeleton />;
  if (/^\/app\/courses\/[^/]+\/challenges\//.test(pathname)) return <ChallengeSkeleton />;
  if (/^\/app\/courses\/[^/]+$/.test(pathname)) return <CourseDetailSkeleton />;
  if (/\/slides$/.test(pathname) || /\/present$/.test(pathname)) return <SlidesSkeleton />;
  if (/^\/app\/theory/.test(pathname)) return <RuledSkeleton narrow />;
  if (pathname === "/app/leaderboard") return <RuledSkeleton narrow />;
  if (pathname === "/app/profile") return <ProfileSkeleton />;
  if (/^\/admin\/(courses|students|theory)$/.test(pathname)) return <TableSkeleton />;
  if (/^\/admin\/theory\/[^/]+$/.test(pathname)) return <RuledSkeleton rows={5} narrow />;
  if (/^\/admin\/courses\/(new|[^/]+)$/.test(pathname)) return <FormSkeleton />;
  if (/^\/admin\/students\/[^/]+$/.test(pathname)) return <ProfileSkeleton />;
  return <GenericSkeleton />;
}
