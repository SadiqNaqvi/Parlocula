"use client";

import { PropsWithChildren, useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";

type Props = {
    headerClasses?: string,
    OptionButton?: React.ReactNode,
    navTitle: string
    titleToShare: string,
    urlToShare?: string,
    textToShare?: string,
    poster?: string,
    className?: string
}

const ObserverHeader = ({ children, headerClasses, OptionButton, className, navTitle, titleToShare, urlToShare, poster, textToShare }: PropsWithChildren<Props>) => {

    const headerRef = useRef<HTMLElement | null>(null);
    const [invisible, setInvisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting)
                setInvisible(false);
            else setInvisible(true);
        });

        const elementToObserve = headerRef.current?.querySelector("[data-observe]");

        if (elementToObserve)
            observer.observe(elementToObserve);

        return () => {
            if (elementToObserve)
                observer.unobserve(elementToObserve);
        }
    }, [headerRef]);

    return (
        <>
            <Navbar
                titleToShare={titleToShare}
                urlToShare={urlToShare}
                poster={poster}
                textToShare={textToShare}
                navTitle={invisible ? navTitle : undefined}
                OptionButton={OptionButton}
            />
            <header ref={headerRef} className={className}>{children}</header>
        </>
    )

}

export default ObserverHeader;