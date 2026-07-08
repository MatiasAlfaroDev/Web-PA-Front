import { useState } from "react";
import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/login";
import { apiResult } from "~/lib/api";
import { getToken, homeFor, tokenCookie, type User } from "~/lib/auth";
import { AuthShell } from "~/components/auth-shell";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

export function meta() {
  return [{ title: "Iniciar sesión · Programación Avanzada" }];
}

// Already signed in? Skip the form.
export async function loader({ request }: Route.LoaderArgs) {
  if (await getToken(request)) throw redirect("/app/courses");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  // Login by email or CI — post whichever field the form submitted.
  const ci = form.get("ci");
  const res = await apiResult<{ token: string; user: User }>("/login", {
    method: "POST",
    body: JSON.stringify({
      ...(ci ? { ci } : { email: form.get("email") }),
      password: form.get("password"),
    }),
  });

  if (!res.ok) {
    return { error: res.data.message ?? "No se pudo iniciar sesión. Verificá tus datos y contraseña." };
  }

  return redirect(homeFor(res.data.user.role), {
    headers: { "Set-Cookie": await tokenCookie.serialize(res.data.token) },
  });
}

export default function Login({ actionData }: Route.ComponentProps) {
  const [mode, setMode] = useState<"email" | "ci">("email");
  const invalid = actionData?.error ? true : undefined;

  return (
    <AuthShell>
      <Form method="post" className="w-full max-w-[380px] space-y-7">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight">Iniciar sesión</h2>
          <p className="text-sm text-muted-foreground">Usá tu email o CI para continuar</p>
        </div>

        {actionData?.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {actionData.error}
          </p>
        )}

        <div>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => v && setMode(v as "email" | "ci")}
            variant="outline"
            spacing={0}
            className="w-full"
          >
            <ToggleGroupItem value="email" className="h-11 flex-1 cursor-pointer">Email</ToggleGroupItem>
            <ToggleGroupItem value="ci" className="h-11 flex-1 cursor-pointer">Cédula</ToggleGroupItem>
          </ToggleGroup>

          {mode === "email" ? (
            <div className="space-y-2 mt-12">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" className="h-11" aria-invalid={invalid} required />
            </div>
          ) : (
            <div className="space-y-2 mt-4">
              <Label htmlFor="ci">Cédula de Identidad</Label>
              <Input id="ci" name="ci" inputMode="numeric" placeholder="1.234.567-2" className="h-11" aria-invalid={invalid} required />
            </div>
          )}

          <div className="space-y-2 mt-6 mb-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input id="password" name="password" type="password" className="h-11" aria-invalid={invalid} required />
          </div>
        </div>

        <div className="space-y-4 mt-12">
          <Button type="submit" className="h-11 w-full cursor-pointer">
            Iniciar sesión
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            ¿Es tu primera vez en la plataforma?{" "}
            <Link to="/register" className="font-medium text-foreground hover:text-success">
              Registrate
            </Link>
          </p>
        </div>
      </Form>
    </AuthShell>
  );
}
