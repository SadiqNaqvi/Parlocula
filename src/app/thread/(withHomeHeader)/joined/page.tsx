import LoginModal from "@components/fallbacks/LoginModal";
import { getUserFromToken } from "@lib/auth/utils";
import { joinedThreadsOfUser } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import ThreadList from "../ThreadList";
import { ParloPageProps } from "@type/other";

const Page = async ({ searchParams }: ParloPageProps) => {

    const jar = await cookies();
    const user = await getUserFromToken(jar);

    if (!user) return (
        <LoginModal skipFullScreen redirectTo="/thread/joined" />
    );

    const queryClient = getQueryClient();
    const { p } = await searchParams;
    const page = parseInt(p || "1") || 1;

    prefetchInfiniteQuery({
        queryClient,
        queryFn: () => joinedThreadsOfUser(user.user_id, page, jar),
        queryKey: getQueryKeys("joinedThreadsOfUser_uid", { uid: user.user_id }),
        initialPageParam: page,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ThreadList section="joined" />
        </HydrationBoundary>
    )
}

export default Page;