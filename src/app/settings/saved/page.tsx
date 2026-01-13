import { LoginModal } from "@components/fallbacks";
import { getUserFromToken } from "@lib/auth/utils";
import { getSavedContent } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { cookies } from "next/headers";
import SavedSection from "./Section";

export const generateMetadata = (): Metadata => {
    return { title: "Saved Posts" }
}

const SavedPostsPage = async () => {

    const jar = await cookies();
    const user = await getUserFromToken(jar);
    const queryClient = getQueryClient();

    if (!user) return (
        <LoginModal redirectTo="/settings/saved" />
    )

    const { user_id } = user;

    await prefetchInfiniteQuery({
        queryClient,
        queryFn: () => getSavedContent(user_id, "post", 1),
        queryKey: getQueryKeys(`saved-posts_uid`, { uid: user_id }),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <SavedSection type="post" uid={user_id} />
        </HydrationBoundary>
    )

}

export default SavedPostsPage;