import { Form, Link, redirect, useSearchParams } from "react-router";
import type { Route } from "./+types/reset-password";
import { apiResult } from "~/lib/api";
import { AuthShell } from "~/components/auth-shell";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function meta() {
  return [{ title: "Crear una nueva contraseña · Programación Avanzada" }];
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const res = await apiResult("/reset-password", {
    method: "POST",
    body: JSON.stringify({
      token: form.get("token"),
      email: form.get("email"),
      password: form.get("password"),
      password_confirmation: form.get("password_confirmation"),
    }),
  });

  if (!res.ok) {
    return { error: res.data.message ?? "No se pudo restablecer tu contraseña. Puede que el enlace haya vencido." };
  }

  return redirect("/login?reset=1");
}

export default function ResetPassword({ actionData }: Route.ComponentProps) {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  return (
    <AuthShell>
      <Form method="post" className="w-full max-w-[360px] space-y-5">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight">Creá una nueva contraseña</h2>
          <p className="text-sm text-muted-foreground">Elegí una contraseña para {email || "tu cuenta"}.</p>
        </div>

        {actionData?.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {actionData.error}
          </p>
        )}

        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />
        <div className="space-y-2">
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input id="password" name="password" type="password" required />
          <p className="text-xs text-muted-foreground">
            Al menos 8 caracteres, con mayúsculas, minúsculas y un número.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
          <Input id="password_confirmation" name="password_confirmation" type="password" required />
        </div>

        <Button type="submit" className="h-10 w-full">
          Actualizar contraseña
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </Form>
    </AuthShell>
  );
}
