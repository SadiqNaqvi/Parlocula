import { postTags } from "@lib/constants";
import { getPostsOfThread } from "@lib/helpers/common";
import {
  getQueryKeys,
  isValidObjectId,
  queryFunction,
  refineSearchParams,
} from "@lib/utils";
import { QueryClient } from "@tanstack/react-query";

export const contentFetcher = async ({
  queryClient,
  searchParams,
  id,
  section,
}: {
  queryClient: QueryClient;
  searchParams: { p?: string; f?: string; t?: string };
  id: string;
  section: "posts" | "frames" | "links";
}) => {
  const { filter, page } = refineSearchParams(
    "posts",
    searchParams.p,
    searchParams.f
  );

  const tid = id.split("-")[0];
  if (tid && !isValidObjectId(tid)) return null;

  const tagParam = section === "posts" ? searchParams.t : section;
  const tag = tagParam && postTags.includes(tagParam) ? tagParam : undefined;

  await queryClient.prefetchInfiniteQuery({
    queryKey: getQueryKeys("postsOfThread_tid_filter_tag", {
      tid,
      filter,
      tag: tag || "none",
    }),
    queryFn: () =>
      queryFunction(getPostsOfThread, [tid, page, filter, tag], page),
    initialPageParam: page,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  return { filter, page, tag, tid };
};
