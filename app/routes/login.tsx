import { Code2, Flame, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function meta() {
  return [{ title: "Sign in · CodeClass" }];
}

export default function Login() {
  const navigate = useNavigate();
  // ponytail: mock auth — buttons just route. Real sign-in posts to the backend
  // and stores a token (see lib/auth.ts) before redirecting.
  return (
    <main className="grid min-h-svh lg:grid-cols-[46%_1fr]">
      <aside className="hidden flex-col justify-between bg-[#0f2818] p-12 text-[#f0fdf4] lg:flex">
        <Code2 className="size-8 text-success" strokeWidth={2.5} />
        <div className="space-y-6">
          <p className="font-mono text-xs tracking-[0.2em] text-[#f0fdf4]/70 uppercase">
            Classroom coding
          </p>
          <h1 className="max-w-md text-[34px] leading-[1.15] font-bold tracking-tight">
            Learn to code, one unlocked challenge at a time.
          </h1>
          <ul className="space-y-3 font-mono text-sm text-[#f0fdf4]/85">
            <li className="flex items-center gap-2.5">
              <Flame className="size-4 text-success" />
              8-day streak — keep it going
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="size-4 text-success" />
              96 challenges solved across 4 courses
            </li>
          </ul>
        </div>
      </aside>

      <div className="flex items-center justify-center p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/app/courses");
          }}
          className="w-full max-w-[360px] space-y-5"
        >
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">Use your school email to continue</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@school.edu" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" defaultValue="password" required />
          </div>

          <Button type="submit" className="h-10 w-full">
            Sign in
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 w-full"
            onClick={() => navigate("/admin/courses")}
          >
            Continue as teacher
          </Button>
        </form>
      </div>
    </main>
  );
}
