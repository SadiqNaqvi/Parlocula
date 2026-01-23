import { CollectionIcon, CrownIcon, HeartIcon, StarIcon } from "@assets/Icons";
import { DataFetcher, FancyImage, Navigate, ObserverHeader } from "@components";
import { ContentBox, InteractiveDetailSection, LinkTile, NotFound, ParloFooter, VerticleMovieCard } from "@components/ui";
import { createArray, getPoster, makeUrlSafe } from "@lib/utils";
import { RefinedCast, RefinedMovieData, RefinedShowData } from "@type/external";
import { FullCinementType } from "@type/internal";
import { CinementSchemaType } from "@type/schemas";
import { PropsWithChildren } from "react";
import {AddToShelf,ShowTrailerButton,ThreadFetcher} from "./";

type Props = {
    type: "movie"
    content: RefinedMovieData & FullCinementType | undefined
} | {
    type: "show"
    content: RefinedShowData & FullCinementType | undefined
}

const Section = ({ children }: PropsWithChildren) => (
    <section className="p-4 space-y-6 border-b border-gray30 last:border-0">
        {children}
    </section>
)

const posterSize = "size-24 sm:size-40";
const shifting = "-mt-12 sm:-mt-20"

const MediaPage = ({ content, type }: Props) => {

    if (!content) return (
        <NotFound
            title="Oops! Looks like The Parlocula Explorers couldn't find anything"
            paras={[
                `Possible reasons: ${type} id is incorrect`,
                `Please search the ${type} with its title in the Explore Page`
            ]}
            redirectToExplore
            fullScreen
        />
    )

    const linkSection: { label: string, path: string }[] = [
        { label: "TMDB", path: `https://themoviedb.org/${type === "show" ? "tv" : "movie"}/${content.tmdb_id}` },
        { label: "IMDB", path: `https://imdb.com/title/${content.imdb_id}` },
    ];

    const cinementForShelf: CinementSchemaType = {
        title: content.title,
        poster: content.poster,
        ext_id: content.tmdb_id,
        year: content.year,
        cinement_type: type,
        isConfirm: true,
        cinement_id: content._id,
    }

    const metadata = createArray([
        { label: "Rated", val: content.rated },
        { label: "Rating", val: content.tmdb_rating },
        { label: "Year", val: content.year },
    ]).concatConditionally(type === "movie", () =>
    ({
        label: "Runtime",
        val: ("runtime" in content ? content.runtime : '')
    })
    ).concatConditionally(type === "show", () =>
    ({
        label: "Seasons",
        val: ("seasons" in content ? content.seasons.length : 0)
    }));

    return (
        <>
            <ObserverHeader
                titleToShare={`Check out ${content.title} on Parlocula`}
                navTitle={content.title}
                poster={content.poster}
                className="px-4 border-b border-gray30 pb-4"
            >

                <div className="w-full">
                    <FancyImage
                        containerClass="w-full"
                        width={768}
                        height={300}
                        className="w-full rounded-md aspect-[16/9] max-h-[300px] object-cover object-top"
                        alt="Backdrop"
                        id="backdrop-popover"
                        thumbnail={getPoster({ external: true, type: "backdrop", path: content.backdrop, size: "w780" })}
                        src={getPoster({ external: true, type: "backdrop", path: content.backdrop, size: "original" })}
                        download={`${content.title} - Parlocula`}
                    />
                </div>

                <div className="flex gap-4">

                    <FancyImage
                        id="poster"
                        thumbnail={getPoster({ external: true, type: "poster", path: content.poster, size: "w185" })}
                        src={getPoster({ external: true, type: "poster", path: content.poster, size: "original" })}
                        height={160}
                        width={160}
                        containerClass={`${shifting} ml-4`}
                        download={`Poster of ${content.title} - Parlocula`}
                        className={`border-4 border-primary object-cover ${posterSize} rounded-full`}
                        alt={`Poster of ${content.title}`}
                    />

                    <div className="space-y-1 mt-2">
                        <h1 data-observe className="text-xl sm:text-3xl font-semibold uppercase">{content.title}</h1>

                        <p className="text-sm md:text-base text-zinc-500">{content.tagline}</p>
                    </div>
                </div>

                <ul className={`flex gap-2 sm:gap-4 mt-4`}>
                    {metadata.map(el => (
                        <li key={el.label} className="gap-1 md:gap-2 flex flex-col flex-cntr-all">
                            <strong>{el.val}</strong>
                            <span className="text-zinc-500 text-sm">{el.label}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-4">
                    <InteractiveDetailSection className="text-sm text-gray-500">
                        {content.overview}
                    </InteractiveDetailSection>
                </div>

                <ul className="my-4 flex gap-3 md:gap-4 overflow-x-auto noScroll">
                    {content.genres.map(el => (
                        <li key={el} className="flex">
                            <Navigate role="button" comp="link"
                                goto={`/explore/genre/${el.toLowerCase().replaceAll(' ', '-')}`}
                                className="text-sm px-2 py-1 bg-gray10 border border-gray30 rounded-md whitespace-nowrap text-nowrap">
                                {el}
                            </Navigate>
                        </li>
                    ))}
                    <span className="h-inherit min-w-[2px] bg-gray-500"></span>
                    {linkSection.map(link => (
                        <LinkTile key={link.path} {...link} />
                    ))}
                </ul>

                <div className="mt-4 text-sm flex gap-2">
                    <ShowTrailerButton trailers={content.trailers} />
                    <AddToShelf
                        released={new Date(content.release_date) < new Date()}
                        className="flex-1 py-1 flex flex-cntr-all border border-gray50 rounded-md"
                        cinement={cinementForShelf} />
                </div>
            </ObserverHeader>

            <Section>
                <h3 className="parloHeading">Full Plot</h3>
                <p className="leading-normal">{content.plot}</p>
            </Section>

            {type === "show" && (
                <Section>
                    <h2 className="parloHeading">Seasons</h2>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {content.seasons.map(el => (
                            <VerticleMovieCard
                                {...el}
                                key={el.id}
                                type="show"
                                redirect={`${content.tmdb_id}/season-${el.season_number}`}
                                year={new Date(el.release_date).getFullYear()}
                            />
                        ))}
                    </div>
                </Section>
            )}

            <Section>
                <h3 className="parloHeading">Top Cast</h3>
                <div className="overflow-x-auto flex gap-4 pb-2">
                    {content.cast.map((el: RefinedCast) => (
                        <ContentBox
                            link={`/explore/person/${el.id}-${makeUrlSafe(el.name)}`}
                            detail={el.character}
                            key={el.id}
                            img={el.poster}
                            title={el.name} />
                    ))}
                </div>
            </Section>

            <Section>
                <h3 className="parloHeading">Deciding Factors</h3>
                <div className="flex overflow-x-auto gap-4 pb-2">
                    <article className="h-44 lg:h-52 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                        <span className="p-4 rounded-full bg-orange-500 bg-opacity-20">
                            <CrownIcon className="h-10 text-orange-600" />
                        </span>
                        <p className="text-center">{content.awards}</p>
                    </article>
                    <article className="h-44 lg:h-52 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                        <span className="p-4 rounded-full bg-pink-500 bg-opacity-20">
                            <HeartIcon className="h-10 text-pink-600" />
                        </span>
                        <p className="text-center">4M+ People Suggesting</p>
                    </article>
                    <article className="h-44 lg:h-52 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                        <span className="p-4 rounded-full bg-purple-500 bg-opacity-20">
                            <StarIcon className="h-10 text-purple-600" />
                        </span>
                        <p className="text-center">7.8 Popcorn Rating</p>
                    </article>
                </div>
            </Section>

            {type === "movie" && content.collection &&
                <Section>
                    <h3 className="parloHeading">Belongs To</h3>
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
                </Section>
            }

            <Section>
                <div className="flex flex-cntr-between">
                    <h3 className="parloHeading">Connected Threads</h3>
                    <Navigate comp="link" goto={`${content.tmdb_id}/threads`}>More</Navigate>
                </div>
                <ThreadFetcher id={content.tmdb_id} type="movie" />
            </Section>

            <Section>
                <h3 className="parloHeading">More Like this</h3>
                <DataFetcher
                    type={type}
                    func={type === "movie" ? "fetchSimilarMovies" : "fetchSimilarShows"}
                    args={[content.tmdb_id]}
                    querykeys={[`similar-${type}`, content.ext_id]}
                />
            </Section>

            {content.cast.splice(0, 2).map((el) => (
                <Section key={el.id}>

                    <div className="flex flex-cntr-between">
                        <h3 className="parloHeading">More of {el.name}</h3>
                        <Navigate comp="link" role="button" goto={`/explore/person/${el.id}`}>More</Navigate>
                    </div>

                    <DataFetcher
                        type="movie"
                        func="fetchMoviesWithCast"
                        args={[el.id]}
                        except={content.tmdb_id}
                        querykeys={["moviesWithCast", el.id]}
                    />
                </Section>
            ))}
            <ParloFooter />
        </>
    )
}

export default MediaPage;