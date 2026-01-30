import { getUserFromToken } from "@lib/auth/utils";
import { fetchShow } from "@lib/contentFetcher";
import { getShelvesForCinement } from "@lib/helpers/common";
import { getQueryClient, prefetchQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { cookies } from "next/headers";
import CinementPage from "../../components/CinementPage";
import { ParloPageProps } from "@type/other";

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {
    const data = await fetchShow((await params).id, false);

    if (!data) return { title: "Parlocula" };
    return {
        title: `${data.title} - Parlocula`,
        description: data.overview,
    };
};

export default async function Page({ params }: ParloPageProps) {

    const queryClient = getQueryClient();
    const user = await getUserFromToken(await cookies());

    const content = await fetchShow((await params).id, true);

    if (content && user)
        await prefetchQuery({
            queryClient,
            queryFn: () => getShelvesForCinement(content.cinement_id, user.user_id),
            queryKey: getQueryKeys("shelfsForCinement_cnid", { cnid: content.cinement_id }),
        });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CinementPage content={content} type="show" />
        </HydrationBoundary>
    )
}