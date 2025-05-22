"use client";

import { PropsWithChildren } from "react";
import toast from "react-hot-toast";

type Props = PropsWithChildren<{
    title: string
    file?: File,
    url?: string,
    text?: string,
}> & React.HTMLAttributes<HTMLButtonElement>

const ShareButton = ({ children, onClick, title, url, text, ...args }: Props) => {

    const share = () => {
        const urlToShare = url ?? window.location.href;
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        const data = { text, url: urlToShare, title };

        if (navigator.canShare && navigator.canShare(data) && isMobile)
            navigator.share(data)
        else {
            navigator.clipboard.writeText(urlToShare)
                .then(() => toast.success("Link copied to the clipboard"))
                .catch(() => toast.error("Unable to copy link to the clipboard"))
        };
    }

    return <button onClick={share} {...args}>{children}</button>
}

export default ShareButton;