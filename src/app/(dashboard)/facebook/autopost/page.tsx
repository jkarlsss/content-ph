import { MetaAutoPost } from "../../../../features/autopost/components/meta-auto-post";
import { prefetch, trpc } from "../../../../trpc/server";

const AutoPostPage = () => {

  prefetch(trpc.meta.getConnection.queryOptions());

  return (
    <MetaAutoPost />
  )
}

export default AutoPostPage