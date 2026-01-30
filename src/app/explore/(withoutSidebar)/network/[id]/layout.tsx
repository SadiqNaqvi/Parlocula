import FancyImage from "@components/FancyImage";
import ObserverHeader from "@components/ObserverHeader";
import { NotFound, OptionalChildren, ParloFooter, TabContainer, TabList } from "@components/ui";
import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import { fetchNetwork } from "@lib/contentFetcher";
import { getPoster } from "@lib/utils";
import { ParloPageProps } from "@type/other";
import { Metadata } from "next";
import { PropsWithChildren, Suspense } from "react";
import CinementWikiHeader from "../../components/CinementWikiPage";
import CinementWikiSkeleton from "@components/ui/loading/CinementWikiSkeleton";

const fetchData = async (params: { id: string }) => {
    const network_id = params.id.split('-')[0];
    return await fetchNetwork(network_id);
}

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {
    const data = await fetchData(await params);

    if (!data) return { title: "Parlocula" };
    return {
        title: `${data.title} - Parlocula`,
        description: data.description,
    };
};

const Page = async ({ params, children }: PropsWithChildren<{ params: { id: string } }>) => {

    const content = await fetchData(params);

    if (!content) return (
        <NotFound
            title="Oops! Looks like we could'nt find anything"
            paras={[
                "Possible Reason: The network id is incorrect.",
                "Please try to search the network in the explore page"
            ]} />
    );

    const currentPage = `/explore/network/${content.tmdb_id}`;

    return (
        <>
            <CinementWikiHeader
                poster={content.poster}
                title={content.title}
                titleSupport={<p className="text-sm md:text-base text-zinc-500">Situated at: {content.headquarters}</p>}
                overviewOrBio={content.description}
                posterClassName="object-contain rounded-none"
                titleToShare={`Check out some top rated shows from ${content.title} - Parlocula`}
            />
            <TabContainer>
                <TabList href={currentPage}>Movies</TabList>
                <TabList href={currentPage + "/show"}>Shows</TabList>
            </TabContainer>
            {children}
        </>
    )
}

const NetworkPageLayout = async ({ params, children }: PropsWithChildren<ParloPageProps>) => {

    const awaitedParams = await params;
    const [_, ...title] = awaitedParams.id.split('-');

    return (
        <Suspense fallback={<CinementWikiSkeleton backdrop={false} title={title.join(' ')} />}>
            <Page params={awaitedParams}>
                {children}
            </Page>
        </Suspense>
    )

}

export default NetworkPageLayout;