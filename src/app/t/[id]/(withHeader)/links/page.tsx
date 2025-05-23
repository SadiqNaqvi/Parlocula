import { getThreadById } from "@lib/helpers/common"
import { isValidObjectId } from "@lib/utils"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { Metadata } from "next"
import PostsTab from "../posts"
import { contentFetcher } from "../utils"
import { getQueryClient } from "@lib/queryClient"
import { getUserFromToken } from "@lib/auth/utils"
import { cookies } from "next/headers"
import { NotFound } from "@components/ui"

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
    const thread_id = params.id.split('-')[0];
    if (!isValidObjectId(thread_id))
        return { title: "Popcorn Paragon" }

    const { success, result } = await getThreadById(thread_id);
    if (!success || !result) return { title: "Popcorn Paragon" }
    const { name, description } = result;
    return { title: `${name} - Thread - Popcorn Paragon`, description };
}

 

const Page = async ({ params, searchParams }: { params: { id: string }, searchParams: { p?: string, f?: string, t?: string } }) => {

    const queryClient = getQueryClient();

    const user = await getUserFromToken(cookies());

    const response = await contentFetcher({
        queryClient,
        id: params.id,
        searchParams,
        section: "links",
        uid: user?.user_id,
    });

    if (!response) return (
        <NotFound
            title="Oops! Look's like you came across a wrong path."
            paras={["Content id is incorrect", "Please go back and try again."]}
        />
    );

    const { filter, page, tag, tid } = response;

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostsTab tag={tag} id={tid} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;