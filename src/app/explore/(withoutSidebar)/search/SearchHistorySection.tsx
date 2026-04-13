"use client";

import { HistoryIcon, XmarkIcon } from "@assets/Icons";
import { useChageSearchParams, useSearchHistoryStack } from "@lib/hooks";
import { SearchHistoryStackType } from "@type/other";

const SearchHistorySection = () => {

    const { removeFromStack, stack } = useSearchHistoryStack<SearchHistoryStackType>();
    const { addToSearchParams } = useChageSearchParams();

    const updateQuery = ({ query, filter }: { query: string, filter?: string }) => {
        if (query.trim())
            addToSearchParams({
                q: query.trim(),
                ...(filter && filter !== "all" && { f: filter })
            });
    }

    if (!stack || !stack.length) return (
        <section className="h-size-screen flex flex-cntr-all flex-col">
            <h3 className="text-lg md:text-2xl uppercase text-center font-semibold mb-2">Search what you like!</h3>
            <p className="text-sm text-center md:text-base text-zinc-500">Movies, Shows, Threads, People, Users, Collections, Companies, etc...</p>
        </section>
    )

    return (
        <section className="mt-4 space-y-3">
            <h3 className="parloHeading">Search History</h3>
        <ul>
            {stack.map(({ id, member: { query, filter } }) => (
                <li key={id} className="flex gap-2 flex-cntr-between p-3">
                    <button onClick={() => updateQuery({ query, filter })} className="flex-1 gap-3 items-center">
                        <HistoryIcon />
                        <div>
                            <h4>{query}</h4>
                            <p className="text-zinc-500 text-sm text-left">{filter}</p>
                        </div>
                    </button>
                    <button onClick={() => removeFromStack(id)} className="p-1 rounded-md border border-gray20 bg-gray20">
                        <XmarkIcon className="size-3" />
                    </button>
                </li>
            ))}
        </ul>
        </section>
    )


}

export default SearchHistorySection;