import { requireAuth } from "../../../lib/server";

const IdeasPage = async () => {

  await requireAuth();

  return (
    <div>IdeasPage</div>
  )
}

export default IdeasPage