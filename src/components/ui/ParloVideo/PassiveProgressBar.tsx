import { useGlobalOptions } from "./helpers";

const PassiveProgressBar = () => {

    const { progress, duration, controlsSeen } = useGlobalOptions();

    return (
        <div className={`absolute bottom-0 bg-zinc-700 w-full h-[3px] z-1 ${controlsSeen ? "fade-out" : "fade-in"}`} >
            <div
                className="h-full bg-zinc-100 transition-[width]"
                style={{ width: `${(progress / (duration || 1)) * 100}%` }}
            ></div>
        </div>
    )
}

export default PassiveProgressBar;