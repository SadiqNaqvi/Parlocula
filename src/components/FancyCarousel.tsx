"use client";

import { useEffect, useRef } from 'react';

import { Carousel as NativeCarousel } from '@fancyapps/ui';
import '@fancyapps/ui/dist/carousel/carousel.css';

import type { OptionsType } from '@fancyapps/ui/types/Carousel/options';
import { twMerge } from 'tailwind-merge';

const options: Partial<OptionsType> = {
    infinite: true,
    Dots: true,
    Navigation: false,
};

const Carousel = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const instance = new NativeCarousel(container, options);

        return () => { instance.destroy(); };
    }, []);

    return (
        <ul className={twMerge("f-carousel", className)} ref={containerRef}>
            {children}
        </ul>
    );
}

export default Carousel;
