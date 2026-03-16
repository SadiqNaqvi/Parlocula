"use client";

import { useEffect, useRef } from 'react';

import "@/app/globals.css"
import { Carousel as NativeCarousel, type CarouselOptions } from '@fancyapps/ui';
import '@fancyapps/ui/dist/carousel/carousel.css';

import { Dots } from "@fancyapps/ui/dist/carousel/carousel.dots.js";
import "@fancyapps/ui/dist/carousel/carousel.dots.css";

import { Arrows } from "@fancyapps/ui/dist/carousel/carousel.arrows.js";
import "@fancyapps/ui/dist/carousel/carousel.arrows.css";

import { twMerge } from 'tailwind-merge';

const options: Partial<CarouselOptions> = {
    // infinite: false,
    // style: {
    //     "--f-carousel-slide-width": "100%",
    // },
    breakpoints: {
        "(min-width: 480px)": {
            style: {
                // "--f-carousel-slide-gap": "8px",
                // "--f-carousel-gap": "8px",
                "--f-carousel-slide-width": "248px",
            },
        },
    }
}

const Carousel = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const instance = NativeCarousel(container, options, {
            Dots,
            Arrows,
        }).init();

        return () => { instance.destroy(); };
    }, []);

    return (
        <ul className={twMerge("f-carousel", className)} ref={containerRef}>
            {children}
        </ul>
    );
}

export default Carousel;
