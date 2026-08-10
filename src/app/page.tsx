import { redirect } from "next/navigation";

/** Redirects the application root to the supported user dashboard. */
export default function Home() {
  redirect("/users/jtw7913");
}
