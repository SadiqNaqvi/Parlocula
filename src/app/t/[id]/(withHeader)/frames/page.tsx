import { getUserFromToken } from "@lib/auth"
import { getThreadById } from "@lib/helpers/common"
import { getQueryClient } from "@lib/queryClient"
import { isValidObjectId } from "@lib/utils"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { Metadata } from "next"
import { cookies } from "next/headers"
import PostsTab from "../posts"
import { contentFetcher } from "../utils"

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
    const thread_id = params.id.split('-')[0];
    if (!isValidObjectId(thread_id))
        return { title: "Popcorn Paragon" }

    const { success, result } = await getThreadById(thread_id);
    if (!success || !result) return { title: "Popcorn Paragon" }
    const { name, description } = result;
    return { title: `${name} - Thread - Popcorn Paragon`, description };
}

export const generateStaticParams = async () => {
    return []
}

const Page = async ({ params, searchParams }: { params: { id: string }, searchParams: { p?: string, f?: string, t?: string } }) => {

    const queryClient = getQueryClient();

    const user = await getUserFromToken(cookies());

    const { filter, page, tag, tid } = await contentFetcher({
        queryClient,
        id: params.id,
        searchParams,
        section: "frames",
        uid: user?.user_id,
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostsTab tag={tag} id={tid} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;