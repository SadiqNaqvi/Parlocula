"use client";

import { useInfiniteQueryHook } from "@lib/hooks";
import useCurrentUser from "@store/user";
import { GeneralGetReturn, GeneralMultipleReturn, InfiniteQueryResponse, InfiniteQueryResponseDB } from "@type/internal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { LoadingSpinner, ShowError } from "./ui";
import NotFound from "./ui/NotFound";
import { GeneralReturnType } from "@type/external";
import { InfiniteData } from "@tanstack/react-query";

type InfiniteScrollerProps = {
    Component: React.ComponentType<any>,
    fetchData: (pageParams: number) => Promise<GeneralMultipleReturn | GeneralGetReturn>,
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
    autoLoad?: boolean;
    placeholderData?: GeneralReturnType<any> | InfiniteQueryResponseDB<any>
    onSuccess?: (d: InfiniteData<InfiniteQueryResponse<any>, number>) => void,
    enabled?: boolean
}

const defaultClasses = "space-y-4";

const defaultNotFoundMessages = {
    title: "Oops! Looks like the popcorn is missing",
    paras: ["Please search the resouce using it's name, title, username, etc."],
}

export default function InfiniteScroller({ Loading, autoLoad = false, onSuccess, placeholderData, Component, fetchData, queryKeys, NotFoundSection, notFoundMessage = defaultNotFoundMessages, initialPage = 1, enabled = true, initialData, callback, className = defaultClasses, paginate = true, additional }: InfiniteScrollerProps) {

    const container = useRef(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { meta } = useCurrentUser();

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

    const { data, refetch, isLoading, error, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQueryHook({
        queryKeys: queryKeys,
        queryFn: (p) => fetchData(p)
            .then(res => {
                if (paginate && res.success && res.result?.data?.length && p > 1) updateSearchParams(p)
                return res;
            }),
        initialData,
        initialPage,
        placeholderData,
        onSuccess,
        enable: enabled,
    });

    useEffect(() => {
        if (autoLoad) return;
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

    const manuallyLoadNextPage = () => {
        fetchNextPage();
    }

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

    if (isLoading)
        return <LoadingComponent />

    else if (error)
        return (
            <ShowError
                retry={refetch}
                errCode={error.message}
                heading="Unable to fetch the resource you're looking for"
            />
        )

    else if (!data?.pages[0]?.results?.length && initialPage !== 1)
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
                                <Component {...el} callback={callback} additional={additional} user={meta} />
                            </li>
                        ))}
                    </React.Fragment>
                ))}
            </ul>
            {hasNextPage &&
                (autoLoad || isFetchingNextPage ?
                    <div ref={container} className="mt-4 py-2">
                        <LoadingComponent />
                    </div>
                    :
                    <div className="w-full flex flex-cntr-all">
                        <button className="primary" onClick={manuallyLoadNextPage}>Load More</button>
                    </div>
                )
            }
        </>
    )
}