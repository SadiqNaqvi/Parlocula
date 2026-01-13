"use client"

import InfiniteScroller from "@components/InfiniteScroller";
import { VerticleMovieCard, VerticleMovieCardSkeleton } from "@components/ui";
import { fetchMoviesWithGenres } from "@lib/contentFetcher";
import { RefinedGeneralData } from "@type/external";
import { useParams } from "next/navigation";

const Component = ({ id, poster, rating, title, year, type }: RefinedGeneralData) => (
    <VerticleMovieCard
        id={id}
        type={type}
        poster={poster}
        title={title}
        rating={rating}
        year={year}
        key={id} />
)

const SkeletonLoader = () => (
    <section className="flex flex-wrap gap-3 justify-center overflow-hidden">
        {Array(12).fill(0).map((_, i) => (
            <VerticleMovieCardSkeleton key={i} />
        ))}
    </section>
)

export default function MoviePage() {
    const { id } = useParams() as { id: string };
    return (
        <section>
            <InfiniteScroller
                Component={Component}
                Loading={SkeletonLoader}
                fetchData={(page) => fetchMoviesWithGenres({ page, genre: id, sort_by: "popularity" })}
                queryKeys={["moviesByGenres", id]}
                className="flex flex-wrap gap-3 justify-center"
            />
        </section>
    )
}