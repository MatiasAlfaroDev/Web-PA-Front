import { useState } from "react";
import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/register";
import { apiResult } from "~/lib/api";
import { cn } from "~/lib/utils";
import { getToken, homeFor, requireUser } from "~/lib/auth";
import { AuthShell } from "~/components/auth-shell";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Check } from "lucide-react";

export function meta() {
  return [{ title: "Crear cuenta · Programación Avanzada" }];
}

// Same rules drive the checklist and the strength bar (one met rule = one point).
const RULES = [
  { label: "Al menos 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Una minúscula", test: (p: string) => /[a-z]/.test(p) },
  { label: "Una mayúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Un número", test: (p: string) => /[0-9]/.test(p) },
  { label: "Un carácter especial", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

// One entry per possible score (0…RULES.length).
const STRENGTH = [
  { label: "", color: "" },
  { label: "Débil", color: "bg-destructive" },
  { label: "Débil", color: "bg-destructive" },
  { label: "Regular", color: "bg-yellow-500" },
  { label: "Buena", color: "bg-lime-500" },
  { label: "Fuerte", color: "bg-success" },
] as const;

export async function loader({ request }: Route.LoaderArgs) {
  if (!(await getToken(request))) return null;
  const user = await requireUser(request);
  return redirect(homeFor(user.role));
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const res = await apiResult("/register", {
    method: "POST",
    body: JSON.stringify({
      first_name: form.get("first_name"),
      last_name: form.get("last_name"),
      ci: form.get("ci"),
      email,
      password: form.get("password"),
    }),
  });

  if (!res.ok) {
    const errors = res.data.errors;
    const first = errors ? Object.values(errors)[0]?.[0] : undefined;
    return { error: first ?? res.data.message ?? "No se pudo crear tu cuenta." };
  }

  // Backend emailed a 6-digit code — continue to verification.
  return redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export default function Register({ actionData }: Route.ComponentProps) {
  const [pw, setPw] = useState("");
  const passed = RULES.map((r) => r.test(pw));
  const score = passed.filter(Boolean).length;
  const meter = STRENGTH[score];

  return (
    <AuthShell>
      <Form method="post" className="w-full max-w-[380px] space-y-7">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight">Creá tu cuenta</h2>
          <p className="text-sm text-muted-foreground">Te enviaremos un código por email para verificarla</p>
        </div>

        {actionData?.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {actionData.error}
          </p>
        )}

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input id="first_name" name="first_name" className="h-11" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input id="last_name" name="last_name" className="h-11" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ci">Cédula de Identidad</Label>
            <Input id="ci" name="ci" inputMode="numeric" placeholder="1.234.567-2" className="h-11" required />
            <p className="text-xs text-muted-foreground">Cédula uruguaya con puntos y guion.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" className="h-11" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              className="h-11"
              onChange={(e) => setPw(e.target.value)}
              required
            />
            {pw && (
              <div className="space-y-1.5">
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all duration-300", meter.color)}
                    style={{ width: `${(score / RULES.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Seguridad: <span className="font-medium text-foreground">{meter.label}</span>
                </p>
              </div>
            )}
            <ul className="space-y-1">
              {RULES.map((rule, i) => (
                <li
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-1.5 text-xs transition-colors",
                    passed[i] ? "text-success" : "text-muted-foreground"
                  )}
                >
                  <Check className={cn("size-3.5 shrink-0", passed[i] ? "opacity-100" : "opacity-40")} />
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <Button type="submit" className="h-11 w-full cursor-pointer">
            Crear cuenta
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tenés una cuenta?{" "}
            <Link to="/login" className="font-medium text-foreground hover:text-success">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </Form>
    </AuthShell>
  );
}
