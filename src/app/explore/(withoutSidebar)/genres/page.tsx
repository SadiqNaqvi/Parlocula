import { TaleonWikiSection } from "@app/explore/(withoutSidebar)/components";
import { Navbar, Navigate } from "@components";

export default function Page() {

    const movieGenres = ["action", "adventure", "animation", "comedy", "thriller", "crime", "drama", "family", "fantasy", "horror", "mystery", "romance", "science fiction", "war", "tv movie", "music", "history", "documentary", "western",]
    const showGenres = ["kids", "news", "reality", "soap", "talk"];

    const genresToDisplay = [
        { type: "movie", value: "action" },
        { type: "show", value: "crime" },
        { type: "movie", value: "adventure" },
        { type: "show", value: "comedy" },
        { type: "movie", value: "family" },
        { type: "show", value: "kids" },
        { type: "movie", value: "thriller" },
        { type: "show", value: "drama" },
        { type: "movie", value: "horror" },
        { type: "show", value: "fantasy" },
    ]

    return (
        <>
            <Navbar navTitle="Genres" />
            <ul className="sticky top-0 bg-primary py-2 overflow-x-auto flex gap-4 noScroll">
                {movieGenres.concat(showGenres).map(el =>
                    <li className="capitalize text-nowrap" key={el}>
                        <Navigate
                            comp="link" goto={`${el.replaceAll(' ', '-')}`} role="button"
                            className="px-4 py-2 bg-gray10 border border-gray20 block rounded-md">{el}</Navigate>
                    </li>
                )}
            </ul>

            {genresToDisplay.map(el => (

                <TaleonWikiSection
                    heading={`${el.value} ${el.type}s`}
                    hrefForMoreButton={`genres/${el.value}`}
                    horizontalMovieListProps={{
                        args: [{ genre: el.value, page: 1, sort_by: "popularity" }],
                        type: el.type,
                        func: el.type === "movie" ? "fetchMoviesWithGenres" : "fetchShowsWithGenres",
                        querykeys: [`${el.type}sByGenre`, el.value],
                    }}
                />
            ))

            }
        </>
    )
}