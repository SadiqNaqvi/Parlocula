import LoginModal from "@components/fallbacks/LoginModal";
import { NotFound, ShowError } from "@components/ui";
import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import { getUserFromToken } from "@lib/auth/utils";
import { getThreadById } from "@lib/helpers/common";
import { fetchQuery, getQueryClient } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ParloPageProps } from "@type/other";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";

const Fetcher = async ({ id, children }: PropsWithChildren<{ id: string }>) => {

    const queryClient = getQueryClient();
    const user = await getUserFromToken(await cookies());

    if (!user) return (
        <LoginModal redirectTo={`/thread/${id}/settings`} />
    )

    const thread = await fetchQuery({
        queryFn: () => getThreadById(id),
        queryKey: getQueryKeys("thread_id", { id }),
        queryClient
    });

    const { user_id } = user;

    if (!thread) return (
        <NotFound
            title="Oops, Parlocula Explorers couldn't find anything."
            paras={["A Thread could not be found with the provided id.", "Please search the thread by it's name in the explore page."]}
            redirectToExplore
        />
    )

    if (!(thread.created_by === user_id || thread.managers?.find(manager => manager._id === user.user_id)))
        return (
            <section className="size-screen">
                <ShowError
                    heading="You're not allowed to be here"
                    errCode="unauthenticated_access" />
            </section>
        )

    return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>

}

const ThreadSettingLayout = async ({ params }: ParloPageProps) => {

    const [id, ...rest] = (await params).id.split("-");

    return (
        <Suspense fallback={<FullPageLoadingSpinner path={rest} />}>
            <Fetcher id={id} />
        </Suspense>
    )
}

export default ThreadSettingLayout;