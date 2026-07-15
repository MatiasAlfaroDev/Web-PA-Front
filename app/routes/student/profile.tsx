import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Form, Link, useFetcher } from "react-router";
import type { Route } from "./+types/profile";
import { api, apiResult } from "~/lib/api";
import { fullName, getTokenOrRedirect, initialsOf, type User } from "~/lib/auth";
import { courseLockState, mapCourse, type ApiCourse } from "~/lib/mappers";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Progress } from "~/components/ui/progress";
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
          <AvatarFallback className="font-mono text-lg">{initialsOf(user)}</AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="size-5" />
        </span>
      </button>
    </upload.Form>
  );
}

export default function Profile({ loaderData, actionData }: Route.ComponentProps) {
  const { user, courses } = loaderData;
  const [editing, setEditing] = useState(false);

  const stats = [
    { label: "Puntos", value: user.points ?? 0 },
    { label: "Racha diaria", value: user.streak ?? 0 },
    { label: "Desafíos resueltos", value: user.solved ?? 0 },
  ];

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-8 py-10 pb-20">
      <h1 className="text-[28px] font-extrabold tracking-tight">Tu perfil</h1>

      {editing ? (
        <Form
          method="post"
          onSubmit={() => setEditing(false)}
          className="space-y-4 rounded-xl border bg-card p-6"
        >
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
            <Textarea id="bio" name="bio" rows={3} defaultValue={user.bio ?? ""} placeholder="Una línea sobre vos" />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Guardar cambios</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </div>
        </Form>
      ) : (
        <div className="flex items-center gap-4 rounded-xl border bg-card p-6">
          <AvatarUpload user={user} />
          <div className="space-y-0.5">
            <p className="text-lg font-bold">{fullName(user)}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.bio && <p className="pt-1 text-sm text-muted-foreground">{user.bio}</p>}
          </div>
          <Button variant="outline" className="ml-auto" onClick={() => setEditing(true)}>
            Editar perfil
          </Button>
        </div>
      )}

      {actionData && "ok" in actionData && (
        <p className="text-sm text-success">Perfil guardado.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5">
            <p className="font-mono text-3xl font-bold text-success">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Tus cursos</h2>
        <div className="divide-y rounded-xl border bg-card">
          {courses.map((c) => {
            const pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
            return (
              <Link prefetch="intent"
                key={c.id}
                to={`/app/courses/${c.id}`}
                className="flex items-center gap-4 p-4 hover:bg-muted/40"
              >
                <span className="w-40 shrink-0 font-semibold">{c.title}</span>
                <Progress value={pct} className="h-1.5 flex-1" />
                <span className="w-14 shrink-0 text-right font-mono text-xs text-muted-foreground">
                  {c.done}/{c.total}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <Form method="post" action="/logout">
        <Button type="submit" variant="outline">
          Cerrar sesión
        </Button>
      </Form>
    </main>
  );
}
