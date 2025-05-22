"use client"

import { useEffect, useRef } from "react"

const HeaderCarosel = ({ children, className = '', control, autoplay }: { children: React.ReactNode, className?: string, autoplay?: number, control?: boolean }) => {

    const caroselRef = useRef<HTMLDivElement>(null);

    const autoPlayCarosel = () => {
        if (!caroselRef?.current) return
        const carosel = caroselRef.current;
        if (carosel.scrollLeft + carosel.clientWidth + 10 > carosel.scrollWidth)
            carosel.scrollLeft = 0;
        else
            carosel.scrollLeft += carosel.clientWidth;
    }

    // useEffect(() => {
    //     if (!caroselRef.current || !autoplay) return
    //     let autoPlayTimer: NodeJS.Timeout;
    //     new IntersectionObserver((entries) => {
    //         entries.forEach(el => {
    //             if (el.isIntersecting)
    //                 autoPlayTimer = setInterval(autoPlayCarosel, autoplay * 1000);
    //             else clearInterval(autoPlayTimer);
    //         })
    //     }).observe(caroselRef.current);
    // }, [caroselRef.current])

    return (
        <div ref={caroselRef} className={`${className} h-full w-full flex scroll-smooth overflow-x-auto snap-x snap-mandatory *:snap-center relative`}>
            {children}
        </div >
    )
}

export default HeaderCarosel
