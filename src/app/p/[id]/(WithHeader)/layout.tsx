import { getUserFromToken } from "@lib/auth/utils";
import { checkIfItemSaved, getPostById, getReactionOnPost } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, isValidObjectId, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";
import PostHeader from "./PostHeader";
import { NotFound } from "@components/ui";
import { FullPageLoadingSpinner } from "@components/ui/LoadingSpinner";
import { TabContainer, TabList } from "@components/ui/Tabs";

type Params = { params: { id: string } }

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
    const id = params.id.split('-')[0];
    if (!isValidObjectId(id)) return { title: "Popcorn Paragon" }
    const { result, success } = await getPostById(id);
    if (!success) return { title: "Popcorn Paragon" }
    const { title, username, body } = result;
    return {
        title: `${title.slice(0, 50)}${username ? " - Post by @" + username : ""} - Popcorn Paragon`,
        description: body
    }
}

const Fetcher = async ({ id, children }: PropsWithChildren<{ id: string }>) => {
    const queryClient = getQueryClient();

    const jar = cookies();
    const user = await getUserFromToken(jar);

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: getQueryKeys("post_id", { id }),
            queryFn: () => queryFunction(getPostById, [id]),
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000,
        }),

        ...(user ? [
            queryClient.prefetchQuery({
                queryKey: getQueryKeys("reaction_pid", { pid: id }),
                queryFn: () => queryFunction(getReactionOnPost, [id, user.user_id, jar]),
                staleTime: 60 * 60 * 1000,
                gcTime: 60 * 60 * 1000
            }),
            queryClient.prefetchQuery({
                queryKey: getQueryKeys("isContentSaved_type_id", { type: "post", id }),
                queryFn: () => queryFunction(checkIfItemSaved, [id, user.user_id, jar]),
                staleTime: 60 * 60 * 1000,
                gcTime: 60 * 60 * 1000
            }),
        ] : [])
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostHeader uid={user?.user_id} id={id} />
            <div className="my-6">
                <TabContainer>
                    <TabList href={`/p/${id}`}>Comments</TabList>
                    <TabList href={`/p/${id}/reposts`}>Reposts</TabList>
                    <TabList href={`/p/${id}/reports`}>Reposts</TabList>
                </TabContainer>
            </div>
            {children}
        </HydrationBoundary>
    )
}

export default function Layout({ children, params }: PropsWithChildren<Params>) {
    const { id } = params;
    const [pid, ...rest] = id.split('-');

    if (!isValidObjectId(pid)) return (
        <main>
            <NotFound
                title="Oops! Look's like you came across a wrong path."
                paras={["Thread id is incorrect", "Please search the thread in explore page."]}
            />
        </main>
    );

    return (
        <main>
            <Suspense fallback={<FullPageLoadingSpinner path={rest} />}>
                <Fetcher id={pid}>{children}</Fetcher>
            </Suspense>
        </main>
    )
}