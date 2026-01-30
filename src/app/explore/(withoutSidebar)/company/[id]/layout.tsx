import { ObserverHeader } from "@components";
import { NotFound, OptionalChildren, ParloFooter, ParloImage, TabContainer, TabList } from "@components/ui";
import { fetchCompany } from "@lib/contentFetcher";
import { getPoster } from "@lib/utils";
import { ParloPageProps } from "@type/other";
import { Metadata } from "next";
import { MediaFetcher } from "../../components";
import { PropsWithChildren, Suspense } from "react";
import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import CinementWikiHeader from "../../components/CinementWikiPage";
import CinementWikiSkeleton from "@components/ui/loading/CinementWikiSkeleton";

const fetchData = async (params: { id: string }) => {
    const company_id = params.id.split('-')[0];
    return await fetchCompany(company_id);
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

    const content = await fetchData(await params);

    if (!content) return (
        <NotFound
            title="Oops! Looks like we could'nt find anything"
            paras={[
                "Possible Reason: The company id is incorrect.",
                "Please try to search the company in the explore page",
            ]} />
    );

    const currentPage = `/explore/company/${content.tmdb_id}`;

    return (
        <>
            <CinementWikiHeader
                poster={content.poster}
                title={content.title}
                titleSupport={<p className="text-sm md:text-base text-zinc-500">Situated at: {content.headquarters}</p>}
                overviewOrBio={content.description}
                titleToShare={`Check out some top rated movies from ${content.title} - Parlocula`}
                posterClassName="object-contain rounded-none"
            />

            <TabContainer>
                <TabList href={currentPage}>Movies</TabList>
                <TabList href={currentPage + "/show"}>Shows</TabList>
            </TabContainer>

            {children}
        </>
    )
}

const CompanyLayout = async ({ params, children }: PropsWithChildren<ParloPageProps>) => {
    const awaitedParams = await params;
    const [_, ...title] = awaitedParams.id.split('-');

    return (
        <Suspense fallback={<CinementWikiSkeleton backdrop title={title.join(' ')} />}>
            <Page params={awaitedParams}>
                {children}
            </Page>
        </Suspense>
    )
}

export default CompanyLayout;