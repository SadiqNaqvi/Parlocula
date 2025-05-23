import { postTags } from "@lib/constants";
import { getPostsOfThread, getThreadById, isMember } from "@lib/helpers/common";
import { getQueryKeys, isValidObjectId, queryFunction, refineSearchParams } from "@lib/utils";
import { QueryClient } from "@tanstack/react-query";

export const contentFetcher = async ({
  queryClient,
  searchParams,
  id,
  section,
  uid,
}: {
  queryClient: QueryClient;
  searchParams: { p?: string; f?: string; t?: string };
  id: string;
  section: "posts" | "frames" | "links";
  uid: string | undefined;
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

  const getQueryConfig = (tag?: string) => ({
    queryKey: getQueryKeys("postsOfThread_tid_filter_page_tag", {
      tid,
      page,
      filter,
      tag: tag || "none",
    }),
    queryFn: () =>
      queryFunction(getPostsOfThread, [tid, page, filter, tag], page),
    initialPageParam: page,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const tabsToPrefetch =
    section === "posts"
      ? ["frames", "links"]
      : section === "frames"
        ? ["links", tag]
        : ["frames", tag];

  tabsToPrefetch.forEach((tab) => {
    queryClient.prefetchInfiniteQuery(getQueryConfig(tab));
  });

  await Promise.all([
    queryClient.prefetchInfiniteQuery(getQueryConfig(tag)),

    queryClient.prefetchQuery({
      queryKey: getQueryKeys("thread_id", { id: tid }),
      queryFn: () => queryFunction(getThreadById, [tid]),
      staleTime: 60 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    }),

    ...(uid
      ? [
          queryClient.prefetchQuery({
            queryKey: getQueryKeys("membership_tid", { tid }),
            queryFn: () => queryFunction(isMember, [tid, uid]),
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000,
          }),
        ]
      : []),
  ]);

  return { filter, page, tag, tid };
};
