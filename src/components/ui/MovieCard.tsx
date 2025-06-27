import { getPoster } from "@lib/utils"
import { GeneralMovieData } from "@type/external"

export const LoadingMovieCard = () => (
    <div className="loadingMovieCard w-[60%] my-5 mx-auto bg-[var(--gray20)] rounded-lg p-4 flex">
        <section className="loadingCardPoster loadingAnimation w-[30%] rounded-lg"></section>
        <section className="loadingCardDetails pl-4 flex-1">
            <div className="loadingAnimation loadingCardTitle h-10 w-[60%] rounded-3xl"></div>
            <div className="loadingCardMetadata flex mt-5 gap-3">
                <span className="loadingAnimation rounded-3xl flex-1 h-5"></span>
                <span className="loadingAnimation rounded-3xl flex-1 h-5"></span>
                <span className="loadingAnimation rounded-3xl flex-1 h-5"></span>
            </div>
            <div className="loadingCardSummary flex flex-col my-6 gap-3">
                <span className="loadingAnimation rounded-3xl h-5"></span>
                <span className="loadingAnimation rounded-3xl h-5"></span>
                <span className="loadingAnimation rounded-3xl h-5"></span>
            </div>
            <div className="loadingCardButtons flex gap-3">
                <span className="loadingAnimation rounded-3xl h-9 flex-1"></span>
                <span className="loadingAnimation rounded-3xl h-9 flex-1"></span>
            </div>
        </section>
    </div>
)

export default function MovieCard({ backdrop_path, title, poster_path, id, overview }: GeneralMovieData) {
    return (
        <article className="flex rounded-lg overflow-hidden bg-cover" style={{ backgroundImage: `url(${getPoster({ external: true, type: "backdrop", path: backdrop_path, size: "w780" })})` }}>
            <img className="aspect-[2/3] w-48 object-cover" src={getPoster({ external: true, type: "poster", path: poster_path, size: "w185" })} alt={`${title} poster`} />
            <div className="p-4 flex flex-col flex-1 backdrop-brightness-[0.4] backdrop-blur-md text-zinc-100">
                <h2 className="text-2xl uppercase">{title}</h2>
                <ul className="flex gap-8 list-disc text-sm text-gray-300">
                    {/* {year && <li className="first:list-none">{year}</li>} */}
                    {/* {runtime && <li className="first:list-none">{runtime}</li>}
                    {imdb_rating && <li className="first:list-none">{imdb_rating}</li>} */}
                </ul>
                <p className="my-2 font-light text-sm line-clamp-4">{overview}</p>
                {/* <Link href={`/title/${id}`} className="w-fit mt-auto">View More...</Link> */}
            </div>
        </article>

    )
}
