import SignUp from "../../../features/auth/views/sign-up";
import { requireNoAuth } from "../../../lib/server";

export default async function  SignupPage () {

  await requireNoAuth()

  return (
    <SignUp />
  );
}
