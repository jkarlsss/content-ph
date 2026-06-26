import { requireAuth } from "../../../lib/server";

const DashboardPage = async () => {

  await requireAuth();

  return (
    <div>DashboardPage</div>
  )
}

export default DashboardPage