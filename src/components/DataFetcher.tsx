"use client";

import { useEffect, useRef, useState } from "react";
import VerticleMovieCard, { VerticleMovieCardSkeleton } from "./ui/VerticleMovieCard";
import { GeneralReturnType, RefinedGeneralData } from "@lib/types";
import { refineGeneralData, refineString } from "@lib/dataRefiner";
import { useQuery } from "@tanstack/react-query";

type DataType = GeneralReturnType & { results: any[] };

export default function DataFetcher({ func, args, type, classnames = '', except }: { func: (...args: any) => any, args: any[], type: string, classnames?: string, except?: string, }) {

    const [loading, setLoading] = useState(true);
    const [startLoading, setStartLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const container = useRef(null);


    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !isVisible) {
                if (entry.intersectionRatio >= 0.2)
                    setStartLoading(true);
                if (entry.intersectionRatio >= 0.5)
                    setIsVisible(true);
            }
        }, { threshold: [0.2, 0.5] })

        if (container.current)
            observer.observe(container.current);

        return () => {
            if (container.current)
                observer.unobserve(container.current);
        }
    }, []);

    const fetchDataWithNew = async () => {
        const res: DataType = await func(...args);
        if (!res) {
            setLoading(false);
            throw new Error("no result found")
        };

        let contents = res.results;
        if (except) contents = contents.filter((el: any) => String(el.id) !== except)

        setLoading(false);
        return refineGeneralData(contents);
    }

    const { refetch, isFetching, error, data } = useQuery({
        enabled: isVisible, retry: false, refetchOnWindowFocus: false,
        queryKey: ['genres_with_id=28'],
        queryFn: fetchDataWithNew,
        initialData: [],
    });

    if (loading || isFetching) return <div className={"flex gap-4 pb-2 overflow-x-hidden" + classnames} ref={container}>
        {startLoading ?
            [1, 2, 3, 4, 5, 6, 7, 8].map(el => (
                <VerticleMovieCardSkeleton key={el} />
            ))
            :
            <div className="h-64 w-full"></div>
        }

    </div>

    if (error)
        return (
            <div className="w-full h-48 bg-[var(--gray10)] border border-gray-500 rounded-lg border-dashed flex flex-cntr-all gap-6 flex-col">
                <p className="text-lg">
                    Something Went Wrong!
                </p>
                <button className="primary" onClick={() => refetch()}>Try Again</button>
            </div>
        )

    return <div className={"flex gap-4 pb-2 overflow-x-auto" + classnames}>
        {data.slice(0, 20).map((el: RefinedGeneralData) => (
            <VerticleMovieCard link={`/explore/${type}/${el.id}-${refineString(el.title)}`} poster={el.poster} title={el.title} year={el.year.toString()} key={el.id} />
        ))}
    </div>
}