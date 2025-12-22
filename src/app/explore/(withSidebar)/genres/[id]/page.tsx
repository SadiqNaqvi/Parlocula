"use client"

import InfiniteScroller from "@components/InfiniteScroller";
import { VerticleMovieCard } from "@components/ui";
import { fetchMoviesWithGenres } from "@lib/contentFetcher";
import { makeUrlSafe } from "@lib/utils";
import { RefinedGeneralData } from "@type/external";
import { GeneralGetReturn } from "@type/internal";

const fetchData = async (page: number, genre: string): Promise<GeneralGetReturn> => {
    const resp = await fetchMoviesWithGenres({ page, genre, sort_by: "popularity" })
    if (!resp) throw new Error("unstable_internet");
    return { success: true, result: resp };
}

const Component = ({ id, poster, rating, title, year, type }: RefinedGeneralData) => (
    <VerticleMovieCard
        link={`/explore/${type}/${id}-${makeUrlSafe(title)}`}
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
                fetchData={(p) => fetchData(p, id)}
                queryKeys={["moviesByGenres", id]}
                className="flex flex-wrap gap-3"
            />
        </section>
    )
}