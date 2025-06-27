import AddToList from "@app/explore/(withoutSidebar)/components/AddToList";
import { CollectionIcon, CrownIcon, HeartIcon, LinkIcon, StarIcon } from "@assets/Icons";
import { DataFetcher } from "@components";
import FancyImage from "@components/FancyImage";
import Navigate from "@components/Navigate";
import ObserverHeader from "@components/ObserverHeader";
import { ContentBox, NotFound, VerticleMovieCard } from "@components/ui";
import InteractiveDetailSection from "@components/ui/InteractiveDetailSection";
import { getPoster } from "@lib/utils";
import { refineString } from "@lib/utils";
import { RefinedCast, RefinedMovieData, RefinedShowData } from "@type/external";
import ShowTrailerButton from "./ShowTrailerButton";
import ThreadFetcher from "./ThreadFetcher";

type Props = {
    type: "movie"
    content: RefinedMovieData | undefined
} | {
    type: "show"
    content: RefinedShowData | undefined
}

const MediaPage = ({ content, type }: Props) => {

    if (!content) return (
        <NotFound
            title="Oops! Looks like the popcorn is missing"
            paras={[
                `Possible reasons: ${type} id is incorrect`,
                `Please search the ${type} with its title in the Explore Page`
            ]}
        />
    )

    const linkSection: { label: string, path: string }[] = [
        { label: "TMDB", path: `https://themoviedb.org/${type === "show" ? "tv" : "movie"}/${content.tmdb_id}` },
        { label: "IMDB", path: `https://imdb.com/title/${content.imdb_id}` },
    ];

    const mediaForList = {
        title: content.title,
        poster: content.poster,
        tmdb_id: content.tmdb_id,
        year: content.year,
        media_type: type,
        isConfirm: true,
        media_id: content.media_id
    }

    const metadata = [
        { label: "Rated", val: content.rated },
        { label: "Rating", val: content.tmdb_rating },
        type === "movie" ? { label: "Runtime", val: content.runtime } :
            { label: "Seasons", val: content.seasons.length },
        { label: "Year", val: content.year },
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
                        thumbnail={getPoster({ external: true, type: "backdrop", path: content.backdrop, size: "w780" })}
                        src={getPoster({ external: true, type: "backdrop", path: content.backdrop, size: "original" })}
                        download={`${content.title} - Popcorn Paragon`}
                    />
                </div>

                <div className="flex gap-4">

                    <FancyImage
                        id="poster"
                        thumbnail={getPoster({ external: true, type: "poster", path: content.poster, size: "w185" })}
                        src={getPoster({ external: true, type: "poster", path: content.poster, size: "original" })}
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

                <p className="text-sm md:text-base text-zinc-500">{content.tagline}</p>

                <div className="mt-4">
                    <InteractiveDetailSection className="text-sm text-gray-500">
                        {content.overview}
                    </InteractiveDetailSection>
                </div>

                <div className="mt-4 text-sm flex gap-2">
                    <ShowTrailerButton trailers={content.trailers} />
                    <AddToList
                        released={new Date(content.release_date) < new Date()}
                        className="flex-1 py-1 flex flex-cntr-all border border-gray50 rounded-md"
                        media={mediaForList} />
                </div>

                <ul className="my-4 flex gap-3 md:gap-4 overflow-x-auto noScroll">
                    {linkSection.map(({ label, path }) => (
                        <li key={path}>
                            <a role="button" href={path} target="_blank" className="flex gap-2 p-2 border border-gray30 rounded-md">
                                <span className="block size-fit"><LinkIcon className="size-4" /></span>
                                <span className="text-sm">{label}</span>
                            </a>
                        </li>
                    ))}
                    <span className="h-inherit min-w-[2px] bg-gray-500"></span>
                    {content.genres.map(el => (
                        <li key={el} className="flex">
                            <Navigate role="button" comp="link"
                                goto={`/explore/genre?q=${el.toLowerCase().replaceAll(' ', '-')}`}
                                className="text-sm p-2 border border-gray30 rounded-md whitespace-nowrap text-nowrap">
                                {el}
                            </Navigate>
                        </li>
                    ))}
                </ul>
            </ObserverHeader>

            <section className="space-y-2 my-2 py-4 bg-primarylight">
                <h3 className="uppercase text-sm font-semibold">Full Plot</h3>
                <p className="text-base lg:text-lg leading-normal">{content.plot}</p>
            </section>

            {type === "show" &&
                <section className="space-y-2 my-2 py-4 bg-primarylight">
                    <h2 className="text-sm uppercase font-semibold">Seasons</h2>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {content.seasons.map(el => (
                            <VerticleMovieCard
                                key={el.id}
                                link={`${content.tmdb_id}/season-${el.season_number}`}
                                poster={el.poster}
                                title={el.title}
                                rating={el.rating}
                                year={`${new Date(el.release_date).getFullYear()}`}
                            />
                        ))}
                    </div>
                </section>
            }

            <section className="space-y-2 my-2 py-4 bg-primarylight">
                <h3 className="uppercase text-sm font-semibold">Top Cast</h3>
                <div className="overflow-x-auto flex gap-4 pb-2">
                    {content.cast.map((el: RefinedCast) => (
                        <ContentBox
                            link={`/explore/person/${el.id}-${refineString(el.name)}`}
                            detail={el.character}
                            key={el.id}
                            img={el.poster}
                            title={el.name} />
                    ))}
                </div>
            </section>

            <section className="space-y-2 my-2 py-4 bg-primarylight">
                <h3 className="uppercase text-sm font-semibold">Deciding Factors</h3>
                <div className="flex overflow-x-auto gap-4 pb-2">
                    <article className="h-44 lg:h-52 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                        <span className="p-4 rounded-full bg-orange-500 bg-opacity-20">
                            <CrownIcon className="h-10 text-orange-600" />
                        </span>
                        <p className="text-lg text-center">{content.awards}</p>
                    </article>
                    <article className="h-44 lg:h-52 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                        <span className="p-4 rounded-full bg-pink-500 bg-opacity-20">
                            <HeartIcon className="h-10 text-pink-600" />
                        </span>
                        <p className="text-lg text-center">4M+ People Suggesting</p>
                    </article>
                    <article className="h-44 lg:h-52 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                        <span className="p-4 rounded-full bg-purple-500 bg-opacity-20">
                            <StarIcon className="h-10 text-purple-600" />
                        </span>
                        <p className="text-lg text-center">7.8 Popcorn Rating</p>
                    </article>
                </div>
            </section>

            {type === "movie" && content.collection &&
                <section className="space-y-2 my-2 py-4 bg-primarylight">
                    <h3 className="uppercase text-sm font-semibold">Belongs To</h3>
                    <div className="flex flex-wrap gap-4">
                        <Navigate
                            comp="link"
                            goto={`/collection/${content.collection.id}`}
                            className="h-24 sm:h-32 w-full px-4 flex-cntr-all gap-6 rounded-lg border border-gray40">
                            <span className="p-4 rounded-full bg-lime-400 bg-opacity-20">
                                <CollectionIcon className="h-6 text-lime-600" />
                            </span>
                            <span className="text-lg">{content.collection.name}</span>
                        </Navigate>
                    </div>
                </section>
            }

            <section className="space-y-2 my-2 py-4 bg-primarylight">
                <div className="flex-flex-cntr-between">
                    <h3 className="uppercase text-sm font-semibold">Connected Threads</h3>
                    <Navigate comp="link" goto={`${content.tmdb_id}/threads`}>More</Navigate>
                </div>
                <ThreadFetcher id={content.tmdb_id} type="movie" />
            </section>

            <section className="space-y-2 my-2 py-4 bg-primarylight">
                <h3 className="uppercase text-sm font-semibold">More Like this</h3>
                <DataFetcher
                    type={type}
                    func={type === "movie" ? "fetchSimilarMovies" : "fetchSimilarShows"}
                    args={[content.tmdb_id]}
                />
            </section>

            {content.cast.splice(0, 2).map((el) => (
                <section key={el.id} className="space-y-2 my-2 py-4 bg-primarylight">
                    <div className="flex flex-cntr-between">
                        <h3 className="uppercase text-sm font-semibold">More of {el.name}</h3>
                        <Navigate comp="link" role="button" goto={`/explore/person/${el.id}`}>More</Navigate>
                    </div>
                    <DataFetcher type="movie" func="fetchMoviesWithCast" args={[el.id]} except={content.tmdb_id} />
                </section>
            ))}
        </>
    )
}

export default MediaPage;