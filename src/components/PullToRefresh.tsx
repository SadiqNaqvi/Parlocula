"use client";

import { getQueryClient } from '@lib/providers/queryClient';
import { QueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';

type PullToRefreshProps = {
    children: React.ReactNode;
};

export const refreshPage = async (queryClient: QueryClient) => {
    // const queries = queryClient.getQueryCache()
    //     .getAll()
    //     .reduce((p, c) => c.observers.length ? c.queryKey : p, [] as string[][]);

    // await Promise.all(queries.map(query => queryClient.refetchQueries({ queryKey: query })));
}

export default function PullToRefresh({ children }: PullToRefreshProps) {
    const [pullDistance, setPullDistance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const queryClient = getQueryClient();

    const threshold = 100;

    const startY = useRef<number | null>(null);
    const isPulling = useRef(false);
    const latestDistance = useRef(0);
    const animationFrame = useRef<number | null>(null);

    const updatePullDistance = () => {
        const distance = Math.min(latestDistance.current, threshold * 1.2);
        if (distance > threshold * 1.2) return;
        setPullDistance(distance);
        animationFrame.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isPulling.current || startY.current === null) return;
        const distance = e.touches[0].clientY - startY.current;

        if (distance > 0) {
            e.preventDefault();
            latestDistance.current = distance;

            if (animationFrame.current === null) {
                animationFrame.current = requestAnimationFrame(updatePullDistance);
            }
        }
    };

    const handleTouchStart = (e: TouchEvent) => {
        if (window.scrollY === 0) {
            startY.current = e.touches[0].clientY;
            isPulling.current = true;
        }
    };

    const resetPullState = () => {
        setPullDistance(0);
        latestDistance.current = 0;
        startY.current = null;
        isPulling.current = false;

        if (animationFrame.current !== null) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
    };

    const handleRefreshing = () => {
        const distance = Math.min(latestDistance.current, threshold * 1.2);
        if (distance >= threshold && !refreshing) {
            setRefreshing(true);
            Promise.resolve(refreshPage(queryClient)).finally(() => {
                setRefreshing(false);
                resetPullState();
            });
        }
        else resetPullState();
    }

    const handleTouchEnd = () => {
        handleRefreshing()
    };

    useEffect(() => {
        const queries = queryClient.getQueryCache()
            .getAll()
        console.log(queries);
        if (refreshing) return;
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [refreshing]);

    const status = refreshing ? "Oh Yes Daddy!!" : pullDistance < threshold ? "A bit more!" : "YES, Release it";

    return (
        <div>
            <div className='flex flex-cntr-all w-full bg-primarylight' style={{ transition: "height 200ms ease", height: refreshing ? 50 : pullDistance, overflow: "hidden" }}>
                {status}
            </div>
            {children}
        </div>
    );
}
