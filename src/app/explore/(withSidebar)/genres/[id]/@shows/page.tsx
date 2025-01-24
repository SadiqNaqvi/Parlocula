import InfiniteScroller from "@components/InfiniteScroller";
import { fetchShowsWithGenres } from "@lib/contentFetcher";

export default function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    return (
        <section>
            <InfiniteScroller func={fetchShowsWithGenres} args={{ genres: id, sort_by: "popularity" }} />
        </section>
    )
}