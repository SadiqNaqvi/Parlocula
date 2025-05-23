"use client"
import InfiniteScroller from "@components/InfiniteScroller";
import { VerticleMovieCard } from "@components/ui";
import { fetchMoviesWithGenres } from "@lib/contentFetcher";
import { queryFunction } from "@lib/utils";
import { GeneralGetReturn } from "@type/internal";

const fetchData = async (page: number, genres: string): Promise<GeneralGetReturn> => {
    const resp = await fetchMoviesWithGenres({ page, genres, sort_by: "popularity" })
    if (!resp) throw new Error("pp200");
    return { success: true, result: resp };
}

export default function Default({ params }: { params: { id: string } }) {
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