import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";

export const requireAuth = async () => {

  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  if (session) {
    return redirect("/dashboard");
  }

}

export const requireNoAuth = async () => {

  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  if (!session) {
    redirect("/sign-in");
  }
};