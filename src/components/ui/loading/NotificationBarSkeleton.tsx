import { ButtonSkeleton, RandomHorizontalLinesSkeleton } from "./tools";

const NotificationBarSkeleton = () => (
    <li className="group px-2 py-4 space-y-3 w-full max-w-3xl mx-auto">

        <div className="flex gap-2">
            <div className="flex-1">
                <RandomHorizontalLinesSkeleton count={3} />
            </div>
            <div className="size-12 rounded-md skeletonPulse"></div>
        </div>
        <div className="group-odd:hidden flex gap-2">
            <ButtonSkeleton />
            <ButtonSkeleton />
        </div>
    </li>
)

export const NotificationPageSkeleton = ({ count = 12 }: { count?: number }) => (
    <ul className="w-full max-w-3xl mx-auto">
        {Array(count).fill(0).map((_, i) => (
            <NotificationBarSkeleton key={i} />
        ))}
    </ul>
)

export default NotificationBarSkeleton;