import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { apiResult } from "~/lib/api";
import { getToken, tokenCookie } from "~/lib/auth";

// Revoke the token server-side (best effort), then clear the cookie.
export async function action({ request }: Route.ActionArgs) {
  const token = await getToken(request);
  if (token) {
    await apiResult("/logout", { method: "POST", token }).catch(() => {});
  }
  return redirect("/login", {
    headers: { "Set-Cookie": await tokenCookie.serialize("", { maxAge: 0 }) },
  });
}

export async function loader() {
  return redirect("/login");
}
