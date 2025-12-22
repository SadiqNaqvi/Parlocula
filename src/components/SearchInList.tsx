"use client";

import { useState } from "react";
import { Form, Input } from "./form";
import InfiniteScroller, { InfiniteScrollerProps } from "./InfiniteScroller";
import { GeneralGetReturn, GeneralMultipleReturn } from "@type/internal";
import { TypedFunction } from "@type/other";
import { PaginatedData } from "@type/external";

export type QueryFnReturn<T> = Promise<GeneralMultipleReturn<T> | GeneralGetReturn<PaginatedData<T>>>

export type SearchInListProps<T> = {
    Component: React.ComponentType<T>,
    queryKeys: (q: string) => string[],
    queryFn: (query: string, page: number) => QueryFnReturn<T>,
    queryKeysForList?: string[],
    queryFnForList?: (p: number) => QueryFnReturn<T>
    inputPlaceholder?: string;
} & Pick<InfiniteScrollerProps, "notFoundMessage" | "NotFoundSection">

const SearchInput = ({ inputPlaceholder, onUpdate, query }: { onUpdate: TypedFunction<{ query: string }>, inputPlaceholder: string | undefined, query: string }) => (
    <Form submit={onUpdate}>
        <Input defaultValue={query} name="query" autoFocus placeholder={inputPlaceholder || "Search here"} />
    </Form>
)

const SearchInList = <T,>({ queryFn, queryKeys, Component, inputPlaceholder, queryFnForList, queryKeysForList, NotFoundSection, notFoundMessage }: SearchInListProps<T>) => {

    const [query, setQuery] = useState('');

    const updateQuery = (data: { query: string }) => {
        const input = data.query;

        if (!input || input.length < 3) return;

        setQuery(input);
    }

    if (!query && queryFnForList && queryKeysForList) return (
        <>
            <SearchInput onUpdate={updateQuery} query={query} inputPlaceholder={inputPlaceholder} />
            <InfiniteScroller
                Component={Component}
                fetchData={queryFnForList}
                queryKeys={queryKeysForList}
                NotFoundSection={NotFoundSection}
                notFoundMessage={notFoundMessage}
            />
        </>
    )

    else if (!query) return (
        <>
            <SearchInput onUpdate={updateQuery} query={query} inputPlaceholder={inputPlaceholder} />
            <section className="forceCenter">
                <p>Results would appear here</p>
            </section>
        </>

    )

    return (
        <>
            <SearchInput onUpdate={updateQuery} query={query} inputPlaceholder={inputPlaceholder} />
            <InfiniteScroller
                Component={Component}
                queryKeys={queryKeys(query)}
                fetchData={(p) => queryFn(query, p)}
            />
        </>
    )

}

export default SearchInList;