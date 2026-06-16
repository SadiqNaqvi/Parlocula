"use client";

import { useEffect } from "react";
import ControlSection from "./ControlSection";
import { useGlobalOptions, VideoOptionsProvider } from "./helpers";
import OverlaySection from "./OverlaySection";
import PassiveProgressBar from "./PassiveProgressBar";
import VideoElement from "./VideoElement";
import "@styles/parloVideo.css";

export type VideoPlayerConfig = {
    startMute?: boolean;
    playState?: boolean;
    poster?: string;
}

type Props = {
    src: string;
} & VideoPlayerConfig;

const VideoPlayer = ({ src, poster, startMute, playState }: Props) => {

    const { setProgress, setDuration, setBuffering, setFullScreen, videoContainerRef, videoRef, setPlaying } = useGlobalOptions();

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Update current time 
        const progressUpdate = () => {
            setProgress(video.currentTime);
            setDuration(video.duration || 0);
        }

        const handleMetadata = () => {
            setDuration(video.duration);
        }

        const handleWaiting = () => {
            setBuffering(true);
        }

        // When video can play or resumes
        const handlePlaying = () => setBuffering(false);
        const handleCanPlay = () => {
            setBuffering(false);
        }

        const handleFullScreenChange = () => {
            if (document.fullscreenElement === videoContainerRef.current)
                setFullScreen(true);
            else setFullScreen(false);
        }

        video.addEventListener("waiting", handleWaiting);
        video.addEventListener("playing", handlePlaying);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("timeupdate", progressUpdate);
        video.addEventListener("loadstart", handleWaiting);
        video.addEventListener("loadedmetadata", handleMetadata);
        video.addEventListener("loadeddata", handleCanPlay);
        document.addEventListener("fullscreenchange", handleFullScreenChange);

        return () => {
            video.removeEventListener("waiting", handleWaiting);
            video.removeEventListener("playing", handlePlaying);
            video.removeEventListener("canplay", handleCanPlay);
            video.removeEventListener("timeupdate", progressUpdate);
            video.removeEventListener("loadedmetadata", handleMetadata);
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
        };

    }, []);

    useEffect(() => {
        setPlaying(!!playState);
    }, [playState]);

    return (
        <div
            ref={videoContainerRef}
            className="relative size-full bg-black overflow-hidden select-none touch-none"
        >

            <VideoElement
                ref={videoRef}
                src={src}
                poster={poster}
                startMute={startMute}
            />

            <OverlaySection />

            <ControlSection />

            <PassiveProgressBar />
        </div>
    );
};


const FancyVideoPlayer = (props: Props) => (
    <VideoOptionsProvider>
        <VideoPlayer {...props} />
    </VideoOptionsProvider>
)

export default FancyVideoPlayer;