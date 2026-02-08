import LoginModal from "@components/fallbacks/LoginModal";
import { getUserFromToken } from "@lib/auth/utils";
import { createdThreadsOfUser } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ParloPageProps } from "@type/other";
import { cookies } from "next/headers";
import ThreadList from "../ThreadList";

const Page = async ({ searchParams }: ParloPageProps) => {

    const jar = await cookies();
    const user = await getUserFromToken(jar);

    if (!user) return (
        <LoginModal redirectTo="/thread/created" />
    );

    const queryClient = getQueryClient();
    const { p } = await searchParams;
    const page = parseInt(p || "1") || 1;

    prefetchInfiniteQuery({
        queryClient,
        queryFn: () => createdThreadsOfUser(user.user_id, page, jar),
        queryKey: getQueryKeys("createdThreadsOfUser_uid", { uid: user.user_id }),
        initialPageParam: page,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ThreadList section="created" />
        </HydrationBoundary>
    )
}

export default Page;