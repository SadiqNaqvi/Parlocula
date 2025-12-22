import { NotFound } from "@components/ui";
import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import { getUserFromToken } from "@lib/auth/utils";
import { getThreadById, isMember } from "@lib/helpers/common";
import { getQueryClient, prefetchQuery } from "@lib/providers/queryClient";
import { createArray, getQueryKeys, isValidParloId } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";
import Thread from "./Thread";

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
    const thread_id = params.id.split('-')[0];

    if (!isValidParloId(thread_id))
        return { title: "Parlocula" }

    const { success, result } = await getThreadById(thread_id);

    if (!success || !result) return { title: "Parlocula" }

    const { name, description } = result;
    return { title: `${name} - Thread - Parlocula`, description };
}

const Fetcher = async ({ tid, children }: PropsWithChildren<{ tid: string }>) => {
    const queryClient = getQueryClient();

    const jar = cookies();
    const user = await getUserFromToken(jar);

    await Promise.all(
        createArray(
            prefetchQuery({
                queryClient,
                queryKey: getQueryKeys("thread_id", { id: tid }),
                queryFn: () => getThreadById(tid),
            }),
        ).concatConditionally(user?.user_id, (uid) => [
            prefetchQuery({
                queryClient,
                queryKey: getQueryKeys("membership_tid", { tid }),
                queryFn: () => isMember(tid, uid, jar),
            }),

        ]
        ))

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Thread uid={user?.user_id} id={tid} />
            {children}
        </HydrationBoundary>
    )
}

const ThreadLayout = ({ children, params }: PropsWithChildren<{ params: { id: string } }>) => {

    const { id } = params;
    const [tid, ...rest] = id.split('-');

    if (!isValidParloId(tid)) return (
        <NotFound
            title="Oops! Look's like you came across a wrong path."
            paras={["Thread id is incorrect", "Please search the thread in explore page."]}
        />
    );

    return (
        <Suspense fallback={<FullPageLoadingSpinner path={rest} />}>
            <Fetcher tid={tid}>{children}</Fetcher>
        </Suspense>
    )

}

export default ThreadLayout;