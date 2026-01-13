import { getUserFromToken } from "@lib/auth/utils";
import { fetchMovie } from "@lib/contentFetcher";
import { getShelvesForCinement } from "@lib/helpers/common";
import { getQueryClient, prefetchQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { cookies } from "next/headers";
import MediaPage from "../../components/MediaPage";
import { ParloPageProps } from "@type/other";

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {
    const { id } = await params;
    const data = await fetchMovie(id);

    if (!data) return { title: "Parlocula" };
    return { title: `${data.title} - Parlocula` };
};

export default async function MoviePage({ params }: ParloPageProps) {

    const { id } = await params;

    const queryClient = getQueryClient();

    const user = await getUserFromToken(await cookies());

    const content = await fetchMovie(id);

    if (content && user)
        await prefetchQuery({
            queryFn: () => getShelvesForCinement(content._id, user.user_id),
            queryKey: getQueryKeys("shelfsForCinement_cnid", { cnid: content._id }),
            queryClient,
        });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MediaPage content={content} type="movie" />
        </HydrationBoundary>
    )
};