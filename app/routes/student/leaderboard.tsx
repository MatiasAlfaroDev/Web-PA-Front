import { leaderboard } from "~/lib/mock-data";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

export function meta() {
  return [{ title: "Leaderboard · CodeClass" }];
}

export function loader() {
  return { leaderboard };
}

const rankColor: Record<number, string> = {
  1: "bg-[#eab308] text-white",
  2: "bg-[#d6d3d1] text-stone-800",
  3: "bg-[#f97316] text-white",
};

export default function Leaderboard({ loaderData }: { loaderData: { leaderboard: typeof leaderboard } }) {
  return (
    <main className="mx-auto max-w-[1120px] px-8 py-10 pb-20">
      <header className="mb-7">
        <h1 className="text-[28px] font-extrabold tracking-tight">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Ranked by total points across all courses this term</p>
      </header>

      <div className="divide-y rounded-xl border bg-card">
        {loaderData.leaderboard.map((e) => (
          <div
            key={e.rank}
            className={cn(
              "flex items-center gap-4 px-4 py-3.5",
              e.isCurrentUser && "bg-success-soft/50"
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold",
                rankColor[e.rank] ?? "bg-muted text-muted-foreground"
              )}
            >
              {e.rank}
            </span>
            <Avatar className="size-8">
              <AvatarFallback className="font-mono text-xs">{e.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold">{e.name}</p>
              <p className="text-xs text-muted-foreground">{e.streak}-day streak</p>
            </div>
            <span className="ml-auto font-mono font-bold text-success">{e.points} pts</span>
          </div>
        ))}
      </div>
    </main>
  );
}
