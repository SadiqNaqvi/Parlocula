"use client";

import { ShareIcon } from "@assets/Icons";
import ContentSharingSheet from "./sheets/ContentSharingSheet";
import { OptionalChildren } from "./ui";

type Props = {
    title?: string
    url?: string,
    className?: string,
    textToShow?: string,
}

const ShareButton = ({ title, url, className, textToShow }: Props) => {

    return (
        <ContentSharingSheet className={className} path={url} title={title}>
            <OptionalChildren condition={textToShow} fallback={<ShareIcon />}>
                <div className="flex flex-1 gap-2 items-center">
                    <ShareIcon />
                    <span>{textToShow}</span>
                </div>
            </OptionalChildren>
        </ContentSharingSheet>
    )
}

export default ShareButton;