import { Link } from "react-router";
import { courses, currentUser } from "~/lib/mock-data";
import { InitialsBadge } from "~/components/bits";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";

export function meta() {
  return [{ title: "Your profile · CodeClass" }];
}

export function loader() {
  return { user: currentUser, courses };
}

const stats = (u: typeof currentUser) => [
  { label: "Points", value: u.points },
  { label: "Day streak", value: u.streak },
  { label: "Challenges solved", value: u.solved },
];

export default function Profile({ loaderData }: { loaderData: { user: typeof currentUser; courses: typeof courses } }) {
  const { user } = loaderData;
  return (
    <main className="mx-auto max-w-[1120px] space-y-6 px-8 py-10 pb-20">
      <h1 className="text-[28px] font-extrabold tracking-tight">Your profile</h1>

      <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
        <Avatar className="size-16">
          <AvatarFallback className="font-mono text-lg">{user.initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-0.5">
          <p className="text-lg font-bold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" className="ml-auto">
          Edit profile
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats(user).map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5">
            <p className="font-mono text-3xl font-bold text-success">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Your courses</h2>
        <div className="divide-y rounded-xl border bg-card">
          {loaderData.courses.map((c) => {
            const pct = Math.round((c.done / c.total) * 100);
            return (
              <Link
                key={c.id}
                to={`/app/courses/${c.id}`}
                className="flex items-center gap-4 p-4 hover:bg-muted/40"
              >
                <InitialsBadge initials={c.initials} />
                <span className="w-40 shrink-0 font-semibold">{c.title}</span>
                <Progress value={pct} className="h-1.5 flex-1" />
                <span className="w-14 shrink-0 text-right font-mono text-xs text-muted-foreground">
                  {c.done}/{c.total}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <Button variant="outline" asChild>
        <Link to="/login">Sign out</Link>
      </Button>
    </main>
  );
}
