"use client";

import ThreadBox, { ThreadBoxLoadingSkeleton } from "@components/ui/ThreadBox";
import { queryFilters } from "@lib/constants";
import { getThreadsForMedia } from "@lib/helpers/common";
import { useQueryHook } from "@lib/hooks";
import { convertCodeIntoError, queryFunction } from "@lib/utils";
import { MereThread } from "@type/internal";
import { useEffect, useRef, useState } from "react";

const ThreadFetcher = ({ id, type }: { id: string, type: string }) => {

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

    const { refetch, isFetching, error, data } = useQueryHook<{ data: MereThread[] }>({
        enabled: isVisible,
        queryKeys: ["threads-for-media", id, queryFilters.threads[0]],
        queryFn: () => queryFunction(getThreadsForMedia, [id, 1]),
    });

    if (isFetching) return (
        <div className="flex gap-4 pb-2 overflow-x-hidden" ref={container}>
            {startLoading ?
                [1, 2, 3, 4, 5, 6, 7, 8].map(el => (
                    <ThreadBoxLoadingSkeleton key={el} />
                ))
                :
                <div className="h-64 w-full"></div>
            }
        </div>
    )

    else if (error) return (
        <section className="py-4 w-full border-dashed border-red-500 space-x-4">
            <p className="text-lg text-center">{convertCodeIntoError(error.message) as string}</p>
            <button className="secondary mx-auto" onClick={() => refetch()}>Try again</button>
        </section>
    )

    else if (!data) return (
        <section className="py-4 w-full border-dashed border-zinc-500 space-x-4">
            <p className="text-lg text-center">Nothing could be found</p>
            <p className="text-sm text-center">{`Be the first one to create a thread on this ${type}.`}</p>
        </section>
    );

    return (
        <div className="flex gap-4 pb-2 overflow-x-auto">
            {data.data.map(el => <ThreadBox key={el._id} {...el} />)}
        </div>
    )
}

export default ThreadFetcher;