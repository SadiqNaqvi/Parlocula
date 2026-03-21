const RoomBarSkeleton = () => (
    <article className="flex gap-3 items-center">
        <div className="min-w-10 size-10 skeleton-pulse-loading rounded-full">
        </div>
        <div className="space-y-1 flex-1">
            <div className="w-1/2 skeleton-pulse-loading h-3 rounded-md"></div>
            <ul className="flex gap-2 items-center">
                <li className="rounded-full h-2 w-10 skeleton-pulse-loading"></li>
                <li className="rounded-full size-1 skeleton-pulse-loading"></li>
                <li className="rounded-full h-2 w-10 skeleton-pulse-loading"></li>
            </ul>
        </div>
    </article>
)

export default RoomBarSkeleton;