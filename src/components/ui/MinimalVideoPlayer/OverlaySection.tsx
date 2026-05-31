import { useEffect, useRef } from "react";
import { displayMessageIconsMap, useGlobalOptions } from "./helpers";
import SkipSectionsWrapper from "./SkipSectionWrapper";

const OverlaySection = () => {

    const { playing, screenLock, videoRef, setMessage, toggleControlsSeen, message, setPlaybackRate } = useGlobalOptions();

    // To be used in calculation/process to avoid stale data since states inside event handlers are not gettin updated.
    const screenLockRef = useRef(screenLock);

    useEffect(() => {
        screenLockRef.current = screenLock;
    }, [screenLock]);

    // Speed handling
    const speedBoostTimeout = useRef<NodeJS.Timeout>(undefined);
    const normalPlaybackRate = useRef(1);

    // to distinguish click vs double-click
    const clickTimeout = useRef<NodeJS.Timeout | null>(null);


    const boostVideoSpeed = (times?: number) => {
        const vid = videoRef.current;
        if (times === 0 || !vid) return;

        if (times) normalPlaybackRate.current = times;
        else normalPlaybackRate.current = vid.playbackRate;

        const newSpeed = times || 2;

        setPlaybackRate(newSpeed);

        setMessage({
            label: `${newSpeed}×`,
            icon: "SpeedBoostIcon",
        }, -1);
    }

    const normaliseVideoSpeed = () => {
        const video = videoRef.current;

        // If video element is not available, return;
        // If video is already at normalPlaybackRate, return;
        if (!video || (video.playbackRate === normalPlaybackRate.current)) return;

        const newSpeed = normalPlaybackRate.current;
        setPlaybackRate(newSpeed);
        setMessage(null);
    }

    // ======= START DRAG =======
    const startDrag = () => {

        const screenLockState = screenLockRef.current;

        if (screenLockState) return;

        clearTimeout(speedBoostTimeout.current);

        // If Video is playing and user touch and hold for longer than one second, set speed to 2x
        if (playing) {
            speedBoostTimeout.current = setTimeout(() => {
                boostVideoSpeed();
            }, 1000);
        }
    }

    const endDrag = () => {
        const video = videoRef.current;
        const screenLockState = screenLockRef.current;

        if (!video || screenLockState) return;

        if (speedBoostTimeout.current) {
            clearTimeout(speedBoostTimeout.current);
            speedBoostTimeout.current = undefined;
        }

        normaliseVideoSpeed();
        setMessage(null);
    }

    // ======= MOUSE EVENTS =======
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        startDrag();
    };

    const handleMouseUp = () => endDrag();

    // ======= TOUCH EVENTS =======
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        startDrag();
    };

    const handleTouchEnd = () => endDrag();

    // ======= CLICK HANDLING (Single vs Double Click Distinguish) =======
    const handleClick = () => {

        if (clickTimeout.current) {
            clearTimeout(clickTimeout.current);
            clickTimeout.current = null;
            return;
        }

        clickTimeout.current = setTimeout(() => {
            toggleControlsSeen();
            clickTimeout.current = null;
        }, 250);
    };


    useEffect(() => {

        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);

    const IconToDisplayWithMessage = () => {
        if (!message || !message.icon) return;
        const Icon = displayMessageIconsMap[message.icon];
        if (!Icon) return;
        return <Icon className="showShadow" />
    }

    return (
        <section
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={handleClick}
            className={`absolute flex z-1 inset-0`}
        >

            <SkipSectionsWrapper />

            {message && (
                <div className={`absolute inset-0 flex gap-2 ${message.rightSide ? "flex-row-reverse" : "flex-row"} items-start justify-center text-white showShadow text-lg mt-4 animate-fadeInOut`}>
                    <span>
                        <IconToDisplayWithMessage />
                    </span>
                    <span>
                        {message.label}
                    </span>
                </div>
            )}

        </section >
    )
}


export default OverlaySection;