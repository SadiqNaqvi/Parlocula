import { NotFound, VerticleMovieCard } from "@components/ui";
import { fetchCollection } from "@lib/contentFetcher";
import { refineString } from "@lib/utils";
import SaveAsList from "./SaveAsList";
import ObserverHeader from "@components/ObserverHeader";
import FancyImage from "@components/FancyImage";
import { getPoster } from "@lib/dataRefiner";
import { Metadata } from "next";

const fetchData = async (params: { id: string }) => {
    const collection_id = params.id.split('-')[0];
    return await fetchCollection(collection_id)
}

type Props = { params: { id: string } };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const data = await fetchData(params);

    if (!data) return { title: "Popcorn Paragon" };
    return {
        title: `${data.title} - Popcorn Paragon`,
        description: data.overview,
    };
};

export const generateStaticParams = async () => {
    return []
}

const Page = async ({ params }: Props) => {

    const content = await fetchData(params);

    if (!content) return (
        <NotFound
            title="Oops! Looks like we could'nt find anything"
            paras={["Possible Reason: The collection id is incorrect.", "Please try to search the collection in the explore page"]} />
    )

    const medias = content.parts.map(el => ({
        title: el.title,
        poster: el.poster,
        year: new Date(el.release_date).getFullYear(),
        tmdb_id: el.tmdb_id,
        media_type: el.media_type,
        isConfirm: false,
    }));

    const metadata = [
        { label: "Rating", val: content.rating },
        { label: "Movies", val: content.parts.length },
    ]

    return (
        <>
            <ObserverHeader
                titleToShare={`Check out ${content.title} on Popcorn Paragon`}
                navTitle={content.title}>

                <div className="w-full mt-2">
                    <FancyImage
                        containerClass="w-full"
                        width={768}
                        height={300}
                        className="w-full rounded-md h-[300px] object-cover object-top"
                        alt="Backdrop"
                        id="backdrop-popover"
                        thumbnail={getPoster("backdrop", content.backdrop, 2)}
                        src={getPoster("backdrop", content.backdrop, 10)}
                        download={`${content.title} - Popcorn Paragon`}
                    />
                </div>

                <div className="flex gap-4">
                    <FancyImage
                        id="poster"
                        thumbnail={getPoster("poster", content.poster, 2)}
                        src={getPoster("poster", content.poster, 10)}
                        height={160}
                        width={160}
                        download={`Poster of ${content.title} - Popcorn Paragon`}
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
                    <SaveAsList title={content.title} medias={medias} />
                </div>
            </ObserverHeader>
            <section className="mt-4">
                <h2 className="text-sm uppercase font-semibold">Movies</h2>
                <div className="mt-4 flex-wrap flex gap-4">
                    {content.parts.map(el => (
                        <VerticleMovieCard
                            key={el.tmdb_id}
                            link={`/explore/movie/${el.tmdb_id}-${refineString(el.title)}`}
                            poster={el.poster}
                            title={el.title}
                            rating={el.rating}
                            year={new Date(el.release_date).getFullYear().toString()}
                        />
                    ))}
                </div>
            </section>
        </>
    )
}

export default Page;