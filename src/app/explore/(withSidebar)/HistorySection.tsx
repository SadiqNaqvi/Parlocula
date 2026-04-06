"use client";

import { OptionalChildren, ParloImage, ParloImageFrameType } from "@components/ui";
import { useHistoryStack } from "@lib/hooks";
import useOfflineStore from "@store/offlineStore";
import { Frame } from "@type/internal";
import { HistoryStackType } from "@type/other";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

const predictFrameType = (path: string): ParloImageFrameType => {
    if (path.includes("/thread")) return "threadPoster";
    else if (path.includes("/user")) return "userProfile";
    else if (path.includes("/shelf")) return "shelfPoster";
    return "poster";
}

const HistoryBar = ({ path, poster, title, image }: HistoryStackType) => (
    <article className="py-2">
        <div className="flex gap-2">
            <ParloImage
                frame={poster}
                frameType={predictFrameType(path)}
                alt="Poster for the history item"
                classNameForFallback="min-w-8 size-8 p-1"
                className="size-10 min-w-10"
            />
            <div>
                <OptionalChildren condition={title}>
                    <h4>{title}</h4>
                </OptionalChildren>
                <p className={`text-sky-500 ${title ? "text-sm" : ""}`}></p>
            </div>
        </div>
        <OptionalChildren condition={image}>
            <ParloImage
                frame={image}
                frameType="poster"
                alt="Poster for the history item"
                className="max-w-60 aspect-square rounded-md"
                containerClassName="mt-2"
            />
        </OptionalChildren>
    </article>
)

const HistorySection = ({ className }: { className?: string }) => {

    const { historyStack, removeFromStack } = useHistoryStack();
    const router = useRouter();
    if (!historyStack || !historyStack.length) return null;

    const handleNavigation = (path: string) => {
        removeFromStack(path);
        router.push(path);
    }

    return (
        <div className={twMerge("space-y-2 px-2", className)}>
            <h3 className="parloHeading">Revisit your journey</h3>
            <ul>
                {historyStack.map(history => (
                    <li key={history.path} onClick={() => handleNavigation(history.path)}>
                        <HistoryBar {...history} />
                    </li>
                ))}
            </ul>
        </div>
    )

}

export default HistorySection;