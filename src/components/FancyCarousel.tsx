"use client";

import { useEffect, useRef } from 'react';

import { Carousel as NativeCarousel } from '@fancyapps/ui';
import '@fancyapps/ui/dist/carousel/carousel.css';

import type { OptionsType } from '@fancyapps/ui/types/Carousel/options';

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
    }, [containerRef.current]);

    return (
        <div className={`f-carousel ${className}`} ref={containerRef}>
            {children}</div>
        //     <div className="f-carousel__viewport">
        //         <div className="f-carousel__track">
        //     </div>
        // </div>
    );
}

export default Carousel;
