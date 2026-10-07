import { useState } from "react";
import { ArrowLeft, Code2, Flame, LogOut, Lock, Moon, User } from "lucide-react";
import { Form, Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Switch } from "~/components/ui/switch";
import { fullName, initialsOf, type User as AppUser } from "~/lib/auth";
import { cn, timeUntil } from "~/lib/utils";
import { isDarkTheme, setTheme } from "~/lib/theme";

export function SiteLogo({ showWordmark = true }: { showWordmark?: boolean }) {
  return (
    <span className="flex items-center gap-2 font-semibold">
      <Code2 className="size-5 text-success-ink" strokeWidth={2.5} />
      {showWordmark && <span className="text-[17px] tracking-tight">PA</span>}
    </span>
  );
}

// Lives inside the account menu, which only ever mounts after a click, so
// reading the theme straight off the document here can't desync hydration.
function ThemeRow() {
  const [dark, setDark] = useState(isDarkTheme);

  function change(next: boolean) {
    setDark(next);
    setTheme(next);
  }

  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 text-sm hover:bg-accent">
      <Moon className="size-4 shrink-0 text-muted-foreground" />
      Tema oscuro
      <Switch checked={dark} onCheckedChange={change} className="ml-auto" />
    </label>
  );
}

// The avatar is the only account affordance in the header: identity, the two
// numbers a student actually tracks (they used to sit loose in the nav bar),
// and the two things you can do with an account.
export function UserMenu({ user }: { user: AppUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Tu cuenta"
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:ring-3 data-[state=open]:ring-ring/30"
      >
        <Avatar className="size-8">
          {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
          <AvatarFallback className="num text-xs">{initialsOf(user)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <div className="px-1.5 py-1.5">
          <p className="truncate text-sm font-medium">{fullName(user)}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>

        {user.role === "student" && (
          <div className="flex items-center gap-2 px-1.5 pb-2">
            <span className="num rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              {user.points ?? 0} pts
            </span>
            <span className="num flex items-center gap-1 rounded-md bg-success-soft px-2 py-1 text-xs font-medium text-success-soft-foreground">
              <Flame className="size-3.5" />
              {user.streak ?? 0}
            </span>
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link prefetch="intent" to="/app/profile">
            <User />
            Tu perfil
          </Link>
        </DropdownMenuItem>

        {/* Not a menu item: toggling the theme should not close the menu, so
            you can see the change land behind it. */}
        <ThemeRow />

        <DropdownMenuSeparator />
        {/* The form lives outside the menu item and is reached by id, because
            the menu content renders in a portal. */}
        <Form id="logout-form" method="post" action="/logout" className="hidden" />
        <DropdownMenuItem variant="destructive" asChild>
          <button type="submit" form="logout-form" className="w-full">
            <LogOut />
            Cerrar sesión
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Every page in both areas opens the same way: one h1, an optional single line
// of context, and actions pinned right. Having it in one place is what keeps
// the type scale from drifting page by page.
export function PageHeader({
  title,
  lead,
  children,
  className,
}: {
  title: string;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3", className)}>
      <div className="space-y-1">
        <h1 className="page-title">{title}</h1>
        {lead && <p className="text-sm text-muted-foreground">{lead}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}

export function BackLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      prefetch="intent"
      to={to}
      className="group mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
      {children}
    </Link>
  );
}

export function EmptyState({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-14 text-center">
      <p className="font-medium">{title}</p>
      {hint && <p className="max-w-[46ch] text-sm text-muted-foreground">{hint}</p>}
      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}

// A figure the reader compares against other figures: tabular mono, label
// underneath, no card around it. Ruled columns give the grouping instead.
export function Figure({
  value,
  label,
  tone = "default",
}: {
  value: React.ReactNode;
  label: string;
  tone?: "default" | "accent";
}) {
  return (
    <div className="space-y-0.5">
      <p
        className={cn(
          "num text-[26px] leading-none font-semibold",
          tone === "accent" && "text-success-ink",
        )}
      >
        {value}
      </p>
      <p className="text-[13px] text-muted-foreground">{label}</p>
    </div>
  );
}

// Progress as one tick per challenge rather than a filled bar: a student can
// count what is left, and it echoes the slide rail so both read as one system.
// Falls back to a plain bar past 24 items, where ticks stop being countable.
export function ProgressTicks({
  done,
  total,
  className,
}: {
  done: number;
  total: number;
  className?: string;
}) {
  const pct = total ? Math.round((done / total) * 100) : 0;

  if (total > 24 || total === 0) {
    return (
      <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-border", className)}>
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="progressbar"
      aria-valuenow={done}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${done} de ${total} desafíos`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn("h-1.5 flex-1 rounded-full", i < done ? "bg-brand" : "bg-border")}
        />
      ))}
    </div>
  );
}

const initialsSize = {
  sm: "size-9 rounded-md text-xs",
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
        "num inline-flex shrink-0 items-center justify-center bg-muted font-semibold text-muted-foreground",
        initialsSize[size],
        className,
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
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
      <Lock className="size-3.5" />
      {unlocksAt ? `Disponible ${timeUntil(unlocksAt)}` : "Bloqueado por el profesor"}
    </span>
  );
}

// Teacher-side publish state, same chip wherever it appears.
export function PublishChip({ published }: { published?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium",
        published
          ? "bg-success-soft text-success-soft-foreground"
          : "bg-muted text-muted-foreground",
      )}
    >
      {published ? "Habilitado" : "Bloqueado"}
    </span>
  );
}

// Minimal markdown-lite: ``` fences become code blocks; # / ## become headings;
// `inline` spans render as inline code. Enough for authored prompt/lesson text.
//
// Every size inside is em-relative, so the caller sets one font-size on the
// wrapper and the whole block scales with it. That is what lets the same
// renderer serve a reading column and a projector-sized slide.
export function Prose({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("space-y-[0.9em] text-[15.5px] leading-[1.7]", className)}>
      {text.split(/```\n?/).map((block, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            className="overflow-x-auto rounded-md bg-muted p-[0.8em] font-mono text-[0.86em] leading-relaxed"
          >
            {block.replace(/\n$/, "")}
          </pre>
        ) : (
          <div key={i} className="space-y-[0.9em]">
            {block
              .trim()
              .split(/\n\n+/)
              .map((para, j) => {
                if (para.startsWith("## "))
                  return (
                    <h3 key={j} className="text-[1.1em] font-semibold tracking-[-0.01em]">
                      {para.slice(3)}
                    </h3>
                  );
                if (para.startsWith("# "))
                  return (
                    <h2 key={j} className="text-[1.35em] font-semibold tracking-[-0.015em]">
                      {para.slice(2)}
                    </h2>
                  );
                return (
                  <p key={j} className="whitespace-pre-wrap">
                    {para.split(/`/).map((seg, k) =>
                      k % 2 === 1 ? (
                        <code
                          key={k}
                          className="rounded bg-muted px-[0.35em] py-[0.1em] font-mono text-[0.85em]"
                        >
                          {seg}
                        </code>
                      ) : (
                        seg.replace(/\*\*/g, "")
                      ),
                    )}
                  </p>
                );
              })}
          </div>
        ),
      )}
    </div>
  );
}
