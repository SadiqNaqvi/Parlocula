import { CollectionIcon, CrownIcon, HeartIcon, LinkIcon, StarIcon, ThreadIcon } from "@assets/Icons";
import { DataFetcher, MainPageHeader, TrailerComponent } from "@components";
import Navigate from "@components/Navigate";
import { ContentBox, NotFound, RatingComponent } from "@components/ui";
import { fetchMovie } from "@lib/contentFetcher";
import { RefinedCast, RefinedCrew } from "@type/external";
import { Metadata } from "next";

type props = { params: { id: string }, searchParams: { tab?: string, action?: string } }

const DetailsList = ({ children, label }: { children: React.ReactNode, label: string }) => (
    <li className=" last:border-b-0 border-b border-inherit py-3 space-y-3">
        <label htmlFor="creators" className="font-semibold text-base capitalize">{label}</label>
        <div className="flex flex-wrap gap-4">{children}</div>
    </li>
);

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
    const { id } = params;
    const data = await fetchMovie(id);

    if (!data) return { title: "Popcorn Paragon" };
    return { title: `${data.title} - Popcorn Paragon` };
};

export default async function MoviePage({ params, searchParams }: props) {

    const { id } = params;
    const content = await fetchMovie(id);

    if (!content) return (
        <NotFound
            title="Nothing could be found"
            paras={[
                "Possible reason: You came across a wrong path, i.e. Movie id is incorrect.",
                "Please search the movie with its title in the Explore Page."
            ]}
        />
    )

    const LinkSection: { label: string, link: string }[] = [
        { label: "TMDB", link: `https://themoviedb.org/movie/${content.tmdb_id}` },
        { label: "IMDB", link: `https://imdb.com/title/${content.imdb_id}` },
    ]

    const creditSection: { label: string, link: string, data: RefinedCrew[] | { name: string, id: string, }[] }[] = [
        { label: "creators", data: content.writers, link: "/explore/person/" },
        { label: "directors", data: content.directors, link: "/explore/person/" },
        { label: "Production Companies", data: content.production_companies, link: "/explore/company/" },
    ]

    const detailSection: { label: string; data: string[]; link?: string; }[] = [
        { label: "genres", data: content.genres, link: "/explore/genre?q=" },
        { label: "release date", data: [new Date(content.release_date).toLocaleDateString()] },
        { label: "Rated", data: [content.rated] },
        { label: "country", data: content.country },
        { label: "languages", data: content.languages },
    ]

    return (
        <>
            <MainPageHeader content={content} />

            <div className="mt-8 pt-8 border-t border-[var(--gray30)] space-y-6">

                <div className="space-y-10 overflow-x-hidden">

                    <section className="space-y-3">
                        <h3 className="uppercase text-xl font-semibold">Full Plot</h3>
                        <p className="text-base lg:text-lg leading-normal">{content.plot}</p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="uppercase text-xl font-semibold">Top Cast</h3>
                        <div className="overflow-x-auto flex gap-4 pb-2">
                            {content.cast.map((el: RefinedCast) => (
                                <ContentBox link={`/person/${el.id}`} detail={el.character} key={el.id} img={el.poster} title={el.name} />
                            ))}
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="uppercase text-xl font-semibold">Deciding Factors</h3>
                        <div className="flex overflow-x-auto gap-4 pb-2">
                            <article className="h-44 lg:h-52 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                                <span className="p-4 rounded-full bg-orange-500 bg-opacity-20">
                                    <CrownIcon classnames="h-10 text-orange-600" />
                                </span>
                                <p className="text-lg text-center">{content.awards}</p>
                            </article>
                            <article className="h-44 lg:h-52 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                                <span className="p-4 rounded-full bg-pink-500 bg-opacity-20">
                                    <HeartIcon classnames="h-10 text-pink-600" />
                                </span>
                                <p className="text-lg text-center">4M+ People Suggesting</p>
                            </article>
                            <article className="h-44 lg:h-52 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                                <span className="p-4 rounded-full bg-purple-500 bg-opacity-20">
                                    <StarIcon classnames="h-10 text-purple-600" />
                                </span>
                                <p className="text-lg text-center">7.8 Popcorn Rating</p>
                            </article>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="uppercase text-xl font-semibold">Belongs To</h3>
                        <div className="flex flex-wrap gap-4">
                            {content.collection &&
                                <Navigate comp="link" goto={`/collection/${content.collection.id}`} className="h-24 sm:h-32 min-w-72 px-4 flex-cntr-all gap-6 rounded-lg flex flex-1 border border-[var(--gray40)]">
                                    <span className="p-4 rounded-full bg-lime-400 bg-opacity-20">
                                        <CollectionIcon classnames="h-6 text-lime-600" />
                                    </span>
                                    <span className="text-lg">{content.collection.name}</span>
                                </Navigate>
                            }
                            <Navigate comp="link" goto={`/thread/${content.tmdb_id}`} className="h-24 sm:h-32 min-w-72 px-4 flex-cntr-all gap-6 rounded-lg flex flex-1 border border-[var(--gray40)]">
                                <span className="p-4 rounded-full bg-sky-400 bg-opacity-30">
                                    <ThreadIcon classnames="h-6 text-sky-600" />
                                </span>
                                <span className="text-lg">{content.title} Thread</span>
                            </Navigate>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="uppercase text-xl font-semibold">More Like this</h3>
                        <DataFetcher type="movie" func="fetchMoviesWithGenres" args={[content.genres.join(',')]} except={content.tmdb_id} />
                    </section>

                    {content.cast.splice(0, 2).map((el) => (
                        <section key={el.id} className="space-y-3">
                            <div className="flex flex-cntr-between">
                                <h3 className="uppercase text-xl font-semibold">More of {el.name}</h3>
                                <Navigate comp="link" role="button" goto={`/person/${el.id}`}>More</Navigate>
                            </div>
                            <DataFetcher type="movie" func="fetchMoviesWithCast" args={[el.id]} except={content.tmdb_id} />
                        </section>
                    ))}

                </div>

                <div className="space-y-4">
                    <div className="h-fit p-4 border border-[var(--gray40)] rounded-lg">

                        <div className="pb-4 flex flex-cntr-between border-b border-inherit">
                            <h3 className="uppercase text-lg font-semibold">More Details</h3>
                            <button>Edit</button>
                        </div>

                        <ul className="border-inherit">
                            {content.original_title.toLowerCase().replaceAll(' ', '') !== content.title.toLowerCase().replaceAll(' ', '') &&
                                <DetailsList label={"Original Title"}>
                                    <span>{content.original_title}</span>
                                </DetailsList>
                            }
                            {creditSection.map((el) => (
                                <DetailsList label={el.label} key={el.label}>
                                    {el.data.map((element: RefinedCrew | { id: string, name: string }) => (
                                        <Navigate comp="link" key={element.id} goto={`${el.link}${element.id}`}>{element.name}</Navigate>
                                    ))}
                                </DetailsList>
                            ))}
                            {detailSection.map((el: {
                                label: string;
                                data: any[];
                                link?: string;
                            }) => (
                                <DetailsList key={el.label} label={el.label}>
                                    {el.data.map((element: string) => (
                                        el.link ?
                                            <Navigate key={element} comp="link" goto={el.link + element.toLowerCase().replaceAll(' ', '-')}>{element}</Navigate>
                                            :
                                            <span key={element}>{element}</span>
                                    ))}
                                </DetailsList>
                            ))}
                            <DetailsList label="More on">
                                {content.homepage &&
                                    <a className="flex flex-cntr-all px-4 py-2 rounded-md border border-[var(--gray30)] gap-2" href={content.homepage} target="_blank">
                                        Homepage
                                        <LinkIcon classnames="h-4" />
                                    </a>
                                }
                                {LinkSection.map(el => (
                                    <a key={el.link} className="flex flex-cntr-all px-4 py-2 rounded-md border border-[var(--gray30)] gap-2" href={el.link} target="_blank">
                                        {el.label}
                                        <LinkIcon classnames="h-4" />
                                    </a>
                                ))}
                            </DetailsList>
                        </ul>
                    </div>
                </div>

            </div>

            {searchParams.action === "trailer" &&
                <TrailerComponent content={content.trailers} />
            }

            {searchParams.action === "rate" &&
                <RatingComponent title={content.title} />
            }
        </>
    )
};