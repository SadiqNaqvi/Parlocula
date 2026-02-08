import { getUserFromToken } from "@lib/auth/utils";
import { fetchShow } from "@lib/contentFetcher";
import { getAllShelvesOfUser, getShelvesForCinement } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery, prefetchQuery } from "@lib/providers/queryClient";
import { getPoster, getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ParloPageProps } from "@type/other";
import { Metadata } from "next";
import { cookies } from "next/headers";
import CinementPage from "../../components/CinementPage";
import generateDynamicMetadata from "@lib/seo/metadata";

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {

    const { id } = await params;
    const data = await fetchShow(id, false);

    if (!data) return generateDynamicMetadata({});

    const { title, plot, overview, backdrop } = data;

    return generateDynamicMetadata({
        title,
        allowRobots: true,
        description: overview.length > plot.length ? overview : plot,
        coverImage: backdrop ? getPoster({ path: backdrop, external: true, type: "backdrop", size: "w1280" }) : undefined,
        url: `/explore/show/${id}`,
    });
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