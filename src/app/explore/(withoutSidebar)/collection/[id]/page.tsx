import LayoutContainer from "@app/explore/(withoutSidebar)/exploreComponents/LayoutContainer";
import { NotFound, VerticleMovieCard } from "@components/ui";
import { fetchCollection } from "@lib/contentFetcher";
import { refineString } from "@lib/dataRefiner";
import SaveAsList from "./SaveAsList";

export default async function Page({ params }: { params: { id: string } }) {

    const content = await fetchCollection(params.id);

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
        isConfirm: false
    }))

    return (
        <>
            <LayoutContainer backdrop={content.backdrop} poster={content.poster} poster_type="poster" poster_classname="object-cover object-center">
                <h1 className="text-2xl sm:text-4xl uppercase font-semibold">{content.title}</h1>
                <div className="w-fit mt-2 py-1 px-2 bg-gray30 rounded-md">Overall Rating: {content.rating}/10</div>
                <p className="mt-4">{content.overview}</p>
                <SaveAsList title={content.title} medias={medias} />
            </LayoutContainer>
            <section>
                <h2 className="text-xl uppercase font-semibold">Movies</h2>
                <div className="mt-4 overflow-x-auto flex gap-4">
                    {medias.map(el => (
                        <VerticleMovieCard link={`/explore/movie/${el.tmdb_id}-${refineString(el.title)}`} poster={el.poster} title={el.title} year={el.year.toString()} key={el.tmdb_id} />
                    ))}
                </div>
            </section>
        </>
    )
}