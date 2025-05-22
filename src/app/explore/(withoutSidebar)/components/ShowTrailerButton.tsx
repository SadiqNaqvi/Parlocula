"use client";

import { PlayIcon } from "@assets/Icons";
import { Fancybox } from "@fancyapps/ui";

const ShowTrailerButton = ({ trailers }: { trailers: { key: string, [key: string]: any }[] }) => {

    const showTrailer = () => {
        Fancybox.show(trailers.map(
            ({ key, name }) => ({ src: `https://www.youtube.com/watch?v=${key}`, caption: name })
        ), { Thumbs: false })
    }

    return (
        <button onClick={showTrailer} className="primary textWithIcon flex-grow sm:flex-none">
            <PlayIcon />
            Watch Trailer
        </button>
    )

}

export default ShowTrailerButton;