import { LoginModal } from "@components/fallbacks";
import { getUserFromToken } from "@lib/auth/utils";
import { getNotificationsOfUser } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { ParloPageProps } from "@type/other";
import { cookies } from "next/headers";
import NotificationPage from "./NotificationPage";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

const Page = async ({ searchParams }: ParloPageProps) => {

    const jar = await cookies();
    const user = await getUserFromToken(jar);

    if (!user) return (
        <LoginModal
            redirectTo="/notifications"
        />
    )

    const sp = await searchParams;
    const page = parseInt(sp.p || '1') || 1;

    const queryClient = getQueryClient();

    await prefetchInfiniteQuery({
        queryClient,
        queryFn: () => getNotificationsOfUser(user.user_id, page),
        queryKey: getQueryKeys("notifications_uid", { uid: user.user_id })
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NotificationPage />
        </HydrationBoundary>
    )

}

export default Page;