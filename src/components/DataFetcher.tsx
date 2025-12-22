"use client";

import { fetchMoviesWithCast, fetchMoviesWithCompany, fetchMoviesWithGenres, fetchMoviesWithYear, fetchShowsWithGenres, fetchSimilarMovies, fetchSimilarShows, fetchTrendingMovies, fetchTrendingShows } from "@lib/contentFetcher";
import { useQueryHook } from "@lib/hooks";
import { makeUrlSafe } from "@lib/utils";
import { ExtGeneralPaginatedData, RefinedGeneralData } from "@type/external";
import { useEffect, useRef, useState } from "react";
import VerticleMovieCard, { VerticleMovieCardSkeleton } from "./ui/VerticleMovieCard";
import { GeneralGetReturn } from "@type/internal";

const funcMap = {
    fetchMoviesWithCast,
    fetchMoviesWithCompany,
    fetchMoviesWithGenres,
    fetchMoviesWithYear,
    fetchSimilarMovies,
    fetchShowsWithGenres,
    fetchSimilarShows,
    fetchTrendingMovies,
    fetchTrendingShows,
}

type AllowedFunctions = keyof typeof funcMap;

type FuncMap = typeof funcMap

type Props<T extends AllowedFunctions> = {
    func: T,
    args: Parameters<FuncMap[T]>,
    type: string,
    className?: string,
    except?: string,
    querykeys: string[],
}

type lala = Props<"fetchMoviesWithCast">

const DataFetcher = <T extends AllowedFunctions>({ func, args, type, className = '', querykeys, except }: Props<T>) => {

    const [isVisible, setIsVisible] = useState(false);
    const container = useRef(null);

    useEffect(() => {

        const current = container.current;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !isVisible && entry.intersectionRatio >= 0.2)
                setIsVisible(true);
        }, { threshold: [0.2] })

        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        }
    }, []);

    const fetchDataWithNew = async (): Promise<GeneralGetReturn> => {
        const functionToFetch = funcMap[func] as (...args: any) => ReturnType<FuncMap[T]>;

        const response = await functionToFetch(...args);

        if (!response) return { success: false, errCode: "unstable_internet" };

        let contents = ("results" in response ? response.results : response.result?.results) || [];
        if (except)
            contents = contents.filter((el: any) => String(el.id) !== except)

        return {
            success: true,
            result: contents
        };
    }

    const { refetch, isRefetching, isFetching, error, data } = useQueryHook<RefinedGeneralData[]>({
        enabled: isVisible,
        queryKeys: querykeys,
        queryFn: fetchDataWithNew,
    });

    if (!isVisible) return (
        <div className="h-64 w-full"></div>
    );

    else if (isFetching || isRefetching) return (
        <div className={"flex gap-4 pb-2 overflow-x-hidden" + className} ref={container}>
            {
                Array(8).fill(0).map((_, i) => (
                    <VerticleMovieCardSkeleton key={i} />
                ))
            }
        </div>
    )

    else if (error || !data)
        return (
            <section className="py-4 w-full border-dashed border-red-500 space-x-4">
                <p className="text-lg">Something Went Wrong! Please Try again</p>
                <button className="secondary" onClick={() => refetch()}>Try again</button>
            </section>
        )

    return (
        <div className={"flex gap-4 pb-2 overflow-x-auto" + className}>
            {data.slice(0, 20).map((content: RefinedGeneralData) => (
                <VerticleMovieCard {...content} key={content.id} />
            ))}
        </div>
    )
}

export default DataFetcher;