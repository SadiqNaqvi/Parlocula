import { getUserFromToken } from "@lib/auth/utils";
import { fetchShow } from "@lib/contentFetcher";
import { getAllShelvesOfUser, getShelvesForCinement } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery, prefetchQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ParloPageProps } from "@type/other";
import { Metadata } from "next";
import { cookies } from "next/headers";
import CinementPage from "../../components/CinementPage";

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {
    const data = await fetchShow((await params).id, false);

    if (!data) return { title: "Parlocula" };
    return {
        title: `${data.title} - Parlocula`,
        description: data.overview,
    };
};

export default async function Page({ params }: ParloPageProps) {

    const jar = await cookies();
    const user = await getUserFromToken(jar);

    const queryClient = getQueryClient();
    const content = await fetchShow((await params).id, true);

    if (content && user) {
        await Promise.all([
            prefetchQuery({
                queryFn: () => getShelvesForCinement(content.cinement_id, user.user_id, jar),
                queryKey: getQueryKeys("shelfsForCinement_cnid", { cnid: content.cinement_id }),
                queryClient,
            }),
            prefetchInfiniteQuery({
                queryFn: () => getAllShelvesOfUser(user.user_id, 1, jar),
                queryKey: getQueryKeys("allShelvesOfUser_uid", { uid: user.user_id }),
                queryClient,
            }),
        ])
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CinementPage content={content} type="show" />
        </HydrationBoundary>
    )
}