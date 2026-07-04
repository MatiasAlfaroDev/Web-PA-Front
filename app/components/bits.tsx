import { Code2, Moon, Sun } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { toggleTheme } from "~/lib/theme";
import type { Difficulty } from "~/lib/mock-data";

export function SiteLogo({ showWordmark = true }: { showWordmark?: boolean }) {
  return (
    <span className="flex items-center gap-2 font-semibold">
      <Code2 className="size-5 text-success" strokeWidth={2.5} />
      {showWordmark && <span className="text-[17px] tracking-tight">CodeClass</span>}
    </span>
  );
}

export function ThemeToggle() {
  // CSS picks the icon from the theme class — no hydration-sensitive state.
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
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

export function DifficultyPill({ difficulty }: { difficulty: Difficulty }) {
  return (
    <Badge variant="outline" className="rounded-md text-[11px] font-medium tracking-wide uppercase">
      {difficulty}
    </Badge>
  );
}
