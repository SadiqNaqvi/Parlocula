import { getUserFromToken } from "@lib/auth/utils";
import { fetchShow } from "@lib/contentFetcher";
import { getAllShelvesOfUser, getShelvesForTaleon } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery, prefetchQuery } from "@lib/providers/queryClient";
import { getPoster, getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ParloPageProps } from "@type/other";
import { Metadata } from "next";
import { cookies } from "next/headers";
import TaleonPage from "../../components/TaleonPage";
import generateDynamicMetadata from "@lib/seo/metadata";
import { generateJsonLdForShow } from "@lib/seo/jsonld";
import JsonLd from "@components/JsonLd";

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {

    const { id } = await params;
    const data = await fetchShow(id, false);

    if (!data) return generateDynamicMetadata({});

    const { title, plot, overview, backdrop } = data;

    return generateDynamicMetadata({
        title,
        allowRobots: true,
        description: `${overview} - Explore seasons, cast, ratings, communities, threads, shelves, and fan discussions on Parlocula.`,
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
                queryFn: () => getShelvesForTaleon(content.taleon_id, user.user_id, jar),
                queryKey: getQueryKeys("shelfsForTaleon_cnid", { cnid: content.taleon_id }),
                queryClient,
            }),
            prefetchInfiniteQuery({
                queryFn: () => getAllShelvesOfUser(user.user_id, 1, jar),
                queryKey: getQueryKeys("allShelvesOfUser_uid", { uid: user.user_id }),
                queryClient,
            }),
        ])
    }
    
    const jsonLd = content ? generateJsonLdForShow(content) : null;

    return (
        <>
            <JsonLd schemas={jsonLd} />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <TaleonPage content={content} type="show" />
            </HydrationBoundary>
        </>
    )
}