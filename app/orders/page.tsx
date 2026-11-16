import { redirect } from "next/navigation";

/** The orders list lives in the account area now. */
export default function Page() {
  redirect("/account/orders");
}
