import { DataFetcher, Navigate } from "@components";
import FancyImage from "@components/FancyImage";
import ObserverHeader from "@components/ObserverHeader";
import { ContentBox, NotFound, VerticleMovieCard } from "@components/ui";
import { fetchSeasonForShow, fetchShow } from "@lib/contentFetcher";
import { getPoster } from "@lib/utils";
import { makeUrlSafe } from "@lib/utils";
import { Metadata } from "next";

type Props = { params: { id: string, season: string } };

const fetchSeason = async ({ id, season }: { id: string, season: string }) => {
    const seasonNumber = parseInt(season.split('-')[1]);
    const [showPromise, seasonPromise] = await Promise.all([
        fetchShow(id),
        fetchSeasonForShow(id, isNaN(seasonNumber) ? 1 : seasonNumber),
    ]);
    if (!showPromise || !seasonPromise) return null;
    return { show: showPromise, season: seasonPromise }
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {

    const data = await fetchSeason(params);

    if (!data) return { title: "Parlocula" };
    const { season, show } = data;
    return {
        title: `${season.title} of ${show.title} - Parlocula`,
        description: season.overview,
    };
};

const SeasonPage = async ({ params }: Props) => {

    const data = await fetchSeason(params);
    if (!data) return (
        <NotFound
            title="Oops! Looks like the popcorn is missing"
            paras={[
                `Possible reasons: Show id is incorrect.`,
                `Please search the show with its title in the Explore Page`
            ]}
        />
    )

    const { season, show } = data;

    const metadata = [
        { label: 'Rating', value: `${season.rating}/10` },
        { label: 'Year', value: new Date(season.release_date).getFullYear() },
    ]

    const mainTitle = `${season.title} of ${show.title}`;
    return <>
        <ObserverHeader
            titleToShare={`Check out ${mainTitle} on Parlocula`}
            navTitle={mainTitle}>

            <div className="w-full mt-2">
                <FancyImage
                    containerClass="w-full"
                    width={768}
                    height={300}
                    className="w-full rounded-md h-[300px] object-cover object-top"
                    alt="Backdrop"
                    id="backdrop-popover"
                    thumbnail={getPoster({ external: true, type: "backdrop", path: show.backdrop, size: "w780" })}
                    src={getPoster({ external: true, type: "backdrop", path: show.backdrop, size: "original" })}
                    download={`${mainTitle} - Parlocula`}
                />
            </div>

            <div className="flex gap-4">

                <FancyImage
                    id="poster"
                    thumbnail={getPoster({ external: true, type: "poster", path: season.poster, size: "w154" })}
                    src={getPoster({ external: true, type: "poster", path: season.poster, size: "original" })}
                    height={160}
                    width={160}
                    download={`Poster of ${mainTitle} - Parlocula`}
                    className="border-4 border-primary object-cover size-24 sm:size-40 ml-4 translate-y-[-50%] rounded-full"
                    alt={`Poster of ${mainTitle}`}
                />

                <div className="w-fit h-fit flex gap-2 sm:gap-4 pt-4">
                    {metadata.map(el => (
                        <div key={el.label} className="border-0 gap-1 md:gap-2 flex flex-col flex-cntr-all md:flex-row sm:p-4 sm:border border-gray20 rounded-md">
                            <span>{el.value}</span>
                            <label className="text-xs text-zinc-500">{el.label}</label>
                        </div>
                    ))}
                </div>

            </div>

            <h1 data-observe className="text-xl sm:text-4xl -mt-10 sm:-mt-16 font-semibold uppercase">{mainTitle}</h1>

            <p className="text-sm md:text-base text-zinc-500">{show.tagline}</p>

            <p className="text-sm text-gray-500 mt-6 line-clamp-4">{season.overview}</p>
        </ObserverHeader>
        <section className="mb-6 space-y-3">
            <h2 className="text-xl uppercase font-semibold">Top Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {season.cast.map(el => (
                    <ContentBox key={el.id} title={el.name} detail={el.character} img={el.poster} link={`/explore/person/${el.id}-${makeUrlSafe(el.name)}`} />
                ))}
            </div>
        </section>
        <section className="mb-6 space-y-3">
            <h2 className="text-xl uppercase font-semibold">Episodes</h2>
            <ul className="flex gap-4 overflow-x-auto pb-2">
                {season.episodes.map(el => (
                    <VerticleMovieCard
                        {...el}
                        redirect={`season-${season.season_number}/episode-${el.episode_number}`}
                        type="show"
                        key={el.id}
                        year={new Date(el.release_date).getFullYear()}
                    />
                ))}
            </ul>
        </section>

        <section className="space-y-2 my-2 py-4 bg-primarylight">
            <h3 className="uppercase text-sm font-semibold">More Like this</h3>
            <DataFetcher
                type="show"
                func="fetchSimilarShows"
                args={[show.tmdb_id]}
                querykeys={["similarShows", show.tmdb_id]}
            />
        </section>

        {season.cast.splice(0, 2).map((el) => (
            <section key={el.id} className="space-y-2 my-2 py-4 bg-primarylight">
                <div className="flex flex-cntr-between">
                    <h3 className="uppercase text-sm font-semibold">More of {el.name}</h3>
                    <Navigate comp="link" role="button" goto={`/explore/person/${el.id}`}>More</Navigate>
                </div>
                <DataFetcher
                    type="movie"
                    func="fetchMoviesWithCast"
                    args={[el.id]}
                    except={show.tmdb_id}
                    querykeys={["moviesWithCast", el.id]}
                />
            </section>
        ))}
    </>
}

export default SeasonPage;