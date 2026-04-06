"use client";

import { PropsWithChildren, useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";

type Props = {
    OptionButton?: React.ReactNode,
    navTitle: string
    titleToShare: string,
    urlToShare?: string,
    className?: string
}

const ObserverHeader = ({ children, OptionButton, className, navTitle, titleToShare, urlToShare }: PropsWithChildren<Props>) => {

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
                navTitle={invisible ? navTitle : undefined}
                OptionButton={OptionButton}
            />
            <header ref={headerRef} className={className}>{children}</header>
        </>
    )

}

export default ObserverHeader;