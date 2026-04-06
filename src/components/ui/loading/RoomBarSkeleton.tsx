import { HeadingSkeleton, PosterSkeleton } from "./tools";

const RoomBarSkeleton = () => (
    <li className="flex gap-3 items-center p-2 w-full max-w-3xl mx-auto">
        <PosterSkeleton />
        <div className="space-y-1 flex-1">
            <HeadingSkeleton />
            <ul className="flex gap-2 items-center">
                <li className="rounded-full h-2 w-10 skeletonPulse"></li>
                <li className="rounded-full size-1 skeletonPulse"></li>
                <li className="rounded-full h-2 w-10 skeletonPulse"></li>
            </ul>
        </div>
    </li>
)

export const RoomBarListSkeleton = ({ count = 12 }: { count?: number }) => (
    <ul className="w-full max-w-3xl mx-auto">
        {Array(count).fill(0).map((_, i) => (
            <RoomBarSkeleton key={i} />
        ))}
    </ul>
)

export default RoomBarSkeleton;