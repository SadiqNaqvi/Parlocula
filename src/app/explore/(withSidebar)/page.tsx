import { RightChevron, SearchIcon } from "@assets/Icons";
import { DataFetcher, Navigate } from "@components";
import HistorySection from "./HistorySection";

export default function ExplorePage() {

    const movieGenres = ["action", "adventure", "animation", "comedy", "thriller", "crime", "drama", "family", "fantasy", "horror", "mystery", "romance", "science fiction", "war", "tv movie", "music", "history", "documentary", "western",]
    const showGenres = ["kids", "news", "reality", "soap", "talk"];

    return (
        <>
            <header className="fullScreen bg-primary p-2 sticky z-1 top-0 border-b border-gray20">
                <Navigate comp="link" role="button" goto="/explore/search" className="flex items-center rounded-md justify-start h-10 md:h-12 cursor-text w-full gap-2 px-4">
                    <SearchIcon className="min-h-4 h-4 ghostColor" />
                    <span className="ghostColor line-clamp-1 leading-tight select-none">
                        What are you looking for?
                    </span>
                </Navigate>
            </header>
            <section className="my-6 space-y-3 px-2">
                <div className="flex flex-cntr-between">
                    <h3 className="parloHeading">Explore Genres</h3>
                    <Navigate comp="link" goto="/explore/genres" className="text-sm inline space-x-2">
                        <span>More</span>
                        <RightChevron className="size-4" />
                    </Navigate>
                </div>
                <div className="flex flex-wrap gap-2">
                    {movieGenres.concat(showGenres).map((genre: string) => (
                        <Navigate
                            comp="link"
                            className="capitalize cursor-pointer bg-gray10 md:hover:bg-gray20 border border-gray30 py-2 px-4 rounded-lg inline"
                            key={genre}
                            goto={`/explore/genres/${genre.toLowerCase().replaceAll(' ', '-')}`}
                            type="button"
                        >
                            {genre}
                        </Navigate>
                    ))}
                </div>
            </section>

            <HistorySection className="my-6 space-y-3" />

            <section className="my-6 space-y-3 px-2">
                <h3 className="parloHeading">Trending Movies</h3>
                <div className="w-full">
                    <DataFetcher
                        querykeys={["movies", "trending"]}
                        type="movie"
                        func="fetchTrendingMovies"
                        args={[]}
                    />
                </div>
            </section>

            <section className="my-6 space-y-3 px-2">
                <h3 className="parloHeading">Trending Shows</h3>
                <div className="w-full">
                    <DataFetcher
                        querykeys={["shows", "trending"]}
                        type="show"
                        func="fetchTrendingShows"
                        args={[]}
                    />
                </div>
            </section>
        </>
    )
}