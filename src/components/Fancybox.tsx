"use client";

import React, { useEffect } from "react";

import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import "@styles/fancybox.css";

const Fancybox = ({ children }: { children: React.ReactNode }) => {

    useEffect(() => {

        NativeFancybox.bind("[data-frame]", {
            groupAll: false,
            hideScrollbar: true,
            closeButton: false,
            dragToClose: true,
            fadeEffect: true,
            groupAttr: "parlo-gallery",
            Carousel: {
                transition: "tween",
                Toolbar: {
                    display: {
                        left: ["counter"],
                        middle: [],
                        right: ["download", "fullscreen", "slideshow", "thumbs", "close"],
                    },
                },
            }
        });

        return () => {
            NativeFancybox.unbind("[data-frame]");
            NativeFancybox.close();
        };
    }, []);

    return <>{children}</>;
}

export default Fancybox;