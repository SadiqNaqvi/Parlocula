"use client";

import { oneHour } from "@lib/constants";
import { infiniteScrollerResponse } from "@lib/utils";
import useCurrentUser from "@store/user";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { InfiniteQueryResponse } from "@type/internal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { LoadingSpinner, ShowError } from "./ui";
import NotFound from "./ui/NotFound";

type InfiniteScrollerProps = {
    Component: React.ComponentType<any>,
    fetchData: (pageParams: number) => Promise<InfiniteQueryResponse>,
    queryKeys: (string | number)[],
    NotFoundSection?: React.ReactNode,
    notFoundMessage?: { title: string, paras: string[] },
    callback?: (arg: any) => any;
    additional?: any;
    initialPage?: number,
    initialData?: { data: any[], total: number } | null,
    Loading?: React.ComponentType<any>,
    className?: string;
    paginate?: boolean;
}

const defaultClasses = "space-y-4";

const defaultNotFoundMessages = {
    title: "Oops! Looks like the popcorn is missing",
    paras: ["Please search the resouce using it's name, title, username, etc."],
}

export default function InfiniteScroller({ Loading, Component, fetchData, queryKeys, NotFoundSection, notFoundMessage = defaultNotFoundMessages, initialPage = 1, initialData, callback, className = defaultClasses, paginate = true, additional }: InfiniteScrollerProps) {

    const container = useRef(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useCurrentUser();

    const updateSearchParams = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("p", page.toString());
        router.replace(`${pathname}?${params.toString()}`)
    }

    const gotoTop = () => {
        const params = new URLSearchParams(searchParams);
        params.set("p", '1');
        router.replace(`${pathname}?${params.toString()}`)
    }

    const { data, refetch, isFetching, error, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery<
        InfiniteQueryResponse, Error, InfiniteData<InfiniteQueryResponse>, (string | number)[], number
    >({
        queryKey: queryKeys,
        staleTime: oneHour * 1000,
        initialPageParam: initialData ? initialPage + 1 : initialPage,
        queryFn: async ({ pageParam }) => await fetchData(pageParam)
            .then(res => {
                // console.log(res);
                const resp = infiniteScrollerResponse(res, pageParam);
                if (resp.results?.length && resp.page > 1 && paginate) updateSearchParams(resp.page)
                return resp;
            }),
        initialData: initialData ? { pageParams: [1], pages: [infiniteScrollerResponse(initialData, initialPage)] } : undefined,
        getNextPageParam: (lp: any): number | undefined => {
            return lp && lp.page < lp.total_pages ? lp.page + 1 : undefined;
        },
        enabled: !initialData,
        retry: false, refetchOnWindowFocus: false, retryOnMount: false, refetchOnMount: false, refetchOnReconnect: false
    });

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

    const LoadingComponent = () => {
        const LoadingComp = Loading ?? LoadingSpinner
        return <LoadingComp />
    }

    const NotFoundComponent = ({ ActionButton, paras, title }: {
        title: string;
        paras: string[];
        ActionButton?: React.ReactNode;
    }) => {
        if (NotFoundSection === undefined)
            return <NotFound paras={paras} title={title} ActionButton={ActionButton} />
        else return NotFoundSection;
    }

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

    else if (!data.pages[0]?.results?.length && initialPage !== 1)
        return (
            <NotFoundComponent
                title="Looks like you came across too far"
                paras={[`No data is available at page ${initialPage}`]}
                ActionButton={<button className="primary" onClick={gotoTop}>Go to top</button>}
            />
        )

    else if (!data || !data.pages[0]?.total_results)
        return <NotFoundComponent {...notFoundMessage} />


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