"use client";

import React, { useEffect } from "react";

import { Fancybox as NativeFancybox, FancyboxPlugins } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

const Fancybox = ({ children }: { children: React.ReactNode }) => {

    useEffect(() => {

        NativeFancybox.bind("[data-frame]", {
            groupAll: false,
            hideScrollbar: true,
            closeButton: false,
            dragToClose: true,
            fadeEffect: true,
            groupAttr: "parlo-gallery",
            // Fullscreen: { autoStart: true },
            Carousel: {
                transition:"tween",
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
            // NativeFancybox.unbind("[data-modal]");
            NativeFancybox.unbind("[data-frame]");
            NativeFancybox.close();
        };
    }, []);

    return <>{children}</>;
}

export default Fancybox;