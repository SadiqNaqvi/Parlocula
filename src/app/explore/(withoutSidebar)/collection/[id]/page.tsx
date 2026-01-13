import { BottomSheet } from "@components";
import FancyImage from "@components/FancyImage";
import ShelfForm from "@components/form/ShelfForm";
import ObserverHeader from "@components/ObserverHeader";
import { NotFound, VerticleMovieCard } from "@components/ui";
import { fetchCollection } from "@lib/contentFetcher";
import { getPoster } from "@lib/utils";
import { ParloPageProps } from "@type/other";
import { CinementSchemaType } from "@type/schemas";
import { Metadata } from "next";

const fetchData = async (params: { id: string }) => {
    const collection_id = params.id.split('-')[0];
    return await fetchCollection(collection_id);
}

export const generateMetadata = async ({ params }: ParloPageProps): Promise<Metadata> => {
    const data = await fetchData(await params);

    if (!data) return { title: "Parlocula" };
    return {
        title: `${data.title} - Parlocula`,
        description: data.overview,
    };
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
        year: new Date(el.release_date).getFullYear(),
        ext_id: el.tmdb_id,
        cinement_type: el.media_type,
        isConfirm: false,
    }) as CinementSchemaType);

    const metadata = [
        { label: "Rating", val: content.rating },
        { label: "Movies", val: content.parts.length },
    ]

    return (
        <>
            <ObserverHeader
                titleToShare={`Check out ${content.title} on Parlocula`}
                navTitle={content.title}>

                <div className="w-full mt-2">
                    <FancyImage
                        containerClass="w-full"
                        width={768}
                        height={300}
                        className="w-full rounded-md h-[300px] object-cover object-top"
                        alt="Backdrop"
                        id="collection-backdrop"
                        thumbnail={getPoster({ external: true, type: "backdrop", path: content.backdrop, size: "w780" })}
                        src={getPoster({ external: true, type: "backdrop", path: content.backdrop, size: "original" })}
                        download={`${content.title} - Parlocula`}
                    />
                </div>

                <div className="flex gap-4">
                    <FancyImage
                        id="collection-poster"
                        thumbnail={getPoster({ external: true, type: "poster", path: content.poster, size: "w154" })}
                        src={getPoster({ external: true, type: "poster", path: content.poster, size: "original" })}
                        height={160}
                        width={160}
                        download={`Poster of ${content.title} - Parlocula`}
                        className="border-4 border-primary object-cover size-24 sm:size-40 ml-4 translate-y-[-50%] rounded-full"
                        alt={`Poster of ${content.title}`}
                    />

                    <div className="w-fit h-fit flex gap-2 sm:gap-4 pt-4">
                        {metadata.map(el => (
                            <div key={el.label} className="border-0 gap-1 md:gap-2 flex flex-col flex-cntr-all md:flex-row sm:p-4 sm:border border-gray20 rounded-md">
                                <span>{el.val}</span>
                                <label className="text-xs text-zinc-500">{el.label}</label>
                            </div>
                        ))}

                    </div>

                </div>

                <h1 data-observe className="text-xl sm:text-4xl -mt-10 sm:-mt-16 font-semibold uppercase">{content.title}</h1>

                <p className="text-sm text-gray-500 mt-6 line-clamp-4">{content.overview}</p>

                <div className="mt-4 text-sm flex gap-2">
                    <BottomSheet button="Copy As Shelf" className="primary" >
                        <ShelfForm defaultVals={{ name: content.title }} cinements={cinements} />
                    </BottomSheet>
                </div>
            </ObserverHeader>
            <section className="mt-4">
                <h2 className="text-sm uppercase font-semibold">Movies</h2>
                <div className="mt-4 flex-wrap flex gap-4">
                    {content.parts.map(el => (
                        <VerticleMovieCard
                            {...el}
                            key={el.tmdb_id}
                            id={el.tmdb_id}
                            type={el.media_type}
                            rating={el.rating.toString()}
                            year={new Date(el.release_date).getFullYear()}
                        />
                    ))}
                </div>
            </section>
        </>
    )
}

export default Page;