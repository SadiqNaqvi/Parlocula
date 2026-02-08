import { BottomSheet } from "@components";
import ShelfForm from "@components/form/ShelfForm";
import { NotFound } from "@components/ui";
import { fetchCollection } from "@lib/contentFetcher";
import { ParloPageProps } from "@type/other";
import { CinementSchemaType } from "@type/schemas";
import { Metadata } from "next";
import { CinementGrid, CinementWikiHeader, CinementWikiSection } from "../../components";
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

    const content = await fetchData(await params);

    if (!content) return (
        <NotFound
            title="Oops! Looks like The Parlocula Explorers came empty handed."
            paras={["Possible Reason: The collection id is incorrect.", "Please try to search the collection in the explore page"]} />
    )

    const cinements = content.parts.map(el => ({
        title: el.title,
        poster: el.poster,
        year: el.year,
        ext_id: el.id,
        cinement_type: el.type,
        isConfirm: false,
    }) as CinementSchemaType);

    const metadata = [
        { label: "Rating", value: content.rating },
        { label: "Movies", value: content.parts.length },
    ]

    return (
        <>

            <CinementWikiHeader
                backdrop={content.backdrop}
                overviewOrBio={content.overview}
                poster={content.poster}
                title={content.title}
                wikiMeta={metadata}
                callToActions={(
                    <div className="mt-6 text-sm flex gap-2">
                        <BottomSheet button="Copy As Shelf" className="primary" >
                            <ShelfForm defaultVals={{ name: content.title }} cinements={cinements} />
                        </BottomSheet>
                    </div>
                )}
            />
            <CinementWikiSection heading="movies">
                <CinementGrid
                    section="collection"
                    content_id=""
                    data={content.parts}
                />
            </CinementWikiSection>

        </>
    )
}

export default Page;