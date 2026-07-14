import { Code2, Lock, Moon, Sun } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn, timeUntil } from "~/lib/utils";
import { toggleTheme } from "~/lib/theme";

export function SiteLogo({ showWordmark = true }: { showWordmark?: boolean }) {
  return (
    <span className="flex items-center gap-2 font-semibold">
      <Code2 className="size-5 text-success" strokeWidth={2.5} />
      {showWordmark && <span className="text-[17px] tracking-tight">PA</span>}
    </span>
  );
}

export function ThemeToggle() {
  // CSS picks the icon from the theme class — no hydration-sensitive state.
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Cambiar tema">
      <Moon className="dark:hidden" />
      <Sun className="hidden dark:block" />
    </Button>
  );
}

const initialsSize = {
  sm: "size-9 rounded-[9px] text-xs",
  lg: "size-16 rounded-xl text-lg",
} as const;

export function InitialsBadge({
  initials,
  size = "sm",
  className,
}: {
  initials: string;
  size?: keyof typeof initialsSize;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-muted font-mono font-semibold text-muted-foreground",
        initialsSize[size],
        className
      )}
    >
      {initials}
    </span>
  );
}

// Shown in place of a locked course/lesson's normal content. The teacher
// controls both the publish flag and the unlock time from the admin panel.
export function CourseLockNotice({ unlocksAt }: { unlocksAt: string | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
      <Lock className="size-3.5" />
      {unlocksAt ? `Disponible ${timeUntil(unlocksAt)}` : "Bloqueado por el profesor"}
    </span>
  );
}

// Minimal markdown-lite: ``` fences become code blocks; # / ## become headings;
// `inline` spans render as inline code. Enough for authored prompt/lesson text.
export function Prose({ text }: { text: string }) {
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
                  <p key={j} className="whitespace-pre-wrap">
                    {para.split(/`/).map((seg, k) =>
                      k % 2 === 1 ? (
                        <code
                          key={k}
                          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
                        >
                          {seg}
                        </code>
                      ) : (
                        seg.replace(/\*\*/g, "")
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
