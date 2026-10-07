import type { Route } from "./+types/leaderboard";
import { api } from "~/lib/api";
import { getTokenOrRedirect, type User } from "~/lib/auth";
import { mapLeaderboard, type ApiLeaderRow } from "~/lib/mappers";
import { EmptyState, PageHeader } from "~/components/bits";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

export function meta() {
  return [{ title: "Clasificación · Programación Avanzada" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const [me, rows] = await Promise.all([
    api<User>("/profile", { token }),
    api<ApiLeaderRow[]>("/leaderboard", { token }),
  ]);
  return { leaderboard: mapLeaderboard(rows, me.id) };
}

// Rank colour carries the podium instead of a medal chip, so the list stays
// one rhythm and the first three rows are distinguished by type weight.
const rankInk: Record<number, string> = {
  1: "text-rank-gold",
  2: "text-rank-silver",
  3: "text-rank-bronze",
};

export default function Leaderboard({ loaderData }: Route.ComponentProps) {
  const { leaderboard } = loaderData;
  const mine = leaderboard.find((e) => e.isCurrentUser);

  return (
    <main className="mx-auto max-w-[760px] px-8 py-10 pb-20">
      <PageHeader
        title="Clasificación"
        lead="Puntos acumulados en todos los cursos de este período"
      >
        {mine && (
          <p className="text-sm text-muted-foreground">
            Tu lugar: <span className="num font-semibold text-foreground">#{mine.rank}</span>
          </p>
        )}
      </PageHeader>

      {leaderboard.length === 0 ? (
        <EmptyState
          title="Nadie puntuó todavía"
          hint="Resolvé el primer desafío y vas a abrir la tabla."
        />
      ) : (
        <ol className="divide-y border-y">
          {leaderboard.map((e) => {
            const podium = e.rank <= 3;
            return (
              <li
                key={e.rank}
                className={cn(
                  "flex items-center gap-4 px-3 py-3.5",
                  podium && "py-4",
                  e.isCurrentUser && "-ml-px border-l-2 border-brand bg-success-soft/40 pl-[11px]",
                )}
              >
                <span
                  className={cn(
                    "num w-7 shrink-0 text-right text-sm font-semibold",
                    podium ? cn("text-base", rankInk[e.rank]) : "text-muted-foreground",
                  )}
                >
                  {e.rank}
                </span>
                <Avatar className="size-8">
                  <AvatarFallback className="num text-xs">{e.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate font-medium", podium && "font-semibold")}>{e.name}</p>
                  {e.streak > 0 && (
                    <p className="text-xs text-muted-foreground">racha de {e.streak} días</p>
                  )}
                </div>
                <span className="num shrink-0 text-sm font-semibold">
                  {e.points}
                  <span className="font-normal text-muted-foreground"> pts</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
