import InfiniteScroller from "@components/InfiniteScroller";
import { VerticleMovieCard } from "@components/ui";
import { fetchShowsWithGenres } from "@lib/contentFetcher";
import { queryFunction } from "@lib/utils";

const fetchData = async (page: number, genres: string) => {
    const resp = await fetchShowsWithGenres({ page, genres, sort_by: "popularity" })
    if (!resp) throw new Error("pp200");
    return resp;
}

export default function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    return (
        <section>
            <InfiniteScroller
                Component={VerticleMovieCard}
                fetchData={(p) => queryFunction(fetchData, [p, id])}
                queryKeys={["movies", "genres", id]}
                className="flex flex-wrap gap-3"
            />
        </section>
    )
}