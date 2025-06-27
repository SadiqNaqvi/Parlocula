import { getQueryClient } from "@lib/queryClient"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import PostsTab from "../posts"
import { contentFetcher } from "../utils"

const Page = async ({ params: { id }, searchParams }: { params: { id: string }, searchParams: { p?: string, f?: string, t?: string } }) => {

    const queryClient = getQueryClient();

    const response = await contentFetcher({
        queryClient, id, searchParams, section: "frames",
    });

    if (!response) return null;

    const { filter, page, tag, tid } = response;

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostsTab tag={tag} id={tid} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;