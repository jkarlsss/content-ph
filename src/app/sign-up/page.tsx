import SignUp from "../../features/auth/views/sign-up";
import { requireAuth } from "../../lib/server";

export default async function  SignupPage () {

  await requireAuth()

  return (
    <SignUp />
  );
}
