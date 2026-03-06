"use client";

import { useEffect, useRef } from 'react';

import { Carousel as NativeCarousel, type CarouselOptions } from '@fancyapps/ui';
import { Dots } from "@fancyapps/ui/dist/carousel/carousel.dots.js";
import '@fancyapps/ui/dist/carousel/carousel.css';

import { twMerge } from 'tailwind-merge';

const options: Partial<CarouselOptions> = {
    infinite: true,
};

const Carousel = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const instance = NativeCarousel(container, options, { Dots, }).init();

        return () => { instance.destroy(); };
    }, []);

    return (
        <ul className={twMerge("f-carousel", className)} ref={containerRef}>
            {children}
        </ul>
    );
}

export default Carousel;
