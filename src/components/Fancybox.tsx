"use client";

import React, { useEffect } from "react";

import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

const Fancybox = ({ children }: { children: React.ReactNode }) => {

    useEffect(() => {

        NativeFancybox.bind("[data-modal]" as any, {
            groupAttr: false,
            closeButton: false,
            hideScrollbar: true
        });

        NativeFancybox.bind("[data-frame]" as any, {
            groupAll: true,
            hideScrollbar: true,
            Toolbar: {
                display: {
                    left: ["infobar"],
                    middle: [],
                    right: ["slideshow", "download", "thumbs", "close"],
                },
            },
        });

        return () => {
            NativeFancybox.unbind("[data-modal]");
            NativeFancybox.unbind("[data-frame]");
            NativeFancybox.close();
        };
    }, []);

    return <>{children}</>;
}

export default Fancybox;