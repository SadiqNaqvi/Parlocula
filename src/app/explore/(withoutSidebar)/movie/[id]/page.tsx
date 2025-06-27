import { fetchMovie } from "@lib/contentFetcher";
import MediaPage from "../../components/MediaPage";
import { Metadata } from "next";
import { getQueryClient } from "@lib/queryClient";
import { cookies } from "next/headers";
import { getUserFromToken } from "@lib/auth/utils";
import { getListsForMedia } from "@lib/helpers/common";
import { queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

type Props = { params: { id: string } };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { id } = params;
    const data = await fetchMovie(id);

    if (!data) return { title: "Popcorn Paragon" };
    return { title: `${data.title} - Popcorn Paragon` };
};

export default async function MoviePage({ params }: Props) {

    const { id } = params;
    const queryClient = getQueryClient();
    const user = await getUserFromToken(cookies());
    const content = await fetchMovie(id);
    if (content && user)
        await queryClient.prefetchQuery({
            queryFn: () => queryFunction(getListsForMedia, [content.media_id, user.user_id]),
            queryKey: [`lists-for-media-${content.media_id}`],
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000,
        });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MediaPage content={content} type="movie" />
        </HydrationBoundary>
    )
};