import { ContentFiltered } from "@components/fallbacks";
import { NotFound } from "@components/ui";
import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import { TabContainer, TabList } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { checkIfItemSaved, getPostById, getReactionOnPost } from "@lib/helpers/common";
import { fetchQuery, getQueryClient, prefetchQuery } from "@lib/providers/queryClient";
import { calculateAge, getQueryKeys, isValidParloId } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";
import PostHeader from "./PostHeader";

type Params = { params: { id: string } }

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {

    const id = params.id.split('-')[0];

    if (!isValidParloId(id)) return { title: "Parlocula" }

    const { result, success } = await getPostById(id);

    if (!success) return { title: "Parlocula" }

    const { title, username, body } = result;

    return {
        title: `${title.slice(0, 50)}${username ? " - Post by @" + username : ""} - Parlocula`,
        description: body
    }
}

const Fetcher = async ({ id, children }: PropsWithChildren<{ id: string }>) => {

    const queryClient = getQueryClient();
    const jar = cookies();
    const user = await getUserFromToken(jar);

    const post = await fetchQuery({
        queryClient,
        queryKey: getQueryKeys("post_id", { id }),
        queryFn: () => getPostById(id),
    });

    // If Post is not found or if Post contains NSFW and user is below 18, show Not Found.
    if (!post || (post.nsfw && user && calculateAge(user.dob) < 18)) return (
        <NotFound
            title="Oops! Looks like the Popcorn Explorers couldn't find anything"
            paras={[
                "Possible reason: Post id is incorrect.",
                "Please search the Post by its title in the explore page.",
                "You can also search the author of the Post by their username."
            ]}
            fullScreen
        />
    )

    // Now if Post contains NSFW and user is a guest or user does not allow NSFW.
    else if (post.nsfw && (!user || user.filterContent)) return (
        <ContentFiltered />
    )

    if (user) {
        const uid = user.user_id;
        await Promise.all([
            prefetchQuery({
                queryClient,
                queryKey: getQueryKeys("reaction_pid", { pid: id }),
                queryFn: () => getReactionOnPost(id, uid, jar),
            }),
            prefetchQuery({
                queryClient,
                queryKey: getQueryKeys("isContentSaved_type_id", { type: "post", id }),
                queryFn: () => checkIfItemSaved(id, uid, jar),
            }),
        ]);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostHeader uid={user?.user_id} id={id} />
            <div className="my-6">
                <TabContainer>
                    <TabList href={`/post/${id}`}>Posts</TabList>
                    <TabList href={`/post/${id}/quotes`}>Quotes</TabList>
                    <TabList href={`/post/${id}/reports`}>Reports</TabList>
                </TabContainer>
            </div>
            {children}
        </HydrationBoundary>
    )
}

const PostLayout = ({ children, params }: PropsWithChildren<Params>) => {
    const { id } = params;
    const [pid, ...rest] = id.split('-');

    if (!isValidParloId(pid)) return (
        <main>
            <NotFound
                title="Oops! Look's like you came across a wrong path."
                paras={[
                    "Post id is incorrect",
                    "Please search the post in explore page."
                ]}
            />
        </main>
    );

    return (
        <main>
            <Suspense fallback={<FullPageLoadingSpinner path={rest} />}>
                <Fetcher id={pid}>
                    {children}
                </Fetcher>
            </Suspense>
        </main>
    )
}

export default PostLayout;