import { Form, Link, redirect, useSearchParams } from "react-router";
import type { Route } from "./+types/verify-email";
import { apiResult } from "~/lib/api";
import { AuthShell } from "~/components/auth-shell";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function meta() {
  return [{ title: "Verificar email · CodeClass" }];
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");

  if (form.get("intent") === "resend") {
    await apiResult("/resend-code", { method: "POST", body: JSON.stringify({ email }) });
    return { notice: "Enviamos un nuevo código. Revisá tu bandeja de entrada." };
  }

  const res = await apiResult("/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code: form.get("code") }),
  });

  if (!res.ok) {
    return { error: res.data.message ?? "Código inválido o vencido." };
  }

  return redirect("/login?verified=1");
}

export default function VerifyEmail({ actionData }: Route.ComponentProps) {
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";

  return (
    <AuthShell>
      <Form method="post" className="w-full max-w-[360px] space-y-5">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight">Revisá tu email</h2>
          <p className="text-sm text-muted-foreground">
            Enviamos un código de 6 dígitos{email ? ` a ${email}` : ""}. Ingresalo abajo.
          </p>
        </div>

        {actionData?.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {actionData.error}
          </p>
        )}
        {actionData?.notice && (
          <p className="rounded-md bg-success-soft px-3 py-2 text-sm text-success-soft-foreground">
            {actionData.notice}
          </p>
        )}

        <input type="hidden" name="email" value={email} />
        <div className="space-y-2">
          <Label htmlFor="code">Código de verificación</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            className="text-center font-mono text-lg tracking-[0.4em]"
            required
          />
        </div>

        <Button type="submit" className="h-10 w-full">
          Verificar email
        </Button>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <button type="submit" name="intent" value="resend" className="hover:text-foreground">
            Reenviar código
          </button>
          <Link to="/login" className="hover:text-foreground">
            Volver a iniciar sesión
          </Link>
        </div>
      </Form>
    </AuthShell>
  );
}
