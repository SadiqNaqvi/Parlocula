"use client";

import { PropsWithChildren } from "react";
import ContentSharingSheet from "./sheets/ContentSharingSheet";

type Props = PropsWithChildren<{
    title?: string
    url?: string,
    className?: string,
}>

const ShareButton = ({ children, title, url, className }: Props) => {

    return (
        <ContentSharingSheet className={className} path={url} title={title}>
            {children}
        </ContentSharingSheet>
    )
}

export default ShareButton;