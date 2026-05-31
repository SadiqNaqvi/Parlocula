import VerticleThreadList from "@app/explore/(withoutSidebar)/components/VerticleThreadList";
import { getUserFromToken } from "@lib/auth/utils";
import { getThreadsForTaleonOrArtist } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ParloPageProps } from "@type/other";
import { cookies } from "next/headers";

const TaleonThreadPage = async ({ params, searchParams }: ParloPageProps) => {

    const queryClient = getQueryClient();
    const sp = await searchParams;
    const { filter, page } = refineSearchParams("threads", sp.p, sp.f)

    const id = (await params).id.split('+')[0];

    const user = await getUserFromToken(await cookies());

    const allowNsfw = user ? !user.filterContent : false;

    await prefetchInfiniteQuery({
        queryKey: ["threads-for-media", id, filter],
        queryFn: () => getThreadsForTaleonOrArtist(id, page, allowNsfw),
        initialPageParam: page,
        queryClient,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <VerticleThreadList id={id} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default TaleonThreadPage;