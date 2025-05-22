import { SearchIcon } from "@assets/Icons";
import { DataFetcher, Navigate } from "@components";
import { fetchTrendingMovies } from "@lib/contentFetcher";

export default function ExplorePage() {

    const movieGenres = ["action", "adventure", "animation", "comedy", "thriller", "crime", "drama", "family", "fantasy", "horror", "mystery", "romance", "science fiction", "war", "tv movie", "music", "history", "documentary", "western",]
    const showGenres = ["kids", "news", "reality", "soap", "talk"];

    return (
        <>
            <header className="bg-[var(--primary)] pt-4 pb-2 sticky top-0">
                <Navigate comp="link" role="button" goto={`/explore/search`} className="flex items-center rounded-md justify-start h-10 md:h-12 cursor-text w-full bg-gray20 gap-2 px-4">
                    <SearchIcon className="min-h-4 h-4 text-zinc-500" />
                    <span className="text-zinc-500 line-clamp-1 leading-tight select-none">
                        What are you looking for?
                    </span>
                </Navigate>
            </header>
            <section className="my-3 space-y-3">
                <h3 className="uppercase text-lg font-semibold">Explore Genres</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {movieGenres.concat(showGenres).map((el: string) => (
                        <Navigate comp="link" className="capitalize cursor-pointer bg-[var(--gray20)] md:hover:bg-[var(--gray10)] p-4 rounded-lg" key={el} goto={`/explore/genres/${el.toLowerCase().replaceAll(' ', '-')}`} role="button">{el}</Navigate>
                    ))}
                </div>
            </section>
            <section className="my-3 space-y-3">
                <h3 className="uppercase text-lg font-semibold">Trending Movies</h3>
                <div className="w-full">
                    <DataFetcher type="movie" args={[]} func="fetchShowsWithGenres" />
                </div>
            </section>
        </>
    )
}