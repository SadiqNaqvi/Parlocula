"use client"

import InfiniteScroller from "@components/InfiniteScroller";
import { VerticleMovieCard } from "@components/ui";
import { fetchMoviesWithGenres } from "@lib/contentFetcher";
import { queryFunction, refineString } from "@lib/utils";
import { RefinedGeneralData } from "@type/external";
import { GeneralGetReturn } from "@type/internal";

const fetchData = async (page: number, genres: string): Promise<GeneralGetReturn> => {
    const resp = await fetchMoviesWithGenres({ page, genres, sort_by: "popularity" })
    if (!resp) throw new Error("pp200");
    return { success: true, result: resp };
}

const Component = ({ id, poster, rating, title, year, type }: RefinedGeneralData) => (
    <VerticleMovieCard
        link={`/explore/${type}/${id}-${refineString(title)}`}
        poster={poster}
        title={title}
        rating={rating}
        year={year.toString()}
        key={id} />
)

export default function MoviePage({ params }: { params: { id: string } }) {
    const { id } = params;
    return (
        <section>
            <InfiniteScroller
                Component={Component}
                fetchData={(p) => queryFunction(fetchData, [p, id])}
                queryKeys={["movies", "genres", id]}
                className="flex flex-wrap gap-3"
            />
        </section>
    )
}