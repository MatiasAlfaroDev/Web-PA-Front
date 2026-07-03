import { Button } from "~/components/ui/button";

export default function Login() {
  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {/* ponytail: placeholder — real form + backend auth wire up later */}
      <Button disabled>Sign in (coming soon)</Button>
    </main>
  );
}
