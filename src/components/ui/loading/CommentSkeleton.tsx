
export const CommentBarSkeleton = () => {
    return (
        <li className="w-full space-y-2">
            <div className="gap-4 flex items-center">
                <div className="size-8 rounded-full animate-pulse"></div>
                <div className="h-3 w-[60%] rounded-lg skeletonLoading"></div>
            </div>
            <div className="space-y-2">
                <div className="h-2 w-[90%] rounded-lg skeletonLoading"></div>
                <div className="h-2 w-[90%] rounded-lg skeletonLoading"></div>
                <div className="h-2 w-[50%] rounded-lg skeletonLoading"></div>
            </div>
        </li>
    )
}

const CommentSectionSkeleton = () => (
    <ul className="space-y-3">
        {
            Array(6).fill(0).map((_, i) => <CommentBarSkeleton key={i} />)
        }
    </ul>
)

export default CommentSectionSkeleton;