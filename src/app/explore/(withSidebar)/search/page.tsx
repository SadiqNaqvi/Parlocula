"use client";

import { SearchHeader } from "@components";
import InfiniteScroller from "@components/InfiniteScroller";
import { SearchTile, LoadingSearchTile } from "@components/ui";
import { searchAllContent, searchCollection, searchCompany, searchMovie, searchPerson, searchShow } from "@lib/contentFetcher";
import { GeneralReturnType, RefinedSearchData } from "@type/external";
import { useSearchParams } from "next/navigation";

const Loading = () => (
    <div className="space-y-4">
        <LoadingSearchTile />
        <LoadingSearchTile />
    </div>
)

export default function SearchPage() {
    const params = useSearchParams();
    const searchQuery = params.get('q') || '';
    const filterType = params.get('f') || '';

    const funcMap: Record<string, (query: string, page?: number) => Promise<(GeneralReturnType & {
        results: RefinedSearchData[];
    }) | undefined>> = {
        "all": searchAllContent,
        "movie": searchMovie,
        "person": searchPerson,
        "show": searchShow,
        "collection": searchCollection,
        "company": searchCompany
    }

    const fetchData = async (page = 1) => {
        const functionToFetch = funcMap["all"];
        const resp = await functionToFetch(searchQuery, page);
        console.log(resp);
        if (!resp) throw new Error("pp200");
        return resp;
    };

    const notFoundMessage = {
        title: `Nothing can be found with '${searchQuery}'`,
        paras: ["Change the query or filter and try again."]
    }

    return (
        <>
            <SearchHeader />
            {searchQuery.trim() ?
                <section className="mt-6">
                    <InfiniteScroller
                        notFoundMessage={notFoundMessage}
                        Loading={Loading}
                        Component={SearchTile}
                        queryKeys={[`searching-${searchQuery.replaceAll(' ', '-')}-with-filter-${filterType}`]}
                        fetchData={fetchData} />
                </section>
                :
                <section className="mt-[30dvh] text-center">
                    <h3 className="text-lg md:text-2xl uppercase font-semibold mb-2">Search what you like!</h3>
                    <p className="text-sm md:text-base text-zinc-500">Movies, Shows, Threads, People, Users, Collections, Companies, etc...</p>
                </section>
            }
        </>
    )
}