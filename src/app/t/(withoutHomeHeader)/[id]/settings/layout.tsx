import { ShowError } from "@components/ui";
import { FullPageLoadingSpinner } from "@components/ui/LoadingSpinner";
import { getUserFromToken } from "@lib/auth/utils";
import { getThreadById } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Thread } from "@type/internal";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";

const Fetcher = async ({ id, children }: PropsWithChildren<{ id: string }>) => {
    const queryClient = getQueryClient();
    const user = await getUserFromToken(cookies());

    if (!user) return (
        <section className="size-screen">
            <ShowError heading="You're not allowed to be here" errCode="unauthenticated_access" />
        </section>
    )

    const thread: Thread = await queryClient.fetchQuery({
        queryFn: () => queryFunction(getThreadById, [id]),
        queryKey: getQueryKeys("thread_id", { id }),
        staleTime: 3600 * 1000,
        gcTime: 3600 * 1000,
    });

    const { user_id } = user;

    if (!(thread.created_by === user_id || thread.managers?.find(manager => manager === user.user_id)))
        return (
            <section className="size-screen">
                <ShowError
                    heading="You're not allowed to be here"
                    errCode="unauthenticated_access" />
            </section>
        )

    return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>

}

const ThreadSettingLayout = ({ params }: { params: { id: string } }) => {

    const [id, ...rest] = params.id.split("-");

    return (
        <Suspense fallback={<FullPageLoadingSpinner path={rest} />}>
            <Fetcher id={id} />
        </Suspense>
    )
}

export default ThreadSettingLayout;