import { ShowError } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { threadsByUser } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import JoinedThreads from "./JoinedThreads";

const Page = async ({ searchParams }: { searchParams: { p?: string } }) => {

    const jar = cookies();
    const user = await getUserFromToken(jar);

    if (!user) return (
        <section className="size-screen">
            <ShowError heading="Nothing to see here" messages={["You need to log-in to see your joined threads here."]} />
        </section>
    );

    const queryClient = getQueryClient();
    const pageParam = searchParams.p ? parseInt(searchParams.p) : 2;

    // Make sure we prefetch the second page because we store the first page on the client side.
    const page = isNaN(pageParam) || pageParam === 1 ? 2 : pageParam;

    await queryClient.prefetchInfiniteQuery({
        queryFn: () => queryFunction(threadsByUser, [user.user_id, page], page),
        queryKey: getQueryKeys("threadOfUser_uid", { uid: user.user_id }),
        initialPageParam: page,
        staleTime: 3600 * 1000,
        gcTime: 3600 * 1000,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <JoinedThreads />
        </HydrationBoundary>
    )
}

export default Page;