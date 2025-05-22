"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { InfiniteQueryResponse } from "@type/internal";
import { useReducer } from "react";
import { oneHour } from "./constants";

export const useInfiniteQueryHook = <T,>(queryKey: unknown, func: (pageParams: number) => Promise<InfiniteQueryResponse & T>) => {
    return useInfiniteQuery({
        retry: 1,
        refetchOnWindowFocus: false,
        queryKey: [queryKey],
        initialPageParam: 1,
        staleTime: oneHour * 1000,
        gcTime: oneHour * 1000,
        queryFn: ({ pageParam = 1 }) => func(pageParam),
        initialData: { pageParams: [1], pages: [] },
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.total_pages)
                return lastPage.page + 1;
            return;
        },
    });
}

type UseQueryProps<T,> = {
    queryKeys: (string | number)[],
    queryFn: () => Promise<T | null>,
    enabled?: boolean,
    initialData?: T,
    staleTime?: number
}

export const useQueryHook = <T,>({ queryKeys, queryFn, initialData, enabled = true }: UseQueryProps<T>) => {
    return useQuery({
        queryKey: queryKeys,
        queryFn,
        enabled,
        staleTime: oneHour * 1000,
        gcTime: oneHour * 1000,
        initialData,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retryOnMount: false,
    })
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
