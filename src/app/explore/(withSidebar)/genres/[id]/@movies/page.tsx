import InfiniteScroller from "@components/InfiniteScroller";
import { fetchMoviesWithGenres } from "@lib/contentFetcher";

export default function Default({ params }: { params: { id: string } }) {
    const { id } = params;
    return (
        <section>
            <InfiniteScroller func={fetchMoviesWithGenres} args={{ genres: id, sort_by: "popularity" }} />
        </section>
    )
}