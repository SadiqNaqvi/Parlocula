import { BottomSheet, Navigate } from "@components";
import ShelfForm from "@components/form/Mutation/ShelfMutation";
import { NotFound } from "@components/ui";
import { fetchCollection } from "@lib/contentFetcher";
import { ParloPageProps } from "@type/other";
import { TaleonSchemaType } from "@type/schemas";
import { Metadata } from "next";
import { TaleonGrid, TaleonWikiHeader, TaleonWikiSection } from "../../components";
import generateDynamicMetadata from "@lib/seo/metadata";
import { getPoster } from "@lib/utils";

const fetchData = async (params: { id: string }) => {
    const collection_id = params.id.split('-')[0];
    return await fetchCollection(collection_id);
}

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {
    const awaitedParams = await params;
    const data = await fetchData(awaitedParams);

    if (!data) return generateDynamicMetadata({});

    const { title, overview, backdrop } = data;

    return generateDynamicMetadata({
        title,
        allowRobots: true,
        description: overview,
        coverImage: backdrop ? getPoster({ path: backdrop, external: true, type: "backdrop", size: "w1280" }) : undefined,
        url: `/explore/collection/${awaitedParams.id}`,
    });
};

const Page = async ({ params }: ParloPageProps) => {

    const awaitedParams = await params;

    const content = await fetchData(awaitedParams);

    if (!content) return (
        <NotFound
            title="Oops! Looks like The Parlocula Explorers came empty handed."
            paras={["Possible Reason: The collection id is incorrect.", "Please try to search the collection in the explore page"]} />
    )

    const metadata = [
        { label: "Rating", value: content.rating },
        { label: "Movies", value: content.parts.length },
    ]

    return (
        <>

            <TaleonWikiHeader
                backdrop={content.backdrop}
                overviewOrBio={content.overview}
                poster={content.poster}
                title={content.title}
                wikiMeta={metadata}
                callToActions={(
                    <div className="mt-6">
                        <Navigate className="btn primary sm:flex-none sm:w-fit" comp="link" goto={`/new/shelf?clid=${awaitedParams.id}`}>Copy To Shelf</Navigate>
                    </div>
                )}
            />
            <TaleonWikiSection heading="movies">
                <TaleonGrid
                    section="collection"
                    content_id=""
                    data={content.parts}
                />
            </TaleonWikiSection>

        </>
    )
}

export default Page;