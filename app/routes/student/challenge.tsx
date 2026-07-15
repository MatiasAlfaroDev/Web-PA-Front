import { useEffect, useState } from "react";
import { ArrowLeft, Check, EyeOff, Lock, Play, X } from "lucide-react";
import { Link, useFetcher, useRouteLoaderData } from "react-router";
import CodeEditor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-java";

// react-simple-code-editor is CJS (exports.default without an __esModule flag), so
// Vite hands back the module namespace — unwrap .default to get the component.
const Editor = ((CodeEditor as any).default ?? CodeEditor) as typeof CodeEditor;
import type { Route } from "./+types/challenge";
import { api, apiResult } from "~/lib/api";
import { fullName, getTokenOrRedirect, type User } from "~/lib/auth";
import { mapChallengeDetail, type ApiChallenge, type ApiCourse } from "~/lib/mappers";
import type { Submission } from "../submission-status";
import { Prose } from "~/components/bits";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";

// Best-effort deterrents only — no web API can block PrintScreen, OS/phone
// screen recording, or a second device's camera. This raises the friction of
// casual copying and makes leaked screenshots traceable; it is not a security
// boundary.
const blockClipboard = (e: { preventDefault: () => void }) => e.preventDefault();

function Watermark({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden select-none">
      <div className="grid -rotate-[20deg] grid-cols-3 gap-16 p-8 opacity-[0.06]" style={{ width: "140%", height: "140%" }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="whitespace-nowrap text-sm font-semibold">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Blurs the challenge while the tab/window isn't focused — a deterrent
// against screen-sharing or handing the screen to someone else mid-challenge.
// Purely client-side: nothing is logged or sent anywhere.
function useTabFocusGuard() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const update = () => setHidden(document.hidden || !document.hasFocus());
    document.addEventListener("visibilitychange", update);
    window.addEventListener("blur", update);
    window.addEventListener("focus", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("blur", update);
      window.removeEventListener("focus", update);
    };
  }, []);
  return hidden;
}

const highlightJava = (code: string) => Prism.highlight(code, Prism.languages.java, "java");

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  // courseId comes from the URL now, so these no longer have to run in sequence.
  const [challenge, course] = await Promise.all([
    api<ApiChallenge>(`/challenges/${params.challengeId}`, { token }),
    api<ApiCourse>(`/courses/${params.courseId}`, { token }),
  ]);
  return { challenge: mapChallengeDetail(challenge, course) };
}

export async function action({ request, params }: Route.ActionArgs) {
  const token = await getTokenOrRedirect(request);
  const form = await request.formData();
  const res = await apiResult<Submission>(`/challenges/${params.challengeId}/submissions`, {
    method: "POST",
    token,
    body: JSON.stringify({
      language_id: Number(form.get("language_id")),
      code: form.get("code"),
    }),
  });
  if (!res.ok) return { error: res.data.message ?? "No se pudo enviar tu solución." };
  return { submission: res.data };
}

export function meta() {
  return [{ title: "Desafío · Programación Avanzada" }];
}

const TERMINAL = ["passed", "partial", "failed", "error"];

export default function Challenge({ loaderData }: Route.ComponentProps) {
  const { challenge } = loaderData;
  const [code, setCode] = useState(challenge.starterCode);
  const layoutData = useRouteLoaderData("routes/student/layout") as { user: User } | undefined;
  const tabHidden = useTabFocusGuard();
  const watermarkLabel = layoutData
    ? `${fullName(layoutData.user)} · ${layoutData.user.email}`
    : "";

  const submit = useFetcher<typeof action>();
  const poll = useFetcher<{ submission: Submission }>();

  // The current submission: latest polled state, falling back to the POST result.
  const submission: Submission | undefined = poll.data?.submission ?? submit.data?.submission;
  const status = submission?.status;
  const isTerminal = status != null && TERMINAL.includes(status);
  const running = submit.state !== "idle" || (submission != null && !isTerminal);

  // Poll the submission until it reaches a terminal status.
  useEffect(() => {
    if (!submission || isTerminal || poll.state !== "idle") return;
    const t = setTimeout(() => poll.load(`/app/submissions/${submission.id}`), 1000);
    return () => clearTimeout(t);
  }, [submission, isTerminal, poll]);

  const cases = submission?.judge_output?.cases ?? [];
  const summary = !submission
    ? "Ejecutá tu código para ver los resultados de las pruebas"
    : !isTerminal
      ? "Ejecutando pruebas…"
      : status === "error"
        ? submission.judge_output?.message ?? "Error de compilación o de ejecución"
        : `${submission.passed_count}/${submission.total_count} pruebas superadas · +${submission.score} pts`;

  const submitError = submit.data && "error" in submit.data ? submit.data.error : undefined;
  const locked = challenge.status === "locked";

  return (
    <div className="flex h-[calc(100svh-3.5rem)] flex-col">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b px-8 py-3">
        <Link prefetch="intent"
          to={`/app/courses/${challenge.courseId}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {challenge.courseTitle}
        </Link>
        <span className="text-sm font-bold">
          Día {challenge.day} · {challenge.title}
        </span>
        <div className="ml-auto flex items-center gap-4">
          <span className="rounded-md bg-success-soft px-2 py-0.5 font-mono text-xs font-medium text-success-soft-foreground">
            +{challenge.points} pts
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {challenge.remaining} de {challenge.total} restantes
          </span>
        </div>
      </div>

      {locked && (
        <div className="flex items-center gap-2 border-b bg-muted/40 px-8 py-2 text-sm text-muted-foreground">
          <Lock className="size-4" />
          Este desafío se desbloquea cuando completes el anterior — volvé mañana.
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Left: prompt */}
        <div
          className="relative flex min-h-0 flex-col border-b select-none lg:w-[38%] lg:border-r lg:border-b-0"
          onCopy={blockClipboard}
          onCut={blockClipboard}
          onPaste={blockClipboard}
          onContextMenu={blockClipboard}
        >
          <Watermark label={watermarkLabel} />
          <Tabs defaultValue="instructions" className="flex min-h-0 flex-1 flex-col gap-0">
            <TabsList variant="line" className="shrink-0 gap-4 border-b px-8 py-2">
              <TabsTrigger value="instructions">Instrucciones</TabsTrigger>
              <TabsTrigger value="hints">Ejemplos</TabsTrigger>
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
            {/* Pasting is blocked to stop dropping in externally-written solutions;
                typing, and copying/cutting your own code, still work normally. */}
            <div className="monokai min-h-0 flex-1 overflow-auto" onPaste={blockClipboard}>
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={highlightJava}
                padding={16}
                tabSize={4}
                spellCheck={false}
                textareaClassName="outline-none"
                className="min-h-full font-mono text-[13px] leading-relaxed"
                style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#f8f8f2" }}
              />
            </div>
            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-white/10 p-3">
              <Button
                variant="ghost"
                className="text-[#d4d4d4] hover:bg-white/10 hover:text-white"
                onClick={() => setCode(challenge.starterCode)}
              >
                Reiniciar
              </Button>
              <submit.Form method="post">
                <input type="hidden" name="code" value={code} />
                <input type="hidden" name="language_id" value={challenge.languageId} />
                <Button type="submit" disabled={running || locked}>
                  <Play className="fill-current" />
                  {running ? "Ejecutando…" : "Enviar y ejecutar"}
                </Button>
              </submit.Form>
            </div>
          </div>

          {/* Results panel */}
          <div className="flex h-[38%] shrink-0 flex-col overflow-y-auto border-t bg-background px-6 py-4">
            <p
              className={cn(
                "mb-3 font-mono text-sm font-medium",
                status === "passed" && "text-success",
                status === "error" && "text-destructive"
              )}
            >
              {summary}
            </p>
            {submitError && <p className="mb-3 text-sm text-destructive">{submitError}</p>}
            <ul className="space-y-2">
              {cases.length > 0
                ? cases.map((c, i) => (
                    <ResultRow
                      key={c.test_case_id}
                      name={c.hidden ? `Caso oculto ${i + 1}` : `Caso ${i + 1}`}
                      passed={c.passed}
                    />
                  ))
                : challenge.tests.map((t, i) => <ResultRow key={i} name={t.name} pending />)}
            </ul>
          </div>
        </div>

        {tabHidden && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-background/90 backdrop-blur-md">
            <EyeOff className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              El desafío se pausó — volvé a esta pestaña para continuar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultRow({ name, passed, pending }: { name: string; passed?: boolean; pending?: boolean }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      {pending ? (
        <span className="size-2 rounded-full bg-border-strong" />
      ) : passed ? (
        <Check className="size-4 text-success" />
      ) : (
        <X className="size-4 text-destructive" />
      )}
      <span className={cn(pending && "text-muted-foreground")}>{name}</span>
    </li>
  );
}
