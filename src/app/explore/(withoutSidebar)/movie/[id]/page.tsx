import { getUserFromToken } from "@lib/auth/utils";
import { fetchMovie } from "@lib/contentFetcher";
import { getAllShelvesOfUser, getShelvesForCinement } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery, prefetchQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ParloPageProps } from "@type/other";
import { Metadata } from "next";
import { cookies } from "next/headers";
import CinementPage from "../../components/CinementPage";

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {
    const { id } = await params;
    const data = await fetchMovie(id, false);

    if (!data)
        return { title: "Parlocula" };
    return {
        title: `${data.title} - Parlocula`,
        description: data.overview.length > data.plot.length ? data.overview : data.plot,
    };
};

export default async function MoviePage({ params }: ParloPageProps) {

    const { id } = await params;

    const queryClient = getQueryClient();

    const jar = await cookies();
    const user = await getUserFromToken(jar);

    const content = await fetchMovie(id, true);

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
            <CinementPage content={content} type="movie" />
        </HydrationBoundary>
    )
};