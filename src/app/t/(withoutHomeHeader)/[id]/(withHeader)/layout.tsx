import { LoadingSpinner, NotFound } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { getThreadById, isMember } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, isValidObjectId, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";
import Thread from "./Thread";
import { FullPageLoadingSpinner } from "@components/ui/LoadingSpinner";

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
    const thread_id = params.id.split('-')[0];
    if (!isValidObjectId(thread_id))
        return { title: "Popcorn Paragon" }

    const { success, result } = await getThreadById(thread_id);
    if (!success || !result) return { title: "Popcorn Paragon" }
    const { name, description } = result;
    return { title: `${name} - Thread - Popcorn Paragon`, description };
}

const Fetcher = async ({ tid, children }: PropsWithChildren<{ tid: string }>) => {
    const queryClient = getQueryClient();

    const jar = cookies();
    const user = await getUserFromToken(jar);

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: getQueryKeys("thread_id", { id: tid }),
            queryFn: () => queryFunction(getThreadById, [tid]),
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000,
        }),

        ...(user
            ? [
                queryClient.prefetchQuery({
                    queryKey: getQueryKeys("membership_tid", { tid }),
                    queryFn: () => queryFunction(isMember, [tid, user.user_id, jar]),
                    staleTime: 60 * 60 * 1000,
                    gcTime: 60 * 60 * 1000,
                }),
            ]
            : [])
    ]);

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

    if (!isValidObjectId(tid)) return (
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