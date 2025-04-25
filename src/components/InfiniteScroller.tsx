"use client";

import { oneHour } from "@lib/constants";
import { infiniteScrollerResponse } from "@lib/utils";
import useCurrentUser from "@store/user";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { InfiniteQueryResponse } from "@type/internal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { LoadingSpinner, ShowError } from "./ui";
import NotFound from "./ui/NotFound";

type InfiniteScrollerType = {
    Component: React.ComponentType<any>,
    fetchData: (pageParams: number) => Promise<InfiniteQueryResponse>,
    queryKeys: string[],
    notFoundMessage?: { title: string, paras: string[] },
    callback?: (arg: any) => any;
    additional?: any;
    staleTime?: number;
    initialPage?: number,
    initialData?: { data: any[], total: number },
    Loading?: React.ComponentType<any>,
    className?: string;
    paginate?: boolean;
}

const defaultClasses = "space-y-4";

const defaultNotFoundMessages = {
    title: "Oops! Looks like the popcorn is missing",
    paras: ["Please search the resouce using it's name, title, username, etc."],
}

export default function InfiniteScroller({ Loading, Component, fetchData, queryKeys, notFoundMessage = defaultNotFoundMessages, initialPage = 1, initialData, callback, className = defaultClasses, paginate = true, staleTime, additional }: InfiniteScrollerType) {

    const container = useRef(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useCurrentUser();

    const updateSearchParams = (page: number) => {
        if (!paginate) return;
        const params = new URLSearchParams(searchParams);
        params.set("p", page.toString());
        router.replace(`${pathname}?${params.toString()}`)
    }

    const gotoTop = () => {
        const params = new URLSearchParams(searchParams);
        params.set("p", '1');
        router.replace(`${pathname}?${params.toString()}`)
    }

    const { data, refetch, isFetching, error, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
        queryKey: queryKeys,
        staleTime: staleTime ?? oneHour * 1000,
        initialPageParam: initialData ? initialPage + 1 : initialPage,
        queryFn: async ({ pageParam }) => await fetchData(pageParam)
            .then(res => {
                const resp = infiniteScrollerResponse(res, pageParam);
                if (resp.results?.length && resp.page > 1) updateSearchParams(resp.page)
                return resp;
            }),
        initialData: initialData ? { pageParams: [1], pages: [infiniteScrollerResponse(initialData, initialPage)] } : undefined,
        getNextPageParam: (lp: any): number | undefined => {
            return lp && lp.page < lp.total_pages ? lp.page + 1 : undefined;
        },
        enabled: !initialData,
        retry: false, refetchOnWindowFocus: false, retryOnMount: false, refetchOnMount: false, refetchOnReconnect: false
    });

    const LoadingComponent = () => {
        const LoadingComp = Loading ?? LoadingSpinner
        return <LoadingComp />
    }

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
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

    if (initialData && !initialData.data?.length && initialPage !== 1)
        return (
            <NotFound
                title="Looks like you came across too far"
                paras={[`No data is available at page ${initialPage}`]}
                ActionButton={<button className="primary" onClick={gotoTop}>Go to top</button>}
            />
        )

    if (isFetching && !isFetchingNextPage)
        return <LoadingComponent />

    else if (error)
        return (
            <ShowError
                retry={refetch}
                errCode={error.message}
                heading="Unable to fetch the resource you're looking for"
            />
        )

    if (!data || !data.pages[0]?.total_results)
        return <NotFound {...notFoundMessage} />


    return (
        <>
            <ul className={className} id="infiniteScroller">
                {data?.pages.map((content, ind) => (
                    <React.Fragment key={ind}>
                        {content.results.map((el: any, i: any) => (
                            <li key={el.id || el._id || el.tmdb_id || i} className="list-none">
                                <Component {...el} callback={callback} additional={additional} user={user} />
                            </li>
                        ))}
                    </React.Fragment>
                ))}
            </ul>
            {hasNextPage &&
                <div ref={container} className="mt-4">
                    <LoadingComponent />
                </div>
            }
        </>
    )
}