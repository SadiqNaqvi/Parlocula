"use client";

import InfiniteScroller from "@components/InfiniteScroller";
import { CommentTile, LoadingSearchTile, PostTile, SearchTile, ThreadTile } from "@components/ui";
import ListTile from "@components/ui/ListTile";
import UserTile from "@components/ui/UserTile";
import { searchFilters } from "@lib/constants";
import { searchAllContent, searchCollection, searchCompany, searchMovie, searchPerson, searchShow } from "@lib/contentFetcher";
import { searchComments, searchLists, searchPosts, searchThreads, searchUsers } from "@lib/helpers/common";
import SearchHeader from "./SearchHeader";
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
    const filter = params.get('f') || '';
    const currentFilter = searchFilters.includes(filter) ? filter : searchFilters[0];

    const funcMap: Record<string, (query: string, page?: number) => Promise<any | undefined>> = {
        "all": searchAllContent,
        "movies": searchMovie,
        "people": searchPerson,
        "shows": searchShow,
        "collections": searchCollection,
        "companies": searchCompany,
        "posts": (query, page = 1) => searchPosts(query, false, page),
        "comments": (query, page = 1) => searchComments(query, false, page),
        "lists": searchLists,
        "threads": (query, page = 1) => searchThreads(query, false, page),
        "users": searchUsers,
    }

    const ComponentToShow = () => {
        if (currentFilter === "posts") return PostTile;
        else if (currentFilter === "comments") return CommentTile;
        else if (currentFilter === "threads") return ThreadTile;
        else if (currentFilter === "lists") return ListTile;
        else if (currentFilter === "users") return UserTile;
        else return SearchTile
    }

    const fetchData = async (page = 1) => {
        const functionToFetch = funcMap[currentFilter] ?? funcMap["all"];
        const resp = await functionToFetch(searchQuery, page);
        if (!resp) throw new Error("pp200");
        return resp;
    };

    const notFoundMessage = {
        title: `Nothing can be found with '${searchQuery}'`,
        paras: ["Change the query or filter and try again."]
    }

    return (
        <>
            <SearchHeader filter={currentFilter} initialQuery={searchQuery} />
            {searchQuery.trim() ?
                <section className="mt-6">
                    <InfiniteScroller
                        notFoundMessage={notFoundMessage}
                        Loading={Loading}
                        Component={ComponentToShow()}
                        queryKeys={["search", `query-${searchQuery.replaceAll(' ', '-')}`, `filter-${currentFilter}`]}
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