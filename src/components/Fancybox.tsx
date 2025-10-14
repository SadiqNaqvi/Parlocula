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
        } as any);

        NativeFancybox.bind("[data-frame]" as any, {
            groupAll: true,
            hideScrollbar: true,
            Toolbar: {
                // items: {
                //     customDownload: {
                //         tpl: `<button class="fancybox__button" title="Download">⬇️</button>`,
                //         click: (fancybox, slide) => {
                //             const src = fancybox.instance.getSlide()?.src
                //             console.log(src)
                //             // const src = slide.src;
                //             // const link = document.createElement("a");
                //             // link.href = src;
                //             // link.download = `image-${Date.now()}`;
                //             // document.body.appendChild(link);
                //             // link.click();
                //             // document.body.removeChild(link);
                //         },

                //     }
                // },
                display: {
                    left: ["infobar"],
                    middle: [],
                    right: ["slideshow", "thumbs", "close"],
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