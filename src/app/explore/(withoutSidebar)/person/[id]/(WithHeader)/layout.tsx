import CinementWikiHeader, { CinementWikiSection } from "@app/explore/(withoutSidebar)/components/CinementWikiPage";
import { NotFound, TabContainer, TabList } from "@components/ui";
import { fetchPerson } from "@lib/contentFetcher";
import { ParloPageProps } from "@type/other";
import { Metadata } from "next";
import { PropsWithChildren, Suspense } from "react";
import { Loading, ThreadFetcher } from "../../../components";
import CinementWikiSkeleton from "@components/ui/loading/CinementWikiSkeleton";

const fetchData = async (params: { id: string }) => {
    const company_id = params.id.split('-')[0];
    return await fetchPerson(company_id);
}

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {
    const data = await fetchData(await params);

    if (!data) return { title: "Parlocula" };
    return {
        title: `${data.name} - Parlocula`,
        description: data.biography,
    };
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
                        <p>Born on: {new Date(content.birth).toDateString()} at {content.place_of_birth}</p>
                        {content.death && (
                            <p>Died on: {new Date(content.death).toDateString()} at {content.place_of_death}</p>
                        )}
                    </div>
                )}
            />

            <CinementWikiSection

                heading="Connected Threads"
                hrefForMoreButton={`${content.tmdb_id}/threads`}
            >
                <ThreadFetcher id={content.tmdb_id} type="person" />
            </CinementWikiSection>

            <TabContainer>
                <TabList href={currentPage}>As Cast</TabList>
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
        </Suspense>
    )
}

export default ArtistPageLayout;