import { availablePostCategories } from "@lib/constants";
import { getPostsOfThread } from "@lib/helpers/common";
import { prefetchInfiniteQuery } from "@lib/providers/queryClient";
import {
  getQueryKeys,
  isValidParloId,
  refineSearchParams
} from "@lib/utils";
import { QueryClient } from "@tanstack/react-query";

export const contentFetcher = async ({
  queryClient,
  searchParams,
  id,
  section,
  allowNsfw,
}: {
  queryClient: QueryClient;
  searchParams: { p?: string; f?: string; c?: string };
  id: string;
  allowNsfw: boolean,
  section: "posts" | "frames" | "links";
}) => {

  const { filter, page } = refineSearchParams("posts", searchParams.p, searchParams.f);

  const tid = id.split("-")[0];
  if (tid && !isValidParloId(tid)) return null;

  const category = searchParams.c && availablePostCategories.includes(searchParams.c) ? searchParams.c : undefined;

  await prefetchInfiniteQuery({
    queryKey: getQueryKeys("postsOfThread_tid_filter_category", {
      tid,
      filter,
      category: category || "none",
    }),
    queryClient,
    queryFn: () => getPostsOfThread(tid, page, allowNsfw, filter, section, category),
    initialPageParam: page,
  });

  return { filter, page, category, tid };
};
