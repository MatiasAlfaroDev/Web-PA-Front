import { Form, Link } from "react-router";
import type { Route } from "./+types/forgot-password";
import { apiResult } from "~/lib/api";
import { AuthShell } from "~/components/auth-shell";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function meta() {
  return [{ title: "Restablecer contraseña · CodeClass" }];
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  // Backend returns the same message whether or not the email exists.
  await apiResult("/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: form.get("email") }),
  });
  return { sent: true };
}

export default function ForgotPassword({ actionData }: Route.ComponentProps) {
  return (
    <AuthShell>
      <div className="w-full max-w-[360px] space-y-5">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight">Restablecé tu contraseña</h2>
          <p className="text-sm text-muted-foreground">
            Ingresá tu email y te enviaremos un enlace para crear una nueva.
          </p>
        </div>

        {actionData?.sent ? (
          <p className="rounded-md bg-success-soft px-3 py-2 text-sm text-success-soft-foreground">
            Si ese email está registrado, te llegará un enlace para restablecerla. Revisá tu bandeja de entrada.
          </p>
        ) : (
          <Form method="post" className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@school.edu" required />
            </div>
            <Button type="submit" className="h-10 w-full">
              Enviar enlace
            </Button>
          </Form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
