import { RightChevron } from "@assets/Icons";
import { DataFetcher, Navbar, Navigate } from "@components";

export default function Page() {

    const movieGenres = ["action", "adventure", "animation", "comedy", "thriller", "crime", "drama", "family", "fantasy", "horror", "mystery", "romance", "science fiction", "war", "tv movie", "music", "history", "documentary", "western",]
    const showGenres = ["kids", "news", "reality", "soap", "talk"];

    const genresToDisplay = [
        { label: "action movies", type: "movie", value: "action" },
        { label: "crime shows", type: "show", value: "crime" },
        { label: "adventure movies", type: "movie", value: "adventure" },
        { label: "comedy shows", type: "show", value: "comedy" },
        { label: "family movies", type: "movie", value: "family" },
        { label: "kids shows", type: "show", value: "kids" },
        { label: "thriller movies", type: "movie", value: "thriller" },
        { label: "drama shows", type: "show", value: "drama" },
        { label: "horror movies", type: "movie", value: "horror" },
        { label: "fantasy shows", type: "show", value: "fantasy" },
    ]


    return (
        <>
            <main className="max-w-screen-lg mx-auto px-4 w-full">
                <Navbar navTitle="Genres" />
                <ul className="sticky top-0 bg-primary py-2 overflow-x-auto flex gap-4 noScroll">
                    {movieGenres.concat(showGenres).map(el =>
                        <li className="capitalize text-nowrap" key={el}>
                            <Navigate comp="link" goto={`${el.replaceAll(' ', '-')}`} role="button" className="px-4 py-3 bg-gray20 block rounded-md">{el}</Navigate>
                        </li>
                    )}
                </ul>
                {genresToDisplay.map(el => (
                    <section className="mt-4 space-y-4" key={el.value}>
                        <div className="flex flex-cntr-between">
                            <h2 className="text-xl uppercase font-semibold">{el.label}</h2>
                            <Navigate comp="link" goto={`${el.value}`}><RightChevron /></Navigate>
                        </div>
                        <DataFetcher
                            args={[{ genre: el.value, page: 1, sort_by: "popularity" }]}
                            type={el.type}
                            func={el.type === "movie" ? "fetchMoviesWithGenres" : "fetchShowsWithGenres"}
                            querykeys={[`${el.type}sByGenre`, el.value]}
                        />
                    </section>
                ))

                }
            </main>
        </>
    )
}