import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Form, Link, useFetcher } from "react-router";
import type { Route } from "./+types/profile";
import { api, apiResult } from "~/lib/api";
import { fullName, getTokenOrRedirect, initialsOf, type User } from "~/lib/auth";
import { courseLockState, mapCourse, type ApiCourse } from "~/lib/mappers";
import { Figure, PageHeader, ProgressTicks } from "~/components/bits";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export function meta() {
  return [{ title: "Tu perfil · Programación Avanzada" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const token = await getTokenOrRedirect(request);
  const [user, courses] = await Promise.all([
    api<User>("/profile", { token }),
    api<ApiCourse[]>("/courses", { token }),
  ]);
  // Only courses the student can actually enter — locked ones belong on the courses page, not this recap.
  return { user, courses: courses.map(mapCourse).filter((c) => !courseLockState(c).locked) };
}

export async function action({ request }: Route.ActionArgs) {
  const token = await getTokenOrRedirect(request);
  const form = await request.formData();

  if (form.get("intent") === "upload-avatar") {
    const body = new FormData();
    body.set("avatar", form.get("avatar") as Blob);
    const res = await apiResult("/profile/avatar", { method: "POST", token, body });
    return { ok: res.ok, error: res.ok ? undefined : res.data.message };
  }

  const res = await apiResult("/profile", {
    method: "PATCH",
    token,
    body: JSON.stringify({
      first_name: form.get("first_name"),
      last_name: form.get("last_name"),
      bio: form.get("bio"),
    }),
  });
  if (!res.ok) return { error: res.data.message ?? "No se pudo guardar tu perfil." };
  return { ok: true };
}

function AvatarUpload({ user }: { user: User }) {
  const upload = useFetcher();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploading = upload.state !== "idle";

  return (
    <upload.Form method="post" encType="multipart/form-data">
      <input type="hidden" name="intent" value="upload-avatar" />
      <input
        ref={inputRef}
        type="file"
        name="avatar"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Cambiar foto de perfil"
        className="group relative rounded-full"
      >
        <Avatar className="size-16">
          {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
          <AvatarFallback className="num text-lg">{initialsOf(user)}</AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="size-5" />
        </span>
      </button>
    </upload.Form>
  );
}

export default function Profile({ loaderData, actionData }: Route.ComponentProps) {
  const { user, courses } = loaderData;
  const [editing, setEditing] = useState(false);

  return (
    <main className="mx-auto max-w-[900px] px-8 py-10 pb-20">
      <PageHeader title="Tu perfil">
        {!editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            Editar perfil
          </Button>
        )}
      </PageHeader>

      {editing ? (
        <Form method="post" onSubmit={() => setEditing(false)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input id="first_name" name="first_name" defaultValue={user.first_name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input id="last_name" name="last_name" defaultValue={user.last_name} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={3}
              defaultValue={user.bio ?? ""}
              placeholder="Una línea sobre vos"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Guardar cambios</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </div>
        </Form>
      ) : (
        <div className="flex items-center gap-5 border-b pb-8">
          <AvatarUpload user={user} />
          <div className="min-w-0 space-y-0.5">
            <p className="section-title text-[19px]">{fullName(user)}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            {user.bio && <p className="pt-1 text-sm text-muted-foreground">{user.bio}</p>}
          </div>
        </div>
      )}

      {actionData && "ok" in actionData && (
        <p className="pt-4 text-sm text-success-ink">Perfil guardado.</p>
      )}

      {/* Three figures side by side on a rule, not three identical cards. */}
      <div className="grid grid-cols-3 gap-6 border-b py-8">
        <Figure value={user.points ?? 0} label="Puntos" tone="accent" />
        <Figure value={user.streak ?? 0} label="Racha diaria" />
        <Figure value={user.solved ?? 0} label="Desafíos resueltos" />
      </div>

      <section className="py-8">
        <h2 className="section-title mb-3">Tus cursos</h2>
        <ul className="divide-y border-t">
          {courses.map((c) => (
            <li key={c.id}>
              <Link
                prefetch="intent"
                to={`/app/courses/${c.id}`}
                className="group flex items-center gap-5 py-3.5"
              >
                <span className="min-w-0 flex-1 truncate font-medium transition-colors group-hover:text-success-ink">
                  {c.title}
                </span>
                <ProgressTicks done={c.done} total={c.total} className="w-32 shrink-0" />
                <span className="num w-12 shrink-0 text-right text-xs text-muted-foreground">
                  {c.done}/{c.total}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
