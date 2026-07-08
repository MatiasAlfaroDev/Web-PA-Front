import { redirect } from "react-router";
import type { Route } from "./+types/home";
import { getToken } from "~/lib/auth";

export async function loader({ request }: Route.LoaderArgs) {
  // Signed-in users land in the app (the student layout bounces teachers to
  // /admin); everyone else goes to sign in.
  return redirect((await getToken(request)) ? "/app/courses" : "/login");
}

export default function Home() {
  return null;
}
