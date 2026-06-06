"use client";

import { PlayIcon } from "@assets/Icons";
import { Button } from "@components/ui";
import { Fancybox } from "@fancyapps/ui";

const ShowTrailerButton = ({ trailers }: { trailers: { key: string, [key: string]: any }[] }) => {

    const showTrailer = () => {
        Fancybox.show(trailers.map(
            ({ key, name }) => ({ src: `https://www.youtube.com/watch?v=${key}`, caption: name })
        ))
    }

    return (
        <Button
            onClick={showTrailer}
            className="primary flex-1 sm:flex-none"
            id="watch-trailer-button"
            title="Watch Trailer"
        >
            <PlayIcon />
            Watch Trailer
        </Button>
    )

}

export default ShowTrailerButton;