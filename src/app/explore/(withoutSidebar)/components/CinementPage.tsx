import { CollectionIcon, CrownIcon, EyesIcon, HeartIcon, StarIcon } from "@assets/Icons";
import { Navigate } from "@components";
import { ArtistCard, LinkTile, NotFound, ParloFooter, VerticleMovieCard } from "@components/ui";
import { checkAndReturn, createArray, makeUrlSafe, numberConverter } from "@lib/utils";
import { RefinedCast, RefinedMovieData, RefinedShowData } from "@type/external";
import { FullCinementType, Link } from "@type/internal";
import { CinementSchemaType } from "@type/schemas";
import { AddToShelf, ShowTrailerButton, HorizontalThreadList, CinementWikiSection, CinementWikiHeader } from "./";

type Props = {
    type: "movie"
    content: RefinedMovieData & FullCinementType | undefined
} | {
    type: "show"
    content: RefinedShowData & FullCinementType | undefined
}

const LinksSection = ({ extLinks, genres }: { genres: string[], extLinks: Link[] }) => (
    <ul className="my-4 flex gap-2 overflow-x-auto noScroll">
        {genres.map(el => (
            <LinkTile
                key={el}
                path={`/explore/genres/${el.toLowerCase().replaceAll(' ', '-')}`}
                label={el}
            />
        ))}
        <span className="h-inherit min-w-[2px] bg-gray-500"></span>
        {extLinks.map(link => (
            <LinkTile key={link.path} {...link} />
        ))}
    </ul>
)

const CinementPage = ({ content, type }: Props) => {

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

    const extLinks: Link[] = [
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
        { label: "Rated", value: content.rated },
        { label: "Rating", value: content.tmdb_rating },
        { label: "Year", value: content.year },
    ]).concatConditionally(type === "movie", () =>
    ({
        label: "Runtime",
        value: "runtime" in content ? content.runtime : ''
    })
    ).concatConditionally(type === "show", () =>
    ({
        label: "Seasons",
        value: "seasons" in content ? content.seasons.length : 0
    }));

    return (
        <>
            <CinementWikiHeader
                backdrop={content.backdrop}
                overviewOrBio={content.overview}
                poster={content.poster}
                title={content.title}
                titleSupport={<p className="text-sm md:text-base text-zinc-500">{content.tagline}</p>}
                descriptionSupport={<LinksSection extLinks={extLinks} genres={content.genres} />}
                wikiMeta={metadata}
                callToActions={(
                    <section className="mt-6 flex gap-2">
                        <ShowTrailerButton trailers={content.trailers} />
                        <AddToShelf
                            released={new Date(content.release_date) < new Date()}
                            className="secondary flex-1 sm:flex-none"
                            cinement={cinementForShelf} />
                    </section>
                )}
            />

            <CinementWikiSection heading="Full Plot">
                <p className="leading-normal">{content.plot}</p>
            </CinementWikiSection>

            {type === "show" && (
                <CinementWikiSection heading="Seasons">
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
                </CinementWikiSection>
            )}

            <CinementWikiSection heading="Top Cast">
                <div className="overflow-x-auto flex gap-4 pb-2">
                    {content.cast.map((el: RefinedCast) => (
                        <ArtistCard
                            link={`/explore/person/${el.id}-${makeUrlSafe(el.name)}`}
                            detail={el.character}
                            key={el.id}
                            img={el.poster}
                            title={el.name} />
                    ))}
                </div>
            </CinementWikiSection>

            <CinementWikiSection heading="Deciding Factors">
                <div className="flex overflow-x-auto gap-4 pb-2">
                    <article className="h-44 lg:h-52 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                        <span className="p-4 rounded-full bg-orange-500 bg-opacity-20">
                            <CrownIcon className="h-10 text-orange-600" />
                        </span>
                        <p className="text-center">{checkAndReturn(content.awards, null, "NA") || "No Awards Yet"}</p>
                    </article>
                    <article className="h-44 lg:h-52 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                        <span className="p-4 rounded-full bg-pink-500 bg-opacity-20">
                            <HeartIcon className="h-10 text-pink-600" />
                        </span>
                        <p className="text-center">Touched the heart of {numberConverter(content.favourite)}</p>
                    </article>
                    <article className="h-44 lg:h-52 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                        <span className="p-4 rounded-full bg-purple-500 bg-opacity-20">
                            <StarIcon className="h-10 text-purple-600" />
                        </span>
                        <p className="text-center">Recommended by {numberConverter(content.recommended)}</p>
                    </article>
                    <article className="h-44 lg:h-52 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                        <span className="p-4 rounded-full bg-sky-500 bg-opacity-20">
                            <EyesIcon className="h-10 text-sky-600" />
                        </span>
                        <p className="text-center">Watched by {numberConverter(content.watched)}</p>
                    </article>
                </div>
            </CinementWikiSection>

            {type === "movie" && content.collection && (
                <CinementWikiSection heading="Belongs To">
                    <div className="flex flex-wrap gap-4">
                        <Navigate
                            comp="link"
                            goto={`/explore/collection/${content.collection.id}-${makeUrlSafe(content.collection.name)}`}
                            className="h-24 sm:h-32 w-full px-4 flex flex-cntr-all gap-3 rounded-lg border border-gray40">
                            <span className="p-4 rounded-full bg-lime-400 bg-opacity-20">
                                <CollectionIcon className="h-6 text-lime-600" />
                            </span>
                            <span className="text-lg">{content.collection.name}</span>
                        </Navigate>
                    </div>
                </CinementWikiSection>
            )}

            <CinementWikiSection
                heading="Connected Threads"
                hrefForMoreButton={`${content.tmdb_id}/threads`}
            >
                <HorizontalThreadList id={content.tmdb_id} type="movie" />
            </CinementWikiSection>

            <CinementWikiSection
                heading="More Like This"
                horizontalMovieListProps={{
                    type,
                    func: type === "movie" ? "fetchSimilarMovies" : "fetchSimilarShows",
                    args: [content.tmdb_id],
                    querykeys: [`similar-${type}`, content.ext_id]
                }}
            />

            {content.cast.splice(0, 2).map((el) => (
                <CinementWikiSection
                    heading={`More of ${el.name}`}
                    hrefForMoreButton={`/explore/person/${el.id}`}
                    key={el.id}
                    horizontalMovieListProps={{
                        type: "movie",
                        func: "fetchMoviesWithCast",
                        args: [el.id],
                        except: content.tmdb_id,
                        querykeys: ["moviesWithCast", el.id]
                    }}
                />
            ))}
            <ParloFooter />
        </>
    )
}

export default CinementPage;