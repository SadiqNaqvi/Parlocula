import LayoutContainer from "@app/explore/exploreComponents/LayoutContainer";
import { VerticleMovieCard } from "@components";
import { refineCollectionData, refineString } from "@lib/dataRefiner"
import { exampleCollectionDetails } from "@lib/sampleData"

export default function Page() {

    const content = refineCollectionData(exampleCollectionDetails);

    return (
        <>
            <LayoutContainer backdrop={content.backdrop} poster={content.poster} poster_type="poster" poster_classname="object-cover object-center">
                <h1 className="text-2xl sm:text-4xl uppercase font-semibold">{content.title}</h1>
                <div className="w-fit mt-2 py-1 px-2 bg-gray30 rounded-md">Overall Rating: {content.rating}/10</div>
                <p className="mt-4">{content.overview}</p>
                <div className="flex gap-4 mt-4">
                    <button className="primary">Add to watchlist</button>
                </div>
            </LayoutContainer>
            <main className="mt-6 max-w-screen-lg mx-auto px-4 pb-6">
                <section>
                    <h2 className="text-xl uppercase font-semibold">Movies</h2>
                    <div className="mt-4 overflow-x-auto flex gap-4">
                        {content.parts.map(el => (
                            <VerticleMovieCard link={`/explore/movie/${el.tmdb_id}-${refineString(el.title)}`} poster={el.poster} title={el.title} year={new Date(el.release_date).getFullYear().toString()} key={el.tmdb_id} />
                        ))}
                    </div>
                </section>

            </main>
        </>
    )
}