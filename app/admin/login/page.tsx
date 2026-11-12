import { redirect } from "next/navigation";

/** Admins use the shared sign-in page; keep this URL working for bookmarks. */
export default function Page() {
  redirect("/login?next=/admin");
}
