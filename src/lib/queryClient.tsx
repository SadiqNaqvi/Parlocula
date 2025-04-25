"use client";

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import {
    isServer,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

const makeQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 60,
            },
        },
    })

let browserQueryClient: QueryClient | undefined = undefined

const getQueryClient = () => {
    if (isServer) {
        return makeQueryClient()
    } else {
        if (!browserQueryClient) browserQueryClient = makeQueryClient()
        return browserQueryClient
    }
}


export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}


