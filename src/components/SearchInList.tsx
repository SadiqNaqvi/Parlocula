"use client";

import { useState } from "react";
import { Form, Input } from "./form";
import InfiniteScroller, { InfiniteScrollerProps } from "./InfiniteScroller";
import { AggregatedResponse, GeneralGetReturn, GeneralMultipleReturn } from "@type/internal";
import { TypedFunction } from "@type/other";
import { PaginatedData } from "@type/external";
import { twMerge } from "tailwind-merge";

export type QueryFnReturn<T> = Promise<GeneralMultipleReturn<T> | GeneralGetReturn<AggregatedResponse<T>> | GeneralGetReturn<PaginatedData<T>>>

export type SearchInListProps<T> = {
    Component: React.ComponentType<T>,
    queryKeys: (q: string) => string[],
    queryFn: (query: string, page: number) => QueryFnReturn<T>,
    queryKeysForList?: string[],
    queryFnForList?: (p: number) => QueryFnReturn<T>
    inputPlaceholder?: string;
    className?: string;
    initialQuery?: string | null;
    searchInputContainerClassName?: string;
    searchInputClassName?: string;
    removeAutoFocus?: boolean;
} & Pick<InfiniteScrollerProps, "notFoundMessage" | "NotFoundSection" | "Loading">

type SearchInputProps = {
    onUpdate: TypedFunction<{ query: string }>,
    inputPlaceholder: string | undefined,
    query: string,
    containerClassName?: string;
    inputClassName?: string;
    removeAutoFocus?: boolean;
}

const SearchInput = ({ inputPlaceholder, onUpdate, query, containerClassName, inputClassName, removeAutoFocus }: SearchInputProps) => (
    <Form submit={onUpdate} className={twMerge("pb-2 bg-primary sticky top-0", containerClassName)}>
        <Input
            defaultValue={query}
            name="query"
            autoFocus={!removeAutoFocus}
            placeholder={inputPlaceholder || "Search here"}
            className={inputClassName}
        />
    </Form>
)

const SearchInList = <T,>({ queryFn, queryKeys, className, searchInputClassName, removeAutoFocus, Loading, searchInputContainerClassName, Component, inputPlaceholder, initialQuery, queryFnForList, queryKeysForList, NotFoundSection, notFoundMessage }: SearchInListProps<T>) => {

    const [query, setQuery] = useState(initialQuery || '');

    const updateQuery = (data: { query: string }) => {
        const input = data.query?.trim();

        if (!input || input.length < 3) return;

        setQuery(input);
    }

    const SearchHeader = () => (
        <SearchInput
            removeAutoFocus={removeAutoFocus}
            containerClassName={searchInputContainerClassName}
            inputClassName={searchInputClassName}
            onUpdate={updateQuery}
            query={query}
            inputPlaceholder={inputPlaceholder}
        />
    )

    if (!query && queryFnForList && queryKeysForList) return (
        <>
            <SearchHeader />
            <InfiniteScroller
                Component={Component}
                fetchData={queryFnForList}
                Loading={Loading}
                queryKeys={queryKeysForList}
                NotFoundSection={NotFoundSection}
                notFoundMessage={notFoundMessage}
                className={twMerge("space-y-2", className)}
            />
        </>
    )

    else if (!query) return (
        <>
            <SearchHeader />
            <div className={twMerge("flex flex-cntr-all h-96", className)}>
                <p>Results would appear here</p>
            </div>
        </>

    )

    return (
        <>
            <SearchHeader />
            <InfiniteScroller
                Component={Component}
                Loading={Loading}
                queryKeys={queryKeys(query)}
                fetchData={(p) => queryFn(query, p)}
                className={twMerge("space-y-2", className)}
            />
        </>
    )

}

export default SearchInList;