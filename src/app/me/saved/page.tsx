import { ShowError } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { getQueryClient } from "@lib/queryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import SavedSection from "./Section";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { getSavedContent } from "@lib/helpers/common";
import { Metadata } from "next";

export const generateMetadata = (): Metadata => {
    return { title: "Saved Posts" }
}

const SavedPostsPage = async () => {

    const jar = cookies();
    const user = await getUserFromToken(jar);
    const queryClient = getQueryClient();

    if (!user) return (
        <section className="size-screen">
            <ShowError heading="Oops! We could'nt find anything" messages={["Looks like you're not logged in", "Log-in to see your Saved Posts here"]} />
        </section>
    )

    const { user_id } = user;

    await queryClient.prefetchInfiniteQuery({
        queryFn: () => queryFunction(getSavedContent, [user_id, "post", 1], 1),
        queryKey: getQueryKeys(`saved_posts_uid`, { uid: user_id }),
        initialPageParam: 1,
        staleTime: 3600 * 1000,
        gcTime: 3600 * 1000,
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <SavedSection type="post" uid={user_id} />
        </HydrationBoundary>
    )

}

export default SavedPostsPage;