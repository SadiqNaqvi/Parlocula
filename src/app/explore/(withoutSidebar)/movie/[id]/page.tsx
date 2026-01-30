import { getUserFromToken } from "@lib/auth/utils";
import { fetchMovie } from "@lib/contentFetcher";
import { getShelvesForCinement } from "@lib/helpers/common";
import { getQueryClient, prefetchQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { cookies } from "next/headers";
import CinementPage from "../../components/CinementPage";
import { ParloPageProps } from "@type/other";
import CinementWikiSkeleton from "@components/ui/loading/CinementWikiSkeleton";

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {
    const { id } = await params;
    const data = await fetchMovie(id, false);

    if (!data) 
        return { title: "Parlocula" };
    return { title: `${data.title} - Parlocula` };
};

export default async function MoviePage({ params }: ParloPageProps) {

    const { id } = await params;

    const queryClient = getQueryClient();

    const user = await getUserFromToken(await cookies());

    const content = await fetchMovie(id, true);

    if (content && user)
        await prefetchQuery({
            queryFn: () => getShelvesForCinement(content.cinement_id, user.user_id),
            queryKey: getQueryKeys("shelfsForCinement_cnid", { cnid: content.cinement_id }),
            queryClient,
        });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CinementPage content={content} type="movie" />
        </HydrationBoundary>
    )
};