"use client";

import React, { useEffect, useRef } from "react";
import NotFound from "./ui/NotFound";
import { useInfiniteQuery } from "@tanstack/react-query";
import { InfiniteQueryResponse } from "@type/internal";
import { LoadingSpinner } from "./ui";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type InfiniteScrollerType = {
    Component: React.ComponentType<any>,
    fetchData: (pageParams: number) => Promise<InfiniteQueryResponse>,
    queryKey: string,
    notFoundMessages: { heading: string, paras: string[] },
    Loading?: React.ComponentType<any>,
    initialPage?: number,
    initialData?: any[],
    className?: string;
    paginate?: boolean;
}

const defaultClasses = "space-y-4";

export default function InfiniteScroller({ Loading, Component, fetchData, queryKey, notFoundMessages: { heading, paras }, initialPage = 1, initialData = [], className = defaultClasses, paginate = true }: InfiniteScrollerType) {

    const container = useRef(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const updateSearchParams = (page: number) => {
        if (!paginate) return;
        const params = new URLSearchParams(searchParams);
        params.set("p", page.toString());
        router.replace(`${pathname}?${params.toString()}`)
    }

    const { data, refetch, isFetching, error, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
        retry: false,
        refetchOnWindowFocus: false,
        queryKey: [queryKey],
        initialPageParam: initialPage,
        queryFn: ({ pageParam = initialPage }) => fetchData(pageParam).then(res => res.results.length && updateSearchParams(res.page)),
        initialData: { pageParams: [initialPage], pages: initialData },
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.total_pages)
                return lastPage.page + 1;
            return;
        },
    });

    const LoadingComponent = () => {
        return Loading ? <Loading /> : <LoadingSpinner />
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

    if (isFetching && !isFetchingNextPage)
        return <LoadingComponent />

    if (error)
        return (
            <div className="mt-6">
                <h3 className="text-3xl capitalize text-center">Unable to find the resource you are looking for!</h3>
                <p className="text-zinc-500 mt-1 text-center">{error.message}</p>
                <button className="mt-4 secondary mx-auto" onClick={() => refetch()}>Try Again</button>
            </div>
        )

    if (!data.pages[0].total_results)
        return (
            <section className="mt-10">
                <NotFound title={heading} paragraph={paras} />
            </section>
        )

    return (
        <>
            <ul className={className}>
                {data?.pages.map((content, ind) => (
                    <React.Fragment key={ind}>
                        {content.results.map((el: any, i: any) => (
                            <li key={el.id || el._id || el.tmdb_id || i} className="list-none">
                                <Component {...el} />
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