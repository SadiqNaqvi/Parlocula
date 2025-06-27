import { fetchShow } from "@lib/contentFetcher";
import MediaPage from "../../components/MediaPage";
import { Metadata } from "next";
import { getQueryClient } from "@lib/queryClient";
import { cookies } from "next/headers";
import { getUserFromToken } from "@lib/auth/utils";
import { getListsForMedia } from "@lib/helpers/common";
import { queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

type Props = { params: { id: string } };

const fetchData = async (params: { id: string }) => {

    const show_id = params.id.split('-')[0];
    if (show_id === "undefined" || show_id.length < 4) return;

    return await fetchShow(show_id)
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const data = await fetchData(params);

    if (!data) return { title: "Popcorn Paragon" };
    return {
        title: `${data.title} - Popcorn Paragon`,
        description: data.overview,
    };
};

export default async function Page({ params }: Props) {

    const { id } = params;
    const queryClient = getQueryClient();
    const user = await getUserFromToken(cookies());
    const content = await fetchData(params);
    if (content && user)
        await queryClient.prefetchQuery({
            queryFn: () => queryFunction(getListsForMedia, [content.media_id, user.user_id]),
            queryKey: [`lists-for-media-${content.media_id}`],
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000,
        });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MediaPage content={content} type="show" />
        </HydrationBoundary>
    )
}