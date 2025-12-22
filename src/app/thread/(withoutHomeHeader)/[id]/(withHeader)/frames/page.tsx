import { getQueryClient } from "@lib/providers/queryClient"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import PostsTab from "../posts"
import { contentFetcher } from "../utils"
import { getUserFromToken } from "@lib/auth/utils"
import { cookies } from "next/headers"

const Page = async ({ params: { id }, searchParams }: { params: { id: string }, searchParams: { p?: string, f?: string, t?: string } }) => {

    const queryClient = getQueryClient();

    const user = await getUserFromToken(cookies());

    const allowNsfw = user ? !user.filterContent : false;

    const response = await contentFetcher({
        queryClient, id, searchParams, section: "frames", allowNsfw
    });

    if (!response) return null;

    const { filter, page, category, tid } = response;

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostsTab
                allowNsfw={allowNsfw}
                section="frames"
                category={category}
                id={tid}
                filter={filter}
                page={page}
            />
        </HydrationBoundary>
    )
}

export default Page;