"use client";

import React, { useState } from "react";
import InfiniteScroller from "./InfiniteScroller";
import { InfiniteQueryResponse } from "@type/internal";

type Props = {
    placeholderSection?: React.ReactNode,
    ComponentToShow: React.ComponentType<any>,
    Loading?: React.ComponentType<any>,
    queryFn: (query: string, p: number,) => Promise<InfiniteQueryResponse>,
    queryKeys: (q: string) => (string | number)[],
    additional?: any,
    callback?: ((arg: any) => any),
    Wrapper?: (a: { children: React.ReactNode, [key: string]: any }) => React.JSX.Element
}

const SearchContainer = ({ placeholderSection, ComponentToShow, queryFn, Loading, queryKeys, additional, callback, Wrapper }: Props) => {

    const [query, setQuery] = useState('');

    const updateQuery = (data: FormData) => {
        const queryParam = data.get("query") as string | null;
        if (!queryParam || queryParam.length < 3) return;
        setQuery(queryParam);
    }

    const queryFunction = async (p: number) => {
        return await queryFn(query, p);
    }

    const PlaceholderComponent = () => {
        return (
            placeholderSection ??
            <span>Search something to see the result here</span>
        )
    }

    const DefaultWrapper = ({ children }: { children: React.ReactNode }) => {
        if (Wrapper) return <Wrapper>{children}</Wrapper>
        return <React.Fragment>{children}</React.Fragment>
    }

    return (
        <div className={`size-[600px] px-2 rounded-md bg-primarylight border border-dashed border-zinc-500`}>
            <header className="w-full mb-3 py-2 bg-primarylight sticky top-0">
                <form action={updateQuery} className="w-full">
                    <input
                        type="search"
                        name="query"
                        className="py-2 w-full block px-4 bg-gray30 rounded-md"
                        placeholder="Search here (minimum 3 characters required)"
                    />
                </form>
            </header>
            <DefaultWrapper>
                <section className="size-full">
                    {query ?
                        <InfiniteScroller
                            Component={ComponentToShow}
                            className="space-y-3 overflow-y-auto"
                            fetchData={queryFunction}
                            queryKeys={queryKeys(query)}
                            Loading={Loading}
                            additional={additional}
                            callback={callback}
                            paginate={false}
                        />
                        :
                        <PlaceholderComponent />
                    }
                </section>
            </DefaultWrapper>
        </div>
    )

}

export default SearchContainer;