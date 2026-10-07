import { Form, redirect } from "react-router";
import type { Route } from "./+types/course-new";
import { apiResult } from "~/lib/api";
import { getTokenOrRedirect } from "~/lib/auth";
import { BackLink } from "~/components/bits";
import { AdminFormHeader, CourseForm } from "~/components/course-form";
import { Button } from "~/components/ui/button";

export function meta() {
  return [{ title: "Nuevo curso · Programación Avanzada" }];
}

export async function action({ request }: Route.ActionArgs) {
  const token = await getTokenOrRedirect(request);
  const form = await request.formData();
  const res = await apiResult<{ id: number }>("/courses", {
    method: "POST",
    token,
    body: JSON.stringify({
      title: form.get("title"),
      description: form.get("description"),
      published: form.get("published") === "on",
      available_from: form.get("available_from") || null,
      available_until: form.get("available_until") || null,
    }),
  });
  if (!res.ok) return { error: res.data.message ?? "No se pudo crear el curso." };
  return redirect(`/admin/courses/${res.data.id}`);
}

export default function CourseNew({ actionData }: Route.ComponentProps) {
  return (
    <main className="mx-auto max-w-[1400px] px-8 py-10 pb-20">
      <BackLink to="/admin/courses">Mis cursos</BackLink>

      <Form method="post">
        <AdminFormHeader
          title="Nuevo curso"
          subtitle="Definí lo básico ahora y agregá los desafíos después de crearlo"
          action={<Button type="submit">Crear curso</Button>}
        />

        {actionData?.error && (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {actionData.error}
          </p>
        )}

        <CourseForm />
      </Form>

      <p className="mt-4 text-sm text-muted-foreground">
        Guardá el curso para empezar a agregar desafíos.
      </p>
    </main>
  );
}
