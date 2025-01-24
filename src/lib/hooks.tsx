"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { GeneralReturnType } from "./types";
import { useEffect, useReducer } from "react";

type DataType = GeneralReturnType & { [key: string]: any[] };

export const useInfiniteScroller = <T,>(queryKey: unknown, func: (pageParams: number) => Promise<GeneralReturnType & T>, container: { current: null | Element }) => {

    const returnVal = useInfiniteQuery({
        retry: 1,
        refetchOnWindowFocus: false,
        queryKey: [queryKey],
        initialPageParam: 1,
        queryFn: ({ pageParam = 1 }) => func(pageParam),
        initialData: { pageParams: [1], pages: [] },
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.total_pages)
                return lastPage.page + 1;
            return;
        },
    });

    const { fetchNextPage, isFetchingNextPage, hasNextPage } = returnVal;

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            // console.log(entry.isIntersecting && !isFetchingNextPage && hasNextPage);
            if (entry.isIntersecting && !isFetchingNextPage && hasNextPage)
                fetchNextPage();
        }, { threshold: 0.1 })

        if (container.current)
            observer.observe(container.current);

        return () => {
            if (container.current)
                observer.unobserve(container.current);
        }
    }, [container.current]);

    return returnVal;
}

function reducer<T>(state: T, action: Partial<T>): T {
    if (!action) return state;
    return { ...state, ...action };
}

export function useCustomReducer<T>(initialValue: T) {
    const [state, dispatch] = useReducer(reducer<T>, initialValue);

    const setter = (value: Partial<T>) => dispatch(value);

    return { ...state, setter };
}
