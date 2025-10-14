"use client";

import { fetchMoviesWithCast, fetchMoviesWithCompany, fetchMoviesWithGenres, fetchMoviesWithYear, fetchShowsWithGenres, fetchSimilarMovies, fetchSimilarShows, fetchTrendingMovies, fetchTrendingShows } from "@lib/contentFetcher";
import { refineGeneralData, } from "@lib/dataRefiner";
import { useQueryHook } from "@lib/hooks";
import { refineString } from "@lib/utils";
import { GeneralReturnType, RefinedGeneralData } from "@type/external";
import { useEffect, useRef, useState } from "react";
import VerticleMovieCard, { VerticleMovieCardSkeleton } from "./ui/VerticleMovieCard";

type DataType = GeneralReturnType & { results: any[] };
type FuncMapType = "fetchSimilarMovies" |
    "fetchMoviesWithCast" |
    "fetchMoviesWithGenres" |
    "fetchMoviesWithYear" |
    "fetchMoviesWithCompany" |
    "fetchSimilarShows" |
    "fetchShowsWithGenres" |
    "fetchTrendingMovies" |
    "fetchTrendingShows"

const funcMap: Record<FuncMapType, (...arg: any) => any> = {
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

export default function DataFetcher({ func, args, type, className = '', except }: { func: FuncMapType, args: any[], type: string, className?: string, except?: string, }) {

    const [isVisible, setIsVisible] = useState(false);
    const container = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !isVisible && entry.intersectionRatio >= 0.2)
                setIsVisible(true);
        }, { threshold: [0.2] })

        if (container.current)
            observer.observe(container.current);

        return () => {
            if (container.current)
                observer.unobserve(container.current);
        }
    }, []);

    const fetchDataWithNew = async () => {
        const functionToFetch = funcMap[func];
        const res: DataType = await functionToFetch(...args);
        if (!res) throw new Error("");

        let contents = res.results;
        if (except) contents = contents.filter((el: any) => String(el.id) !== except)

        return refineGeneralData(contents);
    }

    const { refetch, isFetching, error, data } = useQueryHook({
        enabled: isVisible,
        queryKeys: [func, ...args],
        queryFn: fetchDataWithNew,
    });

    if (isFetching) return (
        <div className={"flex gap-4 pb-2 overflow-x-hidden" + className} ref={container}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(el => (
                <VerticleMovieCardSkeleton key={el} />
            ))
                // :
                // <div className="h-64 w-full"></div>
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
            {data.slice(0, 20).map((el: RefinedGeneralData) => (
                <VerticleMovieCard
                    link={`/explore/${type}/${el.id}-${refineString(el.title)}`}
                    poster={el.poster}
                    title={el.title}
                    rating={el.rating}
                    year={el.year.toString()}
                    key={el.id} />
            ))}
        </div>
    )
}