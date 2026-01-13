import { getUserFromToken } from "@lib/auth/utils";
import { fetchShow } from "@lib/contentFetcher";
import { getShelvesForCinement } from "@lib/helpers/common";
import { getQueryClient, prefetchQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { cookies } from "next/headers";
import MediaPage from "../../components/MediaPage";
import { ParloPageProps } from "@type/other";

const fetchData = async (params: { id: string }) => {
    const show_id = params.id.split('-')[0];
    if (show_id === "undefined" || show_id.length < 4) return;

    return await fetchShow(show_id)
}

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {
    const data = await fetchData(await params);

    if (!data) return { title: "Parlocula" };
    return {
        title: `${data.title} - Parlocula`,
        description: data.overview,
    };
};

export default async function Page({ params }: ParloPageProps) {

    const queryClient = getQueryClient();
    const user = await getUserFromToken(await cookies());

    const content = await fetchData(await params);

    if (content && user)
        await prefetchQuery({
            queryClient,
            queryFn: () => getShelvesForCinement(content.media_id, user.user_id),
            queryKey: getQueryKeys("shelfsForCinement_cnid", { cnid: content.media_id }),
        });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MediaPage content={content} type="show" />
        </HydrationBoundary>
    )
}