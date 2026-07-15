import { redirect } from "react-router";
import type { Route } from "./+types/home";
import { getToken, homeFor, requireUser } from "~/lib/auth";

export async function loader({ request }: Route.LoaderArgs) {
  if (!(await getToken(request))) return redirect("/login");
  const user = await requireUser(request);
  return redirect(homeFor(user.role));
}

export default function Home() {
  return null;
}
