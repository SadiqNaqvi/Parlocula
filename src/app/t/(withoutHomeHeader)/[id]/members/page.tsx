import { getMembers } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import MembersList from "./MembersList";
import { ParloPageProps } from "@type/other";

const Page = async ({ params }: ParloPageProps) => {

    const tid = (await params).id.split('+')[0];

    const queryClient = getQueryClient();

    await prefetchInfiniteQuery({
        queryClient,
        queryKey: getQueryKeys("members_tid", { tid }),
        queryFn: () => getMembers(tid, 1),
        initialPageParam: 1,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MembersList tid={tid} />
        </HydrationBoundary>
    )
}

export default Page;