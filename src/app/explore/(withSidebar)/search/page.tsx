"use client";

import InfiniteScroller from "@components/InfiniteScroller";
import { CommentBarWithoutReply, PostBar, SearchTile, ThreadTile, ShelfBar, UserBar } from "@components/ui";
import { SearchSkeleton } from "@components/ui/loading";
import { searchFilters } from "@lib/constants";
import { searchAllContent, searchCollection, searchCompany, searchMovie, searchPerson, searchShow } from "@lib/contentFetcher";
import { searchComments, searchPosts, searchShelves, searchThreads, searchUsers } from "@lib/helpers/common";
import useCurrentUser from "@store/user";
import { GeneralGetReturn } from "@type/internal";
import { useSearchParams } from "next/navigation";
import SearchHeader from "./SearchHeader";

const getQueryFn = (tab: string, nsfw: boolean) => {

    switch (tab) {
        case "all": return searchAllContent;
        case "movies": return searchMovie;
        case "people": return searchPerson;
        case "shows": return searchShow;
        case "collections": return searchCollection;
        case "companies": return searchCompany;
        case "posts": return (q: string, p: number) => searchPosts(q, nsfw, p);
        case "comments": return (q: string, p: number) => searchComments(q, nsfw, p);
        case "shelves": return searchShelves;
        case "threads": return (q: string, p: number) => searchThreads(q, nsfw, p);
        case "users": return searchUsers;
        default: return (q: string, p: number) => ({ success: false, errCode: "uncaught_error", result: undefined } as GeneralGetReturn)
    }

}

const SearchPage = () => {

    const params = useSearchParams();
    const searchQuery = params.get('q') || '';
    const filter = params.get('f') || '';
    const currentFilter = searchFilters.includes(filter) ? filter : searchFilters[0];

    const { filterContent, isHydrated } = useCurrentUser();

    const ComponentToShow = () => {
        if (currentFilter === "posts") return PostBar;
        else if (currentFilter === "comments") return CommentBarWithoutReply;
        else if (currentFilter === "threads") return ThreadTile;
        else if (currentFilter === "shelves") return ShelfBar;
        else if (currentFilter === "users") return UserBar;
        else return SearchTile;
    }

    const notFoundMessage = {
        title: `Nothing can be found with '${searchQuery}'`,
        paras: ["Change the query or filter and try again."]
    }

    const queryFn = async (p: number) => {
        const func = getQueryFn(currentFilter, !filterContent);
        return await func(searchQuery, p);
    }

    if (searchQuery.trim()) return (
        <>
            <SearchHeader filter={currentFilter} />

            <section className="mt-6 px-4">
                <InfiniteScroller
                    notFoundMessage={notFoundMessage}
                    Loading={SearchSkeleton}
                    Component={ComponentToShow()}
                    queryKeys={["search", searchQuery, `filter-${currentFilter}`]}
                    fetchData={queryFn}
                    enabled={isHydrated}
                />
            </section>

        </>
    )

    return (
        <>
            <SearchHeader filter={currentFilter} />
            <section className="forceCenter flex-col">
                <h3 className="text-lg md:text-2xl uppercase font-semibold mb-2">Search what you like!</h3>
                <p className="text-sm md:text-base text-zinc-500">Movies, Shows, Threads, People, Users, Collections, Companies, etc...</p>
            </section>
        </>
    )
}

export default SearchPage;