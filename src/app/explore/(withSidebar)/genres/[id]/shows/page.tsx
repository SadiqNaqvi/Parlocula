"use client"

import InfiniteScroller from "@components/InfiniteScroller";
import { VerticleMovieCard } from "@components/ui";
import { fetchShowsWithGenres } from "@lib/contentFetcher";
import { makeUrlSafe } from "@lib/utils";
import { RefinedGeneralData } from "@type/external";
import { GeneralGetReturn } from "@type/internal";

const fetchData = async (page: number, genre: string): Promise<GeneralGetReturn> => {
    const resp = await fetchShowsWithGenres({ page, genre, sort_by: "popularity" })
    if (!resp) throw new Error("unstable_internet");
    return { success: true, result: resp };
}

export default function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    return (
        <section>
            <InfiniteScroller
                Component={VerticleMovieCard}
                fetchData={(p) => fetchData(p, id)}
                queryKeys={["showsByGenres", id]}
                className="flex flex-wrap gap-3"
            />
        </section>
    )
}