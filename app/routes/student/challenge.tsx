import { useState } from "react";
import { ArrowLeft, Check, Play, X } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/challenge";
import { getChallenge } from "~/lib/mock-data";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

export function loader({ params }: Route.LoaderArgs) {
  // ponytail: swap for api<ChallengeDetail>(`/challenges/${params.challengeId}`)
  return { challenge: getChallenge(params.challengeId) };
}

export function meta() {
  return [{ title: "Challenge · CodeClass" }];
}

// Minimal markdown-lite: ``` fences become code blocks; # / ## become headings;
// `inline` spans render as inline code. Enough for the authored prompt text.
function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-[15.5px] leading-[1.7]">
      {text.split(/```\n?/).map((block, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[13px] leading-relaxed"
          >
            {block.replace(/\n$/, "")}
          </pre>
        ) : (
          <div key={i} className="space-y-3">
            {block
              .trim()
              .split(/\n\n+/)
              .map((para, j) => {
                if (para.startsWith("## "))
                  return (
                    <h3 key={j} className="text-base font-semibold">
                      {para.slice(3)}
                    </h3>
                  );
                if (para.startsWith("# "))
                  return (
                    <h2 key={j} className="text-xl font-bold tracking-tight">
                      {para.slice(2)}
                    </h2>
                  );
                return (
                  <p key={j}>
                    {para.split(/`/).map((seg, k) =>
                      k % 2 === 1 ? (
                        <code
                          key={k}
                          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
                        >
                          {seg}
                        </code>
                      ) : (
                        seg
                      )
                    )}
                  </p>
                );
              })}
          </div>
        )
      )}
    </div>
  );
}

type RunState = "idle" | "running" | "done";

export default function Challenge({ loaderData }: Route.ComponentProps) {
  const { challenge } = loaderData;
  const [code, setCode] = useState(challenge.starterCode);
  const [runState, setRunState] = useState<RunState>("idle");

  // ponytail: mock run — 700ms then all pass. Real version posts `code` to the
  // grading endpoint and renders pass/fail + messages from the response; Submit
  // additionally unlocks the next challenge and updates points/streak.
  function run() {
    setRunState("running");
    setTimeout(() => setRunState("done"), 700);
  }

  const summary =
    runState === "idle"
      ? "Run your code to see test results"
      : runState === "running"
        ? "Running tests…"
        : `${challenge.tests.length}/${challenge.tests.length} tests passed`;

  return (
    <div className="flex h-[calc(100svh-3.5rem)] flex-col">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b px-8 py-3">
        <Link
          to={`/app/courses/${challenge.courseId}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {challenge.courseTitle}
        </Link>
        <span className="text-sm font-bold">
          Day {challenge.day} · {challenge.title}
        </span>
        <div className="ml-auto flex items-center gap-4">
          <span className="rounded-md bg-success-soft px-2 py-0.5 font-mono text-xs font-medium text-success-soft-foreground">
            +{challenge.points} pts
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {challenge.remaining} of {challenge.total} remaining
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Left: prompt */}
        <div className="flex min-h-0 flex-col border-b lg:w-[38%] lg:border-r lg:border-b-0">
          <Tabs defaultValue="instructions" className="flex min-h-0 flex-1 flex-col gap-0">
            <TabsList variant="line" className="shrink-0 gap-4 border-b px-8 py-2">
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="hints">Hints</TabsTrigger>
            </TabsList>
            <TabsContent value="instructions" className="min-h-0 overflow-y-auto px-8 py-6">
              <Prose text={challenge.instructions} />
            </TabsContent>
            <TabsContent value="hints" className="min-h-0 overflow-y-auto px-8 py-6">
              <Prose text={challenge.hints} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: editor + results (always dark, VS Code-like) */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col bg-[#1e1e1e]">
            <div className="flex shrink-0 items-center bg-[#181818] px-4">
              <span className="border-b-2 border-success px-2 py-2.5 font-mono text-xs text-[#d4d4d4]">
                {challenge.filename}
              </span>
            </div>
            {/* ponytail: plain textarea stands in for Monaco/CodeMirror — swap in a
                real editor with a dark theme + syntax highlighting when wiring the runner. */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="min-h-0 flex-1 resize-none bg-[#1e1e1e] p-4 font-mono text-[13px] leading-relaxed text-[#d4d4d4] outline-none"
            />
            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-white/10 p-3">
              <Button
                variant="ghost"
                className="text-[#d4d4d4] hover:bg-white/10 hover:text-white"
                onClick={() => setCode(challenge.starterCode)}
              >
                Reset
              </Button>
              <div className="flex gap-2">
                <Button
                  className="bg-white/10 text-white hover:bg-white/20"
                  onClick={run}
                  disabled={runState === "running"}
                >
                  <Play className="fill-current" />
                  Run
                </Button>
                <Button onClick={run} disabled={runState === "running"}>
                  Submit
                </Button>
              </div>
            </div>
          </div>

          {/* Results panel */}
          <div className="flex h-[38%] shrink-0 flex-col overflow-y-auto border-t bg-background px-6 py-4">
            <p className="mb-3 font-mono text-sm font-medium">{summary}</p>
            <ul className="space-y-2">
              {challenge.tests.map((t) => (
                <TestRow key={t.name} name={t.name} state={runState} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestRow({ name, state }: { name: string; state: RunState }) {
  const passed = state === "done";
  return (
    <li className="flex items-center gap-2.5 text-sm">
      {passed ? (
        <Check className="size-4 text-success" />
      ) : (
        <span
          className={cn(
            "size-2 rounded-full",
            state === "running" ? "animate-pulse bg-muted-foreground" : "bg-border-strong"
          )}
        />
      )}
      <span className={cn(state === "idle" && "text-muted-foreground")}>{name}</span>
    </li>
  );
}
