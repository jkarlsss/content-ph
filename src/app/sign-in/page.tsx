import { SignIn } from "../../features/auth/views/sign-in";
import { requireAuth } from "../../lib/server";


export default async function LoginPage() {

  await requireAuth()

  return (
    <SignIn />
  );
}
