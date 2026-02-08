import { CinementWikiHeader, CinementWikiSection, HorizontalThreadList } from "@app/explore/(withoutSidebar)/components";
import { NotFound, OptionalChildren, ParloFooter, TabContainer, TabList } from "@components/ui";
import { CinementWikiSkeleton } from "@components/ui/loading";
import { fetchPerson } from "@lib/contentFetcher";
import generateDynamicMetadata from "@lib/seo/metadata";
import { ParloPageProps } from "@type/other";
import { Metadata } from "next";
import { PropsWithChildren, Suspense } from "react";

const fetchData = async (params: { id: string }) => {
    const company_id = params.id.split('-')[0];
    return await fetchPerson(company_id);
}

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {
    const awaitedParams = await params;
    const data = await fetchData(awaitedParams);

    if (!data) return generateDynamicMetadata({});

    const { name, biography } = data;

    return generateDynamicMetadata({
        title: name,
        allowRobots: true,
        description: biography,
        url: `/explore/person/${awaitedParams.id}`,
    });
};

const Page = async ({ params, children }: PropsWithChildren<{ params: { id: string } }>) => {

    const content = await fetchData(params);

    if (!content) return (
        <NotFound
            title="Oops! Looks like The Parlocula Explorers couldn't find anything"
            paras={[
                `Possible reasons: artist id is incorrect`,
                `Please search the artist in the Explore Page`
            ]}
        />
    )

    const currentPage = `/explore/person/${content.tmdb_id}`;

    return (
        <>
            <CinementWikiHeader
                poster={content.profile}
                title={content.name}
                titleSupport={<p className="text-sm md:text-base text-zinc-500">Profession: {content.department}</p>}
                overviewOrBio={content.biography}
                descriptionSupport={(
                    <div className="mt-4 space-y-2 text-zinc-500 text-xs md:text-sm">
                        <p>
                            Born on: {new Date(content.birth).toDateString()}
                            <OptionalChildren condition={content.place_of_birth}>
                                at {content.place_of_birth}
                            </OptionalChildren>
                        </p>
                        <OptionalChildren condition={content.death}>
                            <p>
                                Died on: {new Date(content.death || 0).toDateString()}
                                <OptionalChildren condition={content.place_of_death}>
                                    at {content.place_of_death}
                                </OptionalChildren>
                            </p>
                        </OptionalChildren>
                    </div>
                )}
            />

            <CinementWikiSection

                heading="Connected Threads"
                hrefForMoreButton={`${content.tmdb_id}/threads`}
            >
                <HorizontalThreadList id={content.tmdb_id} type="person" />
            </CinementWikiSection>

            <TabContainer>
                <TabList className="" href={currentPage}>As Cast</TabList>
                <TabList href={currentPage + "/crew"}>As Crew</TabList>
            </TabContainer>

            {children}
        </>
    )
}

const ArtistPageLayout = async ({ children, params }: PropsWithChildren<ParloPageProps>) => {

    const awaitedParams = await params;
    const [_, ...title] = awaitedParams.id.split('-');

    return (
        <Suspense fallback={<CinementWikiSkeleton title={title.join(' ')} backdrop={false} />}>
            <Page params={awaitedParams}>{children}</Page>
            <ParloFooter />
        </Suspense>
    )
}

export default ArtistPageLayout;