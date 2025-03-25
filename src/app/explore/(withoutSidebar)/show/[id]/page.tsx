import Container from "../../exploreComponents/container"
import { BookmarkIcon, CrownIcon, HeartIcon, LinkIcon, StarIcon } from "@assets/Icons"
import { ContentBox, DataFetcher, VerticleMovieCard } from "@components"
import { fetchShow, fetchShowsWithGenres } from "@lib/contentFetcher"
import { refineString } from "@lib/dataRefiner"
import { RefinedShowData } from "@type/types"
import { Metadata } from "next"
import Link from "next/link"

const DetailsList = ({ children, label }: { children: React.ReactNode, label: string }) => (
    <li className=" last:border-b-0 border-b border-inherit py-3 space-y-3">
        <label htmlFor="creators" className="font-semibold text-base capitalize">{label}</label>
        <div className="flex flex-wrap gap-4">{children}</div>
    </li>
);


export const generateMetadata = async ({ params }: { params: any }): Promise<Metadata> => {

    const { id } = params;
    const data = await fetchShow(id);

    if (!data) return { title: "Oops! Something went Wrong - Popcorn Paragon" };
    return { title: `${data.title} - Popcorn Paragon` };
    // return { title: "In development - Popcorn Paragon" }
};

export default async function Page({ params }: { params: { id: string } }) {

    // const content: RefinedShowData = refineShowData(exampleShowDetails, extraDetails);
    const { id } = params;
    const show_id = id.split('-')[0];

    const content: RefinedShowData | undefined = await fetchShow(show_id);
    if (!content) return <>Something Went Wrong!</>

    const fullDetails: {
        label: string, data: string[], args?: string[], link?: string
    }[] = [
            { label: "Creators", data: content.writers.map(el => el.name), args: content.writers.map(el => `${el.id}-${refineString(el.name)}`), link: "/explore/person" },
            { label: "Directors", data: content.directors.map(el => el.name), args: content.directors.map(el => `${el.id}-${refineString(el.name)}`), link: "/explore/person" },
            { label: "Genres", data: content.genres, args: content.genres.map(el => refineString(el).toLowerCase()), link: "/explore/genres" },
            { label: "Production Companies", data: content.production_companies.map(el => el.name), args: content.production_companies.map(el => `${el.id}-${refineString(el.name)}`), link: "/explore/company" },
            { label: "Networks", data: content.networks.map(el => el.name), args: content.networks.map(el => `${el.id}-${refineString(el.name)}`), link: "/explore/network" },
            { label: "Rated", data: [content.rated], },
            { label: "Total Number of episodes", data: [content.number_of_episodes.toString()], },
            { label: "Show Status", data: [content.status], },
            { label: "Last Air Date", data: [new Date(content.last_release_date).toDateString()], },
            { label: "Country", data: content.country, },
            { label: "Original Language", data: [content.language], },
            { label: "Spoken Language", data: content.languages, },
        ];

    const linkSection: { label: string, link: string }[] = [
        { label: "TMDB", link: `https://themoviedb.org/movie/${content.tmdb_id}` },
        { label: "IMDB", link: `https://imdb.com/title/${content.imdb_id}` },
    ];

    const metadata = [{ label: "Rated", value: content.rated }, { label: "Rating", value: content.tmdb_rating }, { label: "Seasons", value: content.seasons.length }, { label: "Year", value: content.year }];


    return (
        <>
            <Container metadata={metadata} content={content}>
                <div className="mb-6 space-y-3">
                    <h2 className="text-xl uppercase font-semibold">Full plot</h2>
                    <p className="text-base lg:text-lg leading-normal">{content.plot}</p>
                </div>
                <div className="mb-6 space-y-3">
                    <h2 className="text-xl uppercase font-semibold">Seasons</h2>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {content.seasons.map(el => (
                            <VerticleMovieCard key={el.id} link={`${id}/season-${el.season_number}`} poster={el.poster} title={`${el.title} - ${el.rating}`} year={`${new Date(el.release_date).getFullYear()}`} />
                        ))}
                    </div>
                </div>
                <section className="mb-6 space-y-3">
                    <h3 className="uppercase text-xl font-semibold">Deciding Factors</h3>
                    <div className="flex overflow-x-auto gap-4 pb-2">
                        <article className="h-44 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                            <span className="p-3 rounded-full bg-orange-500 bg-opacity-20">
                                <CrownIcon classnames="h-8 text-orange-600" />
                            </span>
                            <p className="text-lg text-center">{content.awards}</p>
                        </article>
                        <article className="h-44 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                            <span className="p-3 rounded-full bg-pink-500 bg-opacity-20">
                                <HeartIcon classnames="h-8 text-pink-600" />
                            </span>
                            <p className="text-lg text-center">4M+ People Suggesting</p>
                        </article>
                        <article className="h-44 px-4 rounded-lg flex flex-col aspect-video flex-cntr-even border border-[var(--gray40)]">
                            <span className="p-3 rounded-full bg-purple-500 bg-opacity-20">
                                <StarIcon classnames="h-8 text-purple-600" />
                            </span>
                            <p className="text-lg text-center">7.8 Popcorn Rating</p>
                        </article>
                    </div>
                </section>
                <section className="mb-6 space-y-3">
                    <h2 className="uppercase text-xl font-semibold">Similar Shows</h2>
                    <DataFetcher func={fetchShowsWithGenres} args={content.genres} type="show" except={show_id} />
                </section>
                <section className="p-3 border border-[var(--gray40)] rounded-md">
                    <div className="pb-4 border-b border-[var(--gray40)] flex flex-cntr-between">
                        <h2 className="text-xl uppercase font-semibold">Full Details</h2>
                        <Link href="edit">More</Link>
                    </div>
                    <ul className="border-[var(--gray40)]">
                        {content.title !== content.original_title &&
                            <DetailsList label="Original Title">
                                <span>{content.original_title}</span>
                            </DetailsList>
                        }
                        {fullDetails.map(el => (
                            <DetailsList key={el.label} label={el.label}>
                                {el.data.map((ele, ind) => (
                                    <div key={ele}>
                                        {
                                            el.link ?
                                                <Link className="capitalize" key={ele} href={`${el.link}/${el.args ? el.args[ind] : ''}`}>{ele}</Link>
                                                :
                                                <span className="capitalize" key={ele}>{ele}</span>
                                        }
                                    </div>
                                ))}
                            </DetailsList>
                        ))}

                        <DetailsList label="Read more on">
                            {linkSection.map(el => (
                                <a role="button" key={el.label} className="flex flex-cntr-all px-4 py-2 rounded-md border border-[var(--gray30)] gap-2" href={el.link} target="_blank">
                                    {el.label}
                                    <LinkIcon classnames="h-4" />
                                </a>
                            ))}
                        </DetailsList>
                    </ul>
                </section>
            </Container>
        </>
    )
}