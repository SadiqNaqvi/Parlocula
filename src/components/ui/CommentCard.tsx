import { Ellipsis, ThumbUpIcon, ThumbDownIcon } from "@assets/Icons"
import { numberConverter } from "@lib/utils"
import { CommentData } from "@lib/types"
import Link from "next/link"

export const LoadingCommentCard = () => {
    return (
        <article className="w-full space-y-2">
            <div className="gap-4 flex items-center">
                <div className="aspect-square w-8 rounded-full skeletonLoading"></div>
                <div className="h-3 w-[60%] rounded-lg skeletonLoading"></div>
            </div>
            <div className="space-y-2">
                <div className="h-2 w-[90%] rounded-lg skeletonLoading"></div>
                <div className="h-2 w-[90%] rounded-lg skeletonLoading"></div>
                <div className="h-2 w-[50%] rounded-lg skeletonLoading"></div>
            </div>
        </article>
    )
}

export default function CommentCard({ comment_id, user_id, username, poster = "", comment, upvotes, downvotes }: CommentData) {
    return (
        <article className="p-4 space-y-2 bg-[var(--gray10)] border border-[var(--gray30)] rounded-md">
            <div className="flex">
                <img src={poster} alt="" className="h-6 aspect-square rounded-full mr-4 object-cover" />
                <Link className="line-clamp-1" href={`/explore/user/${user_id}`}>{username}</Link>
                <button className="iconBtn ml-auto h-fit p-2 border-0">
                    <Ellipsis classnames="h-4" />
                </button>
            </div>
            <Link href={`/comments?id=${comment_id}`} className="line-clamp-6">{comment}</Link>
            <div className="flex gap-4 -ml-2">
                <button className="smalBtn p-1 active:bg-[var(--gray10)] md:hover:bg-[var(--gray10)] border-0">
                    {numberConverter(upvotes)}
                    <ThumbUpIcon />
                </button>
                <button className="smalBtn p-1 active:bg-[var(--gray10)] md:hover:bg-[var(--gray10)] border-0">
                    {numberConverter(downvotes)}
                    <ThumbDownIcon />
                </button>
            </div>
        </article>
    )
}