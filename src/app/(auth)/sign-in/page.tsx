import { SignIn } from "../../../features/auth/views/sign-in";
import { requireNoAuth } from "../../../lib/server";


export default async function LoginPage() {

  await requireNoAuth()

  return (
    <SignIn />
  );
}
