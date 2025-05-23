import { getThreadById } from "@lib/helpers/common"
import { isValidObjectId } from "@lib/utils"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { Metadata } from "next"
import PostsTab from "../posts"
import { contentFetcher } from "../utils"
import { getQueryClient } from "@lib/queryClient"
import { getUserFromToken } from "@lib/auth/utils"
import { cookies } from "next/headers"

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
        section: "links",
        uid: user?.user_id
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostsTab tag={tag} id={tid} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;