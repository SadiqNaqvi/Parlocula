"use client";

import { VideoBackwardIcon, VideoExpandIcon, VideoForwardIcon, VideoMuteIcon, VideoPauseIcon, VideoPlayIcon, VideoShrinkIcon, VideoSoundIcon } from "@assets/Icons";
import { useCustomReducer } from "@lib/hooks";
import { useEffect, useRef } from "react";
import logo from "@assets/logo.png"
import placeholder from "@assets/placeholder.png"
import Image from "next/image";

export default function VideoPlayer({ src }: { src: string }) {

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const { loading, isOptionShown, isFullScreen, source, isMute, isPlaying, setter } = useCustomReducer({
        loading: false,
        source: "",
        isOptionShown: true,
        isPlaying: false,
        isFullScreen: false,
        isMute: false,
    });

    useEffect(() => {
        if (!videoRef.current) return;
        videoRef.current.addEventListener("playing", () => setter({ isPlaying: true }))
        videoRef.current.addEventListener("pause", () => setter({ isPlaying: false }))
        videoRef.current.addEventListener("load", (e) => console.log(e));
        // videoRef.current.addEventListener("timeupdate", (e) => console.log(e))
    }, [videoRef.current])

    const togglePlay = (event: any) => {
        event.stopPropagation();
        if (!videoRef.current) return;
        isPlaying ? videoRef.current.pause() : videoRef.current.play();
    }

    const toggleFullScreen = (event: any) => {
        event.stopPropagation();
        if (!videoRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
            setter({ isFullScreen: false });
        }
        else {
            videoRef.current.parentElement?.requestFullscreen();
            setter({ isFullScreen: true });
        }
    }

    const toggleSound = (event: any) => {
        event.stopPropagation();
        setter({ isMute: !isMute })
    }

    const handleLoading = (e: any) => {
        console.log(videoRef.current?.duration);
    }

    const LoadingCont = () => (
        <Image
            className="size-12 loading object-contain"
            src={logo}
            alt=""
            width={40} height={40} />
    )

    return (
        <section className="relative h-64 w-full">
            {source ?
                <>
                    <video
                        onLoadedData={handleLoading}
                        onLoadStart={() => setter({ loading: true })}
                        onCanPlay={() => setter({ loading: false })}
                        onDurationChange={(e) => console.log(e)}
                        preload="metadata"
                        className={`h-full w-full object-${isFullScreen ? "cover" : "contain"}`}
                        ref={videoRef}>
                        <source src={source} />
                    </video>
                    <div className={`absolute inset-0${isOptionShown ? " backdrop-brightness-50" : ''} flex flex-cntr-all`} onClick={() => setter({ isOptionShown: !isOptionShown })}>
                        {isOptionShown &&
                            <>
                                <div className="flex flex-cntr-even w-full">
                                    <button><VideoBackwardIcon classnames="h-12" /></button>
                                    {loading ?
                                        <span>
                                            <LoadingCont />
                                        </span>
                                        :
                                        <button onClick={togglePlay}>
                                            {isPlaying ?
                                                <VideoPauseIcon classnames="h-12" />
                                                :
                                                <VideoPlayIcon classnames="h-12" />
                                            }
                                        </button>
                                    }
                                    <button><VideoForwardIcon classnames="h-12" /></button>
                                </div>
                                <span className="flex gap-4 absolute right-0 bottom-0 mb-4 mr-4">
                                    <button onClick={toggleSound}>
                                        {isMute ?
                                            <VideoMuteIcon classnames="h-6" />
                                            :
                                            <VideoSoundIcon classnames="h-6" />
                                        }
                                    </button>
                                    <button onClick={toggleFullScreen}>
                                        {isFullScreen ?
                                            <VideoShrinkIcon classnames="h-6" />
                                            :
                                            <VideoExpandIcon classnames="h-6" />
                                        }
                                    </button>
                                </span>
                            </>
                        }
                    </div>
                </>
                :
                <div className="size-full">
                    <div className="absolute inset-0 flex flex-cntr-all">
                        <span className="backdrop-brightness-[0.2] rounded-full">
                            <button className="iconBtn h-auto" onClick={() => setter({ source: src })}>
                                <VideoPlayIcon classnames="h-12" />
                            </button>
                        </span>
                    </div>
                    <Image
                        className="size-full object-cover"
                        src={placeholder}
                        height={placeholder.height} width={placeholder.width} alt="" />
                </div>
            }
        </section >
    )
}